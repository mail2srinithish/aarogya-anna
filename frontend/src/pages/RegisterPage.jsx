import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

const DIET_OPTIONS = [
  { value: '', label: 'Select diet type' },
  { value: 'vegetarian', label: 'Vegetarian' },
  { value: 'vegan', label: 'Vegan' },
  { value: 'non-vegetarian', label: 'Non-Vegetarian' },
  { value: 'jain', label: 'Jain' },
  { value: 'eggetarian', label: 'Eggetarian' },
];

export default function RegisterPage() {
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    dietType: '',
    agreeTerms: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (!form.agreeTerms) {
      setError('Please agree to the Terms & Conditions.');
      return;
    }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 700));
    login(
      {
        name: form.name || 'New User',
        email: form.email,
        role: 'user',
        subscription: 'Free Plan',
      },
      'mock-token'
    );
    navigate('/onboarding');
  };

  return (
    <div className="min-h-screen bg-surface font-['Inter'] relative overflow-hidden flex flex-col">
      {/* Background blobs */}
      <div
        className="sattva-blob"
        style={{
          position: 'absolute',
          top: '-8%',
          right: '-10%',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: 'rgba(21,66,18,0.15)',
          filter: 'blur(80px)',
          zIndex: 0,
          pointerEvents: 'none',
        }}
      />
      <div
        className="sattva-blob"
        style={{
          position: 'absolute',
          bottom: '0',
          left: '-8%',
          width: '440px',
          height: '440px',
          borderRadius: '50%',
          background: 'rgba(254,183,0,0.13)',
          filter: 'blur(80px)',
          zIndex: 0,
          pointerEvents: 'none',
        }}
      />
      <div
        className="sattva-blob"
        style={{
          position: 'absolute',
          top: '45%',
          left: '40%',
          width: '360px',
          height: '360px',
          borderRadius: '50%',
          background: 'rgba(124,88,0,0.10)',
          filter: 'blur(80px)',
          zIndex: 0,
          pointerEvents: 'none',
        }}
      />

      {/* Header */}
      <header className="relative z-10 flex items-center px-8 py-5">
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
      </header>

      {/* Main */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-5xl rounded-[2.5rem] shadow-2xl overflow-hidden bg-surface-container-lowest/80 backdrop-blur-xl flex flex-col lg:flex-row min-h-[600px]">

          {/* Left visual panel */}
          <div className="lg:w-[42%] bg-gradient-to-br from-primary to-primary-container relative flex flex-col justify-between p-10 overflow-hidden">
            {/* Decorative shapes */}
            <div
              style={{
                position: 'absolute',
                top: '-40px',
                right: '-40px',
                width: '220px',
                height: '220px',
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.07)',
              }}
            />
            <div
              style={{
                position: 'absolute',
                bottom: '60px',
                left: '-30px',
                width: '180px',
                height: '180px',
                borderRadius: '50%',
                background: 'rgba(254,183,0,0.15)',
                filter: 'blur(2px)',
              }}
            />
            <div
              style={{
                position: 'absolute',
                bottom: '-30px',
                right: '10px',
                width: '160px',
                height: '160px',
                borderRadius: '2rem',
                background: 'rgba(255,255,255,0.06)',
                transform: 'rotate(20deg)',
              }}
            />

            <div className="relative z-10">
              <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center mb-6 shadow">
                <span className="material-symbols-outlined text-white text-3xl">local_florist</span>
              </div>
              <h2
                className="text-3xl font-bold text-white leading-tight mb-4"
                style={{ fontFamily: "'Noto Serif', serif" }}
              >
                Join AarogyaAnna
              </h2>
              <p className="text-white/75 text-sm leading-relaxed mb-8">
                Begin your journey toward vibrant health through the timeless principles of Ayurvedic nutrition.
              </p>

              {/* Sanskrit taglines */}
              <div className="flex flex-col gap-4">
                {[
                  { icon: 'spa', sanskrit: 'आहारः', meaning: 'Food as Medicine' },
                  { icon: 'self_improvement', sanskrit: 'स्वास्थ्य', meaning: 'Holistic Wellness' },
                  { icon: 'eco', sanskrit: 'प्रकृति', meaning: 'Nature\'s Intelligence' },
                ].map(({ icon, sanskrit, meaning }) => (
                  <div key={meaning} className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
                      <span className="material-symbols-outlined text-white/90 text-lg">{icon}</span>
                    </div>
                    <div>
                      <div
                        className="text-white font-semibold text-sm leading-none"
                        style={{ fontFamily: "'Noto Serif', serif" }}
                      >
                        {sanskrit}
                      </div>
                      <div className="text-white/60 text-xs mt-0.5">{meaning}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative z-10 mt-8">
              <div className="h-px bg-white/20 mb-4" />
              <p className="text-white/50 text-xs leading-relaxed italic">
                "Let food be thy medicine and medicine be thy food." — Hippocrates
              </p>
            </div>
          </div>

          {/* Right form panel */}
          <div className="flex-1 p-8 lg:p-10 flex flex-col justify-center">
            <div className="max-w-sm mx-auto w-full flex flex-col gap-5">
              <div>
                <h3
                  className="text-2xl font-bold text-on-surface mb-1"
                  style={{ fontFamily: "'Noto Serif', serif" }}
                >
                  Create Account
                </h3>
                <p className="text-sm text-on-surface-variant">
                  Your wellness journey starts here
                </p>
              </div>

              {error && (
                <div className="flex items-center gap-2 bg-error/10 border border-error/30 rounded-xl px-4 py-3 text-sm text-error">
                  <span className="material-symbols-outlined text-base">error</span>
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                {/* Full Name */}
                <div className="relative">
                  <input
                    id="reg-name"
                    type="text"
                    name="name"
                    required
                    value={form.name}
                    onChange={handleChange}
                    placeholder=" "
                    className="peer w-full bg-surface-container border-none rounded-xl px-4 pt-6 pb-3 text-on-surface text-sm outline-none focus:ring-2 focus:ring-primary/40 transition"
                  />
                  <label
                    htmlFor="reg-name"
                    className="absolute left-4 top-2 text-xs font-medium text-on-surface-variant peer-placeholder-shown:top-4 peer-placeholder-shown:text-sm peer-focus:top-2 peer-focus:text-xs transition-all duration-150 pointer-events-none"
                  >
                    Full Name
                  </label>
                  <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-lg">
                    person
                  </span>
                </div>

                {/* Email */}
                <div className="relative">
                  <input
                    id="reg-email"
                    type="email"
                    name="email"
                    required
                    value={form.email}
                    onChange={handleChange}
                    placeholder=" "
                    className="peer w-full bg-surface-container border-none rounded-xl px-4 pt-6 pb-3 text-on-surface text-sm outline-none focus:ring-2 focus:ring-primary/40 transition"
                  />
                  <label
                    htmlFor="reg-email"
                    className="absolute left-4 top-2 text-xs font-medium text-on-surface-variant peer-placeholder-shown:top-4 peer-placeholder-shown:text-sm peer-focus:top-2 peer-focus:text-xs transition-all duration-150 pointer-events-none"
                  >
                    Email address
                  </label>
                  <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-lg">
                    mail
                  </span>
                </div>

                {/* Password */}
                <div className="relative">
                  <input
                    id="reg-password"
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    required
                    value={form.password}
                    onChange={handleChange}
                    placeholder=" "
                    className="peer w-full bg-surface-container border-none rounded-xl px-4 pt-6 pb-3 pr-10 text-on-surface text-sm outline-none focus:ring-2 focus:ring-primary/40 transition"
                  />
                  <label
                    htmlFor="reg-password"
                    className="absolute left-4 top-2 text-xs font-medium text-on-surface-variant peer-placeholder-shown:top-4 peer-placeholder-shown:text-sm peer-focus:top-2 peer-focus:text-xs transition-all duration-150 pointer-events-none"
                  >
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary transition-colors"
                  >
                    <span className="material-symbols-outlined text-lg">
                      {showPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>

                {/* Confirm Password */}
                <div className="relative">
                  <input
                    id="reg-confirm"
                    type={showConfirm ? 'text' : 'password'}
                    name="confirmPassword"
                    required
                    value={form.confirmPassword}
                    onChange={handleChange}
                    placeholder=" "
                    className="peer w-full bg-surface-container border-none rounded-xl px-4 pt-6 pb-3 pr-10 text-on-surface text-sm outline-none focus:ring-2 focus:ring-primary/40 transition"
                  />
                  <label
                    htmlFor="reg-confirm"
                    className="absolute left-4 top-2 text-xs font-medium text-on-surface-variant peer-placeholder-shown:top-4 peer-placeholder-shown:text-sm peer-focus:top-2 peer-focus:text-xs transition-all duration-150 pointer-events-none"
                  >
                    Confirm Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowConfirm((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary transition-colors"
                  >
                    <span className="material-symbols-outlined text-lg">
                      {showConfirm ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>

                {/* Diet Type */}
                <div className="relative">
                  <select
                    id="reg-diet"
                    name="dietType"
                    required
                    value={form.dietType}
                    onChange={handleChange}
                    className="w-full bg-surface-container border-none rounded-xl px-4 pt-6 pb-3 text-on-surface text-sm outline-none focus:ring-2 focus:ring-primary/40 transition appearance-none cursor-pointer"
                  >
                    {DIET_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value} disabled={opt.value === ''}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  <label
                    htmlFor="reg-diet"
                    className="absolute left-4 top-2 text-xs font-medium text-on-surface-variant pointer-events-none"
                  >
                    Diet Type
                  </label>
                  <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-lg pointer-events-none">
                    expand_more
                  </span>
                </div>

                {/* T&C */}
                <label className="flex items-start gap-3 cursor-pointer group">
                  <div className="relative mt-0.5 flex-shrink-0">
                    <input
                      type="checkbox"
                      name="agreeTerms"
                      checked={form.agreeTerms}
                      onChange={handleChange}
                      className="sr-only"
                    />
                    <div
                      className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                        form.agreeTerms
                          ? 'bg-primary border-primary'
                          : 'border-outline-variant group-hover:border-primary'
                      }`}
                    >
                      {form.agreeTerms && (
                        <span className="material-symbols-outlined text-white text-xs font-bold">
                          check
                        </span>
                      )}
                    </div>
                  </div>
                  <span className="text-xs text-on-surface-variant leading-relaxed">
                    I agree to the{' '}
                    <a href="#terms" className="text-primary font-semibold hover:underline">
                      Terms of Service
                    </a>{' '}
                    and{' '}
                    <a href="#privacy" className="text-primary font-semibold hover:underline">
                      Privacy Policy
                    </a>
                  </span>
                </label>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-br from-primary to-primary-container text-white rounded-full py-4 font-bold text-base shadow-md hover:shadow-lg hover:opacity-95 transition-all disabled:opacity-60 disabled:cursor-not-allowed mt-1"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="inline-block w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      Creating account…
                    </span>
                  ) : (
                    'Create My Account'
                  )}
                </button>
              </form>

              <p className="text-center text-sm text-on-surface-variant">
                Already have an account?{' '}
                <Link to="/login" className="text-primary font-semibold hover:underline">
                  Sign In
                </Link>
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
