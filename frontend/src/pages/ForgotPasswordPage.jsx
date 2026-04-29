import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    setLoading(false);
    setSent(true);
  };

  return (
    <div className="min-h-screen bg-surface font-['Inter'] relative overflow-hidden flex flex-col">
      {/* Background blobs */}
      <div
        className="sattva-blob"
        style={{
          position: 'absolute',
          top: '-15%',
          left: '-10%',
          width: '480px',
          height: '480px',
          borderRadius: '50%',
          background: 'rgba(21,66,18,0.14)',
          filter: 'blur(80px)',
          zIndex: 0,
          pointerEvents: 'none',
        }}
      />
      <div
        className="sattva-blob"
        style={{
          position: 'absolute',
          bottom: '-10%',
          right: '-8%',
          width: '400px',
          height: '400px',
          borderRadius: '50%',
          background: 'rgba(254,183,0,0.14)',
          filter: 'blur(80px)',
          zIndex: 0,
          pointerEvents: 'none',
        }}
      />
      <div
        className="sattva-blob"
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '360px',
          height: '360px',
          borderRadius: '50%',
          background: 'rgba(124,88,0,0.08)',
          filter: 'blur(80px)',
          zIndex: 0,
          pointerEvents: 'none',
        }}
      />

      {/* Header */}
      <header className="relative z-10 flex items-center px-8 py-5">
        <Link to="/login" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
            <span className="material-symbols-outlined text-white text-xl">spa</span>
          </div>
          <span
            className="text-xl font-bold text-primary tracking-tight"
            style={{ fontFamily: "'Noto Serif', serif" }}
          >
            AarogyaAnna
          </span>
        </Link>
      </header>

      {/* Main */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          {/* Card */}
          <div className="rounded-[2.5rem] shadow-xl bg-surface-container-lowest/80 backdrop-blur-xl p-8 sm:p-10 flex flex-col gap-7">

            {/* Icon */}
            <div className="flex justify-center">
              <div
                className="w-20 h-20 rounded-3xl flex items-center justify-center shadow-lg"
                style={{
                  background: 'linear-gradient(135deg, rgba(21,66,18,0.12) 0%, rgba(254,183,0,0.15) 100%)',
                }}
              >
                {sent ? (
                  <span className="material-symbols-outlined text-primary text-4xl">mark_email_read</span>
                ) : (
                  <span className="material-symbols-outlined text-primary text-4xl">lock_reset</span>
                )}
              </div>
            </div>

            {sent ? (
              /* Success state */
              <div className="flex flex-col gap-5 items-center text-center">
                <div>
                  <h2
                    className="text-2xl font-bold text-on-surface mb-2"
                    style={{ fontFamily: "'Noto Serif', serif" }}
                  >
                    Check Your Inbox
                  </h2>
                  <p className="text-sm text-on-surface-variant leading-relaxed">
                    OTP sent to your email
                  </p>
                </div>

                {/* Email badge */}
                <div className="flex items-center gap-2.5 bg-surface-container rounded-2xl px-5 py-3.5 w-full">
                  <span className="material-symbols-outlined text-primary text-xl">mail</span>
                  <div className="text-left">
                    <div className="text-xs text-on-surface-variant mb-0.5">OTP sent to</div>
                    <div className="text-sm font-semibold text-on-surface truncate max-w-[220px]">
                      {email}
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-primary text-xl ml-auto">verified</span>
                </div>

                {/* Info box */}
                <div className="flex items-start gap-3 bg-primary/8 rounded-2xl px-4 py-3.5 w-full text-left">
                  <span className="material-symbols-outlined text-primary text-base mt-0.5 flex-shrink-0">
                    info
                  </span>
                  <p className="text-xs text-on-surface-variant leading-relaxed">
                    The OTP is valid for <strong className="text-on-surface">10 minutes</strong>. If you don't see the email, check your spam folder.
                  </p>
                </div>

                <button
                  onClick={() => { setSent(false); setEmail(''); }}
                  className="w-full flex items-center justify-center gap-2 text-sm text-on-surface-variant hover:text-primary transition-colors py-2"
                >
                  <span className="material-symbols-outlined text-base">refresh</span>
                  Resend OTP
                </button>

                <div className="h-px bg-outline-variant w-full" />

                <Link
                  to="/login"
                  className="flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
                >
                  <span className="material-symbols-outlined text-base">arrow_back</span>
                  Back to Sign In
                </Link>
              </div>
            ) : (
              /* Default state */
              <>
                <div className="text-center">
                  <h2
                    className="text-2xl font-bold text-on-surface mb-2"
                    style={{ fontFamily: "'Noto Serif', serif" }}
                  >
                    Forgot Password?
                  </h2>
                  <p className="text-sm text-on-surface-variant leading-relaxed">
                    No worries — enter your registered email and we'll send you a one-time password to reset your account.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                  {/* Email field */}
                  <div className="relative">
                    <input
                      id="forgot-email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder=" "
                      className="peer w-full bg-surface-container border-none rounded-xl px-4 pt-6 pb-3 text-on-surface text-sm outline-none focus:ring-2 focus:ring-primary/40 transition"
                    />
                    <label
                      htmlFor="forgot-email"
                      className="absolute left-4 top-2 text-xs font-medium text-on-surface-variant peer-placeholder-shown:top-4 peer-placeholder-shown:text-sm peer-focus:top-2 peer-focus:text-xs transition-all duration-150 pointer-events-none"
                    >
                      Email address
                    </label>
                    <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-lg">
                      mail
                    </span>
                  </div>

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-br from-primary to-primary-container text-white rounded-full py-4 font-bold text-base shadow-md hover:shadow-lg hover:opacity-95 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="inline-block w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                        Sending OTP…
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        <span className="material-symbols-outlined text-lg">send</span>
                        Send OTP
                      </span>
                    )}
                  </button>
                </form>

                <div className="flex flex-col items-center gap-3">
                  <div className="h-px bg-outline-variant w-full" />
                  <Link
                    to="/login"
                    className="flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
                  >
                    <span className="material-symbols-outlined text-base">arrow_back</span>
                    Back to Sign In
                  </Link>
                </div>
              </>
            )}
          </div>

          {/* Sub-footer hint */}
          <p className="text-center text-xs text-on-surface-variant mt-6 flex items-center justify-center gap-1.5">
            <span className="material-symbols-outlined text-sm text-primary">shield</span>
            Your account is protected with end-to-end encryption
          </p>
        </div>
      </main>
    </div>
  );
}
