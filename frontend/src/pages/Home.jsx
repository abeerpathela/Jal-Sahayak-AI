import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';
import api from '../services/api';
import Navbar from '../components/Navbar';

/* ─── Inline animation CSS injected once ─────────────────────────────────── */
const ANIMATION_CSS = `
  @keyframes heroFadeUp {
    from { opacity: 0; transform: translateY(28px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes float {
    0%, 100% { transform: translateY(0px); }
    50%       { transform: translateY(-8px); }
  }
  @keyframes ripple {
    0%   { transform: scale(1); opacity: 0.6; }
    100% { transform: scale(2.4); opacity: 0; }
  }
  @keyframes gradShift {
    0%   { background-position: 0% 50%; }
    50%  { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }
  @keyframes slideInLeft {
    from { opacity: 0; transform: translateX(-24px); }
    to   { opacity: 1; transform: translateX(0); }
  }
  @keyframes countUp {
    from { opacity: 0; }
    to   { opacity: 1; }
  }
  .hero-text-1 { animation: heroFadeUp 0.7s ease 0.1s both; }
  .hero-text-2 { animation: heroFadeUp 0.7s ease 0.25s both; }
  .hero-text-3 { animation: heroFadeUp 0.7s ease 0.4s both; }
  .hero-btn    { animation: heroFadeUp 0.7s ease 0.55s both; }
  .hero-stat   { animation: heroFadeUp 0.7s ease 0.7s both; }
  .feat-card:hover { transform: translateY(-5px) !important; }
  .step-item { animation: slideInLeft 0.6s ease both; }
`;

