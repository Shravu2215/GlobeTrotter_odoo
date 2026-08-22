import { useState, FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

export default function Signup() {
  const { signup } = useAuth();
  const navigate = useNavigate();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");
  const [additionalInfo, setAdditionalInfo] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const fullName = `${firstName} ${lastName}`.trim();

      await signup(fullName, email, password);

      navigate("/login");
    } catch (err: any) {
      setError(err.response?.data?.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#F4F0E8] text-[#17251D] flex items-center justify-center px-5 py-10 relative overflow-hidden">

      {/* Decorative flight path */}
      <div className="absolute top-8 right-8 hidden lg:block text-[#A88A4A]/30">
        <svg
          width="190"
          height="110"
          viewBox="0 0 190 110"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M8 95 C50 20, 120 100, 180 20"
            stroke="currentColor"
            strokeWidth="1"
            strokeDasharray="5 6"
          />
          <path
            d="M174 16 L184 21 L176 28"
            stroke="currentColor"
            strokeWidth="1"
          />
        </svg>
      </div>

      <div className="absolute bottom-8 left-8 hidden lg:block">
        <span className="text-[10px] tracking-[0.3em] uppercase text-[#A88A4A]/60">
          Journey · Culture · Discovery
        </span>
      </div>

      <div className="w-full max-w-2xl relative z-10">

        {/* Brand */}
        <div className="text-center mb-7">
          <p className="text-[#A88A4A] text-xs tracking-[0.35em] uppercase mb-3">
            Explore Beyond Limits
          </p>

          <h1
            className="text-5xl text-[#173B2B] leading-none"
            style={{ fontFamily: "Georgia, serif" }}
          >
            GlobeTrotter
          </h1>

          <p className="text-sm text-[#68746D] mt-3">
            Create your profile and begin your next adventure
          </p>
        </div>

        {/* Registration Card */}
        <form
          onSubmit={handleSubmit}
          className="bg-white/70 backdrop-blur-md border border-[#D8D1C3] shadow-[0_20px_60px_rgba(23,59,43,0.10)] rounded-xl px-6 sm:px-9 py-8"
        >
          {/* Photo */}
          <div className="flex justify-center mb-5">
            <div className="w-20 h-20 rounded-full border border-[#A88A4A]/60 bg-[#EEE9DF] flex items-center justify-center">
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#A88A4A"
                strokeWidth="1.3"
              >
                <circle cx="12" cy="8" r="3.5" />
                <path d="M5 20c.8-3.5 3.2-5.5 7-5.5s6.2 2 7 5.5" />
              </svg>
            </div>
          </div>

          <div className="text-center mb-7">
            <h2
              className="text-3xl text-[#173B2B]"
              style={{ fontFamily: "Georgia, serif" }}
            >
              Create Your Account
            </h2>

            <p className="text-sm text-[#68746D] mt-2">
              Tell us a little about yourself
            </p>
          </div>

          {error && (
            <div className="mb-5 px-4 py-3 border border-red-300 bg-red-50 text-red-700 text-sm rounded-md">
              {error}
            </div>
          )}

          {/* First + Last Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs font-medium tracking-wide uppercase text-[#435248] mb-2">
                First Name
              </label>

              <input
                type="text"
                placeholder="First Name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full bg-[#F8F5EF] border border-[#D8D1C3] rounded-md px-4 py-3.5 text-sm text-[#17251D] placeholder:text-[#9A9E98] focus:outline-none focus:border-[#173B2B] focus:ring-1 focus:ring-[#173B2B]/20 transition"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium tracking-wide uppercase text-[#435248] mb-2">
                Last Name
              </label>

              <input
                type="text"
                placeholder="Last Name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full bg-[#F8F5EF] border border-[#D8D1C3] rounded-md px-4 py-3.5 text-sm text-[#17251D] placeholder:text-[#9A9E98] focus:outline-none focus:border-[#173B2B] focus:ring-1 focus:ring-[#173B2B]/20 transition"
                required
              />
            </div>
          </div>

          {/* Email + Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs font-medium tracking-wide uppercase text-[#435248] mb-2">
                Email Address
              </label>

              <input
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#F8F5EF] border border-[#D8D1C3] rounded-md px-4 py-3.5 text-sm text-[#17251D] placeholder:text-[#9A9E98] focus:outline-none focus:border-[#173B2B] focus:ring-1 focus:ring-[#173B2B]/20 transition"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium tracking-wide uppercase text-[#435248] mb-2">
                Phone Number
              </label>

              <input
                type="tel"
                placeholder="Phone Number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-[#F8F5EF] border border-[#D8D1C3] rounded-md px-4 py-3.5 text-sm text-[#17251D] placeholder:text-[#9A9E98] focus:outline-none focus:border-[#173B2B] focus:ring-1 focus:ring-[#173B2B]/20 transition"
              />
            </div>
          </div>

          {/* City + Country */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs font-medium tracking-wide uppercase text-[#435248] mb-2">
                City
              </label>

              <input
                type="text"
                placeholder="City"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full bg-[#F8F5EF] border border-[#D8D1C3] rounded-md px-4 py-3.5 text-sm text-[#17251D] placeholder:text-[#9A9E98] focus:outline-none focus:border-[#173B2B] focus:ring-1 focus:ring-[#173B2B]/20 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-medium tracking-wide uppercase text-[#435248] mb-2">
                Country
              </label>

              <input
                type="text"
                placeholder="Country"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full bg-[#F8F5EF] border border-[#D8D1C3] rounded-md px-4 py-3.5 text-sm text-[#17251D] placeholder:text-[#9A9E98] focus:outline-none focus:border-[#173B2B] focus:ring-1 focus:ring-[#173B2B]/20 transition"
              />
            </div>
          </div>

          {/* Password */}
          <div className="mb-4">
            <label className="block text-xs font-medium tracking-wide uppercase text-[#435248] mb-2">
              Password
            </label>

            <input
              type="password"
              placeholder="Create a password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#F8F5EF] border border-[#D8D1C3] rounded-md px-4 py-3.5 text-sm text-[#17251D] placeholder:text-[#9A9E98] focus:outline-none focus:border-[#173B2B] focus:ring-1 focus:ring-[#173B2B]/20 transition"
              required
              minLength={8}
            />

            <p className="text-xs text-[#7A817B] mt-2">
              At least 8 characters with uppercase, lowercase, number and
              special character.
            </p>
          </div>

          {/* Additional Information */}
          <div className="mb-6">
            <label className="block text-xs font-medium tracking-wide uppercase text-[#435248] mb-2">
              Additional Information
            </label>

            <textarea
              placeholder="Tell us something about yourself..."
              value={additionalInfo}
              onChange={(e) => setAdditionalInfo(e.target.value)}
              rows={4}
              className="w-full bg-[#F8F5EF] border border-[#D8D1C3] rounded-md px-4 py-3.5 text-sm text-[#17251D] placeholder:text-[#9A9E98] resize-none focus:outline-none focus:border-[#173B2B] focus:ring-1 focus:ring-[#173B2B]/20 transition"
            />
          </div>

          {/* Register */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#173B2B] hover:bg-[#102E21] text-white rounded-md py-3.5 text-sm font-medium tracking-wide transition disabled:opacity-50"
          >
            {loading ? "CREATING ACCOUNT..." : "REGISTER USER"}
          </button>

          {/* Login */}
          <p className="text-sm text-[#68746D] text-center mt-6">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-[#A88A4A] font-medium hover:text-[#173B2B] transition"
            >
              Login
            </Link>
          </p>
        </form>

        <div className="text-center mt-5">
          <p className="text-[10px] tracking-[0.25em] uppercase text-[#8A918B]">
            Discover · Plan · Experience
          </p>
        </div>
      </div>
    </div>
  );
}