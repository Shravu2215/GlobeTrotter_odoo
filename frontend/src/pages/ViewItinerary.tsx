import { useState } from 'react';
import { useTrip } from '@/hooks/useTrip';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import {
  Calendar,
  MapPin,
  ArrowRight,
  Search,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Tag,
  Compass,
  ArrowLeft
} from 'lucide-react';

// --- Native Date Utilities ---
const parseDateStr = (dateStr: string) => {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d);
};
const addDays = (date: Date, days: number) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};
const formatDMY = (date: Date) =>
  date.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
const formatDM = (date: Date) =>
  date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
const formatDayName = (date: Date) =>
  date.toLocaleDateString('en-IN', { weekday: 'short' });
const formatYMD = (date: Date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

// Fallback operating hours dictionary
const DEFAULT_HOURS: Record<string, { open: string; close: string; duration: string; area: string }> = {
  museum: { open: '09:00 AM', close: '06:00 PM', duration: '2.5 hrs', area: 'Historic District' },
  sightseeing: { open: '09:30 AM', close: '10:00 PM', duration: '2.0 hrs', area: 'City Landmark' },
  food: { open: '11:30 AM', close: '10:30 PM', duration: '2.0 hrs', area: 'Dining Quarter' },
  adventure: { open: '08:30 AM', close: '05:30 PM', duration: '3.5 hrs', area: 'Outdoor Center' },
  historical: { open: '08:30 AM', close: '06:30 PM', duration: '2.0 hrs', area: 'Heritage Site' },
  nature: { open: 'Open 24 Hours', close: 'Open 24 Hours', duration: '2.5 hrs', area: 'Scenic Park' },
  shopping: { open: '10:00 AM', close: '08:00 PM', duration: '2.0 hrs', area: 'Shopping Promenade' },
};

const ViewItinerary = () => {
  const { currentTrip, addActivity, saveItinerary } = useTrip();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [aiNotice, setAiNotice] = useState<string | null>(null);

  // --- Guard: no trip ---
  if (!currentTrip || !currentTrip.startDate || !currentTrip.endDate) {
    return (
      <div className="min-h-screen bg-[#F4F0E8] flex flex-col items-center justify-center p-8 text-center font-body">
        <span className="text-5xl mb-6">✈️</span>
        <h2 className="text-3xl font-semibold text-[#173B2B] mb-3" style={{ fontFamily: 'Georgia, serif' }}>
          No active trip found
        </h2>
        <p className="text-gray-500 mb-8 font-medium">Create a trip first to view your itinerary.</p>
        <button
          onClick={() => navigate('/create-trip')}
          className="bg-[#173B2B] text-white px-8 py-3 rounded-xl font-medium hover:bg-[#102E21] transition-colors"
        >
          Create Trip
        </button>
      </div>
    );
  }

  const startDate = parseDateStr(currentTrip.startDate);
  const endDate = parseDateStr(currentTrip.endDate);

  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
    return (
      <div className="min-h-screen bg-[#F4F0E8] flex flex-col items-center justify-center p-8 text-center font-body">
        <h2 className="text-3xl font-semibold text-red-500 mb-4" style={{ fontFamily: 'Georgia, serif' }}>Invalid Trip Dates</h2>
        <button onClick={() => navigate('/create-trip')} className="bg-[#173B2B] text-white px-6 py-3 rounded-xl">
          Recreate Trip
        </button>
      </div>
    );
  }

  // --- Derived stats ---
  const tripDuration = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24)) + 1;
  const destinationsCount = new Set(currentTrip.sections.map((s) => s.city)).size;
  const allActivities = currentTrip.sections.flatMap((s) => s.activities);
  const totalActivities = allActivities.length;

  // --- Generate days array ---
  const daysList: Date[] = [];
  let cur = new Date(startDate);
  while (cur <= endDate) {
    daysList.push(new Date(cur));
    cur = addDays(cur, 1);
  }

  // --- Helpers ---
  const getSectionForDate = (date: Date) =>
    currentTrip.sections.find((section) => {
      const s = parseDateStr(section.startDate);
      const e = parseDateStr(section.endDate);
      const d = new Date(date);
      return d >= s && d <= e;
    });

  const getActivitiesForDate = (date: Date) => {
    const key = formatYMD(date);
    return allActivities.filter((a) => a.date === key);
  };

  const matchesFilter = (act: (typeof allActivities)[0]) => {
    const matchesSearch = !searchQuery || act.name.toLowerCase().includes(searchQuery.toLowerCase()) || act.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCategory === 'all' || act.category.toLowerCase() === selectedCategory.toLowerCase();
    return matchesSearch && matchesCat;
  };

  const hasAnyActivities = allActivities.length > 0;

  // Extract unique categories for filter pills
  const availableCategories = Array.from(new Set(allActivities.map((a) => a.category))).filter(Boolean);

  return (
    <div className="min-h-screen bg-[#F4F0E8] text-[#17251D] font-body pb-24">
      <Header />

      <main className="px-4 md:px-8 pb-24 max-w-6xl mx-auto mt-8">
        {/* ── Trip Header Card ── */}
        <section className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-[#D8D1C3] mb-6 relative overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <button
                onClick={() => navigate('/itinerary')}
                className="text-gray-400 hover:text-[#173B2B] text-xs font-semibold uppercase tracking-wider mb-3 flex items-center gap-1.5 transition-colors"
              >
                <ArrowLeft size={14} /> Back to Itinerary Builder
              </button>
              <h1 className="text-3xl md:text-4xl font-semibold text-[#173B2B] mb-2" style={{ fontFamily: 'Georgia, serif' }}>
                {currentTrip.name}
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-gray-500">
                <span className="flex items-center gap-1.5 bg-[#FAF8F5] border border-[#E8E2D5] px-3 py-1.5 rounded-xl">
                  <Calendar size={14} className="text-[#A88A4A]" />
                  {formatDMY(startDate)} – {formatDMY(endDate)} ({tripDuration} Days)
                </span>
                <span className="flex items-center gap-1.5 bg-[#FAF8F5] border border-[#E8E2D5] px-3 py-1.5 rounded-xl">
                  <MapPin size={14} className="text-[#A88A4A]" />
                  {currentTrip.sections.length > 0
                    ? currentTrip.sections.map((s) => s.city).join(' → ')
                    : currentTrip.destination}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/budget')}
                className="flex items-center gap-2 bg-[#173B2B] hover:bg-[#102E21] text-white px-6 py-3.5 rounded-xl font-semibold text-xs uppercase tracking-wider transition-all shadow-md"
              >
                View Cost Breakdown <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </section>

        {/* ── Summary Cards ── */}
        <section className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: 'Trip Duration', value: `${tripDuration} Days` },
            { label: 'Destinations', value: String(destinationsCount) },
            { label: 'Planned Sights', value: `${totalActivities} Activities` },
          ].map(({ label, value }) => (
            <div key={label} className="bg-white rounded-2xl p-4 md:p-5 shadow-sm border border-[#D8D1C3] text-center">
              <div className="text-gray-400 font-semibold text-[10px] uppercase tracking-wider mb-1">{label}</div>
              <div className="text-xl md:text-2xl font-bold text-[#173B2B]" style={{ fontFamily: 'Georgia, serif' }}>
                {value}
              </div>
            </div>
          ))}
        </section>

        {/* ── Search & Filter Toolbar ── */}
        <section className="flex flex-col md:flex-row gap-3 mb-8">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search attractions, museums, foods..."
              className="w-full pl-10 pr-4 py-3 bg-white border border-[#D8D1C3] rounded-2xl outline-none focus:border-[#173B2B] text-xs font-medium transition-colors shadow-sm"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-2 rounded-xl text-xs font-semibold transition shrink-0 ${
                selectedCategory === 'all'
                  ? 'bg-[#173B2B] text-white shadow-sm'
                  : 'bg-white text-gray-600 border border-[#D8D1C3] hover:bg-gray-50'
              }`}
            >
              All Categories
            </button>
            {availableCategories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-2 rounded-xl text-xs font-semibold transition shrink-0 ${
                  selectedCategory === cat
                    ? 'bg-[#173B2B] text-white shadow-sm'
                    : 'bg-white text-gray-600 border border-[#D8D1C3] hover:bg-gray-50'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </section>

        {/* ── Empty State ── */}
        {!hasAnyActivities ? (
          <div className="bg-white rounded-3xl p-16 text-center border border-dashed border-[#D8D1C3]">
            <span className="text-5xl mb-4 block">✈️</span>
            <h3 className="text-2xl font-semibold text-[#173B2B] mb-2" style={{ fontFamily: 'Georgia, serif' }}>
              Your itinerary is waiting to be planned.
            </h3>
            <p className="text-gray-500 mb-6 text-sm font-medium">No activities have been scheduled yet.</p>
            <button
              onClick={() => navigate('/itinerary')}
              className="bg-[#173B2B] text-white px-6 py-3 rounded-xl text-xs font-semibold uppercase tracking-wider hover:bg-[#102E21] transition shadow-sm"
            >
              Go to Itinerary Builder
            </button>
          </div>
        ) : (
          /* ── Day-by-Day Timeline Stream ── */
          <div className="space-y-10">
            {daysList.map((date, index) => {
              const section = getSectionForDate(date);
              const dayActivities = getActivitiesForDate(date).filter(matchesFilter);
              const rawActivities = getActivitiesForDate(date);
              const dailyTotal = rawActivities.reduce((sum, a) => sum + Number(a.cost || 0), 0);

              return (
                <div key={index} className="bg-white rounded-3xl p-6 md:p-8 border border-[#D8D1C3] shadow-sm">
                  {/* Day Header Row */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6 pb-4 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-[#173B2B] text-white flex flex-col items-center justify-center text-xs font-bold shrink-0 shadow-md">
                        <span className="text-[10px] uppercase text-[#A88A4A]">DAY</span>
                        <span>{index + 1}</span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-xl font-bold text-[#17251D]" style={{ fontFamily: 'Georgia, serif' }}>
                            {formatDayName(date)}, {formatDM(date)}
                          </h3>
                          {section && (
                            <span className="bg-[#173B2B]/10 text-[#173B2B] text-[11px] font-bold px-2.5 py-0.5 rounded-full">
                              📍 {section.city}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {dayActivities.length} Experience{dayActivities.length !== 1 ? 's' : ''} Scheduled
                        </p>
                      </div>
                    </div>

                    <div className="text-right self-end sm:self-auto">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 block">Day's Activity Cost</span>
                      <span className="text-lg font-bold text-[#173B2B]">₹{dailyTotal.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Activity Timeline Items */}
                  {dayActivities.length > 0 ? (
                    <div className="relative pl-6 md:pl-8 space-y-6 before:absolute before:left-3 before:top-3 before:bottom-3 before:w-0.5 before:bg-[#E8E2D5]">
                      {dayActivities.map((act, actIdx) => {
                        const fallback = DEFAULT_HOURS[act.category?.toLowerCase()] || DEFAULT_HOURS.sightseeing;
                        const openHrs = act.operatingHours || (act.openTime && act.closeTime ? `${act.openTime} – ${act.closeTime}` : fallback.open + ' – ' + fallback.close);
                        const duration = act.duration || fallback.duration;
                        const locationArea = act.locationArea || section?.city || fallback.area;

                        return (
                          <div key={act.id || actIdx} className="relative group">
                            {/* Timeline Node Dot */}
                            <div className="absolute -left-[27px] md:-left-[35px] top-4 w-4 h-4 rounded-full bg-white border-4 border-[#173B2B] shadow-sm group-hover:scale-125 transition-transform" />

                            <div className="bg-[#FAF8F5] border border-[#E8E2D5] rounded-2xl p-4 md:p-5 hover:border-[#173B2B] transition-all hover:bg-white hover:shadow-sm">
                              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="flex items-start gap-4">
                                  {act.image && (
                                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-200 shrink-0 hidden sm:block">
                                      <img src={act.image} alt={act.name} className="w-full h-full object-cover" onError={(e) => (e.currentTarget.style.display = 'none')} />
                                    </div>
                                  )}
                                  <div>
                                    <div className="flex flex-wrap items-center gap-2 mb-1">
                                      <span className="bg-[#173B2B] text-white text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
                                        <Clock size={10} /> {act.time || '10:00 AM'}
                                      </span>
                                      <span className="bg-gray-100 text-gray-700 text-[10px] font-semibold px-2 py-0.5 rounded-md">
                                        ⏱ {duration}
                                      </span>
                                      <span className="bg-[#A88A4A]/20 text-[#8B6E32] text-[10px] font-bold px-2 py-0.5 rounded-md uppercase">
                                        {act.category}
                                      </span>
                                    </div>

                                    <h4 className="text-base font-semibold text-[#17251D] leading-tight">{act.name}</h4>
                                    <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                                      <MapPin size={12} className="text-[#A88A4A]" /> {locationArea}
                                    </p>
                                  </div>
                                </div>

                                <div className="flex items-center justify-between md:flex-col md:items-end gap-2 shrink-0 border-t md:border-t-0 border-gray-200/60 pt-3 md:pt-0">
                                  <div className="text-right">
                                    <span className="text-sm font-bold text-[#173B2B] block">
                                      {Number(act.cost) === 0 ? 'Free Entry' : `₹${Number(act.cost).toLocaleString()}`}
                                    </span>
                                  </div>

                                  {/* Opening/Closing Verification Badge */}
                                  <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] font-semibold px-2.5 py-1 rounded-lg flex items-center gap-1" title="Location Operating Hours">
                                    <CheckCircle2 size={12} className="text-emerald-600 shrink-0" />
                                    <span>Open: {openHrs}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="p-8 text-center bg-[#FAF8F5] border border-dashed border-[#E8E2D5] rounded-2xl">
                      <span className="text-xs text-gray-400 font-medium block mb-2">No activities scheduled for this date</span>
                      <button
                        onClick={() => navigate('/itinerary')}
                        className="text-xs font-semibold text-[#173B2B] hover:underline"
                      >
                        + Add Activity in Itinerary Builder
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default ViewItinerary;
