import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, RefreshCw, AlertCircle, CheckCircle2, Clock, Inbox, Filter } from 'lucide-react';
import Navbar from '../components/Navbar';
import ComplaintCard from '../components/ComplaintCard';
import api from '../services/api';

const RespondentDashboard = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    if (!user || user.role !== 'respondent') { navigate('/'); return; }
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/complaints/respondent');
      setComplaints(data);
    } catch (error) {
      console.error('Error fetching complaints:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setSearching(true);
    setSearchResult(null);
    try {
      const { data } = await api.get(`/complaints/search/${searchQuery.toUpperCase()}`);
      setSearchResult(data);
    } catch (error) {
      alert('Complaint not found. Check the number and try again.');
    } finally {
      setSearching(false);
    }
  };

  const filtered = complaints.filter(c => {
    if (activeTab === 'active') return ['OPEN', 'IN_PROGRESS', 'REOPENED'].includes(c.status);
    if (activeTab === 'resolved') return c.status === 'RESOLVED';
    if (activeTab === 'high') return c.priority === 'HIGH';
    return true;
  });

  const stats = [
    { label: 'Total', count: complaints.length, icon: <Inbox size={20} />, bg: 'rgba(59,130,246,0.12)', color: '#60a5fa', border: 'rgba(59,130,246,0.25)', key: 'all' },
    { label: 'Active', count: complaints.filter(c => ['OPEN','IN_PROGRESS','REOPENED'].includes(c.status)).length, icon: <Clock size={20} />, bg: 'rgba(139,92,246,0.12)', color: '#c4b5fd', border: 'rgba(139,92,246,0.25)', key: 'active' },
    { label: 'High Priority', count: complaints.filter(c => c.priority === 'HIGH').length, icon: <AlertCircle size={20} />, bg: 'rgba(239,68,68,0.12)', color: '#fca5a5', border: 'rgba(239,68,68,0.25)', key: 'high' },
    { label: 'Resolved', count: complaints.filter(c => c.status === 'RESOLVED').length, icon: <CheckCircle2 size={20} />, bg: 'rgba(34,197,94,0.12)', color: '#4ade80', border: 'rgba(34,197,94,0.25)', key: 'resolved' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#060f1e', display: 'flex', flexDirection: 'column', fontFamily: "'Inter',system-ui,sans-serif" }}>
      <Navbar />

      <div style={{ maxWidth: '80rem', margin: '0 auto', width: '100%', padding: '2rem 1.25rem' }}>
        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ margin: 0, fontSize: '1.6rem', fontWeight: 800, color: '#f1f5f9', letterSpacing: '-0.03em' }}>Respondent Dashboard</h1>
          <p style={{ margin: '0.3rem 0 0', color: 'rgba(241,245,249,0.45)', fontSize: '0.85rem' }}>
            Water Dept. Staff Portal — <strong style={{ color: 'rgba(241,245,249,0.7)' }}>{user?.email}</strong>
          </p>
        </div>

        {/* Stats Grid */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem', marginBottom: '2rem',
        }}>
          {stats.map(stat => (
            <div
              key={stat.label}
              onClick={() => setActiveTab(stat.key)}
              style={{
                background: stat.bg,
                border: `1px solid ${activeTab === stat.key ? stat.color : stat.border}`,
                borderRadius: '1rem', padding: '1.25rem',
                cursor: 'pointer', transition: 'all 0.18s',
                display: 'flex', alignItems: 'center', gap: '1rem',
                boxShadow: activeTab === stat.key ? `0 4px 20px ${stat.bg}` : 'none',
                transform: activeTab === stat.key ? 'translateY(-2px)' : 'translateY(0)',
              }}
            >
              <div style={{
                width: '3.5rem', height: '3.5rem',
                background: `${stat.color}22`,
                border: `1px solid ${stat.border}`,
                color: stat.color, borderRadius: '0.75rem',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {stat.icon}
              </div>
              <div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: stat.color, lineHeight: 1 }}>{stat.count}</div>
                <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'rgba(241,245,249,0.4)', textTransform: 'uppercase', marginTop: '0.2rem', letterSpacing: '0.04em' }}>{stat.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.75rem', marginBottom: '2rem' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search by Complaint ID (e.g. JSA-XXXXX)"
              style={{
                width: '100%', padding: '0.875rem 1rem 0.875rem 3rem',
                borderRadius: '0.875rem', border: '1.5px solid #e5e7eb',
                fontSize: '0.9rem', outline: 'none', background: 'white',
                boxSizing: 'border-box',
              }}
            />
          </div>
          <button type="submit" disabled={searching} style={{
            background: '#1b4d89', color: 'white', border: 'none',
            padding: '0 1.5rem', borderRadius: '0.875rem', fontWeight: 700,
            fontSize: '0.9rem', cursor: 'pointer', opacity: searching ? 0.7 : 1,
            whiteSpace: 'nowrap',
          }}>
            {searching ? '...' : 'Search'}
          </button>
          {searchResult && (
            <button onClick={() => setSearchResult(null)} style={{ background: 'white', border: '1.5px solid #e5e7eb', padding: '0 1rem', borderRadius: '0.875rem', fontWeight: 600, color: '#6b7280', cursor: 'pointer' }}>
              Clear
            </button>
          )}
        </form>

        {/* Search Result Display */}
        {searchResult && (
          <div style={{ marginBottom: '2.5rem', padding: '1.5rem', background: '#fffbeb', borderRadius: '1.25rem', border: '1px solid #fde68a' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <Filter size={16} color="#b45309" />
              <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: 700, color: '#b45309' }}>SEARCH RESULT</p>
            </div>
            <div style={{ maxWidth: '24rem' }}>
              <ComplaintCard complaint={searchResult} isRespondent />
            </div>
          </div>
        )}

        {/* Tab List */}
        {!searchResult && (
          <>
            <div style={{ display: 'flex', gap: '1.5rem', borderBottom: '2px solid #e5e7eb', marginBottom: '1.5rem', overflowX: 'auto' }}>
              {['all', 'active', 'high', 'resolved'].map(t => (
                <button
                  key={t}
                  onClick={() => setActiveTab(t)}
                  style={{
                    padding: '0.75rem 0.25rem', fontSize: '0.875rem', fontWeight: 700,
                    border: 'none', background: 'transparent', cursor: 'pointer',
                    color: activeTab === t ? '#1b4d89' : '#9ca3af',
                    borderBottom: activeTab === t ? '3px solid #1b4d89' : '3px solid transparent',
                    textTransform: 'uppercase', letterSpacing: '0.05em',
                    transition: 'all 0.1s', whiteSpace: 'nowrap',
                  }}
                >
                  {t === 'high' ? '🔴 High Priority' : t === 'active' ? 'Active' : t === 'resolved' ? 'Resolved' : 'All Complaints'}
                </button>
              ))}
            </div>

            {loading ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '5rem 0' }}>
                <div className="spinner" />
              </div>
            ) : filtered.length === 0 ? (
              <div style={{
                textAlign: 'center', padding: '6rem 2rem', background: 'white',
                borderRadius: '1.25rem', border: '2px dashed #e5e7eb',
              }}>
                <Inbox size={48} color="#cbd5e1" style={{ marginBottom: '1rem' }} />
                <h3 style={{ margin: 0, color: '#64748b' }}>No complaints in this category</h3>
                <p style={{ color: '#94a3b8', fontSize: '0.8rem', marginTop: '0.5rem' }}>Great job! Nothing needs your immediate attention here.</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
                {filtered.map(c => (
                  <ComplaintCard key={c._id} complaint={c} isRespondent />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default RespondentDashboard;
