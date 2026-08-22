import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Header from '@/components/Header';
import { Calendar, MapPin } from 'lucide-react';
import { useTrip } from '@/hooks/useTrip';


const CreateTrip = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { createTrip } = useTrip();

  const [formData, setFormData] = useState({
    name: '',
    destination: (location.state as { prefillDestination?: string })?.prefillDestination || '',
    startDate: '',
    endDate: '',
    description: ''
  });
  
  const [error, setError] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [destinationSuggestions, setDestinationSuggestions] = useState<any[]>([]);
  const [isSearchingDest, setIsSearchingDest] = useState(false);

  useEffect(() => {
    if (!formData.destination || formData.destination.length < 2) {
      setDestinationSuggestions([]);
      return;
    }
    const timer = setTimeout(() => {
      setIsSearchingDest(true);
      fetch(`/api/cities?search=${encodeURIComponent(formData.destination)}`)
        .then(res => res.json())
        .then(data => {
          if (data.data?.cities) {
            setDestinationSuggestions(data.data.cities);
            setShowSuggestions(true);
          }
        })
        .finally(() => setIsSearchingDest(false));
    }, 300);
    return () => clearTimeout(timer);
  }, [formData.destination]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (e.target.name === 'destination') {
      setShowSuggestions(true);
    }
    setError(''); // Clear error on change
  };

  const selectCity = (city: string) => {
    setFormData({ ...formData, destination: city });
    setShowSuggestions(false);
  };

  const handleSubmit = async () => {
    // Validation
    if (!formData.name || !formData.destination || !formData.startDate || !formData.endDate) {
      setError('Please fill in all required fields.');
      return;
    }
    
    if (new Date(formData.startDate) > new Date(formData.endDate)) {
      setError('End date cannot be before start date.');
      return;
    }

    await createTrip(formData);
    navigate('/itinerary');
  };



  return (
    <div className="min-h-screen bg-roamora-bg text-roamora-text font-body">
      <Header />
      
      <main className="px-8 pb-24 max-w-7xl mx-auto mt-6">
        <section className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 mb-12">
          <h1 className="font-display text-4xl font-semibold text-roamora-green mb-2">Create a New Trip</h1>
          <p className="text-gray-500 mb-8 border-b border-gray-100 pb-4">Plan your perfect journey, one stop at a time.</p>
          
          <div className="max-w-2xl flex flex-col gap-6">
            {/* Cover Image Placeholder */}
            <div className="w-full h-40 border-2 border-dashed border-gray-300 rounded-2xl flex flex-col items-center justify-center text-gray-500 cursor-pointer hover:bg-gray-50 transition-colors">
              <span className="text-2xl mb-2">📷</span>
              <span className="font-medium">Add Cover Photo</span>
              <span className="text-sm">Upload an image for your trip</span>
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-medium">
                {error}
              </div>
            )}

            <div className="flex flex-col gap-2">
              <label className="font-medium text-gray-700 ml-1">Trip Name *</label>
              <input 
                type="text" 
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="e.g. European Summer Adventure"
                className="w-full bg-roamora-bg/50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-roamora-green transition-colors"
              />
            </div>

            <div className="flex flex-col gap-2 relative">
              <label className="font-medium text-gray-700 ml-1">Destination *</label>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                  type="text" 
                  name="destination"
                  value={formData.destination}
                  onChange={handleInputChange}
                  onFocus={() => setShowSuggestions(true)}
                  placeholder="🔍 Search destination..."
                  className="w-full bg-roamora-bg/50 border border-gray-200 rounded-xl pl-12 pr-4 py-3 outline-none focus:border-roamora-green transition-colors"
                />
                {isSearchingDest && (
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-roamora-green/30 border-t-roamora-green rounded-full animate-spin" />
                )}
              </div>
              
              {showSuggestions && destinationSuggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-50">
                  {destinationSuggestions.map((dest: any) => (
                    <div 
                      key={dest.id} 
                      className="px-4 py-3 hover:bg-gray-50 cursor-pointer text-gray-700 font-medium border-t border-gray-50 flex items-center justify-between"
                      onMouseDown={() => selectCity(dest.cityName)} // Use onMouseDown to prevent blur from hiding it before click
                    >
                      <span>{dest.cityName}</span>
                      <span className="text-gray-400 text-sm font-normal">{dest.country}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label className="font-medium text-gray-700 ml-1">Start Date *</label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input 
                    type="date" 
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleInputChange}
                    className="w-full bg-roamora-bg/50 border border-gray-200 rounded-xl pl-12 pr-4 py-3 outline-none focus:border-roamora-green transition-colors text-gray-600"
                  />
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <label className="font-medium text-gray-700 ml-1">End Date *</label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input 
                    type="date" 
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleInputChange}
                    className="w-full bg-roamora-bg/50 border border-gray-200 rounded-xl pl-12 pr-4 py-3 outline-none focus:border-roamora-green transition-colors text-gray-600"
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="font-medium text-gray-700 ml-1">Trip Description</label>
              <textarea 
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Tell us a little about your trip..."
                rows={4}
                className="w-full bg-roamora-bg/50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-roamora-green transition-colors resize-none"
              />
            </div>
            
            <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-100">
              <button 
                onClick={() => navigate('/')} 
                className="text-gray-500 font-medium hover:text-gray-800 transition-colors px-4 py-2"
              >
                Cancel
              </button>
              <button 
                onClick={handleSubmit} 
                className="bg-roamora-green hover:bg-roamora-greenHover text-white font-medium py-3 px-8 rounded-xl transition-colors shadow-sm"
              >
                Create Trip →
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default CreateTrip;
