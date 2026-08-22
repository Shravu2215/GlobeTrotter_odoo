import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import { useTrip } from '@/hooks/useTrip';
import { Trip } from '@/types/trip';
import {
  Plus, Search, MapPin, Calendar, Wallet, ArrowRight,
  Edit2, Trash2, Globe, SortAsc
} from 'lucide-react';

type Tab = 'all' | 'upcoming' | 'ongoing' | 'completed';
type SortKey = 'newest' | 'oldest' | 'az';

function getStatus(trip: Trip): 'upcoming' | 'ongoing' | 'completed' {
  const now = new Date();
  const start = new Date(trip.startDate);
  const end = new Date(trip.endDate);
  if (now >= start && now <= end) return 'ongoing';
  if (now < start) return 'upcoming';
  return 'completed';
}

const STATUS_BADGE: Record<string, string> = {
  ongoing:   'bg-emerald-100 text-emerald-700',
  upcoming:  'bg-blue-100 text-blue-700',
  completed: 'bg-gray-100 text-gray-600',
};
const STATUS_LABEL: Record<string, string> = {
  ongoing: 'Ongoing', upcoming: 'Upcoming', completed: 'Completed',
};

function formatBudget(n: number) {
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
  if (n >= 1000) return `₹${(n / 1000).toFixed(0)}K`;
  return `₹${n}`;
}

