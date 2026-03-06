import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const logout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    navigate('/');
  };

  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 200,
      backdropFilter: 'blur(16px)',
      background: scrolled
        ? 'rgba(10, 25, 50, 0.96)'
        : 'rgba(10, 25, 50, 0.92)',
      borderBottom: scrolled ? '1px solid rgba(41, 121, 208, 0.25)' : '1px solid rgba(255,255,255,0.06)',
      transition: 'all 0.3s ease',
    }}>
      <div style={{
        maxWidth: '82rem', margin: '0 auto',
        padding: '0 1.5rem',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        height: '4rem',
      }}>

        {/* Brand / Logo */}
        <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {/* Badge Logo */}
          <img 
            src="/logo.jpg" 
            alt="Jal Sahayak Logo" 
            style={{ 
              width: '42px', 
              height: '42px', 
              borderRadius: '50%', 
              objectFit: 'cover',
              border: '1px solid rgba(255,255,255,0.1)'
            }} 
          />

          <div>
            <div style={{ fontWeight: 800, fontSize: '1rem', color: 'white', letterSpacing: '-0.3px', lineHeight: 1.1 }}>
              Jal Sahayak
            </div>
            <div style={{ fontSize: '0.6rem', color: 'rgba(41,121,208,0.9)', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
              AI · Water Services
            </div>
          </div>
        </Link>

        {/* Right */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {user ? (
            <>
              <Link
                to={user.role === 'respondent' ? '/respondent-dashboard' : '/customer-dashboard'}
                style={{
                  color: 'rgba(255,255,255,0.75)', textDecoration: 'none',
                  fontSize: '0.85rem', fontWeight: 500,
                  padding: '0.375rem 0.875rem',
                  borderRadius: '0.5rem',
                  transition: 'color 0.2s, background 0.2s',
                }}
                onMouseOver={e => { e.currentTarget.style.color = 'white'; e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; }}
                onMouseOut={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.75)'; e.currentTarget.style.background = 'transparent'; }}
              >
                Dashboard
              </Link>

              <span style={{
                background: user.role === 'respondent' ? 'rgba(234,179,8,0.15)' : 'rgba(34,197,94,0.15)',
                color: user.role === 'respondent' ? '#fcd34d' : '#4ade80',
                border: `1px solid ${user.role === 'respondent' ? 'rgba(234,179,8,0.3)' : 'rgba(34,197,94,0.3)'}`,
                fontSize: '0.65rem', fontWeight: 700,
                padding: '0.2rem 0.6rem', borderRadius: '999px',
                textTransform: 'uppercase', letterSpacing: '0.08em',
              }}>
                {user.role === 'respondent' ? 'Staff' : 'Citizen'}
              </span>

              <div style={{ width: '1px', height: '1.5rem', background: 'rgba(255,255,255,0.15)' }} />

              <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)', fontWeight: 500 }}>
                {user.name?.split(' ')[0]}
              </span>

              <button
                onClick={logout}
                style={{
                  background: 'transparent',
                  color: '#fc8181',
                  border: '1px solid rgba(252,129,129,0.4)',
                  padding: '0.35rem 0.875rem',
                  borderRadius: '0.5rem',
                  fontSize: '0.8rem', fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                onMouseOver={e => { e.currentTarget.style.background = 'rgba(220,38,38,0.15)'; e.currentTarget.style.borderColor = '#fc8181'; }}
                onMouseOut={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'rgba(252,129,129,0.4)'; }}
              >
                Logout
              </button>
            </>
          ) : (
            <Link to="/" style={{
              background: '#2979d0',
              color: 'white',
              padding: '0.45rem 1.25rem',
              borderRadius: '0.5rem',
              fontWeight: 600, fontSize: '0.875rem',
              textDecoration: 'none',
              transition: 'background 0.2s',
            }}
              onMouseOver={e => e.currentTarget.style.background = '#1b4d89'}
              onMouseOut={e => e.currentTarget.style.background = '#2979d0'}
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
