import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import { Plus, X, Search } from 'lucide-react';
import { useTrip } from '@/hooks/useTrip';
import SectionCard from '@/components/SectionCard';

interface ActivityTemplate {
  name: string;
  category: string;
  cost: number;
  image: string;
  time: string;
  openTime: string;
  closeTime: string;
  operatingHours: string;
  duration: string;
  locationArea: string;
}

// Activities are fetched dynamically from the backend

const ItineraryBuilder = () => {
  const { currentTrip, addSection, addActivity, saveItinerary } = useTrip();
  const navigate = useNavigate();

  const [isAddStopOpen, setIsAddStopOpen] = useState(false);
  const [stopForm, setStopForm] = useState({ city: '', cityId: '', startDate: '', endDate: '', budget: '' });
  const [stopError, setStopError] = useState('');

  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
  const [activitySearch, setActivitySearch] = useState('');
  const [availableActivities, setAvailableActivities] = useState<ActivityTemplate[]>([]);
  const [isFetchingActivities, setIsFetchingActivities] = useState(false);
  const [isAutoPlanning, setIsAutoPlanning] = useState(false);

  const [destinationSuggestions, setDestinationSuggestions] = useState<any[]>([]);
  const [showDestinations, setShowDestinations] = useState(false);
  const [isSearchingDest, setIsSearchingDest] = useState(false);

  useEffect(() => {
    if (stopForm.city.length < 2) {
      setDestinationSuggestions([]);
      return;
    }
    const timer = setTimeout(() => {
      setIsSearchingDest(true);
      fetch(`/api/cities?search=${encodeURIComponent(stopForm.city)}`)
        .then(res => res.json())
        .then(data => {
          if (data && data.data && data.data.cities) {
            setDestinationSuggestions(data.data.cities);
          }
        })
        .catch(err => console.error("Failed to fetch destinations:", err))
        .finally(() => setIsSearchingDest(false));
    }, 300);
    return () => clearTimeout(timer);
  }, [stopForm.city]);

  useEffect(() => {
    if (!activeSectionId || !currentTrip) {
      setAvailableActivities([]);
      return;
    }
    
    setIsFetchingActivities(true);
    const section = currentTrip.sections.find(s => s.id === activeSectionId);
    if (!section) return;

    fetch(`/api/cities?search=${encodeURIComponent(section.city)}`)
      .then(res => res.json())
      .then(data => {
        const city = data.data?.cities?.[0];
        if (!city) {
          setAvailableActivities([]);
          return null;
        }
        return fetch(`/api/cities/${city.id}/activities`);
      })
      .then(res => (res ? res.json() : null))
      .then(data => {
        if (data && data.data && data.data.activities) {
          // Map backend activities to frontend ActivityTemplate
          const mapped = data.data.activities.map((a: any) => ({
            name: a.name,
            category: a.category,
            cost: Number(a.cost),
            image: a.image,
            time: 'Flexible',
            openTime: '09:00',
            closeTime: '18:00',
            operatingHours: '09:00 - 18:00',
            duration: '2-3 hours',
            locationArea: section.city
          }));
        }
      })
      .catch(err => {
        console.error("Failed to fetch activities:", err);
        setAvailableActivities([]);
      })
      .finally(() => {
        setIsFetchingActivities(false);
      });
  }, [activeSectionId, currentTrip]);

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
      cityId: stopForm.cityId,
      country: '',
      startDate: stopForm.startDate,
      endDate: stopForm.endDate,
      budget: Number(stopForm.budget)
    });
    
    setIsAddStopOpen(false);
    setStopForm({ city: '', cityId: '', startDate: '', endDate: '', budget: '' });
  };

  const getSectionDays = (startDateStr: string, endDateStr: string) => {
    const [y1, m1, d1] = startDateStr.split('-').map(Number);
    const [y2, m2, d2] = endDateStr.split('-').map(Number);
    const start = new Date(y1, m1 - 1, d1);
    const end = new Date(y2, m2 - 1, d2);
    const daysDiff = Math.max(0, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
    const days: string[] = [];
    for (let i = 0; i <= daysDiff; i++) {
      const d = new Date(start);
      d.setDate(d.getDate() + i);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      days.push(`${y}-${m}-${day}`);
    }
    return days.length > 0 ? days : [startDateStr];
  };

  const handleAddActivity = (mockAct: ActivityTemplate) => {
    if (!activeSectionId) return;
    const section = currentTrip.sections.find(s => s.id === activeSectionId);
    if (!section) return;

    const days = getSectionDays(section.startDate, section.endDate);

    // Find day with least activities to evenly distribute
    const countsByDay: Record<string, number> = {};
    days.forEach(d => { countsByDay[d] = 0; });
    section.activities.forEach(a => {
      if (countsByDay[a.date] !== undefined) {
        countsByDay[a.date]++;
      }
    });

    // Pick day with minimum activity count
    let targetDate = days[0];
    let minCount = Infinity;
    for (const d of days) {
      if (countsByDay[d] < minCount) {
        minCount = countsByDay[d];
        targetDate = d;
      }
    }

    // Determine realistic time slot based on slot count for that day
    const TIME_SLOTS = ["09:30 AM", "01:30 PM", "05:30 PM", "08:00 PM"];
    const slotIdx = countsByDay[targetDate] % TIME_SLOTS.length;
    const targetTime = mockAct.time || TIME_SLOTS[slotIdx];

    addActivity(activeSectionId, {
      name: mockAct.name,
      category: mockAct.category,
      cost: mockAct.cost,
      date: targetDate,
      time: targetTime,
      image: mockAct.image,
      duration: mockAct.duration || "2.0 hrs",
      openTime: mockAct.openTime || "09:00 AM",
      closeTime: mockAct.closeTime || "07:00 PM",
      operatingHours: mockAct.operatingHours || "09:00 AM – 07:00 PM",
      locationArea: mockAct.locationArea || section.city
    });
  };

  const handleAiAutoPlan = async () => {
    if (!currentTrip || currentTrip.sections.length === 0) return;
    
    setIsAutoPlanning(true);
    try {
      for (const section of currentTrip.sections) {
        let cityPool: ActivityTemplate[] = [];
        try {
          const cRes = await fetch(`/api/cities?search=${encodeURIComponent(section.city)}`);
          const cData = await cRes.json();
          const city = cData.data?.cities?.[0];
          if (city) {
            const aRes = await fetch(`/api/cities/${city.id}/activities`);
            const aData = await aRes.json();
            if (aData && aData.data && aData.data.activities) {
              cityPool = aData.data.activities.map((a: any) => ({
                name: a.name,
                category: a.category,
                cost: a.cost,
                time: "10:00 AM",
                openTime: "09:00 AM",
                closeTime: "06:00 PM",
                operatingHours: "09:00 AM - 06:00 PM",
                duration: a.duration,
                locationArea: section.city,
                image: `https://source.unsplash.com/400x300/?${encodeURIComponent(a.category)},${encodeURIComponent(section.city)}`
              }));
            }
          }
        } catch(e) {
          console.error("Auto plan fetch failed for", section.city, e);
        }

        const days = getSectionDays(section.startDate, section.endDate);
        const existingNames = new Set(section.activities.map(a => a.name));
        const available = cityPool.filter(a => !existingNames.has(a.name));

        const TIME_SLOTS = ["09:30 AM", "02:00 PM", "06:30 PM"];
        let actIdx = 0;

        days.forEach((dayDate) => {
          for (let slot = 0; slot < 2; slot++) {
            if (actIdx < available.length) {
              const act = available[actIdx];
              addActivity(section.id, {
                name: act.name,
                category: act.category,
                cost: act.cost,
                date: dayDate,
                time: TIME_SLOTS[slot] || act.time || "10:00 AM",
                image: act.image,
                duration: act.duration || "2.0 hrs",
                openTime: act.openTime || "09:00 AM",
                closeTime: act.closeTime || "07:00 PM",
                operatingHours: act.operatingHours || "09:00 AM – 07:00 PM",
                locationArea: act.locationArea || section.city
              });
              actIdx++;
            }
          }
        });
      }
    } finally {
      setIsAutoPlanning(false);
    }
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
            <div className="flex items-center gap-3">
              <button
                onClick={handleAiAutoPlan}
                disabled={isAutoPlanning}
                className="bg-[#A88A4A] hover:bg-[#8F743B] text-white px-5 py-3 rounded-xl font-semibold text-xs uppercase tracking-wider shadow-sm transition-all flex items-center gap-2 whitespace-nowrap disabled:opacity-50"
                title="Automatically schedule activities evenly across all days with balanced time slots"
              >
                ✨ {isAutoPlanning ? 'Planning...' : 'AI Auto-Plan All Stops'}
              </button>
              <button onClick={handleSave} className="bg-roamora-green hover:bg-roamora-greenHover text-white px-6 py-3 rounded-xl font-medium shadow-sm transition-colors whitespace-nowrap">
                Save Itinerary
              </button>
            </div>
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
              <div className="relative">
                <label className="text-sm font-medium text-gray-700 ml-1">Destination</label>
                <div className="relative mt-1">
                  <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="text" value={stopForm.city} onChange={e=>{setStopForm({...stopForm, city: e.target.value}); setShowDestinations(true);}} placeholder="e.g. Paris, France" className="w-full bg-roamora-bg/50 border border-gray-200 rounded-xl pl-10 pr-4 py-3 outline-none focus:border-roamora-green" />
                  
                  {isSearchingDest && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-roamora-green/30 border-t-roamora-green rounded-full animate-spin" />
                  )}

                  {showDestinations && destinationSuggestions.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-100 rounded-xl shadow-lg z-50 max-h-48 overflow-y-auto">
                      {destinationSuggestions.map((dest: any) => (
                        <div 
                          key={dest.id}
                          className="px-4 py-2 hover:bg-gray-50 cursor-pointer text-sm"
                          onClick={() => {
                            setStopForm({...stopForm, city: dest.cityName, cityId: dest.id});
                            setShowDestinations(false);
                          }}
                        >
                          <span className="font-medium text-gray-800">{dest.cityName}</span>
                          <span className="text-gray-500 ml-2 text-xs">{dest.country}</span>
                        </div>
                      ))}
                    </div>
                  )}
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
        const cityActivities = availableActivities;
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
                {isFetchingActivities ? (
                  <div className="text-center py-10 text-gray-400 font-medium">
                    Loading activities...
                  </div>
                ) : filtered.length === 0 ? (
                  <div className="text-center py-10 text-gray-400 font-medium">
                    {alreadyAdded.size > 0 && alreadyAdded.size === cityActivities.length
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
