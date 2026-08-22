import { useNavigate, useSearchParams } from 'react-router-dom';
import Header from '@/components/Header';
import { useCommunity } from '@/hooks/useCommunity';
import {
  ArrowLeft, MapPin, Calendar, Wallet, Clock, Tag,
  Globe, Lock, CheckCircle
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

  const id = searchParams.get('id') ?? '';
  const entry = getCommunityTrip(id);

  if (!entry) {
    return (
      <div className="min-h-screen bg-roamora-bg flex flex-col items-center justify-center p-8 text-center font-body">
        <Globe size={56} className="text-gray-300 mb-4" />
        <h2 className="font-display text-3xl font-semibold text-gray-600 mb-2">Itinerary not found</h2>
        <p className="text-gray-400 mb-6">This itinerary may have been removed or the link is invalid.</p>
        <button
          onClick={() => navigate('/community')}
          className="bg-roamora-green text-white px-6 py-3 rounded-xl font-medium"
        >
          Back to Community
        </button>
      </div>
    );
  }

  const { trip } = entry;
  const days = tripDays(trip.startDate, trip.endDate);
  const totalActivities = trip.sections.reduce((s, sec) => s + sec.activities.length, 0);
  const totalExpenses = trip.sections.reduce(
    (s, sec) => s + sec.activities.reduce((s2, a) => s2 + Number(a.cost), 0), 0
  );
  const isMyTrip = entry.userId === 'me';

  return (
    <div className="min-h-screen bg-roamora-bg text-roamora-text font-body">
      <Header />

      <main className="px-4 md:px-8 pb-24 max-w-4xl mx-auto mt-6">

        {/* ── Page header ── */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate('/community')}
            className="w-11 h-11 bg-white rounded-full flex items-center justify-center shadow-sm border border-gray-100 text-gray-400 hover:text-roamora-green hover:border-roamora-green transition-colors shrink-0"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-xs font-semibold text-roamora-green uppercase tracking-widest">Community Itinerary</span>
              {isMyTrip ? (
                <span className="bg-roamora-green/10 text-roamora-green text-xs font-bold px-2 py-0.5 rounded-full">My Trip</span>
              ) : (
                <span className="bg-gray-100 text-gray-500 text-xs font-medium px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Lock size={10} /> Read Only
                </span>
              )}
            </div>
            <h1 className="font-display text-2xl md:text-3xl font-bold text-gray-900 truncate">{trip.name}</h1>
          </div>
        </div>

        {/* ── Hero card ── */}
        <div className="bg-gradient-to-br from-roamora-green/10 via-emerald-50 to-teal-50 rounded-3xl p-8 mb-8 border border-emerald-100">
          <div className="flex flex-wrap gap-6 mb-4">
            <div className="flex items-center gap-2 text-gray-700">
              <MapPin size={18} className="text-roamora-green" />
              <span className="font-semibold">{trip.destination}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-700">
              <Calendar size={18} className="text-roamora-green" />
              <span className="font-medium">{formatDate(trip.startDate)} → {formatDate(trip.endDate)}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-700">
              <Clock size={18} className="text-roamora-green" />
              <span className="font-medium">{days} {days === 1 ? 'day' : 'days'}</span>
            </div>
          </div>
          <p className="text-gray-600 leading-relaxed mb-6">{trip.description}</p>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Total Budget', value: formatBudget(trip.totalBudget), color: 'text-roamora-green' },
              { label: 'Activity Costs', value: formatBudget(totalExpenses), color: 'text-orange-600' },
              { label: 'Activities', value: `${totalActivities}`, color: 'text-blue-600' },
            ].map(({ label, value, color }) => (
              <div key={label} className="bg-white rounded-2xl p-4 text-center shadow-sm">
                <div className={`font-display text-2xl font-bold ${color}`}>{value}</div>
                <div className="text-xs text-gray-400 font-medium mt-0.5">{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Read-only notice ── */}
        {!isMyTrip && (
          <div className="bg-blue-50 border border-blue-100 rounded-2xl px-5 py-3.5 mb-8 flex items-center gap-3">
            <CheckCircle size={18} className="text-blue-500 shrink-0" />
            <p className="text-blue-700 text-sm font-medium">
              This is a community-shared itinerary. You can browse it for inspiration but cannot edit it.
            </p>
          </div>
        )}

        {/* ── Sections ── */}
        <div className="flex flex-col gap-6">
          {trip.sections.map((section, idx) => {
            const sectionTotal = section.activities.reduce((s, a) => s + Number(a.cost), 0);

            return (
              <div key={section.id} className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">

                {/* Section header */}
                <div className="bg-gradient-to-r from-gray-50 to-white px-8 py-5 border-b border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-roamora-green text-white flex items-center justify-center font-display font-bold text-lg shrink-0">
                      {idx + 1}
                    </div>
                    <div>
                      <h2 className="font-display text-xl font-bold text-gray-900">{section.city}</h2>
                      <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
                        <MapPin size={12} />
                        <span>{section.country}</span>
                        <span className="text-gray-300">·</span>
                        <span>{formatDate(section.startDate)} – {formatDate(section.endDate)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1.5 text-gray-500 text-xs font-medium mb-1 justify-end">
                      <Wallet size={12} />
                      Section Budget
                    </div>
                    <div className="font-display text-xl font-bold text-roamora-green">
                      {formatBudget(section.budget)}
                    </div>
                    <div className="text-xs text-gray-400 font-medium mt-0.5">
                      {formatBudget(sectionTotal)} spent
                    </div>
                  </div>
                </div>

                {/* Activities */}
                <div className="px-8 py-6">
                  {section.activities.length === 0 ? (
                    <p className="text-gray-400 italic text-center py-6">No activities in this section.</p>
                  ) : (
                    <div className="flex flex-col gap-3">
                      {section.activities.map(activity => {
                        const color = getColor(activity.category);
                        return (
                          <div
                            key={activity.id}
                            className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100"
                          >
                            {/* Color dot */}
                            <div
                              className="w-3 h-3 rounded-full shrink-0"
                              style={{ backgroundColor: color }}
                            />

                            {/* Name + category */}
                            <div className="flex-1 min-w-0">
                              <div className="font-semibold text-gray-900 text-sm truncate">{activity.name}</div>
                              <div className="flex items-center gap-1 mt-0.5">
                                <Tag size={11} style={{ color }} />
                                <span className="text-xs font-medium" style={{ color }}>{activity.category}</span>
                              </div>
                            </div>

                            {/* Time */}
                            <div className="flex items-center gap-1 text-gray-400 text-xs font-medium shrink-0">
                              <Clock size={12} />
                              {activity.time}
                            </div>

                            {/* Date */}
                            <div className="text-xs text-gray-400 font-medium shrink-0 hidden sm:block">
                              {formatDate(activity.date)}
                            </div>

                            {/* Cost */}
                            <div className="text-sm font-bold text-gray-900 shrink-0 min-w-[64px] text-right">
                              {Number(activity.cost) === 0 ? (
                                <span className="text-emerald-600 font-semibold">Free</span>
                              ) : (
                                formatBudget(Number(activity.cost))
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Back button ── */}
        <div className="mt-10 text-center">
          <button
            onClick={() => navigate('/community')}
            className="inline-flex items-center gap-2 bg-roamora-green text-white px-8 py-3 rounded-2xl font-semibold hover:bg-emerald-600 transition-colors"
          >
            <Globe size={18} />
            Back to Community
          </button>
        </div>

      </main>
    </div>
  );
};

export default SharedItineraryView;
