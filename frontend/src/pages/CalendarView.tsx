import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import { useTrip } from '@/hooks/useTrip';
import {
  CalendarDays, ChevronLeft, ChevronRight, MapPin, Clock,
  Tag, Plus, ArrowRight, Wallet, CheckCircle2, Sparkles
} from 'lucide-react';

const CATEGORY_COLORS: Record<string, string> = {
  Sightseeing: '#3B82F6',
  Museum:      '#8B5CF6',
  Food:        '#F59E0B',
  Adventure:   '#10B981',
  Nature:      '#34D399',
  Historical:  '#EF4444',
  Shopping:    '#EC4899',
  Transport:   '#6B7280',
};

const getColor = (cat: string) => CATEGORY_COLORS[cat] || '#9CA3AF';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];
const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function CalendarView() {
  const navigate = useNavigate();
  const { currentTrip, trips, loadTrip } = useTrip();

  // Selected trip (defaults to currentTrip, fallback to trips[0])
  const activeTrip = currentTrip || (trips.length > 0 ? trips[0] : null);

  // Initialize view month/year from active trip start date if available
  const initialDate = useMemo(() => {
    if (activeTrip?.startDate) {
      const parts = activeTrip.startDate.split('-').map(Number);
      if (parts.length === 3) return new Date(parts[0], parts[1] - 1, 1);
    }
    return new Date();
  }, [activeTrip]);

  const [currentMonth, setCurrentMonth] = useState<Date>(initialDate);
  const [selectedDateStr, setSelectedDateStr] = useState<string>(activeTrip?.startDate || '');

  // Flatten all activities in activeTrip with section info
  const activitiesByDate = useMemo(() => {
    const map: Record<string, { activity: import('@/types/trip').Activity; sectionCity: string }[]> = {};
    if (!activeTrip) return map;

    activeTrip.sections.forEach((section) => {
      section.activities.forEach((act) => {
        if (!map[act.date]) map[act.date] = [];
        map[act.date].push({ activity: act, sectionCity: section.city });
      });
    });
    return map;
  }, [activeTrip]);

  // Calendar matrix calculations
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  const firstDayIndex = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const prevMonth = () => {
    setCurrentMonth(new Date(year, month - 1, 1));
  };
  const nextMonth = () => {
    setCurrentMonth(new Date(year, month + 1, 1));
  };

  const isDateInTrip = (dateStr: string) => {
    if (!activeTrip?.startDate || !activeTrip?.endDate) return false;
    return dateStr >= activeTrip.startDate && dateStr <= activeTrip.endDate;
  };

  const selectedActivities = selectedDateStr ? (activitiesByDate[selectedDateStr] || []) : [];

  const handleTripSelect = (tripId: string) => {
    loadTrip(tripId);
    const trip = trips.find(t => t.id === tripId);
    if (trip?.startDate) {
      const parts = trip.startDate.split('-').map(Number);
      if (parts.length === 3) setCurrentMonth(new Date(parts[0], parts[1] - 1, 1));
      setSelectedDateStr(trip.startDate);
    }
  };

  return (
    <div className="min-h-screen bg-roamora-bg text-roamora-text font-body">
      <Header />

      <main className="max-w-6xl mx-auto px-4 md:px-8 py-8 pb-24">
        {/* ── Page Header ── */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <CalendarDays size={20} className="text-roamora-green" />
              <span className="text-xs font-bold uppercase tracking-widest text-roamora-green">Timeline & Schedule</span>
            </div>
            <h1 className="font-display text-3xl md:text-4xl font-bold text-gray-900">
              Itinerary Calendar
            </h1>
          </div>

          {/* Trip Selector if multiple trips exist */}
          {trips.length > 1 && (
            <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-2xl border border-gray-200 shadow-sm">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider pl-1">Trip:</span>
              <select
                value={activeTrip?.id || ''}
                onChange={(e) => handleTripSelect(e.target.value)}
                className="bg-transparent text-sm font-semibold text-gray-800 outline-none cursor-pointer"
              >
                {trips.map(t => (
                  <option key={t.id} value={t.id}>{t.name} ({t.destination})</option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* ── No Trip Guard ── */}
        {!activeTrip ? (
          <div className="bg-white rounded-3xl p-16 text-center border border-dashed border-gray-200 shadow-sm max-w-xl mx-auto my-8">
            <div className="w-16 h-16 rounded-full bg-roamora-green/10 flex items-center justify-center mx-auto mb-4 text-roamora-green">
              <CalendarDays size={28} />
            </div>
            <h3 className="font-display text-2xl font-bold text-gray-800 mb-2">No Active Trip Selected</h3>
            <p className="text-gray-500 text-sm mb-6">Create or select a trip to view its calendar schedule and daily activities.</p>
            <button
              onClick={() => navigate('/create-trip')}
              className="bg-roamora-green text-white font-semibold px-6 py-3 rounded-xl hover:bg-emerald-700 transition-colors shadow-sm inline-flex items-center gap-2"
            >
              <Plus size={18} /> Plan a Trip
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* ── Calendar Grid Section ── */}
            <div className="lg:col-span-7 bg-white rounded-3xl p-6 md:p-8 border border-gray-100 shadow-sm">
              {/* Trip Context Sub-banner */}
              <div className="p-4 mb-6 rounded-2xl bg-emerald-50/70 border border-emerald-100 flex items-center justify-between">
                <div>
                  <h2 className="font-display text-lg font-bold text-gray-900">{activeTrip.name}</h2>
                  <p className="text-xs text-emerald-800 font-medium flex items-center gap-1 mt-0.5">
                    <MapPin size={12} /> {activeTrip.destination} · {activeTrip.startDate} to {activeTrip.endDate}
                  </p>
                </div>
                <button
                  onClick={() => navigate('/itinerary')}
                  className="text-xs font-bold text-roamora-green bg-white px-3 py-1.5 rounded-xl border border-emerald-200 hover:bg-emerald-50 transition-colors shrink-0"
                >
                  Edit in Builder
                </button>
              </div>

              {/* Month Navigation */}
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-display text-xl font-bold text-gray-900">
                  {MONTH_NAMES[month]} {year}
                </h3>
                <div className="flex gap-2">
                  <button
                    onClick={prevMonth}
                    className="w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <button
                    onClick={nextMonth}
                    className="w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors"
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>

              {/* Day Name Headers */}
              <div className="grid grid-cols-7 gap-2 mb-2 text-center">
                {DAY_NAMES.map((d) => (
                  <div key={d} className="text-xs font-bold text-gray-400 py-1 uppercase tracking-wider">
                    {d}
                  </div>
                ))}
              </div>

              {/* Day Cells Matrix */}
              <div className="grid grid-cols-7 gap-2">
                {/* Empty cells before month start */}
                {Array.from({ length: firstDayIndex }).map((_, idx) => (
                  <div key={`empty-${idx}`} className="h-14 sm:h-16 rounded-xl bg-gray-50/50" />
                ))}

                {/* Days of month */}
                {Array.from({ length: daysInMonth }).map((_, idx) => {
                  const dayNum = idx + 1;
                  const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
                  const inTrip = isDateInTrip(dateStr);
                  const isSelected = selectedDateStr === dateStr;
                  const dayActs = activitiesByDate[dateStr] || [];

                  return (
                    <button
                      key={dateStr}
                      onClick={() => setSelectedDateStr(dateStr)}
                      className={`h-14 sm:h-16 rounded-2xl p-1.5 sm:p-2 flex flex-col justify-between items-start transition-all relative border ${
                        isSelected
                          ? 'bg-roamora-green text-white border-roamora-green shadow-md scale-105 z-10'
                          : inTrip
                          ? 'bg-emerald-50/80 text-gray-900 border-emerald-200 hover:border-roamora-green'
                          : 'bg-white text-gray-700 border-gray-100 hover:bg-gray-50'
                      }`}
                    >
                      <span className={`text-xs sm:text-sm font-bold ${isSelected ? 'text-white' : inTrip ? 'text-emerald-900' : 'text-gray-700'}`}>
                        {dayNum}
                      </span>

                      {/* Indicator dots / activity count */}
                      {dayActs.length > 0 && (
                        <div className="w-full flex items-center justify-between">
                          <div className="flex gap-1">
                            {dayActs.slice(0, 3).map((a, i) => (
                              <div
                                key={i}
                                className="w-1.5 h-1.5 rounded-full shrink-0"
                                style={{ backgroundColor: isSelected ? '#FFFFFF' : getColor(a.activity.category) }}
                              />
                            ))}
                          </div>
                          <span className={`text-[10px] font-bold ${isSelected ? 'text-white' : 'text-emerald-700'}`}>
                            {dayActs.length}
                          </span>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Legend */}
              <div className="flex flex-wrap items-center gap-4 mt-6 pt-4 border-t border-gray-100 text-xs text-gray-500 font-medium">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-md bg-emerald-50 border border-emerald-200" />
                  <span>Trip Duration</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-md bg-roamora-green" />
                  <span>Selected Day</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-blue-500" />
                  <span>Activities Scheduled</span>
                </div>
              </div>
            </div>

            {/* ── Daily Schedule Detail Panel ── */}
            <div className="lg:col-span-5 flex flex-col gap-6">
              <div className="bg-white rounded-3xl p-6 md:p-8 border border-gray-100 shadow-sm flex-1">
                <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-100">
                  <div>
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Day Schedule</span>
                    <h3 className="font-display text-xl font-bold text-gray-900">
                      {selectedDateStr ? new Date(selectedDateStr + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }) : 'Select a date'}
                    </h3>
                  </div>
                  <span className="bg-roamora-green/10 text-roamora-green text-xs font-bold px-3 py-1 rounded-full">
                    {selectedActivities.length} {selectedActivities.length === 1 ? 'Activity' : 'Activities'}
                  </span>
                </div>

                {selectedActivities.length === 0 ? (
                  <div className="py-12 text-center text-gray-400">
                    <Clock size={36} className="mx-auto mb-2 text-gray-300" />
                    <p className="text-sm font-semibold text-gray-600 mb-1">No activities scheduled on this day</p>
                    <p className="text-xs text-gray-400 mb-6">You can add activities to this date in the itinerary builder.</p>
                    <button
                      onClick={() => navigate('/itinerary')}
                      className="text-xs font-bold text-roamora-green bg-roamora-green/10 px-4 py-2 rounded-xl hover:bg-roamora-green hover:text-white transition-colors"
                    >
                      + Add Activity
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {selectedActivities.map(({ activity, sectionCity }, idx) => {
                      const color = getColor(activity.category);
                      return (
                        <div
                          key={activity.id || idx}
                          className="p-4 rounded-2xl border border-gray-100 bg-gray-50/70 hover:bg-white hover:shadow-md transition-all flex items-start gap-3.5"
                        >
                          <div
                            className="w-3 h-3 rounded-full mt-1.5 shrink-0"
                            style={{ backgroundColor: color }}
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2 mb-1">
                              <h4 className="font-semibold text-gray-900 text-sm truncate">{activity.name}</h4>
                              <span className="text-xs font-bold text-gray-900 shrink-0">
                                {activity.cost === 0 ? 'Free' : `₹${Number(activity.cost).toLocaleString('en-IN')}`}
                              </span>
                            </div>

                            <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 font-medium">
                              <span className="flex items-center gap-1 text-gray-600">
                                <Clock size={12} /> {activity.time || 'Flexible'}
                              </span>
                              <span className="flex items-center gap-1 text-gray-600">
                                <MapPin size={12} /> {sectionCity}
                              </span>
                              <span
                                className="px-2 py-0.5 rounded-full text-[10px] font-bold"
                                style={{ backgroundColor: `${color}18`, color: color }}
                              >
                                {activity.category}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    {/* Total cost for selected day */}
                    <div className="pt-4 border-t border-dashed border-gray-200 flex justify-between items-center text-xs">
                      <span className="font-bold text-gray-500 uppercase tracking-wide">Daily Estimated Cost</span>
                      <span className="font-display text-base font-bold text-roamora-green">
                        ₹{selectedActivities.reduce((s, a) => s + Number(a.activity.cost || 0), 0).toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Quick Jump to View Itinerary */}
              <button
                onClick={() => navigate('/view-itinerary')}
                className="w-full bg-gradient-to-r from-roamora-green to-emerald-700 text-white p-4 rounded-2xl font-semibold text-sm flex items-center justify-between shadow-sm hover:shadow-md transition-shadow"
              >
                <span>View Full Day-by-Day Itinerary</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
