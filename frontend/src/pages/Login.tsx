import { useState, FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(email, password);
      navigate("/");
    } catch (err: any) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#F4F0E8] text-[#17251D] flex items-center justify-center px-5 py-10 relative overflow-hidden">
      {/* Subtle decorative flight path */}
      <div className="absolute top-10 right-10 hidden lg:block text-[#A88A4A]/40">
        <svg
          width="180"
          height="100"
          viewBox="0 0 180 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M10 80 C60 10, 110 100, 170 25"
            stroke="currentColor"
            strokeWidth="1"
            strokeDasharray="5 6"
          />
          <path
            d="M164 20 L174 25 L166 32"
            stroke="currentColor"
            strokeWidth="1"
          />
        </svg>
      </div>

      <div className="absolute bottom-10 left-10 hidden lg:block text-[#A88A4A]/30">
        <span className="text-xs tracking-[0.3em] uppercase">
          Explore Beyond Limits
        </span>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Brand */}
        <div className="text-center mb-8">
          <p className="text-[#A88A4A] text-xs tracking-[0.35em] uppercase mb-3">
            Explore Beyond Limits
          </p>

          <h1
            className="text-5xl text-[#173B2B] leading-none"
            style={{ fontFamily: "Georgia, serif" }}
          >
            GlobeTrotter
          </h1>

          <div className="flex items-center justify-center gap-3 mt-4">
            <div className="h-px w-10 bg-[#A88A4A]/50" />
            <span className="text-xs text-[#68746D] tracking-wider uppercase">
              Your Journey Begins Here
            </span>
            <div className="h-px w-10 bg-[#A88A4A]/50" />
          </div>
        </div>

        {/* Login Card */}
        <form
          onSubmit={handleSubmit}
          className="bg-white/70 backdrop-blur-md border border-[#D8D1C3] shadow-[0_20px_60px_rgba(23,59,43,0.10)] rounded-xl px-7 sm:px-9 py-9"
        >
          {/* Photo */}
          <div className="flex justify-center mb-6">
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
              Welcome Back
            </h2>

            <p className="text-sm text-[#68746D] mt-2">
              Continue your journey with us
            </p>
          </div>

          {error && (
            <div className="mb-5 px-4 py-3 border border-red-300 bg-red-50 text-red-700 text-sm rounded-md">
              {error}
            </div>
          )}

          {/* Email */}
          <div className="mb-5">
            <label className="block text-xs font-medium tracking-wide uppercase text-[#435248] mb-2">
              Email Address
            </label>

            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#F8F5EF] border border-[#D8D1C3] rounded-md px-4 py-3.5 text-sm text-[#17251D] placeholder:text-[#9A9E98] focus:outline-none focus:border-[#173B2B] focus:ring-1 focus:ring-[#173B2B]/20 transition"
              required
            />
          </div>

          {/* Password */}
          <div className="mb-2">
            <label className="block text-xs font-medium tracking-wide uppercase text-[#435248] mb-2">
              Password
            </label>

            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#F8F5EF] border border-[#D8D1C3] rounded-md px-4 py-3.5 text-sm text-[#17251D] placeholder:text-[#9A9E98] focus:outline-none focus:border-[#173B2B] focus:ring-1 focus:ring-[#173B2B]/20 transition"
              required
            />
          </div>

          {/* Forgot Password */}
          <div className="flex justify-end mb-6">
            <button
              type="button"
              className="text-xs text-[#A88A4A] hover:text-[#173B2B] transition"
            >
              Forgot Password?
            </button>
          </div>

          {/* Login */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#173B2B] hover:bg-[#102E21] text-white rounded-md py-3.5 text-sm font-medium tracking-wide transition disabled:opacity-50"
          >
            {loading ? "SIGNING IN..." : "LOGIN"}
          </button>

          {/* Register */}
          <p className="text-sm text-[#68746D] text-center mt-6">
            Don't have an account?{" "}
            <Link
              to="/signup"
              className="text-[#A88A4A] font-medium hover:text-[#173B2B] transition"
            >
              Register User
            </Link>
          </p>
        </form>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-[10px] tracking-[0.25em] uppercase text-[#8A918B]">
            Discover · Plan · Experience
          </p>
        </div>
      </div>
    </div>
  );
}
