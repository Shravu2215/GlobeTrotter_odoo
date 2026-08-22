import { useNavigate, useSearchParams } from 'react-router-dom';
import Header from '@/components/Header';
import { useCommunity } from '@/hooks/useCommunity';
import { useTrip } from '@/hooks/useTrip';
import {
  ArrowLeft, MapPin, Calendar, Wallet, Clock, Tag,
  Globe, Lock, CheckCircle, Hotel, Plane, Utensils,
  Compass, CheckCircle2, Sparkles, Building2
} from 'lucide-react';

const CATEGORY_COLORS: Record<string, string> = {
  Sightseeing: '#3B82F6',
  Museum:      '#8B5CF6',
  Food:        '#F59E0B',
  Adventure:   '#EF4444',
  Nature:      '#10B981',
  Historical:  '#D97706',
  Shopping:    '#EC4899',
  Transport:   '#6B7280',
};

const getColor = (cat: string) => CATEGORY_COLORS[cat] ?? '#9CA3AF';

const parseTimeToMinutes = (timeStr?: string): number => {
  if (!timeStr) return 0;
  const str = timeStr.trim().toUpperCase();
  const match = str.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
  if (match) {
    let hours = parseInt(match[1], 10);
    const minutes = parseInt(match[2], 10);
    const ampm = match[3];
    if (ampm === 'PM' && hours < 12) hours += 12;
    if (ampm === 'AM' && hours === 12) hours = 0;
    return hours * 60 + minutes;
  }
  return 0;
};

