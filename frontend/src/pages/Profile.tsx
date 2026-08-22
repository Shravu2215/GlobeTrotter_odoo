import { useState, useEffect, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import Header from "@/components/Header";
import { tripApi, cityApi } from "@/api/auth";
import { Trip } from "@/types/trip";
import { MapPin, Calendar, Edit2, Check, X, Shield, Trash2, Heart } from "lucide-react";

interface City {
  id: string;
  name: string;
  country: string;
  imageUrl?: string;
  popularity?: number;
}

export default function Profile() {
  const { user, updateProfile, deleteAccount } = useAuth();
  const navigate = useNavigate();

  const [isEditing, setIsEditing] = useState(false);
  const [firstName, setFirstName] = useState(user?.firstName || "");
  const [lastName, setLastName] = useState(user?.lastName || "");
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [city, setCity] = useState(user?.city || "");
  const [country, setCountry] = useState(user?.country || "");
  const [photo, setPhoto] = useState(user?.photo || "");
  const [language, setLanguage] = useState(user?.language || "en");

  const [trips, setTrips] = useState<Trip[]>([]);
  const [loadingTrips, setLoadingTrips] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [savedCitiesList, setSavedCitiesList] = useState<City[]>([]);
  const [loadingCities, setLoadingCities] = useState(true);

  // Sync state if user changes
  useEffect(() => {
    if (user) {
      setFirstName(user.firstName || "");
      setLastName(user.lastName || "");
      setEmail(user.email || "");
      setPhone(user.phone || "");
      setCity(user.city || "");
      setCountry(user.country || "");
      setPhoto(user.photo || "");
      setLanguage(user.language || "en");
    }
  }, [user]);

  // Load Trips and Saved Destinations
  useEffect(() => {
    setLoadingTrips(true);
    tripApi
      .list()
      .then((res) => {
        const data = res.data?.data?.trips || res.data?.data || res.data || [];
        setTrips(data);
      })
      .catch((err) => {
        console.error("Failed to load trips", err);
      })
      .finally(() => {
        setLoadingTrips(false);
      });

    setLoadingCities(true);
    cityApi
      .list()
      .then((res) => {
        const allCities: City[] = res.data?.data?.cities || res.data?.data || res.data || [];
        const savedIds: string[] = JSON.parse(
          localStorage.getItem("globeTrotter_savedDestinations") || "[]"
        );
        const filtered = allCities.filter((c) => savedIds.includes(c.id));
        setSavedCitiesList(filtered);
      })
      .catch((err) => {
        console.error("Failed to load cities", err);
      })
      .finally(() => {
        setLoadingCities(false);
      });
  }, []);

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSaveLoading(true);

    try {
      await updateProfile({
        firstName,
        lastName,
        email,
        phone: phone || null,
        city: city || null,
        country: country || null,
        photo: photo || null,
        language,
      });
      setSuccess("Profile updated successfully!");
      setIsEditing(false);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to update profile");
    } finally {
      setSaveLoading(false);
    }
  }

  function handleCancel() {
    if (user) {
      setFirstName(user.firstName || "");
      setLastName(user.lastName || "");
      setEmail(user.email || "");
      setPhone(user.phone || "");
      setCity(user.city || "");
      setCountry(user.country || "");
      setPhoto(user.photo || "");
      setLanguage(user.language || "en");
    }
    setIsEditing(false);
    setError("");
    setSuccess("");
  }

  const handleRemoveSavedCity = (cityId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const savedIds: string[] = JSON.parse(
      localStorage.getItem("globeTrotter_savedDestinations") || "[]"
    );
    const updated = savedIds.filter((id) => id !== cityId);
    localStorage.setItem("globeTrotter_savedDestinations", JSON.stringify(updated));
    setSavedCitiesList((prev) => prev.filter((c) => c.id !== cityId));
  };

  async function handleDeleteAccount() {
    if (
      !window.confirm(
        "Are you absolutely sure you want to delete your account? This will permanently delete your profile and all created itineraries. This action cannot be undone."
      )
    ) {
      return;
    }

    setError("");
    setDeleteLoading(true);
    try {
      await deleteAccount();
      navigate("/login", { replace: true });
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to delete account");
      setDeleteLoading(false);
    }
  }

  // Group Trips into Preplanned (Future) and Previous (Past)
  const now = new Date();
  const preplannedTrips = trips.filter((trip) => {
    if (!trip.startDate) return true;
    return new Date(trip.startDate) >= now;
  });
  const previousTrips = trips.filter((trip) => {
    if (!trip.startDate) return false;
    return new Date(trip.startDate) < now;
  });

  const initials = user
    ? `${(user.firstName || user.name || "U")[0]}${(user.lastName || "")[0] || ""}`.toUpperCase()
    : "?";

  const fallbackTripImages = [
    "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=800&q=80",
  ];

  return (
    <div className="min-h-screen bg-[#F4F0E8] text-[#17251D] font-body pb-24">
      <Header />

      <main className="px-6 md:px-8 max-w-6xl mx-auto mt-8">
        <h1
          className="text-4xl text-[#173B2B] mb-8 font-semibold"
          style={{ fontFamily: "Georgia, serif" }}
        >
          My Profile
        </h1>

        {/* User details card */}
        <section className="bg-white/70 backdrop-blur-md border border-[#D8D1C3] shadow-[0_20px_60px_rgba(23,59,43,0.05)] rounded-2xl p-6 md:p-8 mb-12">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
            {/* Avatar Column */}
            <div className="flex flex-col items-center gap-4">
              <div className="w-32 h-32 rounded-full border-2 border-[#A88A4A]/60 bg-[#EEE9DF] flex items-center justify-center relative overflow-hidden shadow-md">
                {photo ? (
                  <img src={photo} alt="avatar" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-4xl font-display font-semibold text-[#173B2B]">
                    {initials}
                  </span>
                )}
              </div>
              {isEditing && (
                <div className="w-full max-w-xs">
                  <label className="block text-[10px] font-semibold text-[#435248] uppercase tracking-wider text-center mb-1">
                    Photo URL
                  </label>
                  <input
                    type="url"
                    placeholder="https://example.com/photo.jpg"
                    value={photo}
                    onChange={(e) => setPhoto(e.target.value)}
                    className="w-full bg-[#F8F5EF] border border-[#D8D1C3] rounded-md px-3 py-1.5 text-xs text-[#17251D] focus:outline-none focus:border-[#173B2B]"
                  />
                </div>
              )}
              <div className="flex items-center gap-1.5 text-xs text-[#A88A4A] font-semibold tracking-wider uppercase">
                <Shield size={14} /> {user?.role || "USER"}
              </div>
            </div>

            {/* Form Details Column */}
            <form onSubmit={handleSave} className="flex-1 w-full space-y-6">
              <div className="flex justify-between items-center border-b border-[#D8D1C3] pb-4 mb-4">
                <h2
                  className="text-2xl text-[#173B2B]"
                  style={{ fontFamily: "Georgia, serif" }}
                >
                  Personal Information
                </h2>
                {!isEditing ? (
                  <button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#A88A4A] hover:text-[#173B2B] transition"
                  >
                    <Edit2 size={14} /> Edit Profile
                  </button>
                ) : (
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-red-600 hover:text-red-800 transition"
                    >
                      <X size={14} /> Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={saveLoading}
                      className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-green-700 hover:text-green-950 transition"
                    >
                      <Check size={14} /> {saveLoading ? "Saving..." : "Save"}
                    </button>
                  </div>
                )}
              </div>

              {error && (
                <div className="px-4 py-3 border border-red-300 bg-red-50 text-red-700 text-sm rounded-md">
                  {error}
                </div>
              )}

              {success && (
                <div className="px-4 py-3 border border-green-300 bg-green-50 text-green-700 text-sm rounded-md">
                  {success}
                </div>
              )}

              {/* Grid fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] font-semibold text-[#435248] uppercase tracking-wider mb-2">
                    First Name
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="w-full bg-[#F8F5EF] border border-[#D8D1C3] rounded-md px-4 py-3 text-sm text-[#17251D] focus:outline-none focus:border-[#173B2B] focus:ring-1 focus:ring-[#173B2B]/20"
                      required
                    />
                  ) : (
                    <p className="text-sm font-medium py-1.5">{user?.firstName || "—"}</p>
                  )}
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-[#435248] uppercase tracking-wider mb-2">
                    Last Name
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="w-full bg-[#F8F5EF] border border-[#D8D1C3] rounded-md px-4 py-3 text-sm text-[#17251D] focus:outline-none focus:border-[#173B2B] focus:ring-1 focus:ring-[#173B2B]/20"
                      required
                    />
                  ) : (
                    <p className="text-sm font-medium py-1.5">{user?.lastName || "—"}</p>
                  )}
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-[#435248] uppercase tracking-wider mb-2">
                    Email Address
                  </label>
                  {isEditing ? (
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-[#F8F5EF] border border-[#D8D1C3] rounded-md px-4 py-3 text-sm text-[#17251D] focus:outline-none focus:border-[#173B2B] focus:ring-1 focus:ring-[#173B2B]/20"
                      required
                    />
                  ) : (
                    <p className="text-sm font-medium py-1.5">{user?.email || "—"}</p>
                  )}
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-[#435248] uppercase tracking-wider mb-2">
                    Phone Number
                  </label>
                  {isEditing ? (
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full bg-[#F8F5EF] border border-[#D8D1C3] rounded-md px-4 py-3 text-sm text-[#17251D] focus:outline-none focus:border-[#173B2B] focus:ring-1 focus:ring-[#173B2B]/20"
                    />
                  ) : (
                    <p className="text-sm font-medium py-1.5">{user?.phone || "—"}</p>
                  )}
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-[#435248] uppercase tracking-wider mb-2">
                    City
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full bg-[#F8F5EF] border border-[#D8D1C3] rounded-md px-4 py-3 text-sm text-[#17251D] focus:outline-none focus:border-[#173B2B]"
                    />
                  ) : (
                    <p className="text-sm font-medium py-1.5">{user?.city || "—"}</p>
                  )}
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-[#435248] uppercase tracking-wider mb-2">
                    Country
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      className="w-full bg-[#F8F5EF] border border-[#D8D1C3] rounded-md px-4 py-3 text-sm text-[#17251D] focus:outline-none focus:border-[#173B2B]"
                    />
                  ) : (
                    <p className="text-sm font-medium py-1.5">{user?.country || "—"}</p>
                  )}
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-[#435248] uppercase tracking-wider mb-2">
                    Preferred Language
                  </label>
                  {isEditing ? (
                    <select
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                      className="w-full bg-[#F8F5EF] border border-[#D8D1C3] rounded-md px-4 py-3 text-sm text-[#17251D] focus:outline-none focus:border-[#173B2B]"
                    >
                      <option value="en">English</option>
                      <option value="es">Español</option>
                      <option value="fr">Français</option>
                      <option value="de">Deutsch</option>
                    </select>
                  ) : (
                    <p className="text-sm font-medium py-1.5 uppercase">{user?.language || "en"}</p>
                  )}
                </div>
              </div>
            </form>
          </div>
        </section>

        {/* Saved Destinations List Section */}
        <section className="mb-12">
          <div className="flex justify-between items-end mb-6 border-b border-[#D8D1C3] pb-2">
            <h2
              className="text-3xl text-[#173B2B]"
              style={{ fontFamily: "Georgia, serif" }}
            >
              Saved Destinations
            </h2>
          </div>
          {loadingCities ? (
            <p className="text-sm text-gray-500">Loading saved destinations...</p>
          ) : savedCitiesList.length === 0 ? (
            <div className="bg-white/40 border border-dashed border-[#D8D1C3] rounded-xl p-8 text-center text-gray-500 text-sm">
              No saved destinations yet. Explore and bookmark cities from the main feed!
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {savedCitiesList.map((city) => (
                <div
                  key={city.id}
                  className="group relative rounded-2xl overflow-hidden aspect-square cursor-pointer shadow-md"
                  onClick={() => navigate("/create-trip", { state: { cityId: city.id, cityName: city.name } })}
                >
                  <img
                    src={
                      city.imageUrl ||
                      "https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e?auto=format&fit=crop&w=800&q=80"
                    }
                    alt={city.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <button
                    onClick={(e) => handleRemoveSavedCity(city.id, e)}
                    className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center text-red-500 hover:bg-white transition-all shadow-sm"
                    title="Remove from saved"
                  >
                    <Heart size={16} className="fill-red-500 text-red-500" />
                  </button>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-6 flex flex-col justify-end">
                    <div className="flex items-center gap-1.5 bg-white/20 backdrop-blur-sm w-max px-2.5 py-1 rounded-full text-white text-xs font-medium mb-3">
                      <MapPin size={12} /> {city.name}
                    </div>
                    <h3 className="text-white font-display text-xl font-medium drop-shadow-md">
                      {city.name}
                    </h3>
                    <p className="text-white/90 text-sm mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300 drop-shadow-md">
                      {city.country}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Trips Section */}
        <section className="space-y-12 mb-16">
          {/* Preplanned Trips Grid */}
          <div>
            <div className="flex justify-between items-end mb-6 border-b border-[#D8D1C3] pb-2">
              <h2
                className="text-3xl text-[#173B2B]"
                style={{ fontFamily: "Georgia, serif" }}
              >
                Preplanned Trips
              </h2>
            </div>
            {loadingTrips ? (
              <p className="text-sm text-gray-500">Loading trips...</p>
            ) : preplannedTrips.length === 0 ? (
              <div className="bg-white/40 border border-dashed border-[#D8D1C3] rounded-xl p-8 text-center text-gray-500 text-sm">
                No preplanned trips found.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {preplannedTrips.map((trip, idx) => (
                  <div
                    key={trip.id}
                    className="bg-white border border-[#D8D1C3] rounded-xl overflow-hidden shadow-sm hover:shadow-md transition flex flex-col justify-between"
                  >
                    <div>
                      <div className="h-44 overflow-hidden bg-gray-100">
                        <img
                          src={trip.coverImage || fallbackTripImages[idx % fallbackTripImages.length]}
                          alt={trip.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="p-5">
                        <h3 className="text-lg font-semibold text-[#173B2B] font-display mb-1">
                          {trip.name}
                        </h3>
                        <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-2">
                          <MapPin size={12} className="text-[#A88A4A]" /> {trip.destination || "Various"}
                        </div>
                        {trip.startDate && (
                          <div className="flex items-center gap-1.5 text-xs text-gray-500">
                            <Calendar size={12} /> {new Date(trip.startDate).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="p-5 pt-0">
                      <button
                        onClick={() => navigate(`/view-itinerary/${trip.id}`)}
                        className="w-full text-center bg-[#173B2B] hover:bg-[#102E21] text-white py-2 rounded-md text-xs font-semibold tracking-wider uppercase transition"
                      >
                        View
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Previous Trips Grid */}
          <div>
            <div className="flex justify-between items-end mb-6 border-b border-[#D8D1C3] pb-2">
              <h2
                className="text-3xl text-[#173B2B]"
                style={{ fontFamily: "Georgia, serif" }}
              >
                Previous Trips
              </h2>
            </div>
            {loadingTrips ? (
              <p className="text-sm text-gray-500">Loading trips...</p>
            ) : previousTrips.length === 0 ? (
              <div className="bg-white/40 border border-dashed border-[#D8D1C3] rounded-xl p-8 text-center text-gray-500 text-sm">
                No previous trips found.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {previousTrips.map((trip, idx) => (
                  <div
                    key={trip.id}
                    className="bg-white border border-[#D8D1C3] rounded-xl overflow-hidden shadow-sm hover:shadow-md transition flex flex-col justify-between"
                  >
                    <div>
                      <div className="h-44 overflow-hidden bg-gray-100">
                        <img
                          src={trip.coverImage || fallbackTripImages[idx % fallbackTripImages.length]}
                          alt={trip.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="p-5">
                        <h3 className="text-lg font-semibold text-[#173B2B] font-display mb-1">
                          {trip.name}
                        </h3>
                        <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-2">
                          <MapPin size={12} className="text-[#A88A4A]" /> {trip.destination || "Various"}
                        </div>
                        {trip.startDate && (
                          <div className="flex items-center gap-1.5 text-xs text-gray-500">
                            <Calendar size={12} /> {new Date(trip.startDate).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="p-5 pt-0">
                      <button
                        onClick={() => navigate(`/view-itinerary/${trip.id}`)}
                        className="w-full text-center bg-[#173B2B] hover:bg-[#102E21] text-white py-2 rounded-md text-xs font-semibold tracking-wider uppercase transition"
                      >
                        View
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Danger Zone Section */}
        <section className="bg-red-50/50 border border-red-200 rounded-2xl p-6 md:p-8">
          <h2
            className="text-2xl text-red-800 mb-2"
            style={{ fontFamily: "Georgia, serif" }}
          >
            Danger Zone
          </h2>
          <p className="text-sm text-gray-600 mb-6">
            Permanently delete your GlobeTrotter account. Once deleted, you will lose access to all your trips and profile details.
          </p>
          <button
            onClick={handleDeleteAccount}
            disabled={deleteLoading}
            className="flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white px-5 py-3 rounded-lg text-sm font-semibold tracking-wider uppercase transition disabled:opacity-50"
          >
            <Trash2 size={16} /> {deleteLoading ? "Deleting Account..." : "Delete Account"}
          </button>
        </section>

        {/* Footer Brand */}
        <div className="text-center mt-20 pt-8 border-t border-[#D8D1C3]">
          <p className="text-xs tracking-[0.3em] uppercase text-[#8A918B]">
            Discover · Plan · Experience
          </p>
        </div>
      </main>
    </div>
  );
}
