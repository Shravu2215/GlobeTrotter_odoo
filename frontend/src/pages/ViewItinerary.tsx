import { useState } from 'react';
import { useTrip } from '@/hooks/useTrip';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import { Calendar, MapPin, ArrowRight, Search } from 'lucide-react';

// --- Native Date Utilities (no external libs) ---
const parseDateStr = (dateStr: string) => {
  // Parse as local time to avoid timezone offset issues
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
  date.toLocaleDateString('en-IN', { day: 'numeric', month: 'long' });
const formatYMD = (date: Date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const ViewItinerary = () => {
  const { currentTrip } = useTrip();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  // --- Guard: no trip ---
  if (!currentTrip || !currentTrip.startDate || !currentTrip.endDate) {
    return (
      <div className="min-h-screen bg-roamora-bg flex flex-col items-center justify-center p-8 text-center">
        <span className="text-5xl mb-6">✈️</span>
        <h2 className="font-display text-3xl font-semibold text-roamora-green mb-3">No active trip found</h2>
        <p className="text-gray-500 mb-8 font-medium">Create a trip first to view your itinerary.</p>
        <button
          onClick={() => navigate('/create-trip')}
          className="bg-roamora-green text-white px-8 py-3 rounded-xl font-medium hover:bg-roamora-greenHover transition-colors"
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
      <div className="min-h-screen bg-roamora-bg flex flex-col items-center justify-center p-8 text-center">
        <h2 className="font-display text-3xl font-semibold text-red-500 mb-4">Invalid Trip Dates</h2>
        <button onClick={() => navigate('/create-trip')} className="bg-roamora-green text-white px-6 py-3 rounded-xl">
          Recreate Trip
        </button>
      </div>
    );
  }

  // --- Derived stats ---
  const tripDuration = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24)) + 1;
  const destinationsCount = new Set(currentTrip.sections.map(s => s.city)).size;
  const allActivities = currentTrip.sections.flatMap(s => s.activities);
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
    currentTrip.sections.find(section => {
      const s = parseDateStr(section.startDate);
      const e = parseDateStr(section.endDate);
      const d = new Date(date);
      return d >= s && d <= e;
    });

  const getActivitiesForDate = (date: Date) => {
    const key = formatYMD(date);
    return allActivities.filter(a => a.date === key);
  };

  // --- Search filtering ---
  const matchesSearch = (activityName: string) =>
    !searchQuery || activityName.toLowerCase().includes(searchQuery.toLowerCase());

  const hasAnyActivities = allActivities.length > 0;

  return (
    <div className="min-h-screen bg-roamora-bg text-roamora-text font-body">
      <Header />

      <main className="px-4 md:px-8 pb-24 max-w-5xl mx-auto mt-6">

        {/* ── Trip Header Card ── */}
        <section className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 mb-6 relative overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div>
              <button
                onClick={() => navigate('/itinerary')}
                className="text-gray-400 hover:text-roamora-green text-sm font-medium mb-4 flex items-center gap-1 transition-colors"
              >
                ← Back to Itinerary Builder
              </button>
              <h1 className="font-display text-4xl font-semibold text-roamora-green mb-3">
                {currentTrip.name}
              </h1>
              <p className="text-gray-600 font-medium flex items-center gap-2 mb-2">
                <Calendar size={16} className="text-roamora-gold shrink-0" />
                {formatDMY(startDate)} – {formatDMY(endDate)}
              </p>
              <p className="text-gray-500 font-medium flex items-center gap-2">
                <MapPin size={16} className="text-roamora-gold shrink-0" />
                {currentTrip.sections.length > 0
                  ? currentTrip.sections.map(s => s.city).join(' → ')
                  : currentTrip.destination}
              </p>
            </div>
            <button
              onClick={() => navigate('/budget')}
              className="shrink-0 flex items-center gap-2 bg-roamora-green/10 text-roamora-green hover:bg-roamora-green hover:text-white px-6 py-3 rounded-xl font-semibold transition-all self-start"
            >
              View Budget <ArrowRight size={18} />
            </button>
          </div>
        </section>

        {/* ── Summary Strip ── */}
        <section className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Trip Duration', value: `${tripDuration} Days` },
            { label: 'Destinations', value: String(destinationsCount) },
            { label: 'Activities', value: String(totalActivities) },
          ].map(({ label, value }) => (
            <div key={label} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 text-center">
              <div className="text-gray-400 font-medium text-xs uppercase tracking-wide mb-1">{label}</div>
              <div className="font-display text-2xl md:text-3xl font-semibold text-roamora-green">{value}</div>
            </div>
          ))}
        </section>

        {/* ── Toolbar ── */}
        <section className="flex flex-col md:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search activities..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-xl outline-none focus:border-roamora-green text-sm transition-colors"
            />
          </div>
          <div className="flex gap-2">
            <button className="bg-white border border-gray-300 rounded-xl px-4 py-2.5 text-sm font-medium hover:bg-gray-50">Group by</button>
            <button className="bg-white border border-gray-300 rounded-xl px-4 py-2.5 text-sm font-medium hover:bg-gray-50">Filter</button>
            <button className="bg-white border border-gray-300 rounded-xl px-4 py-2.5 text-sm font-medium hover:bg-gray-50">Sort by...</button>
          </div>
        </section>

        {/* ── Itinerary Title ── */}
        <h2 className="text-center font-display text-2xl md:text-3xl font-semibold text-gray-800 mb-8">
          Itinerary for {currentTrip.destination || (currentTrip.sections[0]?.city ?? 'your trip')}
        </h2>

        {/* ── Empty State ── */}
        {!hasAnyActivities ? (
          <div className="bg-white rounded-3xl p-16 text-center border border-dashed border-gray-300">
            <span className="text-5xl mb-4 block">✈️</span>
            <h3 className="font-display text-2xl font-semibold text-roamora-green mb-2">
              Your itinerary is waiting to be planned.
            </h3>
            <p className="text-gray-500 mb-6 font-medium">No activities have been added yet.</p>
            <button
              onClick={() => navigate('/itinerary')}
              className="bg-roamora-green text-white px-6 py-3 rounded-xl font-medium hover:bg-roamora-greenHover transition-colors"
            >
              Go back to Itinerary Builder
            </button>
          </div>
        ) : (
          <>
            {/* ── Column Headers (shown once above all days) ── */}
            <div className="flex gap-6 mb-3 pl-32">
              <div className="flex-1 text-center text-sm font-semibold text-gray-500 uppercase tracking-wider">Physical Activity</div>
              <div className="w-36 text-center text-sm font-semibold text-gray-500 uppercase tracking-wider">Expense</div>
            </div>

            {/* ── Day-by-Day Rows ── */}
            <section className="flex flex-col gap-10">
              {daysList.map((date, index) => {
                const section = getSectionForDate(date);
                const dayActivities = getActivitiesForDate(date).filter(a => matchesSearch(a.name));
                const rawActivities = getActivitiesForDate(date);
                const dailyTotal = rawActivities.reduce((sum, a) => sum + Number(a.cost), 0);

                return (
                  <div key={index} className="flex gap-6 items-start">
                    {/* Day Label Column */}
                    <div className="w-24 shrink-0 pt-1">
                      <div className="border border-gray-400 text-gray-700 font-semibold text-sm px-3 py-2 rounded-lg text-center">
                        Day {index + 1}
                      </div>
                      <div className="text-xs text-gray-500 mt-2 font-medium text-center leading-tight">
                        {formatDM(date)}
                      </div>
                      {section && (
                        <div className="text-xs text-roamora-green font-semibold mt-1 text-center leading-tight">
                          {section.city}
                        </div>
                      )}
                    </div>

                    {/* Activities Column */}
                    <div className="flex-1 flex flex-col gap-0">
                      {dayActivities.length > 0 ? (
                        <>
                          {dayActivities.map((activity, i) => (
                            <div key={activity.id} className="flex flex-col">
                              <div className="flex gap-4 items-stretch">
                                {/* Activity Box */}
                                <div className="flex-1 border border-gray-300 rounded-xl px-5 py-4 bg-white hover:border-roamora-green transition-colors flex items-center justify-between gap-3">
                                  <div className="min-w-0">
                                    <h5 className="font-semibold text-gray-900 truncate">{activity.name}</h5>
                                    <div className="flex items-center gap-3 mt-0.5">
                                      <span className="text-xs text-gray-500">{activity.time}</span>
                                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded font-medium">
                                        {activity.category}
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                {/* Expense Box */}
                                <div className="w-36 border border-gray-300 rounded-xl bg-white flex items-center justify-center font-semibold text-gray-800 shrink-0">
                                  ₹{Number(activity.cost).toLocaleString()}
                                </div>
                              </div>

                              {/* Arrow connector between activities */}
                              {i < dayActivities.length - 1 && (
                                <div className="flex items-center my-1 pl-4">
                                  <div className="flex flex-col items-center">
                                    <div className="w-0.5 h-4 bg-gray-300"></div>
                                    <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-gray-400"></div>
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}

                          {/* Day Total row */}
                          <div className="flex gap-4 mt-3 pt-3 border-t border-dashed border-gray-200">
                            <div className="flex-1 flex justify-end items-center pr-4">
                              <span className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                                Day {index + 1} Total
                              </span>
                            </div>
                            <div className="w-36 text-center font-bold text-roamora-green text-lg">
                              ₹{dailyTotal.toLocaleString()}
                            </div>
                          </div>
                        </>
                      ) : (
                        <div className="flex gap-4">
                          <div className="flex-1 border border-dashed border-gray-300 rounded-xl px-5 py-6 bg-gray-50 flex flex-col items-center justify-center gap-2">
                            <span className="text-gray-400 text-sm font-medium">No activities planned</span>
                            <button
                              onClick={() => navigate('/itinerary')}
                              className="text-roamora-green hover:underline text-sm font-semibold"
                            >
                              + Add Activity
                            </button>
                          </div>
                          <div className="w-36 border border-dashed border-gray-200 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 font-medium shrink-0">
                            ₹0
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </section>

            {/* ── Grand Total ── */}
            <div className="mt-10 flex gap-6 pl-32">
              <div className="flex-1 flex justify-end pr-4">
                <span className="font-display text-lg font-semibold text-gray-700 uppercase tracking-wide">Grand Total</span>
              </div>
              <div className="w-36 text-center font-display text-xl font-bold text-roamora-green border-t-2 border-roamora-green pt-2">
                ₹{allActivities.reduce((s, a) => s + Number(a.cost), 0).toLocaleString()}
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default ViewItinerary;
