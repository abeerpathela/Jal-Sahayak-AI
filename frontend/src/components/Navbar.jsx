import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, LayoutDashboard, LogOut, User } from 'lucide-react';

const Navbar = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const logout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    navigate('/');
    setMobileMenuOpen(false);
  };

  return (
    <nav className={`sticky top-0 z-[200] transition-all duration-300 ${
      scrolled ? 'bg-[#0a1932]/96 backdrop-blur-md border-b border-govAccent/25' : 'bg-[#0a1932]/92 backdrop-blur-sm border-b border-white/5'
    }`}>
      <div className="max-w-[82rem] mx-auto px-6 h-16 flex justify-between items-center">
        
        {/* Brand / Logo */}
        <Link to="/" className="flex items-center gap-3 no-underline" onClick={() => setMobileMenuOpen(false)}>
          <img 
            src="/logo.jpg" 
            alt="Jal Sahayak Logo" 
            className="w-[42px] h-[42px] rounded-full object-cover border border-white/10"
          />
          <div className="hidden sm:block">
            <div className="font-extrabold text-base text-white tracking-tight leading-none">
              Jal Sahayak
            </div>
            <div className="text-[0.6rem] color-govAccent/90 font-semibold tracking-widest uppercase mt-0.5">
              AI · Water Services
            </div>
          </div>
          {/* Mobile minimal title */}
          <div className="sm:hidden font-extrabold text-base text-white tracking-tight">
            Jal Sahayak
          </div>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <>
              <Link
                to={user.role === 'respondent' ? '/respondent-dashboard' : '/customer-dashboard'}
                className="text-white/75 no-underline text-sm font-medium px-3.5 py-1.5 rounded-lg transition-all hover:text-white hover:bg-white/10 flex items-center gap-2"
              >
                <LayoutDashboard size={14} />
                Dashboard
              </Link>

              <span className={`text-[0.65rem] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider border ${
                user.role === 'respondent' 
                  ? 'bg-yellow-500/15 text-yellow-300 border-yellow-500/30' 
                  : 'bg-green-500/15 text-green-400 border-green-500/30'
              }`}>
                {user.role === 'respondent' ? 'Staff' : 'Citizen'}
              </span>

              <div className="w-[1px] h-6 bg-white/15 mx-1" />

              <span className="text-sm text-white/60 font-medium flex items-center gap-2">
                <User size={14} />
                {user.name?.split(' ')[0]}
              </span>

              <button
                onClick={logout}
                className="bg-transparent text-red-400 border border-red-400/40 px-3.5 py-1.5 rounded-lg text-sm font-semibold cursor-pointer transition-all hover:bg-red-600/15 hover:border-red-400 flex items-center gap-2"
              >
                <LogOut size={14} />
                Logout
              </button>
            </>
          ) : (
            <Link to="/" className="bg-[#2979d0] hover:bg-[#1b4d89] text-white px-5 py-2 rounded-lg font-semibold text-sm no-underline transition-colors shrink-0">
              Sign In
            </Link>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button 
          className="md:hidden text-white/80 p-2 rounded-lg hover:bg-white/10 transition-colors"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Drawer */}
      <div className={`md:hidden fixed inset-x-0 top-16 bg-[#0a1932]/98 backdrop-blur-xl border-b border-white/10 overflow-hidden transition-all duration-300 ease-in-out ${mobileMenuOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="p-6 flex flex-col gap-4">
          {user ? (
            <>
              <div className="flex items-center justify-between pb-4 border-b border-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-govAccent/20 flex items-center justify-center text-govAccent border border-govAccent/30">
                    <User size={20} />
                  </div>
                  <div>
                    <div className="text-white font-semibold text-sm">{user.name}</div>
                    <div className="text-white/40 text-xs capitalize">{user.role}</div>
                  </div>
                </div>
                <span className={`text-[0.6rem] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider border ${
                  user.role === 'respondent' 
                    ? 'bg-yellow-500/15 text-yellow-300 border-yellow-500/30' 
                    : 'bg-green-500/15 text-green-400 border-green-500/30'
                }`}>
                  {user.role === 'respondent' ? 'Staff' : 'Citizen'}
                </span>
              </div>
              
              <Link
                to={user.role === 'respondent' ? '/respondent-dashboard' : '/customer-dashboard'}
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-white/80 no-underline text-base font-medium p-3 rounded-xl bg-white/5 hover:bg-white/10 flex items-center gap-3 transition-colors"
              >
                <LayoutDashboard size={20} />
                Dashboard
              </Link>

              <button
                onClick={logout}
                className="w-full bg-red-600/10 text-red-400 border border-red-500/20 p-3 rounded-xl text-base font-semibold cursor-pointer flex items-center gap-3"
              >
                <LogOut size={20} />
                Logout
              </button>
            </>
          ) : (
            <Link 
              to="/" 
              onClick={() => setMobileMenuOpen(false)}
              className="w-full bg-[#2979d0] hover:bg-[#1b4d89] text-white p-3 rounded-xl font-bold text-center no-underline transition-colors shadow-lg shadow-blue-900/20"
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
