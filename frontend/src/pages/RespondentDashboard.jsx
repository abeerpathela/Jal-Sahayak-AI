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
    <div className="min-h-screen bg-[#060f1e] flex flex-col font-sans">
      <Navbar />

      <div className="max-w-[80rem] mx-auto w-full px-5 py-8 sm:py-10">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-black text-slate-50 tracking-tight">Respondent Dashboard</h1>
          <p className="text-sm text-slate-500 mt-1.5">
            Water Dept. Staff Portal — <strong className="text-slate-300">{user?.email}</strong>
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map(stat => (
            <div
              key={stat.label}
              onClick={() => setActiveTab(stat.key)}
              className={`p-5 rounded-2xl border cursor-pointer transition-all flex items-center gap-4 ${
                activeTab === stat.key 
                  ? 'bg-white/10 border-blue-400 translate-y-[-2px] shadow-lg shadow-blue-500/10' 
                  : 'bg-white/[0.03] border-white/10 hover:border-white/20'
              }`}
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${
                activeTab === stat.key ? 'bg-blue-500/20 border-blue-500/30 text-blue-400' : 'bg-white/5 border-white/10 text-slate-400'
              }`}>
                {stat.icon}
              </div>
              <div>
                <div className={`text-2xl font-black leading-none ${activeTab === stat.key ? 'text-blue-400' : 'text-slate-200'}`}>{stat.count}</div>
                <div className="text-[0.65rem] font-bold text-slate-500 uppercase mt-1 tracking-wider">{stat.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 mb-8">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Complaint ID (e.g. JSA-XXXXX)"
              className="w-full pl-11 pr-4 py-3.5 bg-white rounded-xl border border-slate-200 text-sm outline-none focus:border-govAccent transition-colors"
            />
          </div>
          <div className="flex gap-2">
            <button 
              type="submit" 
              disabled={searching}
              className="flex-1 sm:flex-none bg-govDark text-white border-none px-8 py-3.5 rounded-xl font-bold text-sm cursor-pointer shadow-lg shadow-govDark/20 transition-all hover:bg-govBlue active:translate-y-0 disabled:opacity-70"
            >
              {searching ? '...' : 'Search'}
            </button>
            {searchResult && (
              <button 
                onClick={() => setSearchResult(null)} 
                className="bg-white border border-slate-200 px-6 py-3.5 rounded-xl font-bold text-slate-500 text-sm cursor-pointer hover:bg-slate-50 transition-colors"
              >
                Clear
              </button>
            )}
          </div>
        </form>

        {/* Search Result Display */}
        {searchResult && (
          <div className="mb-10 p-5 sm:p-6 bg-amber-50 rounded-2xl border border-amber-200">
            <div className="flex items-center gap-2 mb-4">
              <Filter size={16} className="text-amber-700" />
              <p className="text-[0.65rem] font-black text-amber-800 uppercase tracking-widest">SEARCH RESULT</p>
            </div>
            <div className="max-w-md">
              <ComplaintCard complaint={searchResult} isRespondent />
            </div>
          </div>
        )}

        {/* Tab List */}
        {!searchResult && (
          <>
            <div className="flex gap-6 border-b border-white/10 mb-6 overflow-x-auto no-scrollbar">
              {['all', 'active', 'high', 'resolved'].map(t => (
                <button
                  key={t}
                  onClick={() => setActiveTab(t)}
                  className={`py-3 px-1 text-[0.7rem] font-black uppercase tracking-[.15em] border-none bg-transparent cursor-pointer transition-all whitespace-nowrap relative ${
                    activeTab === t ? 'text-blue-400' : 'text-slate-500'
                  }`}
                >
                  {t === 'high' ? '🔴 High Priority' : t === 'active' ? 'Active' : t === 'resolved' ? 'Resolved' : 'All'}
                  {activeTab === t && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-govAccent" />
                  )}
                </button>
              ))}
            </div>

            {loading ? (
              <div className="flex justify-center py-20">
                <div className="spinner" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-20 px-6 bg-white/[0.02] rounded-2xl border border-dashed border-white/10">
                <Inbox size={48} className="text-slate-700 mb-4 mx-auto" />
                <h3 className="text-slate-500 font-bold">No complaints found</h3>
                <p className="text-slate-600 text-sm mt-2">Everything looks clear here!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
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