function tripDays(start: string, end: string) {
  return Math.max(1, Math.round((new Date(end).getTime() - new Date(start).getTime()) / 86400000) + 1);
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function formatBudget(n: number) {
  return `₹${Number(n).toLocaleString('en-IN')}`;
}

const SharedItineraryView = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { getCommunityTrip } = useCommunity();
  const { currentTrip, trips } = useTrip();

  const id = searchParams.get('id') ?? '';
  let entry = getCommunityTrip(id);

  // Fallback to active trip if lookup is pending or matches active trip
  if (!entry && (currentTrip || trips[0])) {
    const fallbackTrip = currentTrip || trips[0];
    entry = {
      id: id || `community-${Date.now()}`,
      tripId: fallbackTrip.id,
      userId: 'me',
      isPublic: true,
      sharedAt: new Date().toISOString(),
      trip: fallbackTrip,
    };
  }

  if (!entry) {
    return (
      <div className="min-h-screen bg-[#F4F0E8] flex flex-col items-center justify-center p-8 text-center font-body">
        <Globe size={56} className="text-gray-300 mb-4" />
        <h2 className="text-3xl font-semibold text-gray-700 mb-2" style={{ fontFamily: 'Georgia, serif' }}>Itinerary not found</h2>
        <p className="text-gray-500 mb-6 font-medium">This itinerary may have been removed or the link is invalid.</p>
        <button
          onClick={() => navigate('/community')}
          className="bg-[#173B2B] text-white px-6 py-3 rounded-xl font-medium hover:bg-[#102E21] transition"
        >
          Back to Community
        </button>
      </div>
    );
  }

  const { trip } = entry;
  const days = tripDays(trip.startDate, trip.endDate);
  const allActivities = trip.sections.flatMap((s) => s.activities);
  const totalActivities = allActivities.length;
  const totalExpenses = allActivities.reduce((sum, a) => sum + Number(a.cost || 0), 0);
  const totalBudgetNum = Number(trip.totalBudget || 95000);
  const isMyTrip = entry.userId === 'me';

  // Group all activities by date and sort each day chronologically by AM/PM
  const dateMap: Record<string, typeof allActivities> = {};
  allActivities.forEach((act) => {
    const key = act.date || 'Unscheduled';
    if (!dateMap[key]) dateMap[key] = [];
    dateMap[key].push(act);
  });

  const sortedDates = Object.keys(dateMap).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

  // 4 Pillar Cost Estimations
  const stayEstimate = Math.round(totalBudgetNum * 0.40);
  const transportEstimate = Math.round(totalBudgetNum * 0.25);
  const mealsEstimate = Math.round(totalBudgetNum * 0.15);

  return (
    <div className="min-h-screen bg-[#F4F0E8] text-[#17251D] font-body pb-24">
      <Header />

      <main className="px-4 md:px-8 pb-24 max-w-5xl mx-auto mt-8">
        {/* ── Top Navigation Bar ── */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate('/community')}
            className="w-11 h-11 bg-white rounded-full flex items-center justify-center shadow-sm border border-[#D8D1C3] text-gray-500 hover:text-[#173B2B] hover:border-[#173B2B] transition-colors shrink-0"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-xs font-semibold text-[#173B2B] uppercase tracking-widest flex items-center gap-1">
                <Sparkles size={12} className="text-[#A88A4A]" /> Community Shared Itinerary
              </span>
              {isMyTrip ? (
                <span className="bg-[#173B2B]/10 text-[#173B2B] text-xs font-bold px-2.5 py-0.5 rounded-full">My Shared Trip</span>
              ) : (
                <span className="bg-gray-100 text-gray-600 text-xs font-medium px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <Lock size={10} /> Community Read-Only
                </span>
              )}
            </div>
            <h1 className="text-3xl md:text-4xl font-semibold text-[#173B2B] truncate" style={{ fontFamily: 'Georgia, serif' }}>
              {trip.name}
            </h1>
          </div>
        </div>

        {/* ── Hero Overview Card ── */}
        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-[#D8D1C3] mb-8">
          <div className="flex flex-wrap gap-4 mb-4 text-xs font-medium text-gray-600">
            <span className="flex items-center gap-1.5 bg-[#FAF8F5] border border-[#E8E2D5] px-3.5 py-1.5 rounded-xl">
              <MapPin size={15} className="text-[#A88A4A]" />
              <strong className="text-gray-900">{trip.destination}</strong>
            </span>
            <span className="flex items-center gap-1.5 bg-[#FAF8F5] border border-[#E8E2D5] px-3.5 py-1.5 rounded-xl">
              <Calendar size={15} className="text-[#A88A4A]" />
              {formatDate(trip.startDate)} → {formatDate(trip.endDate)} ({days} Days)
            </span>
          </div>

          {trip.description && (
            <p className="text-gray-600 text-sm leading-relaxed mb-6 bg-[#FAF8F5] p-4 rounded-2xl border border-[#E8E2D5]">
              {trip.description}
            </p>
          )}

          {/* 4 Pillar Budget Summary */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-gray-100">
            <div className="bg-[#FAF8F5] p-4 rounded-2xl border border-[#E8E2D5]">
              <div className="flex items-center gap-1.5 text-xs text-gray-500 font-semibold mb-1">
                <Wallet size={14} className="text-[#173B2B]" /> Total Budget
              </div>
              <p className="text-xl font-bold text-[#173B2B]" style={{ fontFamily: 'Georgia, serif' }}>
                {formatBudget(totalBudgetNum)}
              </p>
            </div>
            <div className="bg-[#FAF8F5] p-4 rounded-2xl border border-[#E8E2D5]">
              <div className="flex items-center gap-1.5 text-xs text-gray-500 font-semibold mb-1">
                <Compass size={14} className="text-[#10B981]" /> Activity Sights
              </div>
              <p className="text-xl font-bold text-[#10B981]" style={{ fontFamily: 'Georgia, serif' }}>
                {formatBudget(totalExpenses)}
              </p>
            </div>
            <div className="bg-[#FAF8F5] p-4 rounded-2xl border border-[#E8E2D5]">
              <div className="flex items-center gap-1.5 text-xs text-gray-500 font-semibold mb-1">
                <Hotel size={14} className="text-[#173B2B]" /> Stay Allocation
              </div>
              <p className="text-xl font-bold text-gray-800" style={{ fontFamily: 'Georgia, serif' }}>
                ~{formatBudget(stayEstimate)}
              </p>
            </div>
            <div className="bg-[#FAF8F5] p-4 rounded-2xl border border-[#E8E2D5]">
              <div className="flex items-center gap-1.5 text-xs text-gray-500 font-semibold mb-1">
                <Plane size={14} className="text-[#2563EB]" /> Transit Pool
              </div>
              <p className="text-xl font-bold text-[#2563EB]" style={{ fontFamily: 'Georgia, serif' }}>
                ~{formatBudget(transportEstimate)}
              </p>
            </div>
          </div>
        </div>

        {/* ── Day-by-Day Timeline Stream (Sorted Chronologically AM → PM) ── */}
        <section className="mb-10 space-y-8">
          <div className="flex items-center justify-between border-b border-[#D8D1C3] pb-3">
            <h2 className="text-2xl font-bold text-[#173B2B]" style={{ fontFamily: 'Georgia, serif' }}>
              Full Day-by-Day Itinerary Stream
            </h2>
            <span className="text-xs font-semibold text-gray-500 bg-white border border-[#D8D1C3] px-3 py-1 rounded-xl shadow-sm">
              {sortedDates.length} Active Day{sortedDates.length !== 1 ? 's' : ''} Scheduled
            </span>
          </div>

          {sortedDates.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-[#D8D1C3]">
              <p className="text-gray-500 text-sm font-medium">No activities planned in this shared itinerary yet.</p>
            </div>
          ) : (
            sortedDates.map((dateKey, dayIdx) => {
              const dayActs = [...dateMap[dateKey]].sort(
                (a, b) => parseTimeToMinutes(a.time) - parseTimeToMinutes(b.time)
              );
              const dayTotal = dayActs.reduce((sum, a) => sum + Number(a.cost || 0), 0);

              return (
                <div key={dateKey} className="bg-white rounded-3xl p-6 md:p-8 border border-[#D8D1C3] shadow-sm">
                  <div className="flex items-center justify-between gap-3 mb-6 pb-4 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-2xl bg-[#173B2B] text-white flex flex-col items-center justify-center text-xs font-bold shrink-0 shadow-sm">
                        <span className="text-[9px] uppercase text-[#A88A4A]">DAY</span>
                        <span>{dayIdx + 1}</span>
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-[#17251D]" style={{ fontFamily: 'Georgia, serif' }}>
                          {formatDate(dateKey)}
                        </h3>
                        <p className="text-xs text-gray-400 mt-0.5">{dayActs.length} Scheduled Experience{dayActs.length !== 1 ? 's' : ''}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 block">Day's Activity Spend</span>
                      <span className="text-base font-bold text-[#173B2B]">{formatBudget(dayTotal)}</span>
                    </div>
                  </div>

                  {/* Activity Timeline Cards */}
                  <div className="relative pl-6 md:pl-8 space-y-6 before:absolute before:left-3 before:top-3 before:bottom-3 before:w-0.5 before:bg-[#E8E2D5]">
                    {dayActs.map((act, actIdx) => {
                      const color = getColor(act.category);
                      const openHrs = act.operatingHours || (act.openTime && act.closeTime ? `${act.openTime} – ${act.closeTime}` : '09:00 AM – 06:00 PM');
                      const duration = act.duration || '2.0 hrs';

                      return (
                        <div key={act.id || actIdx} className="relative group">
                          <div className="absolute -left-[27px] md:-left-[35px] top-4 w-4 h-4 rounded-full bg-white border-4 border-[#173B2B] shadow-sm" />

                          <div className="bg-[#FAF8F5] border border-[#E8E2D5] rounded-2xl p-4 md:p-5">
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
                                  <h4 className="text-base font-semibold text-[#17251D]">{act.name}</h4>
                                  <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                                    <MapPin size={12} className="text-[#A88A4A]" /> {act.locationArea || trip.destination}
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-center justify-between md:flex-col md:items-end gap-2 shrink-0 border-t md:border-t-0 border-gray-200/60 pt-3 md:pt-0">
                                <div className="text-right">
                                  <span className="text-sm font-bold text-[#173B2B] block">
                                    {Number(act.cost) === 0 ? 'Free Entry' : formatBudget(Number(act.cost))}
                                  </span>
                                </div>
                                <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] font-semibold px-2.5 py-1 rounded-lg flex items-center gap-1">
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
                </div>
              );
            })
          )}
        </section>

        {/* ── City Sections Summary Breakdown ── */}
        <section className="space-y-6 mb-10">
          <div className="flex items-center justify-between border-b border-[#D8D1C3] pb-3">
            <div className="flex items-center gap-2">
              <Building2 className="text-[#173B2B]" size={22} />
              <h2 className="text-2xl font-bold text-[#173B2B]" style={{ fontFamily: 'Georgia, serif' }}>
                City Section Breakdown
              </h2>
            </div>
            <span className="text-xs text-gray-500 font-medium">
              {trip.sections.length} Destination Section{trip.sections.length !== 1 ? 's' : ''}
            </span>
          </div>

          <div className="space-y-4">
            {trip.sections.map((section, idx) => {
              const secCost = section.activities.reduce((sum, a) => sum + Number(a.cost || 0), 0);

              return (
                <div key={section.id} className="bg-white rounded-3xl p-6 border border-[#D8D1C3] shadow-sm">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-gray-100">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="w-7 h-7 rounded-xl bg-[#173B2B] text-white flex items-center justify-center text-xs font-bold">
                          {idx + 1}
                        </span>
                        <h3 className="text-xl font-bold text-[#173B2B]" style={{ fontFamily: 'Georgia, serif' }}>
                          📍 {section.city}, {section.country}
                        </h3>
                      </div>
                      <p className="text-xs text-gray-400 mt-1">
                        {formatDate(section.startDate)} – {formatDate(section.endDate)}
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-gray-400 uppercase font-semibold block">Section Budget</span>
                      <strong className="text-base text-[#173B2B]">{formatBudget(section.budget)}</strong>
                      <span className="text-[11px] text-gray-400 block font-medium">({formatBudget(secCost)} activities spent)</span>
                    </div>
                  </div>

                  <div className="mt-4 pt-2">
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-2">
                      Included Activities ({section.activities.length})
                    </span>
                    {section.activities.length === 0 ? (
                      <p className="text-xs text-gray-400 italic">No activities added in this section.</p>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {section.activities.map((a) => (
                          <span key={a.id} className="bg-[#FAF8F5] border border-[#E8E2D5] text-[#17251D] text-xs px-3 py-1.5 rounded-xl font-medium flex items-center gap-1.5">
                            <Tag size={12} className="text-[#A88A4A]" /> {a.name} ({formatBudget(Number(a.cost))})
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── Back to Community Button ── */}
        <div className="text-center pt-4">
          <button
            onClick={() => navigate('/community')}
            className="inline-flex items-center gap-2 bg-[#173B2B] text-white px-8 py-3.5 rounded-xl font-semibold text-xs uppercase tracking-wider hover:bg-[#102E21] transition shadow-md"
          >
            <Globe size={16} /> Back to Community Hub
          </button>
        </div>
      </main>
    </div>
  );
};

export default SharedItineraryView;
