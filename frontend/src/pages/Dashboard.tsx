import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import { useAuth } from '@/hooks/useAuth';
import { useTrip } from '@/hooks/useTrip';
import {
  Plus, Briefcase, Compass, CalendarDays, Users,
  MapPin, Calendar, ArrowRight, Globe
} from 'lucide-react';

const QUICK_ACTIONS = [
  {
    label: 'My Trips',
    description: 'View and manage your saved trips',
    icon: Briefcase,
    path: '/my-trips',
    color: 'bg-blue-50 text-blue-600',
    border: 'hover:border-blue-200',
  },
  {
    label: 'Explore',
    description: 'Discover new destinations',
    icon: Compass,
    path: '/explore',
    color: 'bg-amber-50 text-amber-600',
    border: 'hover:border-amber-200',
  },
  {
    label: 'Calendar',
    description: 'See your itinerary timeline',
    icon: CalendarDays,
    path: '/calendar',
    color: 'bg-purple-50 text-purple-600',
    border: 'hover:border-purple-200',
  },
  {
    label: 'Community',
    description: 'Browse shared itineraries',
    icon: Users,
    path: '/community',
    color: 'bg-emerald-50 text-emerald-600',
    border: 'hover:border-emerald-200',
  },
];

function statusBadge(trip: { startDate: string; endDate: string }) {
  const now = new Date();
  const start = new Date(trip.startDate);
  const end = new Date(trip.endDate);
  if (now >= start && now <= end) return { label: 'Ongoing', cls: 'bg-emerald-100 text-emerald-700' };
  if (now < start) return { label: 'Upcoming', cls: 'bg-blue-100 text-blue-700' };
  return { label: 'Completed', cls: 'bg-gray-100 text-gray-600' };
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { trips, loadTrip } = useTrip();

  const firstName = user?.name?.split(' ')[0] ?? 'Traveller';
  const recentTrips = [...trips].reverse().slice(0, 3);
  const totalDestinations = new Set(trips.flatMap(t => t.sections.map(s => s.country))).size;
  const totalActivities = trips.reduce((s, t) => s + t.sections.reduce((s2, sec) => s2 + sec.activities.length, 0), 0);

  return (
    <div className="min-h-screen bg-roamora-bg text-roamora-text font-body">
      <Header />

      <main className="max-w-6xl mx-auto px-4 md:px-8 py-8 pb-24">

        {/* ── Hero Welcome Banner ── */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-roamora-green via-emerald-600 to-teal-700 p-8 md:p-10 mb-10 text-white">
          <div className="absolute inset-0 opacity-10"
            style={{ backgroundImage: 'radial-gradient(circle at 80% 20%, white 1px, transparent 1px)', backgroundSize: '28px 28px' }}
          />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <p className="text-emerald-200 text-sm font-semibold uppercase tracking-widest mb-2">Welcome back</p>
              <h1 className="font-display text-4xl md:text-5xl font-bold mb-3">
                Hello, {firstName}! 👋
              </h1>
              <p className="text-emerald-100 text-lg max-w-lg">
                Ready to plan your next adventure? The world is waiting.
              </p>
            </div>
            <button
              onClick={() => navigate('/create-trip')}
              className="flex items-center gap-2 bg-white text-roamora-green font-bold px-7 py-4 rounded-2xl hover:bg-emerald-50 transition-all shadow-lg hover:shadow-xl hover:scale-105 shrink-0 self-start md:self-center"
            >
              <Plus size={20} />
              Plan a New Trip
            </button>
          </div>
        </div>

        {/* ── Stats Strip ── */}
        <div className="grid grid-cols-3 gap-4 mb-10">
          {[
            { label: 'Total Trips', value: trips.length, icon: <Globe size={18} className="text-roamora-green" /> },
            { label: 'Countries', value: totalDestinations, icon: <MapPin size={18} className="text-blue-500" /> },
            { label: 'Activities', value: totalActivities, icon: <Calendar size={18} className="text-purple-500" /> },
          ].map(({ label, value, icon }) => (
            <div key={label} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-center">
              <div className="flex justify-center mb-2">{icon}</div>
              <div className="font-display text-3xl font-bold text-gray-900">{value}</div>
              <div className="text-xs text-gray-400 font-medium mt-1">{label}</div>
            </div>
          ))}
        </div>

        {/* ── Quick Access Cards ── */}
        <div className="mb-10">
          <h2 className="font-display text-xl font-semibold text-gray-800 mb-4">Quick Access</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {QUICK_ACTIONS.map(({ label, description, icon: Icon, path, color, border }) => (
              <button
                key={path}
                onClick={() => navigate(path)}
                className={`bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-left transition-all hover:shadow-md hover:-translate-y-0.5 ${border} group`}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${color}`}>
                  <Icon size={22} />
                </div>
                <h3 className="font-semibold text-gray-900 text-sm mb-1">{label}</h3>
                <p className="text-xs text-gray-400 leading-relaxed">{description}</p>
              </button>
            ))}
          </div>
        </div>

        {/* ── Recent Trips ── */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-xl font-semibold text-gray-800">Recent Trips</h2>
            {trips.length > 0 && (
              <button
                onClick={() => navigate('/my-trips')}
                className="flex items-center gap-1 text-sm font-semibold text-roamora-green hover:underline"
              >
                View all <ArrowRight size={14} />
              </button>
            )}
          </div>

          {trips.length === 0 ? (
            <div className="bg-white rounded-3xl p-16 text-center border border-dashed border-gray-200">
              <Globe size={48} className="mx-auto mb-4 text-gray-200" />
              <h3 className="font-display text-xl font-semibold text-gray-500 mb-2">No trips yet</h3>
              <p className="text-gray-400 text-sm mb-6">Create your first trip and start planning your adventure!</p>
              <button
                onClick={() => navigate('/create-trip')}
                className="bg-roamora-green text-white px-7 py-3 rounded-xl font-semibold hover:bg-emerald-700 transition-colors inline-flex items-center gap-2"
              >
                <Plus size={18} /> Create Your First Trip
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {recentTrips.map(trip => {
                const badge = statusBadge(trip);
                const actCount = trip.sections.reduce((s, sec) => s + sec.activities.length, 0);
                return (
                  <div
                    key={trip.id}
                    className="bg-white rounded-2xl border border-gray-100 p-5 flex items-center gap-5 shadow-sm hover:shadow-md transition-shadow group"
                  >
                    <div className="w-12 h-12 rounded-xl bg-roamora-green/10 flex items-center justify-center shrink-0">
                      <MapPin size={20} className="text-roamora-green" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 truncate">{trip.name}</h3>
                      <p className="text-sm text-gray-500 font-medium">{trip.destination}</p>
                      <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                        <span>{trip.startDate} – {trip.endDate}</span>
                        <span>·</span>
                        <span>{trip.sections.length} sections</span>
                        <span>·</span>
                        <span>{actCount} activities</span>
                      </div>
                    </div>
                    <span className={`text-xs font-bold px-3 py-1 rounded-full shrink-0 ${badge.cls}`}>
                      {badge.label}
                    </span>
                    <button
                      onClick={() => { loadTrip(trip.id); navigate('/view-itinerary'); }}
                      className="flex items-center gap-1 text-sm font-semibold text-roamora-green opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                    >
                      View <ArrowRight size={14} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </main>
    </div>
  );
}