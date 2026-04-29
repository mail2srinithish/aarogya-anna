import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export default function LoginPage() {
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    login(
      {
        name: 'Priya Ramesh',
        email: email,
        role: 'user',
        subscription: 'Free Plan',
      },
      'mock-token'
    );
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-surface font-['Inter'] relative overflow-hidden flex flex-col">
      {/* Background blobs */}
      <div
        className="sattva-blob"
        style={{
          position: 'absolute',
          top: '-10%',
          left: '-12%',
          width: '520px',
          height: '520px',
          borderRadius: '50%',
          background: 'rgba(21,66,18,0.18)',
          filter: 'blur(80px)',
          zIndex: 0,
          pointerEvents: 'none',
        }}
      />
      <div
        className="sattva-blob"
        style={{
          position: 'absolute',
          top: '30%',
          right: '-10%',
          width: '420px',
          height: '420px',
          borderRadius: '50%',
          background: 'rgba(254,183,0,0.15)',
          filter: 'blur(80px)',
          zIndex: 0,
          pointerEvents: 'none',
        }}
      />
      <div
        className="sattva-blob"
        style={{
          position: 'absolute',
          bottom: '-8%',
          left: '35%',
          width: '380px',
          height: '380px',
          borderRadius: '50%',
          background: 'rgba(124,88,0,0.12)',
          filter: 'blur(80px)',
          zIndex: 0,
          pointerEvents: 'none',
        }}
      />

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-8 py-5">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shadow-md">
            <span className="material-symbols-outlined text-white text-xl">spa</span>
          </div>
          <span
            className="text-xl font-bold text-primary tracking-tight"
            style={{ fontFamily: "'Noto Serif', serif" }}
          >
            AarogyaAnna
          </span>
        </div>
        <a
          href="#support"
          className="text-sm text-on-surface-variant hover:text-primary transition-colors font-medium flex items-center gap-1"
        >
          <span className="material-symbols-outlined text-base">help_outline</span>
          Support
        </a>
      </header>

      {/* Main content */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-5xl flex flex-col lg:flex-row gap-8 items-center">

          {/* Hero card */}
          <div className="w-full lg:w-[480px] rounded-[2.5rem] shadow-xl bg-primary relative overflow-hidden min-h-[340px] flex flex-col justify-end p-8 flex-shrink-0">
            {/* Decorative asymmetric rotated overlay */}
            <div
              style={{
                position: 'absolute',
                top: '-30px',
                right: '-40px',
                width: '260px',
                height: '260px',
                borderRadius: '2rem',
                background: 'rgba(255,255,255,0.07)',
                transform: 'rotate(22deg)',
              }}
            />
            <div
              style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                width: '160px',
                height: '160px',
                borderRadius: '1.5rem',
                background: 'rgba(254,183,0,0.18)',
                transform: 'rotate(-12deg)',
              }}
            />
            <div
              style={{
                position: 'absolute',
                bottom: '-20px',
                right: '-20px',
                width: '200px',
                height: '200px',
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.05)',
              }}
            />

            {/* Leaf motif placeholder */}
            <div
              className="bg-primary-fixed"
              style={{
                position: 'absolute',
                top: '24px',
                right: '28px',
                width: '120px',
                height: '120px',
                borderRadius: '50% 10% 50% 10%',
                opacity: 0.22,
                transform: 'rotate(30deg)',
              }}
            />

            <div className="relative z-10">
              <div className="mb-3 flex items-center gap-2">
                <span className="material-symbols-outlined text-white/70 text-sm">eco</span>
                <span className="text-white/70 text-xs font-medium tracking-widest uppercase">
                  Sattvic Wellness
                </span>
              </div>
              <h1
                className="text-3xl font-bold text-white leading-snug mb-3"
                style={{ fontFamily: "'Noto Serif', serif" }}
              >
                Welcome back to your Health Journey
              </h1>
              <p className="text-white/75 text-sm leading-relaxed">
                Nourish your body and mind with personalized Sattvic meal plans rooted in Ayurvedic wisdom.
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                {['Dosha-Aware', 'Seasonal Eating', 'Mindful Nutrition'].map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 rounded-full text-xs font-semibold"
                    style={{ background: 'rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.9)' }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Form card */}
          <div className="w-full max-w-[420px] rounded-[2.5rem] shadow-xl bg-surface-container-lowest/80 backdrop-blur-xl p-8 flex flex-col gap-6">
            <div>
              <h2
                className="text-2xl font-bold text-on-surface mb-1"
                style={{ fontFamily: "'Noto Serif', serif" }}
              >
                Secure Sign In
              </h2>
              <p className="text-sm text-on-surface-variant">
                Continue your wellness journey
              </p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {/* Email field */}
              <div className="relative">
                <input
                  id="login-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder=" "
                  className="peer w-full bg-surface-container border-none rounded-xl px-4 pt-6 pb-3 text-on-surface text-sm outline-none focus:ring-2 focus:ring-primary/40 transition"
                />
                <label
                  htmlFor="login-email"
                  className="absolute left-4 top-2 text-xs font-medium text-on-surface-variant peer-placeholder-shown:top-4 peer-placeholder-shown:text-sm peer-focus:top-2 peer-focus:text-xs transition-all duration-150 pointer-events-none"
                >
                  Email address
                </label>
                <span
                  className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-lg"
                >
                  mail
                </span>
              </div>

              {/* Password field */}
              <div className="relative">
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder=" "
                  className="peer w-full bg-surface-container border-none rounded-xl px-4 pt-6 pb-3 pr-10 text-on-surface text-sm outline-none focus:ring-2 focus:ring-primary/40 transition"
                />
                <label
                  htmlFor="login-password"
                  className="absolute left-4 top-2 text-xs font-medium text-on-surface-variant peer-placeholder-shown:top-4 peer-placeholder-shown:text-sm peer-focus:top-2 peer-focus:text-xs transition-all duration-150 pointer-events-none"
                >
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  <span className="material-symbols-outlined text-lg">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>

              {/* Forgot password */}
              <div className="text-right -mt-2">
                <Link
                  to="/forgot-password"
                  className="text-xs text-primary font-semibold hover:underline"
                >
                  Forgot Password?
                </Link>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-br from-primary to-primary-container text-white rounded-full py-4 font-bold text-base shadow-md hover:shadow-lg hover:opacity-95 transition-all disabled:opacity-60 disabled:cursor-not-allowed mt-1"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span
                      className="inline-block w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"
                    />
                    Signing in…
                  </span>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-outline-variant" />
              <span className="text-xs text-on-surface-variant font-medium">or continue with</span>
              <div className="flex-1 h-px bg-outline-variant" />
            </div>

            {/* Google OAuth button */}
            <button
              type="button"
              className="w-full flex items-center justify-center gap-3 bg-secondary-fixed-dim hover:bg-surface-container rounded-full py-3.5 font-semibold text-sm text-on-surface border border-outline-variant transition-all hover:shadow-sm"
            >
              {/* Google icon SVG */}
              <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Continue with Google
            </button>

            {/* Sign up link */}
            <p className="text-center text-sm text-on-surface-variant">
              Don't have an account?{' '}
              <Link to="/register" className="text-primary font-semibold hover:underline">
                Sign Up
              </Link>
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-5 flex items-center justify-center gap-6 text-xs text-on-surface-variant">
        <span className="flex items-center gap-1.5">
          <span className="material-symbols-outlined text-base text-primary">spa</span>
          Ancient Wisdom
        </span>
        <span className="text-outline-variant">•</span>
        <span className="flex items-center gap-1.5">
          <span className="material-symbols-outlined text-base text-secondary">psychology</span>
          Modern Science
        </span>
        <span className="text-outline-variant">•</span>
        <span className="flex items-center gap-1.5">
          <span className="material-symbols-outlined text-base text-primary">eco</span>
          Absolute Purity
        </span>
      </footer>
    </div>
  );
}
