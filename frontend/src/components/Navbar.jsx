import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, LayoutDashboard, LogOut, User } from 'lucide-react';

const Navbar = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const logout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    navigate('/');
    setOpen(false);
  };

  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 200, transition: 'all 0.3s',
      background: scrolled ? 'rgba(10,25,50,0.97)' : 'rgba(10,25,50,0.93)',
      backdropFilter: 'blur(12px)',
      borderBottom: scrolled ? '1px solid rgba(41,121,208,0.25)' : '1px solid rgba(255,255,255,0.06)',
    }}>
      {/* ── Responsive CSS ── */}
      <style>{`
        .nav-desktop { display: flex; align-items: center; gap: 0.75rem; }
        .nav-hamburger { display: none; }
        .nav-drawer { display: none; }
        @media (max-width: 767px) {
          .nav-desktop { display: none !important; }
          .nav-hamburger { display: flex !important; align-items: center; justify-content: center; }
          .nav-drawer { display: block; }
        }
      `}</style>

      {/* ── Main Bar ── */}
      <div style={{
        maxWidth: '82rem', margin: '0 auto', padding: '0 1.25rem',
        height: '64px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        {/* Brand */}
        <Link to="/" onClick={() => setOpen(false)} style={{
          display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none',
        }}>
          <img src="/logo.jpg" alt="Jal Sahayak"
            style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover', border: '1px solid rgba(255,255,255,0.15)', flexShrink: 0 }}
          />
          <div>
            <div style={{ fontWeight: 800, fontSize: '0.95rem', color: 'white', lineHeight: 1.2 }}>Jal Sahayak</div>
            <div style={{ fontSize: '0.55rem', color: 'rgba(41,121,208,0.85)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.12em' }}>AI · Water Services</div>
          </div>
        </Link>

        {/* Desktop Nav */}
        <div className="nav-desktop">
          {user ? (
            <>
              <Link
                to={user.role === 'respondent' ? '/respondent-dashboard' : '/customer-dashboard'}
                style={{
                  color: 'rgba(255,255,255,0.75)', textDecoration: 'none', fontSize: '0.875rem',
                  fontWeight: 600, padding: '0.375rem 0.875rem', borderRadius: '0.5rem',
                  display: 'flex', alignItems: 'center', gap: '0.375rem',
                }}
              >
                <LayoutDashboard size={14} /> Dashboard
              </Link>
              <span style={{
                fontSize: '0.6rem', fontWeight: 800, padding: '0.2rem 0.6rem', borderRadius: '999px',
                textTransform: 'uppercase', letterSpacing: '0.08em',
                background: user.role === 'respondent' ? 'rgba(234,179,8,0.15)' : 'rgba(34,197,94,0.15)',
                color: user.role === 'respondent' ? '#fde047' : '#4ade80',
                border: `1px solid ${user.role === 'respondent' ? 'rgba(234,179,8,0.3)' : 'rgba(34,197,94,0.3)'}`,
              }}>
                {user.role === 'respondent' ? 'Staff' : 'Citizen'}
              </span>
              <div style={{ width: 1, height: 24, background: 'rgba(255,255,255,0.15)' }} />
              <span style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.55)', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                <User size={14} /> {user.name?.split(' ')[0]}
              </span>
              <button onClick={logout} style={{
                background: 'transparent', color: '#f87171', border: '1px solid rgba(248,113,113,0.35)',
                padding: '0.375rem 0.875rem', borderRadius: '0.5rem', fontSize: '0.875rem', fontWeight: 600,
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.375rem',
              }}>
                <LogOut size={14} /> Logout
              </button>
            </>
          ) : (
            <Link to="/" style={{
              background: '#2979d0', color: 'white', padding: '0.5rem 1.25rem',
              borderRadius: '0.5rem', fontWeight: 600, fontSize: '0.875rem', textDecoration: 'none',
            }}>Sign In</Link>
          )}
        </div>

        {/* Hamburger Button */}
        <button className="nav-hamburger" onClick={() => setOpen(o => !o)} style={{
          background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
          color: 'rgba(255,255,255,0.9)', padding: '0.5rem', borderRadius: '0.5rem', cursor: 'pointer',
        }}>
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* ── Mobile Drawer ── */}
      <div className="nav-drawer" style={{
        maxHeight: open ? '400px' : '0px',
        overflow: 'hidden',
        opacity: open ? 1 : 0,
        transition: 'max-height 0.3s ease, opacity 0.25s ease',
        background: 'rgba(8,18,38,0.99)',
        borderTop: open ? '1px solid rgba(255,255,255,0.07)' : 'none',
      }}>
        <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {user ? (
            <>
              {/* User info */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: '50%', background: 'rgba(41,121,208,0.2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#60a5fa',
                    border: '1px solid rgba(41,121,208,0.3)', flexShrink: 0,
                  }}><User size={20} /></div>
                  <div>
                    <div style={{ color: 'white', fontWeight: 600, fontSize: '0.9rem' }}>{user.name}</div>
                    <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem' }}>{user.role}</div>
                  </div>
                </div>
                <span style={{
                  fontSize: '0.6rem', fontWeight: 800, padding: '0.2rem 0.6rem', borderRadius: '999px',
                  textTransform: 'uppercase', letterSpacing: '0.08em',
                  background: user.role === 'respondent' ? 'rgba(234,179,8,0.15)' : 'rgba(34,197,94,0.15)',
                  color: user.role === 'respondent' ? '#fde047' : '#4ade80',
                  border: `1px solid ${user.role === 'respondent' ? 'rgba(234,179,8,0.3)' : 'rgba(34,197,94,0.3)'}`,
                }}>
                  {user.role === 'respondent' ? 'Staff' : 'Citizen'}
                </span>
              </div>

              {/* Dashboard */}
              <Link
                to={user.role === 'respondent' ? '/respondent-dashboard' : '/customer-dashboard'}
                onClick={() => setOpen(false)}
                style={{
                  color: 'rgba(255,255,255,0.85)', textDecoration: 'none', fontSize: '1rem', fontWeight: 600,
                  padding: '0.875rem 1rem', borderRadius: '0.75rem', background: 'rgba(255,255,255,0.05)',
                  display: 'flex', alignItems: 'center', gap: '0.75rem',
                }}
              >
                <LayoutDashboard size={20} /> Dashboard
              </Link>

              {/* Logout */}
              <button onClick={logout} style={{
                background: 'rgba(239,68,68,0.08)', color: '#f87171',
                border: '1px solid rgba(239,68,68,0.2)', padding: '0.875rem 1rem',
                borderRadius: '0.75rem', fontSize: '1rem', fontWeight: 600,
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.75rem', width: '100%',
              }}>
                <LogOut size={20} /> Logout
              </button>
            </>
          ) : (
            <Link to="/" onClick={() => setOpen(false)} style={{
              background: '#2979d0', color: 'white', padding: '0.875rem',
              borderRadius: '0.75rem', fontWeight: 700, textAlign: 'center', textDecoration: 'none',
              display: 'block', fontSize: '1rem',
            }}>Sign In</Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
