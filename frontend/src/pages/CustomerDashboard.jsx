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
    <div className="min-h-screen bg-[#060f1e] flex flex-col font-sans">
      <Navbar />
      <div className="max-w-[80rem] mx-auto w-full px-5 py-8 sm:py-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start mb-8 gap-6 sm:gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-50 tracking-tight">My Complaints</h1>
            <p className="text-sm text-slate-500 mt-1.5">
              Welcome, <strong className="text-slate-300">{user?.name}</strong>
            </p>
          </div>
          <button 
            onClick={() => navigate('/chatbot')} 
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-govAccent hover:bg-govDark text-white border-none py-3 px-6 rounded-xl font-bold text-sm cursor-pointer shadow-lg shadow-govAccent/20 transition-all hover:-translate-y-0.5"
          >
            <Plus size={18} /> New Complaint
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-0 border-b border-white/10 mb-6 overflow-x-auto no-scrollbar scroll-smooth">
          {tabs.map(t => (
            <button 
              key={t.key} 
              onClick={() => setActiveTab(t.key)} 
              className={`px-5 py-3 text-sm font-bold border-none cursor-pointer bg-transparent transition-all whitespace-nowrap relative ${
                activeTab === t.key ? 'text-blue-400' : 'text-slate-500'
              }`}
            >
              {t.label}
              {t.count > 0 && (
                <span className={`ml-2 px-1.5 py-0.5 rounded-full text-[0.65rem] font-black ${
                  activeTab === t.key ? 'bg-govAccent text-white' : 'bg-white/10 text-slate-500'
                }`}>{t.count}</span>
              )}
              {activeTab === t.key && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-govAccent" />
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="spinner" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 px-6 bg-white/[0.02] rounded-2xl border border-dashed border-white/10">
            <div className="text-5xl mb-4">💧</div>
            <h3 className="text-slate-50 font-bold mb-2">No complaints found</h3>
            <p className="text-slate-500 text-sm mb-6 max-w-xs mx-auto">
              Start a chat with Jal Sahayak AI to register a complaint
            </p>
            <button 
              onClick={() => navigate('/chatbot')} 
              className="bg-govAccent text-white border-none py-3 px-6 rounded-xl font-bold text-sm cursor-pointer"
            >
              Chat with AI
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filtered.map(c => (
              <div key={c._id} className="flex flex-col gap-2 group">
                <ComplaintCard complaint={c} />
                <div className="flex gap-2">
                  <button 
                    onClick={() => navigate(`/complaint/${c._id}`)} 
                    className="flex-1 flex items-center justify-center gap-2 border-1.5 border-govDark text-govDark bg-white py-2.5 rounded-lg text-xs font-bold cursor-pointer transition-colors hover:bg-slate-50"
                  >
                    <MessageCircle size={14} /> Chat
                  </button>
                  {c.status === 'RESOLVED' && !c.feedback?.rating && (
                    <button 
                      onClick={() => setFeedbackModal(c._id)} 
                      className="flex-1 flex items-center justify-center gap-2 border-1.5 border-amber-500 text-amber-700 bg-white py-2.5 rounded-lg text-xs font-bold cursor-pointer transition-colors hover:bg-slate-50"
                    >
                      <Star size={14} /> Feedback
                    </button>
                  )}
                  {c.status === 'RESOLVED' && (
                    <button 
                      onClick={() => handleReopen(c._id)} 
                      className="flex-1 flex items-center justify-center gap-2 border-1.5 border-orange-500 text-orange-700 bg-white py-2.5 rounded-lg text-xs font-bold cursor-pointer transition-colors hover:bg-slate-50"
                    >
                      <RefreshCw size={14} /> Reopen
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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[1000] p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-2xl animate-heroFadeUp">
            <h2 className="text-xl sm:text-2xl font-black text-govDark mb-1">Rate Experience</h2>
            <p className="text-slate-500 text-sm mb-6">How was our water department's service?</p>
            
            <div className="flex justify-center gap-3 mb-8">
              {[1,2,3,4,5].map(s => (
                <button 
                  key={s} 
                  onClick={() => setRating(s)} 
                  className={`text-4xl bg-transparent border-none cursor-pointer transition-all ${
                    s <= rating ? 'scale-110 grayscale-0' : 'scale-100 grayscale opacity-30 shadow-none'
                  }`}
                >⭐</button>
              ))}
            </div>

            <textarea 
              value={feedbackMsg} 
              onChange={e => setFeedbackMsg(e.target.value)}
              placeholder="Share your comments (optional)"
              rows={3} 
              className="w-full box-border px-4 py-3 border border-slate-200 rounded-xl resize-none text-sm mb-6 outline-none focus:border-govAccent transition-colors"
            />

            <div className="flex gap-4">
              <button 
                onClick={() => { setFeedbackModal(null); setRating(0); }} 
                className="flex-1 py-3 border border-slate-200 rounded-xl bg-white text-slate-500 font-bold text-sm cursor-pointer hover:bg-slate-50 transition-colors"
              >Cancel</button>
              <button 
                onClick={handleFeedback} 
                disabled={!rating} 
                className={`flex-1 py-3 rounded-xl text-white font-bold text-sm cursor-pointer transition-all ${
                  rating ? 'bg-govDark shadow-lg shadow-govDark/20' : 'bg-slate-300 cursor-not-allowed'
                }`}
              >Submit</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerDashboard;
