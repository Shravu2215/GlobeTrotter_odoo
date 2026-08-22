import { useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Header from '@/components/Header';
import { useCommunity } from '@/hooks/useCommunity';
import {
  Globe, Search, MapPin, Calendar, Wallet, ArrowRight,
  Sparkles, Users, TrendingUp, Filter, SortAsc, Clock, Tag
} from 'lucide-react';

type SortOption = 'newest' | 'oldest' | 'budget-high' | 'budget-low';

const DEST_FLAGS: Record<string, string> = {
  Japan: '🇯🇵', India: '🇮🇳', Italy: '🇮🇹', Indonesia: '🇮🇩',
  France: '🇫🇷', Thailand: '🇹🇭', Greece: '🇬🇷', Spain: '🇪🇸',
};

const CATEGORY_BADGE_COLORS: Record<string, string> = {
  Nature: 'bg-emerald-100 text-emerald-700',
  Historical: 'bg-amber-100 text-amber-700',
  Adventure: 'bg-orange-100 text-orange-700',
  Food: 'bg-rose-100 text-rose-700',
  Sightseeing: 'bg-blue-100 text-blue-700',
  Shopping: 'bg-pink-100 text-pink-700',
  Museum: 'bg-purple-100 text-purple-700',
  Transport: 'bg-gray-100 text-gray-700',
};

function tripDays(startDate: string, endDate: string) {
  const ms = new Date(endDate).getTime() - new Date(startDate).getTime();
  return Math.max(1, Math.round(ms / 86400000) + 1);
}

function getUniqueCategories(trip: import('@/types/trip').Trip) {
  const cats = new Set<string>();
  trip.sections.forEach(s => s.activities.forEach(a => cats.add(a.category)));
  return [...cats].slice(0, 4);
}

function getFlag(trip: import('@/types/trip').Trip) {
  for (const s of trip.sections) {
    if (DEST_FLAGS[s.country]) return DEST_FLAGS[s.country];
  }
  return '🌍';
}

function formatSharedAt(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function formatBudget(n: number) {
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
  if (n >= 1000) return `₹${(n / 1000).toFixed(0)}K`;
  return `₹${n}`;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

const Community = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { communityTrips } = useCommunity();

  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<SortOption>('newest');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState('All');
  const [expandedTripId, setExpandedTripId] = useState<string | null>(null);

  // Highlighted id — if coming from BudgetView share
  const highlightedId = searchParams.get('highlight');

  const allCountries = useMemo(() => {
    const countries = new Set<string>();
    communityTrips.forEach(ct =>
      ct.trip.sections.forEach(s => countries.add(s.country))
    );
    return ['All', ...Array.from(countries).sort()];
  }, [communityTrips]);

  const filtered = useMemo(() => {
    let result = [...communityTrips];

    if (query.trim()) {
      const q = query.toLowerCase();
      result = result.filter(ct =>
        ct.trip.name.toLowerCase().includes(q) ||
        ct.trip.destination.toLowerCase().includes(q) ||
        ct.trip.description.toLowerCase().includes(q)
      );
    }

    if (selectedCountry !== 'All') {
      result = result.filter(ct =>
        ct.trip.sections.some(s => s.country === selectedCountry)
      );
    }

    result.sort((a, b) => {
      if (sort === 'newest') return new Date(b.sharedAt).getTime() - new Date(a.sharedAt).getTime();
      if (sort === 'oldest') return new Date(a.sharedAt).getTime() - new Date(b.sharedAt).getTime();
      if (sort === 'budget-high') return b.trip.totalBudget - a.trip.totalBudget;
      if (sort === 'budget-low') return a.trip.totalBudget - b.trip.totalBudget;
      return 0;
    });

    return result;
  }, [communityTrips, query, sort, selectedCountry]);

  const stats = useMemo(() => ({
    total: communityTrips.length,
    destinations: new Set(communityTrips.flatMap(ct => ct.trip.sections.map(s => s.country))).size,
    activities: communityTrips.reduce((sum, ct) =>
      sum + ct.trip.sections.reduce((s2, sec) => s2 + sec.activities.length, 0), 0),
  }), [communityTrips]);

  return (
    <div className="min-h-screen bg-roamora-bg text-roamora-text font-body">
      <Header />

      <main className="px-4 md:px-8 pb-24 max-w-7xl mx-auto mt-6">
        {/* ── Hero banner ── */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-roamora-green via-emerald-500 to-teal-600 p-8 md:p-12 mb-10 text-white shadow-md">
          <div className="absolute inset-0 opacity-10"
            style={{ backgroundImage: 'radial-gradient(circle at 70% 50%, white 1px, transparent 1px)', backgroundSize: '32px 32px' }}
          />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Globe size={22} className="opacity-80" />
                <span className="text-sm font-semibold uppercase tracking-widest opacity-80">Community Hub</span>
              </div>
              <h1 className="font-display text-4xl md:text-5xl font-bold mb-2 leading-tight">
                Discover & Explore Shared Itineraries
              </h1>
              <p className="text-emerald-100 text-lg max-w-xl">
                Browse travel plans shared by fellow globetrotters. Inspect complete day-by-day activities, stays & budget breakdowns.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-4 shrink-0">
              {[
                { icon: <Users size={20} />, value: stats.total, label: 'Shared Trips' },
                { icon: <MapPin size={20} />, value: stats.destinations, label: 'Countries' },
                { icon: <TrendingUp size={20} />, value: stats.activities, label: 'Activities' },
              ].map(({ icon, value, label }) => (
                <div key={label} className="bg-white/15 backdrop-blur rounded-2xl p-4 text-center">
                  <div className="flex justify-center mb-1 opacity-80">{icon}</div>
                  <div className="font-display text-2xl font-bold">{value}</div>
                  <div className="text-xs opacity-70 font-medium">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── "Just Shared" highlight banner ── */}
        {highlightedId && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl px-6 py-4 mb-6 flex items-center gap-3 shadow-sm">
            <Sparkles size={20} className="text-roamora-green shrink-0" />
            <span className="text-emerald-800 font-semibold text-sm">
              Your itinerary was just shared with the community! It's highlighted below with full activity stream & budget details. 🎉
            </span>
          </div>
        )}

        {/* ── Search & Filter bar ── */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6 flex flex-col md:flex-row gap-3 items-stretch md:items-center">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search trips, destinations…"
              className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-roamora-green/40 focus:border-roamora-green text-sm font-medium"
            />
          </div>

          <button
            onClick={() => setShowFilters(v => !v)}
            className={`flex items-center gap-2 px-4 py-3 rounded-xl border font-medium text-sm transition-colors ${
              showFilters ? 'bg-roamora-green text-white border-roamora-green' : 'border-gray-200 text-gray-600 hover:border-roamora-green hover:text-roamora-green'
            }`}
          >
            <Filter size={16} />
            Filters
          </button>

          <div className="flex items-center gap-2">
            <SortAsc size={16} className="text-gray-400 shrink-0" />
            <select
              value={sort}
              onChange={e => setSort(e.target.value as SortOption)}
              className="border border-gray-200 rounded-xl px-3 py-3 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-roamora-green/40 focus:border-roamora-green bg-white"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="budget-high">Budget: High → Low</option>
              <option value="budget-low">Budget: Low → High</option>
            </select>
          </div>
        </div>

        {/* ── Country filter chips ── */}
        {showFilters && (
          <div className="flex flex-wrap gap-2 mb-6">
            {allCountries.map(country => (
              <button
                key={country}
                onClick={() => setSelectedCountry(country)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                  selectedCountry === country
                    ? 'bg-roamora-green text-white border-roamora-green'
                    : 'border-gray-200 text-gray-600 bg-white hover:border-roamora-green hover:text-roamora-green'
                }`}
              >
                {country !== 'All' && (DEST_FLAGS[country] ?? '🌍')} {country}
              </button>
            ))}
          </div>
        )}

        {/* ── Results count ── */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-gray-500 font-medium">
            {filtered.length} {filtered.length === 1 ? 'itinerary' : 'itineraries'} found
          </p>
        </div>

        {/* ── Cards Grid ── */}
        {filtered.length === 0 ? (
          <div className="text-center py-24 text-gray-400">
            <Globe size={48} className="mx-auto mb-4 opacity-30" />
            <p className="text-xl font-semibold mb-2">No itineraries found</p>
            <p className="text-sm">Try adjusting your search or filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(ct => {
              const { trip } = ct;
              const days = tripDays(trip.startDate, trip.endDate);
              const cats = getUniqueCategories(trip);
              const flag = getFlag(trip);
              const isHighlighted = ct.id === highlightedId;
              const isMyTrip = ct.userId === 'me';
              const isExpanded = expandedTripId === ct.id;
              const allActs = trip.sections.flatMap(s => s.activities);

              return (
                <div
                  key={ct.id}
                  className={`group bg-white rounded-3xl shadow-sm border overflow-hidden transition-all duration-300 hover:shadow-xl ${
                    isHighlighted ? 'ring-2 ring-roamora-green border-roamora-green' : 'border-gray-100'
                  }`}
                >
                  {/* Card header */}
                  <div className="relative bg-gradient-to-br from-roamora-green/10 via-emerald-50 to-teal-50 p-6 pb-4">
                    {isHighlighted && (
                      <div className="absolute top-3 right-3">
                        <span className="bg-roamora-green text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                          <Sparkles size={11} /> Just Shared
                        </span>
                      </div>
                    )}
                    {isMyTrip && !isHighlighted && (
                      <div className="absolute top-3 right-3">
                        <span className="bg-emerald-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                          My Trip
                        </span>
                      </div>
                    )}
                    <div className="text-4xl mb-3">{flag}</div>
                    <h3 className="font-display text-lg font-bold text-gray-900 leading-snug mb-1 group-hover:text-roamora-green transition-colors">
                      {trip.name}
                    </h3>
                    <div className="flex items-center gap-1.5 text-gray-500 text-sm font-medium">
                      <MapPin size={13} />
                      <span>{trip.destination}</span>
                    </div>
                  </div>

                  {/* Card body */}
                  <div className="p-6 pt-4 space-y-4">
                    {trip.description && (
                      <p className="text-gray-500 text-sm leading-relaxed line-clamp-2">
                        {trip.description}
                      </p>
                    )}

                    {/* Meta row */}
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1.5 text-gray-600">
                        <Calendar size={14} className="text-roamora-green" />
                        <span className="font-medium">{days} {days === 1 ? 'day' : 'days'}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-gray-600">
                        <Wallet size={14} className="text-roamora-green" />
                        <span className="font-medium">{formatBudget(trip.totalBudget)}</span>
                      </div>
                    </div>

                    {/* City Stops Strip */}
                    <div className="bg-[#FAF8F5] border border-[#E8E2D5] p-2.5 rounded-xl text-xs flex items-center gap-1.5 flex-wrap">
                      <span className="font-semibold text-gray-500 uppercase text-[10px]">City Stops:</span>
                      {trip.sections.map((sec, i) => (
                        <span key={sec.id} className="font-bold text-[#173B2B]">
                          📍 {sec.city}{i < trip.sections.length - 1 ? ' → ' : ''}
                        </span>
                      ))}
                    </div>

                    {/* Category chips */}
                    {cats.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {cats.map(cat => (
                          <span
                            key={cat}
                            className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${CATEGORY_BADGE_COLORS[cat] ?? 'bg-gray-100 text-gray-600'}`}
                          >
                            {cat}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* In-Card Full Itinerary Stream Toggle */}
                    <button
                      onClick={() => setExpandedTripId(prev => prev === ct.id ? null : ct.id)}
                      className="w-full bg-gray-50 border border-gray-200 hover:bg-emerald-50 hover:border-emerald-200 text-gray-700 text-xs font-semibold py-2.5 rounded-xl transition flex items-center justify-center gap-1.5 shadow-sm"
                    >
                      <Sparkles size={13} className="text-roamora-green" />
                      {isExpanded ? 'Hide Itinerary Stream' : `View Whole Itinerary (${allActs.length} Sights)`}
                    </button>

                    {/* In-Card Expanded Itinerary Stream */}
                    {isExpanded && (
                      <div className="space-y-3 pt-2 border-t border-gray-100 max-h-64 overflow-y-auto pr-1">
                        <span className="text-[11px] font-bold text-gray-700 uppercase tracking-wider block">
                          Whole Itinerary Activity Schedule
                        </span>
                        {allActs.length === 0 ? (
                          <p className="text-xs text-gray-400 italic">No activities planned in this itinerary.</p>
                        ) : (
                          allActs.map((act, i) => (
                            <div key={act.id || i} className="bg-gray-50 p-2.5 rounded-xl border border-gray-100 flex items-center justify-between gap-2 text-xs">
                              <div>
                                <div className="font-semibold text-gray-900">{act.name}</div>
                                <div className="text-[10px] text-gray-400">
                                  {act.date ? formatDate(act.date) : 'Day Activity'} · ⏱ {act.time || '10:00 AM'}
                                </div>
                              </div>
                              <span className="font-bold text-[#173B2B] shrink-0">
                                {Number(act.cost) === 0 ? 'Free' : `₹${Number(act.cost).toLocaleString('en-IN')}`}
                              </span>
                            </div>
                          ))
                        )}
                      </div>
                    )}

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                      <span className="text-xs text-gray-400 font-medium">
                        Shared {formatSharedAt(ct.sharedAt)}
                      </span>
                      <button
                        onClick={() => navigate(`/community/view?id=${ct.id}`)}
                        className="flex items-center gap-1.5 text-sm font-semibold text-roamora-green hover:gap-2.5 transition-all"
                      >
                        Full Itinerary Page
                        <ArrowRight size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default Community;
