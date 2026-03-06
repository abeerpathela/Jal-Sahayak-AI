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
    <div style={{ minHeight: '100vh', background: '#060f1e', fontFamily: "'Inter', system-ui, sans-serif" }}>
      <Navbar />

      {/* ── HERO ──────────────────────────────────────────────────────────── */}
      <section style={{
        position: 'relative', overflow: 'hidden',
        minHeight: '92vh',
        display: 'flex', alignItems: 'center',
        background: 'linear-gradient(145deg, #060f1e 0%, #0a1e3d 45%, #0d2a52 100%)',
      }}>
        {/* Animated grid background */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: `
            linear-gradient(rgba(41,121,208,0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(41,121,208,0.05) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
          pointerEvents: 'none',
        }} />

        {/* Radial glow accents */}
        <div style={{
          position: 'absolute', top: '-10rem', right: '-5rem',
          width: '45rem', height: '45rem',
          background: 'radial-gradient(circle, rgba(41,121,208,0.12) 0%, transparent 65%)',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', bottom: '-8rem', left: '-8rem',
          width: '38rem', height: '38rem',
          background: 'radial-gradient(circle, rgba(15,47,87,0.4) 0%, transparent 65%)',
          pointerEvents: 'none',
        }} />

        {/* Floating particles */}
        {[...Array(6)].map((_, i) => (
          <div key={i} style={{
            position: 'absolute',
            width: `${4 + i * 2}px`, height: `${4 + i * 2}px`,
            borderRadius: '50%',
            background: `rgba(41, 121, 208, ${0.15 + i * 0.04})`,
            left: `${10 + i * 14}%`,
            top: `${20 + (i % 3) * 20}%`,
            animation: `float ${3 + i}s ease-in-out ${i * 0.4}s infinite`,
            pointerEvents: 'none',
          }} />
        ))}

        <div style={{ maxWidth: '60rem', margin: '0 auto', padding: '6rem 1.5rem 4rem', textAlign: 'center', position: 'relative', zIndex: 1 }}>

          {/* Government badge */}
          <div className="hero-text-1" style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
            border: '1px solid rgba(41,121,208,0.35)',
            borderRadius: '999px',
            padding: '0.4rem 1rem',
            marginBottom: '2.25rem',
            fontSize: '0.72rem', fontWeight: 700,
            color: '#93c5fd', letterSpacing: '0.1em',
            textTransform: 'uppercase',
            background: 'rgba(41,121,208,0.08)',
          }}>
            <span style={{
              width: '6px', height: '6px', borderRadius: '50%',
              background: '#22c55e', display: 'inline-block',
              boxShadow: '0 0 6px #22c55e',
            }} />
            Jal Shakti Ministry · Government of India · Official Portal
          </div>

          <h1 className="hero-text-2" style={{
            fontSize: 'clamp(2.4rem, 6vw, 4rem)',
            fontWeight: 900, lineHeight: 1.1,
            color: '#f1f5f9', margin: '0 0 1.25rem',
            letterSpacing: '-0.03em',
          }}>
            Resolve Water Issues<br />
            <span style={{
              background: 'linear-gradient(90deg, #60a5fa, #2979d0, #38bdf8)',
              backgroundSize: '200% auto',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              animation: 'gradShift 4s ease infinite',
            }}>
              Faster with AI
            </span>
          </h1>

          <p className="hero-text-3" style={{
            fontSize: '1.05rem', color: 'rgba(241,245,249,0.6)',
            maxWidth: '38rem', margin: '0 auto 2.75rem',
            lineHeight: 1.75,
          }}>
            Jal Sahayak AI provides instant answers about water supply,
            quality, and government schemes — and escalates serious issues
            directly to your local water authority.
          </p>

          {error && (
            <div style={{
              background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.35)',
              borderRadius: '0.75rem', padding: '0.75rem 1.25rem',
              marginBottom: '1.5rem', color: '#fca5a5', fontSize: '0.875rem',
            }}>
              {error}
            </div>
          )}

          <div className="hero-btn" style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            {/* Google Sign In */}
            <button
              onClick={() => googleLogin()}
              disabled={loading}
              id="google-signin-btn"
              style={{
                display: 'flex', alignItems: 'center', gap: '0.75rem',
                background: 'white', color: '#0f2f57',
                padding: '0.875rem 2rem', borderRadius: '0.75rem',
                fontWeight: 700, fontSize: '0.95rem', border: 'none',
                cursor: loading ? 'not-allowed' : 'pointer',
                boxShadow: '0 0 0 0 rgba(255,255,255,0)', opacity: loading ? 0.7 : 1,
                transition: 'transform 0.2s, box-shadow 0.2s',
              }}
              onMouseOver={e => { if (!loading) { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(255,255,255,0.15)'; } }}
              onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
            >
              <svg width="20" height="20" viewBox="0 0 48 48">
                <path fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3C33.7 32.3 29.2 35 24 35c-6.1 0-11-4.9-11-11s4.9-11 11-11c2.8 0 5.3 1 7.3 2.7l5.7-5.7C33.8 7 29.1 5 24 5 12.9 5 4 13.9 4 25s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.6-.4-4.9z"/>
                <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 16 19 13 24 13c2.8 0 5.3 1 7.3 2.7l5.7-5.7C33.8 7 29.1 5 24 5c-7.6 0-14.2 4.2-17.7 9.7z"/>
                <path fill="#4CAF50" d="M24 45c5 0 9.6-1.9 13-5l-6-5.2C29.3 36.4 26.8 37 24 37c-5.2 0-9.6-2.7-11.3-6.7L6 35.5C9.5 41 16.2 45 24 45z"/>
                <path fill="#1976D2" d="M43.6 20.1H42V20H24v8h11.3c-.8 2.3-2.4 4.3-4.3 5.8l6 5.2c-.4.4 6-4.4 6-13 0-1.3-.1-2.6-.4-4.9z"/>
              </svg>
              {loading ? 'Signing in…' : 'Continue with Google'}
            </button>

            {/* Staff portal */}
            <button
              onClick={() => setShowStaffModal(true)}
              id="staff-portal-btn"
              style={{
                display: 'flex', alignItems: 'center', gap: '0.625rem',
                background: 'transparent', color: '#e2e8f0',
                padding: '0.875rem 1.75rem', borderRadius: '0.75rem',
                fontWeight: 600, fontSize: '0.95rem',
                border: '1px solid rgba(255,255,255,0.18)',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseOver={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)'; }}
              onMouseOut={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.18)'; }}
            >
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              Staff Portal
            </button>
          </div>

          {/* Trust stats bar */}
          <div className="hero-stat" style={{
            display: 'flex', gap: '2.5rem', justifyContent: 'center',
            marginTop: '3.5rem', flexWrap: 'wrap',
          }}>
            {[
              { n: '48h', label: 'Avg Resolution' },
              { n: '95%', label: 'Satisfaction Rate' },
              { n: '1.2L+', label: 'Complaints Resolved' },
            ].map(s => (
              <div key={s.label} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#60a5fa', letterSpacing: '-0.04em' }}>{s.n}</div>
                <div style={{ fontSize: '0.7rem', color: 'rgba(241,245,249,0.45)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: '0.15rem' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ──────────────────────────────────────────────────────── */}
      <section style={{ background: '#0a1428', padding: '5rem 1.5rem' }}>
        <div style={{ maxWidth: '72rem', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <p style={{ fontSize: '0.72rem', fontWeight: 800, color: '#2979d0', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '0.75rem' }}>Capabilities</p>
            <h2 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 900, color: '#f1f5f9', letterSpacing: '-0.03em', margin: 0 }}>
              Everything you need in one place
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
            {[
              {
                icon: (
                  <svg width="24" height="24" fill="none" stroke="#60a5fa" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 8v4m0 4h.01"/></svg>
                ),
                title: 'AI-Powered Answers',
                desc: 'Instant, accurate responses about water supply, quality issues, and government schemes — no waiting.',
                accent: '#1d4ed8',
              },
              {
                icon: (
                  <svg width="24" height="24" fill="none" stroke="#34d399" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                ),
                title: 'Smart Complaint Filing',
                desc: 'Auto-detected priority (HIGH / MEDIUM / LOW), GPS location capture, and photo evidence attachment.',
                accent: '#065f46',
              },
              {
                icon: (
                  <svg width="24" height="24" fill="none" stroke="#f472b6" strokeWidth="2" viewBox="0 0 24 24"><path d="M8 12h8M12 8v8"/><circle cx="12" cy="12" r="10"/></svg>
                ),
                title: 'Live Staff Chat',
                desc: 'Real-time messaging with assigned water department officers for escalated complaints.',
                accent: '#831843',
              },
              {
                icon: (
                  <svg width="24" height="24" fill="none" stroke="#fb923c" strokeWidth="2" viewBox="0 0 24 24"><path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/></svg>
                ),
                title: 'Real-Time Tracking',
                desc: 'Track complaint status live — OPEN → IN PROGRESS → RESOLVED with full chat history.',
                accent: '#7c2d12',
              },
            ].map((f, i) => (
              <div
                key={i}
                className="feat-card"
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.07)',
                  borderRadius: '1rem', padding: '1.75rem',
                  transition: 'transform 0.25s, border-color 0.25s, box-shadow 0.25s',
                  cursor: 'default',
                }}
                onMouseOver={e => { e.currentTarget.style.borderColor = 'rgba(41,121,208,0.4)'; e.currentTarget.style.boxShadow = '0 8px 40px rgba(41,121,208,0.12)'; }}
                onMouseOut={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'; e.currentTarget.style.boxShadow = 'none'; }}
              >
                <div style={{
                  width: '2.75rem', height: '2.75rem',
                  background: `${f.accent}33`,
                  borderRadius: '0.75rem',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: '1.25rem',
                }}>
                  {f.icon}
                </div>
                <h3 style={{ margin: '0 0 0.6rem', fontWeight: 700, fontSize: '0.95rem', color: '#f1f5f9' }}>{f.title}</h3>
                <p style={{ margin: 0, fontSize: '0.825rem', color: 'rgba(241,245,249,0.5)', lineHeight: 1.65 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ──────────────────────────────────────────────────── */}
      <section style={{ background: '#060f1e', padding: '5rem 1.5rem', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
        <div style={{ maxWidth: '46rem', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <p style={{ fontSize: '0.72rem', fontWeight: 800, color: '#2979d0', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '0.75rem' }}>Process</p>
            <h2 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.4rem)', fontWeight: 900, color: '#f1f5f9', letterSpacing: '-0.03em', margin: 0 }}>
              Complaint to Resolution in 4 steps
            </h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
            {[
              { n: '01', t: 'Sign in with Google', d: 'Secure one-click login — no registration needed, no passwords to remember.' },
              { n: '02', t: 'Describe your issue', d: 'Chat with Jal Sahayak AI. It answers water-related queries from a verified knowledge base.' },
              { n: '03', t: 'Register a complaint', d: 'If unresolved, the system auto-creates a complaint with priority, category, and your GPS location.' },
              { n: '04', t: 'Get resolved', d: 'A water department officer joins your complaint chat and resolves it in real time.' },
            ].map((step, i) => (
              <div key={i} className="step-item" style={{
                display: 'flex', gap: '1.5rem', alignItems: 'flex-start',
                animationDelay: `${i * 0.12}s`,
                padding: '1.75rem 0',
                borderBottom: i < 3 ? '1px solid rgba(255,255,255,0.05)' : 'none',
              }}>
                <div style={{
                  minWidth: '3rem', textAlign: 'right',
                  fontSize: '0.7rem', fontWeight: 800, color: 'rgba(41,121,208,0.5)',
                  letterSpacing: '0.05em', paddingTop: '0.15rem',
                }}>{step.n}</div>
                <div style={{ width: '1px', background: 'rgba(41,121,208,0.25)', alignSelf: 'stretch', margin: '0 0.25rem' }} />
                <div>
                  <div style={{ fontWeight: 700, color: '#e2e8f0', fontSize: '0.95rem', marginBottom: '0.35rem' }}>{step.t}</div>
                  <div style={{ fontSize: '0.825rem', color: 'rgba(241,245,249,0.45)', lineHeight: 1.65 }}>{step.d}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOOTER ────────────────────────────────────────────────────────── */}
      <footer style={{
        borderTop: '1px solid rgba(255,255,255,0.06)',
        padding: '2rem 1.5rem',
        background: '#060f1e',
        textAlign: 'center',
        color: 'rgba(241,245,249,0.3)',
        fontSize: '0.78rem',
      }}>
        © 2026 Jal Shakti Water Services — Government of India &nbsp;|&nbsp; Jal Sahayak AI
      </footer>

      {/* ── STAFF LOGIN MODAL ─────────────────────────────────────────────── */}
      {showStaffModal && (
        <div style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, padding: '1rem',
        }} onClick={(e) => e.target === e.currentTarget && setShowStaffModal(false)}>
          <div style={{
            background: '#0d1f3c',
            border: '1px solid rgba(41,121,208,0.25)',
            borderRadius: '1.25rem', padding: '2.25rem',
            maxWidth: '26rem', width: '100%',
            boxShadow: '0 24px 80px rgba(0,0,0,0.6)',
            animation: 'heroFadeUp 0.3s ease both',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', marginBottom: '1.75rem' }}>
              <div style={{
                background: 'rgba(41,121,208,0.12)',
                border: '1px solid rgba(41,121,208,0.25)',
                padding: '0.625rem', borderRadius: '0.75rem',
              }}>
                <svg width="20" height="20" fill="none" stroke="#60a5fa" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              </div>
              <div>
                <h2 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#f1f5f9' }}>Staff Portal</h2>
                <p style={{ margin: 0, fontSize: '0.75rem', color: 'rgba(241,245,249,0.45)' }}>Water Department Login</p>
              </div>
            </div>

            {error && (
              <div style={{
                background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
                borderRadius: '0.5rem', padding: '0.625rem 1rem',
                marginBottom: '1rem', color: '#fca5a5', fontSize: '0.85rem',
              }}>{error}</div>
            )}

            <form onSubmit={handleStaffLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {[
                { label: 'Staff Email', type: 'email', val: staffEmail, set: setStaffEmail, ph: 'officer@jalshakti.gov.in' },
                { label: 'Password', type: 'password', val: staffPass, set: setStaffPass, ph: '••••••••' },
              ].map(f => (
                <div key={f.label}>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'rgba(241,245,249,0.6)', marginBottom: '0.4rem' }}>{f.label}</label>
                  <input
                    type={f.type} required value={f.val} onChange={e => f.set(e.target.value)}
                    placeholder={f.ph}
                    style={{
                      width: '100%', padding: '0.7rem 0.875rem',
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '0.5rem',
                      fontSize: '0.9rem', outline: 'none',
                      color: '#f1f5f9', boxSizing: 'border-box',
                      transition: 'border-color 0.2s',
                    }}
                    onFocus={e => e.target.style.borderColor = 'rgba(41,121,208,0.6)'}
                    onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                  />
                </div>
              ))}

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button type="button" onClick={() => setShowStaffModal(false)} style={{
                  flex: 1, padding: '0.75rem',
                  border: '1px solid rgba(255,255,255,0.12)',
                  borderRadius: '0.625rem', background: 'transparent',
                  cursor: 'pointer', fontWeight: 600, color: 'rgba(241,245,249,0.6)',
                  fontSize: '0.875rem', transition: 'background 0.2s',
                }}
                  onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                  onMouseOut={e => e.currentTarget.style.background = 'transparent'}
                >Cancel</button>
                <button type="submit" disabled={loading} style={{
                  flex: 1, padding: '0.75rem',
                  background: '#2979d0', color: 'white',
                  border: 'none', borderRadius: '0.625rem',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontWeight: 700, fontSize: '0.875rem',
                  opacity: loading ? 0.7 : 1,
                  transition: 'background 0.2s',
                }}
                  onMouseOver={e => { if (!loading) e.currentTarget.style.background = '#1d4ed8'; }}
                  onMouseOut={e => e.currentTarget.style.background = '#2979d0'}
                >
                  {loading ? 'Logging in…' : 'Login'}
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