const Home = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showStaffModal, setShowStaffModal] = useState(false);
  const [staffEmail, setStaffEmail] = useState('');
  const [staffPass, setStaffPass] = useState('');
  const [injected, setInjected] = useState(false);

  useEffect(() => {
    if (!injected) {
      const style = document.createElement('style');
      style.textContent = ANIMATION_CSS;
      document.head.appendChild(style);
      setInjected(true);
    }
  }, []);

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setLoading(true); setError('');
      try {
        const profileRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
        });
        const profile = await profileRes.json();
        const { data } = await api.post('/auth/google', {
          name: profile.name, email: profile.email,
          googleId: profile.sub, picture: profile.picture,
        });
        localStorage.setItem('user', JSON.stringify(data));
        localStorage.setItem('token', data.token);
        navigate('/customer-dashboard');
      } catch { setError('Sign-in failed. Please ensure the backend is running.'); }
      finally { setLoading(false); }
    },
    onError: () => setError('Google Sign-In cancelled. Please try again.'),
  });

  const handleStaffLogin = async (e) => {
    e.preventDefault(); setLoading(true); setError('');
    try {
      const { data } = await api.post('/auth/staff-login', { email: staffEmail, password: staffPass });
      localStorage.setItem('user', JSON.stringify(data));
      localStorage.setItem('token', data.token);
      setShowStaffModal(false);
      navigate('/respondent-dashboard');
    } catch (err) {
      setError(err?.response?.data?.message || 'Staff login failed. Check credentials.');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-[#060f1e] font-sans">
      <Navbar />

      {/* ── HERO ──────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden min-h-[92vh] flex items-center bg-gradient-to-br from-[#060f1e] via-[#0a1e3d] to-[#0d2a52]">
        {/* Animated grid background */}
        <div className="absolute inset-0 pointer-events-none opacity-20" 
             style={{ backgroundImage: 'linear-gradient(rgba(41,121,208,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(41,121,208,0.1) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />

        {/* Radial glow accents */}
        <div className="absolute -top-40 -right-20 w-[45rem] h-[45rem] bg-radial from-govAccent/10 to-transparent pointer-events-none" />
        <div className="absolute -bottom-32 -left-32 w-[38rem] h-[38rem] bg-radial from-govDark/40 to-transparent pointer-events-none" />

        <div className="max-w-[72rem] mx-auto px-6 py-20 lg:py-32 text-center relative z-10">

          {/* Government badge */}
          <div className="hero-text-1 inline-flex items-center gap-2 border border-govAccent/35 rounded-full px-4 py-1.5 mb-8 text-[0.65rem] sm:text-[0.72rem] font-bold text-blue-300 tracking-wider uppercase bg-govAccent/10">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_6px_#22c55e]" />
            Jal Shakti Ministry · Gov of India · Official Portal
          </div>

          <h1 className="hero-text-2 text-[2.2rem] sm:text-5xl md:text-6xl lg:text-7xl font-extrabold leading-[1.1] text-slate-50 mb-6 tracking-tight">
            Resolve Water Issues<br />
            <span className="bg-gradient-to-r from-blue-400 via-govAccent to-sky-400 bg-[length:200%_auto] bg-clip-text text-transparent animate-[gradShift_4s_ease_infinite]">
              Faster with AI
            </span>
          </h1>

          <p className="hero-text-3 text-base sm:text-lg text-slate-400 max-w-2xl mx-auto mb-10 sm:mb-12 leading-relaxed">
            Jal Sahayak AI provides instant answers about water supply,
            quality, and schemes — escalates serious issues
            directly to your local authority.
          </p>

          {error && (
            <div className="bg-red-500/10 border border-red-500/35 rounded-xl p-3 sm:p-4 mb-6 text-red-300 text-sm max-w-md mx-auto">
              {error}
            </div>
          )}

          <div className="hero-btn flex flex-col sm:flex-row gap-4 justify-center items-center">
            {/* Google Sign In */}
            <button
              onClick={() => googleLogin()}
              disabled={loading}
              className="w-full sm:w-auto flex items-center justify-center gap-3 bg-white text-govDark px-8 py-3.5 rounded-xl font-bold text-sm sm:text-base cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-white/10 active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              <svg width="20" height="20" viewBox="0 0 48 48">
                <path fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3C33.7 32.3 29.2 35 24 35c-6.1 0-11-4.9-11-11s4.9-11 11-11c2.8 0 5.3 1 7.3 2.7l5.7-5.7C33.8 7 29.1 5 24 5 12.9 5 4 13.9 4 25s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.6-.4-4.9z"/>
                <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 16 19 13 24 13c2.8 0 5.3 1 7.3 2.7l5.7-5.7C33.8 7 29.1 5 24 5c-7.6 0-14.2 4.2-17.7 9.7z"/>
                <path fill="#4CAF50" d="M24 45c5 0 9.6-1.9 13-5l-6-5.2C29.3 36.4 26.8 37 24 37c-5.2 0-9.6-2.7-11.3-6.7L6 35.5C9.5 41 16.2 45 24 45z"/>
                <path fill="#1976D2" d="M43.6 20.1H42V20H24v8h11.3c-.8 2.3-2.4 4.3-4.3 5.8l6 5.2c-.4.4 6-4.4 6-13 0-1.3-.1-2.6-.4-4.9z"/>
              </svg>
              {loading ? 'Signing in...' : 'Continue with Google'}
            </button>

            {/* Staff portal */}
            <button
              onClick={() => setShowStaffModal(true)}
              className="w-full sm:w-auto flex items-center justify-center gap-2.5 bg-transparent text-slate-200 px-7 py-3.5 rounded-xl font-semibold text-sm border border-white/20 hover:bg-white/5 hover:border-white/30 transition-all cursor-pointer"
            >
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              Staff Portal
            </button>
          </div>

          {/* Trust stats bar */}
          <div className="hero-stat flex flex-wrap gap-8 sm:gap-12 justify-center mt-14 sm:mt-16">
            {[
              { n: '48h', label: 'Avg Resolution' },
              { n: '95%', label: 'Satisfaction Rate' },
              { n: '1.2L+', label: 'Complaints Resolved' },
            ].map(s => (
              <div key={s.label} className="text-center group">
                <div className="text-2xl sm:text-3xl font-black text-blue-400 tracking-tighter transition-transform group-hover:scale-110">{s.n}</div>
                <div className="text-[0.65rem] sm:text-[0.7rem] text-slate-500 font-bold uppercase tracking-widest mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ──────────────────────────────────────────────────────── */}
      <section className="bg-[#0a1428] py-20 px-6">
        <div className="max-w-[72rem] mx-auto">
          <div className="text-center mb-16">
            <p className="text-[0.72rem] font-extrabold text-govAccent uppercase tracking-[.2em] mb-3">Capabilities</p>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-50 tracking-tight">
              Everything you need in one place
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              {
                icon: (
                  <svg width="24" height="24" fill="none" stroke="#60a5fa" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 8v4m0 4h.01"/></svg>
                ),
                title: 'AI-Powered Answers',
                desc: 'Instant, accurate responses about water supply, quality issues, and government schemes.',
                accent: 'bg-blue-600/20',
              },
              {
                icon: (
                  <svg width="24" height="24" fill="none" stroke="#34d399" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                ),
                title: 'Smart Complaint Filing',
                desc: 'Auto-detected priority, GPS location capture, and photo evidence attachment.',
                accent: 'bg-emerald-600/20',
              },
              {
                icon: (
                  <svg width="24" height="24" fill="none" stroke="#f472b6" strokeWidth="2" viewBox="0 0 24 24"><path d="M8 12h8M12 8v8"/><circle cx="12" cy="12" r="10"/></svg>
                ),
                title: 'Live Staff Chat',
                desc: 'Real-time messaging with assigned water department officers for escalated complaints.',
                accent: 'bg-pink-600/20',
              },
              {
                icon: (
                  <svg width="24" height="24" fill="none" stroke="#fb923c" strokeWidth="2" viewBox="0 0 24 24"><path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/></svg>
                ),
                title: 'Real-Time Tracking',
                desc: 'Track complaint status live — OPEN → IN PROGRESS → RESOLVED with full chat history.',
                accent: 'bg-orange-600/20',
              },
            ].map((f, i) => (
              <div
                key={i}
                className="feat-card bg-white/[0.03] border border-white/[0.07] rounded-2xl p-7 transition-all hover:border-govAccent/40 hover:shadow-2xl hover:shadow-govAccent/10 cursor-default"
              >
                <div className={`w-11 h-11 ${f.accent} rounded-xl flex items-center justify-center mb-5`}>
                  {f.icon}
                </div>
                <h3 className="text-base font-bold text-slate-50 mb-2.5">{f.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ──────────────────────────────────────────────────── */}
      <section className="bg-[#060f1e] py-20 px-6 border-t border-white/5">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-[0.72rem] font-extrabold text-govAccent uppercase tracking-[.2em] mb-3">Process</p>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-50 tracking-tight">
              Complaint to Resolution in 4 steps
            </h2>
          </div>

          <div className="space-y-0">
            {[
              { n: '01', t: 'Sign in with Google', d: 'Secure one-click login — no registration needed, no passwords to remember.' },
              { n: '02', t: 'Describe your issue', d: 'Chat with Jal Sahayak AI. It answers water-related queries from a verified knowledge base.' },
              { n: '03', t: 'Register a complaint', d: 'If unresolved, the system auto-creates a complaint with priority and your GPS location.' },
              { n: '04', t: 'Get resolved', d: 'A water department officer joins your complaint chat and resolves it in real time.' },
            ].map((step, i) => (
              <div key={i} className="step-item flex gap-6 sm:gap-8 items-start py-8 border-b border-white/5 last:border-0" style={{ animationDelay: `${i * 0.12}s` }}>
                <div className="min-w-[2.5rem] sm:min-w-[3rem] text-right text-[0.65rem] sm:text-[0.75rem] font-black text-govAccent/50 tracking-wider pt-1">{step.n}</div>
                <div className="w-px bg-govAccent/20 self-stretch" />
                <div>
                  <div className="font-bold text-slate-200 text-sm sm:text-base mb-1.5">{step.t}</div>
                  <div className="text-xs sm:text-sm text-slate-500 leading-safe">{step.d}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOOTER ────────────────────────────────────────────────────────── */}
      <footer className="border-t border-white/10 py-8 px-6 bg-[#060f1e] text-center text-slate-500 text-xs sm:text-sm">
        © 2026 Jal Shakti Water Services — Government of India &nbsp;|&nbsp; Jal Sahayak AI
      </footer>

      {/* ── STAFF LOGIN MODAL ─────────────────────────────────────────────── */}
      {showStaffModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[1000] p-4 animate-fadeIn" 
             onClick={(e) => e.target === e.currentTarget && setShowStaffModal(false)}>
          <div className="bg-[#0d1f3c] border border-govAccent/25 rounded-2xl p-6 sm:p-10 max-w-md w-full shadow-2xl animate-heroFadeUp">
            <div className="flex items-center gap-4 mb-8">
              <div className="bg-govAccent/10 border border-govAccent/20 p-2.5 rounded-xl">
                <svg width="24" height="24" fill="none" stroke="#60a5fa" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-50 mb-0.5">Staff Portal</h2>
                <p className="text-xs sm:text-sm text-slate-500">Water Department Login</p>
              </div>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3.5 mb-6 text-red-300 text-xs sm:text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleStaffLogin} className="space-y-5">
              {[
                { label: 'Staff Email', type: 'email', val: staffEmail, set: setStaffEmail, ph: 'officer@jalshakti.gov.in' },
                { label: 'Password', type: 'password', val: staffPass, set: setStaffPass, ph: '••••••••' },
              ].map(f => (
                <div key={f.label}>
                  <label className="block text-[0.7rem] sm:text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">{f.label}</label>
                  <input
                    type={f.type} required value={f.val} onChange={e => f.set(e.target.value)}
                    placeholder={f.ph}
                    className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 text-sm text-slate-100 outline-none focus:border-govAccent/60 transition-colors placeholder:text-slate-600"
                  />
                </div>
              ))}

              <div className="flex gap-4 pt-3">
                <button type="button" onClick={() => setShowStaffModal(false)} 
                  className="flex-1 bg-transparent border border-white/15 py-3 rounded-xl text-slate-400 font-bold text-sm hover:bg-white/5 transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={loading}
                  className="flex-1 bg-govAccent py-3 rounded-xl text-white font-bold text-sm hover:bg-blue-600 transition-colors disabled:opacity-70">
                  {loading ? '...' : 'Login'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
