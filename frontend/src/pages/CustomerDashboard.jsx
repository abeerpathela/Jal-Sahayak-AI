import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, RefreshCw, Star, MessageCircle } from 'lucide-react';
import Navbar from '../components/Navbar';
import ComplaintCard from '../components/ComplaintCard';
import api from '../services/api';

const tabStyle = (active) => ({
  padding: '0.625rem 1.25rem',
  fontSize: '0.875rem', fontWeight: 600,
  border: 'none', cursor: 'pointer', background: 'transparent',
  borderBottom: active ? '2px solid #2979d0' : '2px solid transparent',
  color: active ? '#60a5fa' : 'rgba(241,245,249,0.45)',
  transition: 'all 0.15s', whiteSpace: 'nowrap',
});

const CustomerDashboard = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [feedbackModal, setFeedbackModal] = useState(null);
  const [rating, setRating] = useState(0);
  const [feedbackMsg, setFeedbackMsg] = useState('');

  useEffect(() => {
    if (!user) { navigate('/'); return; }
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/complaints/user/${user._id}`);
      setComplaints(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleReopen = async (id) => {
    await api.patch('/complaints/reopen', { complaintId: id });
    fetchComplaints();
  };

  const handleFeedback = async () => {
    await api.patch('/complaints/resolve', { complaintId: feedbackModal, feedback: { rating, message: feedbackMsg } });
    setFeedbackModal(null); setRating(0); setFeedbackMsg('');
    fetchComplaints();
  };

  const tabs = [
    { key: 'all', label: 'All', count: complaints.length },
    { key: 'active', label: 'Active', count: complaints.filter(c => ['OPEN','IN_PROGRESS','REOPENED'].includes(c.status)).length },
    { key: 'resolved', label: 'Resolved', count: complaints.filter(c => c.status === 'RESOLVED').length },
  ];

  const filtered = complaints.filter(c => {
    if (activeTab === 'active') return ['OPEN','IN_PROGRESS','REOPENED'].includes(c.status);
    if (activeTab === 'resolved') return c.status === 'RESOLVED';
    return true;
  });

  return (
    <div style={{ minHeight:'100vh', background:'#060f1e', display:'flex', flexDirection:'column', fontFamily:"'Inter',system-ui,sans-serif" }}>
      <Navbar />
      <div style={{ maxWidth:'80rem', margin:'0 auto', width:'100%', padding:'2rem 1.25rem' }}>
        {/* Header */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'2rem', flexWrap:'wrap', gap:'1rem' }}>
          <div>
            <h1 style={{ margin:0, fontSize:'1.6rem', fontWeight:800, color:'#f1f5f9', letterSpacing:'-0.03em' }}>My Complaints</h1>
            <p style={{ margin:'0.3rem 0 0', color:'rgba(241,245,249,0.45)', fontSize:'0.875rem' }}>
              Welcome, <strong style={{ color:'rgba(241,245,249,0.8)' }}>{user?.name}</strong>
            </p>
          </div>
          <button onClick={() => navigate('/chatbot')} style={{
            display:'flex', alignItems:'center', gap:'0.5rem',
            background:'#2979d0', color:'white', border:'none',
            padding:'0.75rem 1.5rem', borderRadius:'0.75rem', fontWeight:700,
            fontSize:'0.9rem', cursor:'pointer',
            boxShadow:'0 4px 20px rgba(41,121,208,0.35)',
            transition:'background 0.2s, transform 0.2s',
          }}
            onMouseOver={e => { e.currentTarget.style.background='#1b4d89'; e.currentTarget.style.transform='translateY(-1px)'; }}
            onMouseOut={e => { e.currentTarget.style.background='#2979d0'; e.currentTarget.style.transform='translateY(0)'; }}
          >
            <Plus size={18} /> New Complaint
          </button>
        </div>

        {/* Tabs */}
        <div style={{ display:'flex', gap:0, borderBottom:'1px solid rgba(255,255,255,0.07)', marginBottom:'1.5rem', overflowX:'auto' }}>
          {tabs.map(t => (
            <button key={t.key} onClick={() => setActiveTab(t.key)} style={tabStyle(activeTab === t.key)}>
              {t.label}
              {t.count > 0 && (
                <span style={{
                  marginLeft:'0.5rem', padding:'0.1rem 0.5rem', borderRadius:'999px',
                  fontSize:'0.7rem', fontWeight:800,
                  background: activeTab === t.key ? '#2979d0' : 'rgba(255,255,255,0.08)',
                  color: activeTab === t.key ? 'white' : 'rgba(241,245,249,0.4)',
                }}>{t.count}</span>
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <div style={{ display:'flex', justifyContent:'center', padding:'5rem 0' }}>
            <div className="spinner" />
          </div>
        ) : filtered.length === 0 ? (
          <div style={{
            textAlign:'center', padding:'5rem 2rem',
            background:'rgba(255,255,255,0.03)',
            borderRadius:'1rem', border:'1px dashed rgba(255,255,255,0.1)',
          }}>
            <div style={{ fontSize:'3rem', marginBottom:'1rem' }}>💧</div>
            <h3 style={{ color:'#f1f5f9', marginBottom:'0.5rem' }}>No complaints found</h3>
            <p style={{ color:'rgba(241,245,249,0.4)', marginBottom:'1.5rem', fontSize:'0.875rem' }}>
              Start a chat with Jal Sahayak AI to register a complaint
            </p>
            <button onClick={() => navigate('/chatbot')} style={{ background:'#2979d0', color:'white', border:'none', padding:'0.75rem 1.5rem', borderRadius:'0.625rem', fontWeight:700, cursor:'pointer' }}>
              Chat with AI
            </button>
          </div>
        ) : (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(280px, 1fr))', gap:'1.25rem' }}>
            {filtered.map(c => (
              <div key={c._id} style={{ display:'flex', flexDirection:'column', gap:'0.5rem' }}>
                <ComplaintCard complaint={c} />
                <div style={{ display:'flex', gap:'0.5rem' }}>
                  <button onClick={() => navigate(`/complaint/${c._id}`)} style={{
                    flex:1, display:'flex', alignItems:'center', justifyContent:'center', gap:'0.4rem',
                    border:'1.5px solid #1b4d89', color:'#1b4d89', background:'white',
                    padding:'0.5rem', borderRadius:'0.5rem', fontSize:'0.78rem', fontWeight:700, cursor:'pointer',
                  }}>
                    <MessageCircle size={13} /> Chat
                  </button>
                  {c.status === 'RESOLVED' && !c.feedback?.rating && (
                    <button onClick={() => setFeedbackModal(c._id)} style={{
                      flex:1, display:'flex', alignItems:'center', justifyContent:'center', gap:'0.4rem',
                      border:'1.5px solid #f59e0b', color:'#b45309', background:'white',
                      padding:'0.5rem', borderRadius:'0.5rem', fontSize:'0.78rem', fontWeight:700, cursor:'pointer',
                    }}>
                      <Star size={13} /> Feedback
                    </button>
                  )}
                  {c.status === 'RESOLVED' && (
                    <button onClick={() => handleReopen(c._id)} style={{
                      flex:1, display:'flex', alignItems:'center', justifyContent:'center', gap:'0.4rem',
                      border:'1.5px solid #f97316', color:'#c2410c', background:'white',
                      padding:'0.5rem', borderRadius:'0.5rem', fontSize:'0.78rem', fontWeight:700, cursor:'pointer',
                    }}>
                      <RefreshCw size={13} /> Reopen
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Feedback Modal */}
      {feedbackModal && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.55)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000, padding:'1rem' }}>
          <div style={{ background:'white', borderRadius:'1.25rem', padding:'2rem', maxWidth:'28rem', width:'100%', boxShadow:'0 20px 60px rgba(0,0,0,0.3)' }}>
            <h2 style={{ margin:'0 0 0.3rem', fontSize:'1.25rem', fontWeight:800, color:'#0f2f57' }}>Rate Your Experience</h2>
            <p style={{ margin:'0 0 1.5rem', color:'#6b7280', fontSize:'0.85rem' }}>How was our water department's service?</p>
            <div style={{ display:'flex', justifyContent:'center', gap:'0.75rem', marginBottom:'1.5rem' }}>
              {[1,2,3,4,5].map(s => (
                <button key={s} onClick={() => setRating(s)} style={{
                  background:'none', border:'none', cursor:'pointer', fontSize:'2.25rem',
                  filter: s <= rating ? 'none' : 'grayscale(1) opacity(0.3)',
                  transition:'transform 0.1s', transform: s <= rating ? 'scale(1.15)' : 'scale(1)',
                }}>⭐</button>
              ))}
            </div>
            <textarea value={feedbackMsg} onChange={e => setFeedbackMsg(e.target.value)}
              placeholder="Share your comments (optional)"
              rows={3} style={{
                width:'100%', boxSizing:'border-box', padding:'0.75rem',
                border:'1.5px solid #e5e7eb', borderRadius:'0.5rem', resize:'vertical',
                fontSize:'0.875rem', marginBottom:'1rem', outline:'none',
              }}
            />
            <div style={{ display:'flex', gap:'0.75rem' }}>
              <button onClick={() => { setFeedbackModal(null); setRating(0); }} style={{
                flex:1, padding:'0.75rem', border:'1.5px solid #e5e7eb', borderRadius:'0.625rem',
                background:'white', cursor:'pointer', fontWeight:600, color:'#6b7280',
              }}>Cancel</button>
              <button onClick={handleFeedback} disabled={!rating} style={{
                flex:1, padding:'0.75rem', background: rating ? '#1b4d89' : '#9ca3af',
                color:'white', border:'none', borderRadius:'0.625rem', fontWeight:700, cursor: rating ? 'pointer' : 'not-allowed',
              }}>Submit</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerDashboard;
