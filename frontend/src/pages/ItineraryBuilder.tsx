import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import { Plus, X, Search } from 'lucide-react';
import { useTrip } from '@/hooks/useTrip';
import SectionCard from '@/components/SectionCard';

// City-specific activity pool keyed by lowercase city keywords
const CITY_ACTIVITIES: Record<string, { name: string; category: string; cost: number; image: string; time: string }[]> = {
  paris: [
    { name: "Eiffel Tower Tour",       category: "Sightseeing",  cost: 0,    time: "10:00 AM", image: "https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?w=400" },
    { name: "Louvre Museum",            category: "Museum",       cost: 1500, time: "02:00 PM", image: "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=400" },
    { name: "French Food Tour",         category: "Food",         cost: 2000, time: "01:00 PM", image: "https://images.unsplash.com/photo-1550340499-a6c60fc8287c?w=400" },
    { name: "Seine River Cruise",       category: "Sightseeing",  cost: 1500, time: "05:00 PM", image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=400" },
    { name: "Musée d'Orsay",            category: "Museum",       cost: 1200, time: "11:00 AM", image: "https://images.unsplash.com/photo-1560179406-1c6c60e0dc76?w=400" },
    { name: "Palace of Versailles",     category: "Historical",   cost: 2500, time: "09:00 AM", image: "https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?w=400" },
    { name: "Notre Dame Cathedral",     category: "Historical",   cost: 0,    time: "03:00 PM", image: "https://images.unsplash.com/photo-1478391679764-b2d8b3cd1e94?w=400" },
    { name: "Montmartre Walking Tour",  category: "Sightseeing",  cost: 500,  time: "04:00 PM", image: "https://images.unsplash.com/photo-1550340499-a6c60fc8287c?w=400" },
    { name: "Paris Wine Tasting",       category: "Food",         cost: 3000, time: "07:00 PM", image: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=400" },
    { name: "Arc de Triomphe",          category: "Sightseeing",  cost: 800,  time: "06:00 PM", image: "https://images.unsplash.com/photo-1471929873714-39fca87f8abf?w=400" },
    { name: "Champs-Élysées Shopping",  category: "Shopping",     cost: 5000, time: "02:00 PM", image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=400" },
    { name: "Sainte-Chapelle Visit",    category: "Historical",   cost: 1100, time: "10:00 AM", image: "https://images.unsplash.com/photo-1478391679764-b2d8b3cd1e94?w=400" },
  ],
  interlaken: [
    { name: "Jungfraujoch — Top of Europe", category: "Adventure",   cost: 8000, time: "09:00 AM", image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400" },
    { name: "Lake Thun Boat Cruise",        category: "Sightseeing",  cost: 1200, time: "11:00 AM", image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400" },
    { name: "Harder Kulm Viewpoint",        category: "Nature",       cost: 2500, time: "10:00 AM", image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=400" },
    { name: "Paragliding over Alps",        category: "Adventure",   cost: 12000,time: "01:00 PM", image: "https://images.unsplash.com/photo-1622738049484-1898e96ad7f3?w=400" },
    { name: "Trummelbach Falls",            category: "Nature",       cost: 800,  time: "03:00 PM", image: "https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?w=400" },
    { name: "Schynige Platte Hike",         category: "Adventure",   cost: 3500, time: "08:00 AM", image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400" },
    { name: "Swiss Chocolate Workshop",     category: "Food",         cost: 2000, time: "02:00 PM", image: "https://images.unsplash.com/photo-1481391319764-ac6d90b0b54e?w=400" },
    { name: "Lake Brienz Kayaking",         category: "Adventure",   cost: 2500, time: "10:00 AM", image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400" },
    { name: "Lauterbrunnen Valley Walk",    category: "Nature",       cost: 0,    time: "09:00 AM", image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=400" },
    { name: "Grindelwald Glacier Tour",     category: "Nature",       cost: 4000, time: "08:00 AM", image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400" },
    { name: "Swiss Folk Museum",            category: "Museum",       cost: 600,  time: "01:00 PM", image: "https://images.unsplash.com/photo-1560179406-1c6c60e0dc76?w=400" },
    { name: "Interlaken Old Town Stroll",   category: "Sightseeing",  cost: 0,    time: "04:00 PM", image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400" },
  ],
  rome: [
    { name: "Colosseum & Roman Forum",   category: "Historical",   cost: 1800, time: "10:00 AM", image: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=400" },
    { name: "Vatican Museums & Sistine Chapel", category: "Museum", cost: 2000, time: "02:00 PM", image: "https://images.unsplash.com/photo-1531572753322-ad063cecc140?w=400" },
    { name: "Trevi Fountain Visit",       category: "Sightseeing",  cost: 0,    time: "10:00 AM", image: "https://images.unsplash.com/photo-1525874684015-58379d421a52?w=400" },
    { name: "Borghese Gallery",           category: "Museum",       cost: 1500, time: "09:00 AM", image: "https://images.unsplash.com/photo-1560179406-1c6c60e0dc76?w=400" },
    { name: "Pantheon Tour",             category: "Historical",   cost: 500,  time: "11:00 AM", image: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=400" },
    { name: "Roman Street Food Walk",    category: "Food",         cost: 1800, time: "12:00 PM", image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400" },
    { name: "Trastevere Evening Walk",   category: "Sightseeing",  cost: 0,    time: "07:00 PM", image: "https://images.unsplash.com/photo-1525874684015-58379d421a52?w=400" },
    { name: "Piazza Navona",             category: "Sightseeing",  cost: 0,    time: "05:00 PM", image: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=400" },
    { name: "St. Peter's Basilica",      category: "Historical",   cost: 0,    time: "09:00 AM", image: "https://images.unsplash.com/photo-1531572753322-ad063cecc140?w=400" },
    { name: "Pasta Making Class",        category: "Food",         cost: 3500, time: "02:00 PM", image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400" },
    { name: "Campo de' Fiori Market",    category: "Shopping",     cost: 1000, time: "08:00 AM", image: "https://images.unsplash.com/photo-1525874684015-58379d421a52?w=400" },
    { name: "Appian Way Cycling",        category: "Adventure",   cost: 1200, time: "09:00 AM", image: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=400" },
  ],
};

// Resolve which city's activities to show
const getActivitiesForCity = (city: string) => {
  const key = city.toLowerCase();
  if (key.includes('paris'))       return CITY_ACTIVITIES.paris;
  if (key.includes('interlaken'))  return CITY_ACTIVITIES.interlaken;
  if (key.includes('rome') || key.includes('roma')) return CITY_ACTIVITIES.rome;
  // Fallback: return all activities
  return [
    ...CITY_ACTIVITIES.paris,
    ...CITY_ACTIVITIES.interlaken,
    ...CITY_ACTIVITIES.rome,
  ];
};


const ItineraryBuilder = () => {
  const { currentTrip, addSection, addActivity, saveItinerary } = useTrip();
  const navigate = useNavigate();

  const [isAddStopOpen, setIsAddStopOpen] = useState(false);
  const [stopForm, setStopForm] = useState({ city: '', startDate: '', endDate: '', budget: '' });
  const [stopError, setStopError] = useState('');

  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
  const [activitySearch, setActivitySearch] = useState('');

  if (!currentTrip) {
    return (
      <div className="min-h-screen bg-roamora-bg flex flex-col items-center justify-center p-8 text-center">
        <h2 className="font-display text-3xl font-semibold text-roamora-green mb-4">No active trip found</h2>
        <p className="text-gray-500 mb-8 font-medium">Please start by creating a new trip.</p>
        <button onClick={() => navigate('/create-trip')} className="bg-roamora-green hover:bg-roamora-greenHover text-white px-8 py-3 rounded-xl font-medium shadow-sm transition-colors">Create Trip</button>
      </div>
    );
  }

  const handleAddStop = () => {
    setStopError('');
    if (!stopForm.city || !stopForm.startDate || !stopForm.endDate || !stopForm.budget) {
      setStopError('All fields are required.');
      return;
    }
    if (new Date(stopForm.startDate) > new Date(stopForm.endDate)) {
      setStopError('End date cannot be before start date.');
      return;
    }
    if (new Date(stopForm.startDate) < new Date(currentTrip.startDate) || new Date(stopForm.endDate) > new Date(currentTrip.endDate)) {
      setStopError(`Dates must be within overall trip dates (${currentTrip.startDate} to ${currentTrip.endDate})`);
      return;
    }

    addSection({
      city: stopForm.city,
      country: '',
      startDate: stopForm.startDate,
      endDate: stopForm.endDate,
      budget: Number(stopForm.budget)
    });
    
    setIsAddStopOpen(false);
    setStopForm({ city: '', startDate: '', endDate: '', budget: '' });
  };

  const handleAddActivity = (mockAct: { name: string; category: string; cost: number; image: string; time: string }) => {
    if (!activeSectionId) return;
    const section = currentTrip.sections.find(s => s.id === activeSectionId);
    if (!section) return;

    addActivity(activeSectionId, {
      name: mockAct.name,
      category: mockAct.category,
      cost: mockAct.cost,
      date: section.startDate,
      time: mockAct.time,
      image: mockAct.image
    });
  };

  const handleSave = () => {
    saveItinerary();
    navigate('/view-itinerary');
  };

  const tripDuration = Math.max(1, Math.ceil((new Date(currentTrip.endDate).getTime() - new Date(currentTrip.startDate).getTime()) / (1000 * 3600 * 24)));
  const uniqueDestinations = new Set(currentTrip.sections.map(s => s.city)).size;

  return (
    <div className="min-h-screen bg-roamora-bg text-roamora-text font-body relative">
      <Header />
      
      <main className="px-4 md:px-8 pb-24 max-w-7xl mx-auto mt-6 flex flex-col lg:flex-row gap-8 items-start">
        {/* Main Content Area */}
        <div className="flex-1 w-full min-w-0">
          <div className="flex justify-between items-start mb-8 border-b border-gray-200 pb-6 flex-wrap gap-4">
            <div>
              <button onClick={() => navigate('/create-trip')} className="text-gray-400 hover:text-roamora-green text-sm font-medium mb-3 flex items-center gap-1 transition-colors">
                ← Back to Trip Details
              </button>
              <h1 className="font-display text-4xl font-semibold text-roamora-green mb-1">
                {currentTrip.name}
              </h1>
              <p className="text-gray-500 font-medium">
                {currentTrip.startDate} — {currentTrip.endDate} • {currentTrip.destination}
              </p>
            </div>
            <button onClick={handleSave} className="bg-roamora-green hover:bg-roamora-greenHover text-white px-6 py-3 rounded-xl font-medium shadow-sm transition-colors whitespace-nowrap">
              Save Itinerary
            </button>
          </div>
          
          <div className="flex flex-col gap-2">
            {currentTrip.sections.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-gray-300">
                <span className="text-4xl mb-4 block">✈️</span>
                <h3 className="font-display text-2xl font-semibold text-roamora-green mb-2">Your itinerary is waiting to be planned.</h3>
                <p className="text-gray-500 mb-6 font-medium">Add your first destination and start building your journey.</p>
                <button 
                  onClick={() => setIsAddStopOpen(true)}
                  className="bg-roamora-green hover:bg-roamora-greenHover text-white px-6 py-3 rounded-xl font-medium mx-auto flex items-center gap-2 shadow-sm transition-colors"
                >
                  <Plus size={18} strokeWidth={2.5} /> Add Stop
                </button>
              </div>
            ) : (
              currentTrip.sections.map((section, index) => (
                <SectionCard 
                  key={section.id} 
                  section={section} 
                  index={index} 
                  onAssignActivities={(id) => setActiveSectionId(id)}
                />
              ))
            )}
            
            {currentTrip.sections.length > 0 && (
              <button 
                onClick={() => setIsAddStopOpen(true)}
                className="mt-4 flex items-center justify-center gap-3 w-full py-6 border-2 border-dashed border-roamora-green/40 text-roamora-green rounded-3xl hover:bg-roamora-green/5 hover:border-roamora-green transition-all duration-300 font-semibold text-lg shadow-sm"
              >
                <Plus size={24} strokeWidth={2.5} />
                Add Another Section
              </button>
            )}
          </div>
        </div>

        {/* Sidebar Summary */}
        <div className="w-full lg:w-80 bg-white rounded-3xl p-6 shadow-sm border border-gray-100 sticky top-6 shrink-0">
          <h3 className="font-display text-xl font-semibold text-roamora-green mb-6 pb-4 border-b border-gray-100">Trip Summary</h3>
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-500 font-medium">Trip Duration</span>
              <span className="font-semibold text-gray-900">{tripDuration || 0} Days</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500 font-medium">Destinations</span>
              <span className="font-semibold text-gray-900">{uniqueDestinations}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500 font-medium">Sections</span>
              <span className="font-semibold text-gray-900">{currentTrip.sections.length}</span>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
              <span className="text-gray-700 font-semibold">Total Planned Budget</span>
              <span className="font-display text-xl font-semibold text-roamora-green">₹{currentTrip.totalBudget}</span>
            </div>
          </div>
        </div>
      </main>

      {/* Add Stop Modal */}
      {isAddStopOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-display text-2xl font-semibold text-roamora-green">Add a Stop</h2>
              <button onClick={() => setIsAddStopOpen(false)} className="text-gray-400 hover:text-gray-700 p-2"><X size={20}/></button>
            </div>
            
            {stopError && <div className="mb-4 bg-red-50 text-red-600 text-sm font-medium p-3 rounded-xl">{stopError}</div>}
            
            <div className="flex flex-col gap-4 mb-8">
              <div>
                <label className="text-sm font-medium text-gray-700 ml-1">Destination</label>
                <div className="relative mt-1">
                  <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="text" value={stopForm.city} onChange={e=>setStopForm({...stopForm, city: e.target.value})} placeholder="e.g. Paris, France" className="w-full bg-roamora-bg/50 border border-gray-200 rounded-xl pl-10 pr-4 py-3 outline-none focus:border-roamora-green" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 ml-1">Start Date</label>
                  <input type="date" value={stopForm.startDate} onChange={e=>setStopForm({...stopForm, startDate: e.target.value})} className="w-full bg-roamora-bg/50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-roamora-green mt-1 text-sm text-gray-600" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 ml-1">End Date</label>
                  <input type="date" value={stopForm.endDate} onChange={e=>setStopForm({...stopForm, endDate: e.target.value})} className="w-full bg-roamora-bg/50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-roamora-green mt-1 text-sm text-gray-600" />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 ml-1">Budget</label>
                <div className="relative mt-1">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">₹</span>
                  <input type="number" value={stopForm.budget} onChange={e=>setStopForm({...stopForm, budget: e.target.value})} placeholder="25000" className="w-full bg-roamora-bg/50 border border-gray-200 rounded-xl pl-10 pr-4 py-3 outline-none focus:border-roamora-green" />
                </div>
              </div>
            </div>
            
            <button onClick={handleAddStop} className="w-full bg-roamora-green hover:bg-roamora-greenHover text-white py-3.5 rounded-xl font-medium shadow-sm transition-colors">
              Add Stop
            </button>
          </div>
        </div>
      )}

      {/* Assign Activities Modal */}
      {activeSectionId && (() => {
        const activeSection = currentTrip.sections.find(s => s.id === activeSectionId);
        const cityActivities = activeSection ? getActivitiesForCity(activeSection.city) : [];
        const alreadyAdded = new Set(activeSection?.activities.map(a => a.name) ?? []);
        const filtered = cityActivities.filter(
          a => !alreadyAdded.has(a.name) &&
               (activitySearch === '' || a.name.toLowerCase().includes(activitySearch.toLowerCase()) || a.category.toLowerCase().includes(activitySearch.toLowerCase()))
        );

        // Group by category
        const grouped = filtered.reduce<Record<string, typeof filtered>>((acc, a) => {
          acc[a.category] = acc[a.category] ? [...acc[a.category], a] : [a];
          return acc;
        }, {});

        return (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 md:p-8 w-full max-w-lg shadow-xl max-h-[85vh] flex flex-col">
              <div className="flex justify-between items-center mb-1 shrink-0">
                <div>
                  <h2 className="font-display text-2xl font-semibold text-roamora-green">Assign Activities</h2>
                  {activeSection && (
                    <p className="text-gray-400 text-sm font-medium mt-0.5">{activeSection.city}</p>
                  )}
                </div>
                <button onClick={() => { setActiveSectionId(null); setActivitySearch(''); }} className="text-gray-400 hover:text-gray-700 p-2"><X size={20}/></button>
              </div>

              <div className="relative my-4 shrink-0">
                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={activitySearch}
                  onChange={e => setActivitySearch(e.target.value)}
                  placeholder="Search activities or categories..."
                  className="w-full bg-roamora-bg/50 border border-gray-200 rounded-xl pl-10 pr-4 py-3 outline-none focus:border-roamora-green text-sm"
                />
              </div>

              <div className="overflow-y-auto pr-1 flex flex-col gap-5">
                {filtered.length === 0 ? (
                  <div className="text-center py-10 text-gray-400 font-medium">
                    {alreadyAdded.size === cityActivities.length
                      ? 'All available activities have been added!'
                      : 'No activities match your search.'}
                  </div>
                ) : (
                  Object.entries(grouped).map(([category, acts]) => (
                    <div key={category}>
                      <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 px-1">{category}</div>
                      <div className="flex flex-col gap-2">
                        {acts.map((act, i) => (
                          <div key={i} className="flex justify-between items-center p-4 border border-gray-100 rounded-xl hover:border-roamora-green/40 hover:bg-gray-50 transition-colors bg-white">
                            <div className="flex gap-3 items-center min-w-0">
                              <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                                <img src={act.image} alt={act.name} className="w-full h-full object-cover" onError={e => (e.currentTarget.style.display = 'none')} />
                              </div>
                              <div className="min-w-0">
                                <h5 className="font-semibold text-gray-900 text-sm leading-tight truncate">{act.name}</h5>
                                <div className="flex gap-2 text-xs text-gray-400 mt-0.5">
                                  <span>{act.time}</span>
                                  <span>·</span>
                                  <span className="text-roamora-green font-medium">₹{act.cost === 0 ? 'Free' : act.cost.toLocaleString()}</span>
                                </div>
                              </div>
                            </div>
                            <button
                              onClick={() => { handleAddActivity(act); }}
                              className="text-sm font-semibold text-roamora-green bg-roamora-green/10 hover:bg-roamora-green hover:text-white px-4 py-2 rounded-lg transition-colors shrink-0 ml-3"
                            >
                              + Add
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="shrink-0 pt-4 border-t border-gray-100 mt-4">
                <button
                  onClick={() => { setActiveSectionId(null); setActivitySearch(''); }}
                  className="w-full bg-roamora-green hover:bg-roamora-greenHover text-white py-3 rounded-xl font-medium transition-colors"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        );
      })()}

    </div>
  );
};

export default ItineraryBuilder;
