import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import { useAuth } from '@/hooks/useAuth';
import { useTrip } from '@/hooks/useTrip';
import {
  User, Mail, Shield, Briefcase, MapPin, Calendar, LogOut,
  CheckCircle, Globe, Award, Sparkles, Heart
} from 'lucide-react';

export default function Profile() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { trips } = useTrip();

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [bio, setBio] = useState('Passionate traveller exploring hidden gems around the globe ✈️🌏');
  const [homeCity, setHomeCity] = useState('Mumbai, India');

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
    : 'U';

  const totalDestinations = new Set(trips.flatMap(t => t.sections.map(s => s.country))).size;
  const totalActivities = trips.reduce((s, t) => s + t.sections.reduce((s2, sec) => s2 + sec.activities.length, 0), 0);
  const totalBudgetSpent = trips.reduce((s, t) => s + Number(t.totalBudget || 0), 0);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-roamora-bg text-roamora-text font-body">
      <Header />

      <main className="max-w-4xl mx-auto px-4 md:px-8 py-8 pb-24">
        {/* ── Profile Header Card ── */}
        <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm mb-8 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-28 bg-gradient-to-r from-roamora-green via-emerald-600 to-teal-600" />
          
          <div className="relative pt-12 flex flex-col sm:flex-row sm:items-end justify-between gap-6 pb-2 border-b border-gray-100">
            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-5 text-center sm:text-left">
              <div className="w-24 h-24 rounded-full bg-roamora-green text-white text-3xl font-display font-bold border-4 border-white shadow-md flex items-center justify-center">
                {initials}
              </div>
              <div className="mb-1">
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <h1 className="font-display text-2xl md:text-3xl font-bold text-gray-900">{user?.name || 'Globetrotter Member'}</h1>
                  <span className="bg-roamora-green/10 text-roamora-green text-xs font-bold px-2.5 py-0.5 rounded-full capitalize">
                    {user?.role || 'Member'}
                  </span>
                </div>
                <p className="text-gray-500 text-sm flex items-center justify-center sm:justify-start gap-1.5 mt-1">
                  <Mail size={14} className="text-gray-400" />
                  {user?.email || 'user@globetrotter.app'}
                </p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 text-sm font-semibold transition-colors shrink-0"
            >
              <LogOut size={16} /> Log out
            </button>
          </div>

          {/* ── Stats Row ── */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
            <div className="p-4 bg-gray-50 rounded-2xl text-center">
              <div className="flex justify-center mb-1 text-roamora-green"><Briefcase size={18} /></div>
              <div className="font-display text-2xl font-bold text-gray-900">{trips.length}</div>
              <div className="text-xs text-gray-500 font-medium">Trips Planned</div>
            </div>

            <div className="p-4 bg-gray-50 rounded-2xl text-center">
              <div className="flex justify-center mb-1 text-blue-500"><MapPin size={18} /></div>
              <div className="font-display text-2xl font-bold text-gray-900">{totalDestinations}</div>
              <div className="text-xs text-gray-500 font-medium">Countries</div>
            </div>

            <div className="p-4 bg-gray-50 rounded-2xl text-center">
              <div className="flex justify-center mb-1 text-purple-500"><Calendar size={18} /></div>
              <div className="font-display text-2xl font-bold text-gray-900">{totalActivities}</div>
              <div className="text-xs text-gray-500 font-medium">Activities</div>
            </div>

            <div className="p-4 bg-gray-50 rounded-2xl text-center">
              <div className="flex justify-center mb-1 text-amber-500"><Sparkles size={18} /></div>
              <div className="font-display text-2xl font-bold text-gray-900">
                ₹{totalBudgetSpent > 100000 ? `${(totalBudgetSpent / 100000).toFixed(1)}L` : totalBudgetSpent.toLocaleString('en-IN')}
              </div>
              <div className="text-xs text-gray-500 font-medium">Total Budget</div>
            </div>
          </div>
        </div>

        {/* ── Personal Info & Preferences ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
            <h2 className="font-display text-xl font-bold text-gray-900 mb-6">Profile Settings</h2>

            {savedSuccess && (
              <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 text-emerald-700 text-sm font-medium">
                <CheckCircle size={18} />
                Profile details updated successfully!
              </div>
            )}

            <form onSubmit={handleSaveProfile} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    type="text"
                    disabled
                    value={user?.name || ''}
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-600 font-medium cursor-not-allowed"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    type="email"
                    disabled
                    value={user?.email || ''}
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-600 font-medium cursor-not-allowed"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Home City / Base</label>
                <div className="relative">
                  <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    type="text"
                    value={homeCity}
                    onChange={(e) => setHomeCity(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 font-medium focus:border-roamora-green outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Bio</label>
                <textarea
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full p-3.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 font-medium focus:border-roamora-green outline-none resize-none"
                />
              </div>

              <button
                type="submit"
                className="bg-roamora-green text-white font-semibold px-6 py-2.5 rounded-xl hover:bg-emerald-700 transition-colors shadow-sm text-sm"
              >
                Save Changes
              </button>
            </form>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
              <h3 className="font-display text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Award size={18} className="text-roamora-gold" />
                Badges & Status
              </h3>
              <div className="space-y-3">
                <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-100 flex items-center gap-3">
                  <div className="text-2xl">🌱</div>
                  <div>
                    <p className="text-xs font-bold text-emerald-800">Early Explorer</p>
                    <p className="text-[11px] text-emerald-600">Joined GlobeTrotter beta</p>
                  </div>
                </div>
                <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-100 flex items-center gap-3">
                  <div className="text-2xl">🧭</div>
                  <div>
                    <p className="text-xs font-bold text-blue-800">Master Planner</p>
                    <p className="text-[11px] text-blue-600">Configured custom itineraries</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-roamora-green/10 via-emerald-50 to-teal-50 rounded-3xl p-6 border border-emerald-100">
              <h3 className="font-display text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
                <Heart size={18} className="text-rose-500" />
                Quick Links
              </h3>
              <p className="text-xs text-gray-600 mb-4">Jump straight into managing your trips or discovering new community spots.</p>
              <div className="space-y-2">
                <button
                  onClick={() => navigate('/my-trips')}
                  className="w-full text-left bg-white px-4 py-2.5 rounded-xl text-xs font-semibold text-gray-800 shadow-sm hover:bg-gray-50 flex items-center justify-between"
                >
                  <span>View All Saved Trips</span>
                  <span>→</span>
                </button>
                <button
                  onClick={() => navigate('/community')}
                  className="w-full text-left bg-white px-4 py-2.5 rounded-xl text-xs font-semibold text-gray-800 shadow-sm hover:bg-gray-50 flex items-center justify-between"
                >
                  <span>Community Shared Plans</span>
                  <span>→</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
