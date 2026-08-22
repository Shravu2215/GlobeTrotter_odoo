import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import { useAuth } from '@/hooks/useAuth';
import { useTrip } from '@/hooks/useTrip';
import { useCommunity } from '@/hooks/useCommunity';
import {
  ShieldAlert, ShieldCheck, Users, Briefcase, Globe,
  TrendingUp, Activity, ArrowLeft
} from 'lucide-react';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { trips } = useTrip();
  const { communityTrips } = useCommunity();

  if (user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-roamora-bg flex flex-col items-center justify-center p-8 text-center font-body">
        <div className="w-16 h-16 rounded-full bg-red-100 text-red-600 flex items-center justify-center mb-4">
          <ShieldAlert size={32} />
        </div>
        <h2 className="font-display text-3xl font-bold text-gray-900 mb-2">Access Restricted</h2>
        <p className="text-gray-500 text-sm max-w-md mb-6">
          This section is exclusively available for administrator accounts.
        </p>
        <button
          onClick={() => navigate('/dashboard')}
          className="bg-roamora-green text-white px-6 py-2.5 rounded-xl font-semibold text-sm hover:bg-emerald-700 transition-colors"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  const totalActivities = trips.reduce((s, t) => s + t.sections.reduce((s2, sec) => s2 + sec.activities.length, 0), 0);
  const totalBudget = trips.reduce((s, t) => s + Number(t.totalBudget || 0), 0);

  return (
    <div className="min-h-screen bg-roamora-bg text-roamora-text font-body">
      <Header />

      <main className="max-w-6xl mx-auto px-4 md:px-8 py-8 pb-24">
        {/* ── Header ── */}
        <div className="flex items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <ShieldCheck size={20} className="text-amber-600" />
              <span className="text-xs font-bold uppercase tracking-widest text-amber-700">Admin Console</span>
            </div>
            <h1 className="font-display text-3xl md:text-4xl font-bold text-gray-900">
              Analytics & Overview
            </h1>
          </div>
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-1.5 text-xs font-bold text-gray-600 bg-white border border-gray-200 px-4 py-2.5 rounded-xl hover:bg-gray-50 shadow-sm"
          >
            <ArrowLeft size={14} /> Back to App
          </button>
        </div>

        {/* ── Stats ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-gray-400 uppercase">Community Shared</span>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-roamora-green flex items-center justify-center">
                <Globe size={16} />
              </div>
            </div>
            <p className="text-3xl font-display font-bold text-gray-900">{communityTrips.length}</p>
            <p className="text-xs text-emerald-600 font-medium mt-1">Live public itineraries</p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-gray-400 uppercase">Local Saved Trips</span>
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <Briefcase size={16} />
              </div>
            </div>
            <p className="text-3xl font-display font-bold text-gray-900">{trips.length}</p>
            <p className="text-xs text-blue-600 font-medium mt-1">Active user itineraries</p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-gray-400 uppercase">Total Activities</span>
              <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                <Activity size={16} />
              </div>
            </div>
            <p className="text-3xl font-display font-bold text-gray-900">{totalActivities}</p>
            <p className="text-xs text-purple-600 font-medium mt-1">Across all trip sections</p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-gray-400 uppercase">Total Planned Volume</span>
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                <TrendingUp size={16} />
              </div>
            </div>
            <p className="text-3xl font-display font-bold text-gray-900">
              ₹{totalBudget > 100000 ? `${(totalBudget / 100000).toFixed(1)}L` : totalBudget.toLocaleString('en-IN')}
            </p>
            <p className="text-xs text-amber-600 font-medium mt-1">Estimated itinerary budgets</p>
          </div>
        </div>

        {/* ── Community Monitoring Table ── */}
        <div className="bg-white rounded-3xl p-6 md:p-8 border border-gray-100 shadow-sm">
          <h2 className="font-display text-xl font-bold text-gray-900 mb-4">Published Community Itineraries</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-xs font-bold text-gray-400 uppercase">
                  <th className="py-3 px-4">Trip Name</th>
                  <th className="py-3 px-4">Destination</th>
                  <th className="py-3 px-4">Author</th>
                  <th className="py-3 px-4">Sections</th>
                  <th className="py-3 px-4">Total Budget</th>
                  <th className="py-3 px-4">Shared Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {communityTrips.map((ct) => (
                  <tr key={ct.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="py-3 px-4 font-semibold text-gray-900">{ct.trip.name}</td>
                    <td className="py-3 px-4 text-gray-600">{ct.trip.destination}</td>
                    <td className="py-3 px-4 text-xs font-bold text-emerald-700">{ct.userId}</td>
                    <td className="py-3 px-4 text-gray-600">{ct.trip.sections.length}</td>
                    <td className="py-3 px-4 font-semibold text-gray-900">₹{ct.trip.totalBudget.toLocaleString('en-IN')}</td>
                    <td className="py-3 px-4 text-xs text-gray-400">
                      {new Date(ct.sharedAt).toLocaleDateString('en-IN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