const MyTrips = () => {
  const navigate = useNavigate();
  const { trips, loadTrip, saveItinerary, currentTrip } = useTrip();

  const [activeTab, setActiveTab] = useState<Tab>('all');
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<SortKey>('newest');
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  // We need to expose a deleteTrip — useTrip doesn't have one, so we manage via localStorage directly
  const deleteTrip = (tripId: string) => {
    const stored = localStorage.getItem('globeTrotter_trips');
    if (!stored) return;
    const parsed: Trip[] = JSON.parse(stored);
    const updated = parsed.filter(t => t.id !== tripId);
    localStorage.setItem('globeTrotter_trips', JSON.stringify(updated));
    // Force page refresh to reload state
    window.location.reload();
  };

  const filtered = useMemo(() => {
    let result = [...trips];

    // Tab filter
    if (activeTab !== 'all') {
      result = result.filter(t => getStatus(t) === activeTab);
    }

    // Search
    if (query.trim()) {
      const q = query.toLowerCase();
      result = result.filter(t =>
        t.name.toLowerCase().includes(q) ||
        t.destination.toLowerCase().includes(q)
      );
    }

    // Sort
    result.sort((a, b) => {
      if (sort === 'newest') return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
      if (sort === 'oldest') return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
      if (sort === 'az') return a.name.localeCompare(b.name);
      return 0;
    });

    return result;
  }, [trips, activeTab, query, sort]);

  const tabCounts = useMemo(() => ({
    all: trips.length,
    upcoming: trips.filter(t => getStatus(t) === 'upcoming').length,
    ongoing: trips.filter(t => getStatus(t) === 'ongoing').length,
    completed: trips.filter(t => getStatus(t) === 'completed').length,
  }), [trips]);

  const TABS: { key: Tab; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'ongoing', label: 'Ongoing' },
    { key: 'upcoming', label: 'Upcoming' },
    { key: 'completed', label: 'Completed' },
  ];

  return (
    <div className="min-h-screen bg-roamora-bg text-roamora-text font-body">
      <Header />

      <main className="max-w-5xl mx-auto px-4 md:px-8 py-8 pb-24">

        {/* ── Page Header ── */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-4xl font-bold text-roamora-green">My Trips</h1>
            <p className="text-gray-500 font-medium mt-1">
              {trips.length} {trips.length === 1 ? 'trip' : 'trips'} saved
            </p>
          </div>
          <button
            onClick={() => navigate('/create-trip')}
            className="flex items-center gap-2 bg-roamora-green text-white px-5 py-3 rounded-xl font-semibold hover:bg-emerald-700 transition-all shadow-sm hover:shadow-md"
          >
            <Plus size={18} /> New Trip
          </button>
        </div>

        {/* ── Tabs ── */}
        <div className="flex gap-1 bg-gray-100 p-1 rounded-2xl mb-6 w-fit">
          {TABS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all ${
                activeTab === key
                  ? 'bg-white text-roamora-green shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {label}
              <span className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full font-bold ${
                activeTab === key ? 'bg-roamora-green/10 text-roamora-green' : 'bg-gray-200 text-gray-500'
              }`}>
                {tabCounts[key]}
              </span>
            </button>
          ))}
        </div>

        {/* ── Search + Sort ── */}
        <div className="flex gap-3 mb-6">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search trips…"
              className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-roamora-green/30 focus:border-roamora-green"
            />
          </div>
          <div className="flex items-center gap-2">
            <SortAsc size={16} className="text-gray-400" />
            <select
              value={sort}
              onChange={e => setSort(e.target.value as SortKey)}
              className="border border-gray-200 rounded-xl px-3 py-3 text-sm bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-roamora-green/30"
            >
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
              <option value="az">A → Z</option>
            </select>
          </div>
        </div>

        {/* ── Trip Cards ── */}
        {filtered.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-3xl border border-dashed border-gray-200">
            <Globe size={48} className="mx-auto mb-4 text-gray-200" />
            <h3 className="font-display text-xl font-semibold text-gray-500 mb-2">
              {query ? 'No trips match your search' : `No ${activeTab === 'all' ? '' : activeTab} trips yet`}
            </h3>
            {activeTab === 'all' && !query && (
              <button
                onClick={() => navigate('/create-trip')}
                className="mt-4 bg-roamora-green text-white px-7 py-3 rounded-xl font-semibold hover:bg-emerald-700 transition-colors inline-flex items-center gap-2"
              >
                <Plus size={18} /> Create a Trip
              </button>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {filtered.map(trip => {
              const status = getStatus(trip);
              const actCount = trip.sections.reduce((s, sec) => s + sec.activities.length, 0);
              const totalExpenses = trip.sections.reduce(
                (s, sec) => s + sec.activities.reduce((s2, a) => s2 + Number(a.cost), 0), 0
              );

              return (
                <div
                  key={trip.id}
                  className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col md:flex-row md:items-start gap-4">
                    {/* Icon */}
                    <div className="w-14 h-14 rounded-2xl bg-roamora-green/10 flex items-center justify-center shrink-0">
                      <MapPin size={24} className="text-roamora-green" />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3 mb-1">
                        <h3 className="font-display text-lg font-bold text-gray-900 truncate">{trip.name}</h3>
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full shrink-0 ${STATUS_BADGE[status]}`}>
                          {STATUS_LABEL[status]}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-3">
                        <span className="flex items-center gap-1.5 font-medium">
                          <MapPin size={13} className="text-roamora-green" />
                          {trip.destination}
                        </span>
                        <span className="flex items-center gap-1.5 font-medium">
                          <Calendar size={13} className="text-roamora-green" />
                          {trip.startDate} – {trip.endDate}
                        </span>
                        <span className="flex items-center gap-1.5 font-medium">
                          <Wallet size={13} className="text-roamora-green" />
                          {formatBudget(trip.totalBudget)} budget
                        </span>
                      </div>

                      <div className="flex items-center gap-4 text-xs text-gray-400 font-medium">
                        <span>{trip.sections.length} section{trip.sections.length !== 1 ? 's' : ''}</span>
                        <span>·</span>
                        <span>{actCount} {actCount === 1 ? 'activity' : 'activities'}</span>
                        <span>·</span>
                        <span>₹{totalExpenses.toLocaleString('en-IN')} expenses</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => { loadTrip(trip.id); navigate('/view-itinerary'); }}
                        className="flex items-center gap-1.5 bg-roamora-green text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-emerald-700 transition-colors"
                      >
                        View <ArrowRight size={14} />
                      </button>
                      <button
                        onClick={() => { loadTrip(trip.id); navigate('/itinerary'); }}
                        className="w-9 h-9 border border-gray-200 rounded-xl flex items-center justify-center text-gray-500 hover:text-roamora-green hover:border-roamora-green transition-colors"
                        title="Edit"
                      >
                        <Edit2 size={15} />
                      </button>
                      <button
                        onClick={() => setConfirmDelete(trip.id)}
                        className="w-9 h-9 border border-gray-200 rounded-xl flex items-center justify-center text-gray-500 hover:text-red-500 hover:border-red-300 transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* ── Delete Confirmation Modal ── */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setConfirmDelete(null)} />
          <div className="relative bg-white rounded-3xl p-8 shadow-2xl max-w-sm w-full z-10">
            <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-4">
              <Trash2 size={24} className="text-red-500" />
            </div>
            <h3 className="font-display text-xl font-bold text-gray-900 text-center mb-2">Delete Trip?</h3>
            <p className="text-gray-500 text-sm text-center mb-6">
              This action cannot be undone. The trip and all its activities will be permanently deleted.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDelete(null)}
                className="flex-1 border border-gray-200 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => { deleteTrip(confirmDelete); setConfirmDelete(null); }}
                className="flex-1 bg-red-500 text-white py-3 rounded-xl font-semibold hover:bg-red-600 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyTrips;
