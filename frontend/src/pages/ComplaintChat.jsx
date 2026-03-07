import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import { ChevronLeft, Shield, Info, MoreVertical, CheckCircle2 } from 'lucide-react';
import Navbar from '../components/Navbar';
import ChatWindow from '../components/ChatWindow';
import api from '../services/api';

const ComplaintChat = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));
  const [complaint, setComplaint] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const socketRef = useRef();

  useEffect(() => {
    if (!user) { navigate('/'); return; }
    fetchComplaint();

    socketRef.current = io(import.meta.env.VITE_API_URL || 'http://localhost:5000');
    socketRef.current.emit('join_room', id);

    // Only add messages from OTHER users (not our own, since we add optimistically)
    socketRef.current.on('receive_message', (msg) => {
      if (msg.sender !== user.role) {
        setMessages((prev) => [...prev, msg]);
      }
    });

    socketRef.current.on('ai_typing', (typing) => {
      setIsTyping(typing);
    });

    return () => socketRef.current.disconnect();
  }, [id]);

  const fetchComplaint = async () => {
    try {
      const { data } = await api.get(`/complaints/${id}`);
      setComplaint(data);
      // Build messages — if there's an attached image, inject it as a visual bubble
      const msgs = [...data.chatHistory];
      if (data.imageUrl) {
        // Insert image bubble right after the first customer message
        const firstCustomerIdx = msgs.findIndex(m => m.sender === 'customer');
        const imageMsg = {
          sender: 'customer',
          imageUrl: data.imageUrl,
          message: '',
          timestamp: data.createdAt,
          _isImageBubble: true,
        };
        if (firstCustomerIdx >= 0) {
          msgs.splice(firstCustomerIdx + 1, 0, imageMsg);
        } else {
          msgs.unshift(imageMsg);
        }
      }
      setMessages(msgs);
    } catch (error) {
      console.error(error);
    }
  };

  const sendMessage = async (text) => {
    const msgData = {
      complaintId: id,
      sender: user.role,
      message: text,
      timestamp: new Date(),
    };

    // 1. Optimistically add to local state immediately
    setMessages((prev) => [...prev, msgData]);

    // 2. Persist to database
    try {
      await api.post('/chat/message', { complaintId: id, message: text, sender: user.role });
    } catch (err) {
      console.error('Failed to save message:', err);
    }

    // 3. Broadcast to OTHER clients in the room via socket
    socketRef.current.emit('send_message', msgData);
  };

  const resolve = async () => {
    if (window.confirm('Mark this complaint as resolved?')) {
      await api.patch('/complaints/resolve', { complaintId: id });
      fetchComplaint();
    }
  };

  if (!complaint) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#f3f4f6' }}>
      <div className="spinner" />
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans">
      <Navbar />

      <div className="max-w-[64rem] mx-auto w-full flex-1 px-5 py-8 sm:py-10 flex flex-col gap-6">
        
        {/* Sub Header / Breadcrumb */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <button 
            onClick={() => navigate(user.role === 'respondent' ? '/respondent-dashboard' : '/customer-dashboard')}
            className="flex items-center gap-2 bg-transparent border-none text-govDark font-black text-[0.75rem] uppercase tracking-widest cursor-pointer group"
          >
            <ChevronLeft size={18} className="transition-transform group-hover:-translate-x-1" />
            Back to Dashboard
          </button>
          
          {user.role === 'respondent' && complaint.status !== 'RESOLVED' && (
            <button 
              onClick={resolve}
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white border-none py-3 px-6 rounded-xl font-bold text-sm cursor-pointer shadow-lg shadow-emerald-500/20 transition-all"
            >
              <CheckCircle2 size={16} /> Mark Resolved
            </button>
          )}
        </div>

        {/* Info Bar */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
          <div className="flex items-center gap-5">
            <div className="bg-blue-50 p-3.5 rounded-2xl border border-blue-100 hidden sm:block">
              <Shield size={28} className="text-govDark" />
            </div>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-xl sm:text-2xl font-black text-govDark tracking-tight">
                  {complaint.complaintNumber}
                </h1>
                <span className={`text-[0.65rem] font-black px-2 py-0.5 rounded-full uppercase tracking-widest border ${
                  complaint.priority === 'HIGH' 
                    ? 'bg-red-50 text-red-700 border-red-100' 
                    : 'bg-amber-50 text-amber-700 border-amber-100'
                }`}>
                  {complaint.priority}
                </span>
              </div>
              <p className="text-sm text-slate-500 font-medium">
                {complaint.title}
              </p>
            </div>
          </div>

          <div className="flex gap-10 items-center w-full lg:w-auto border-t lg:border-t-0 pt-6 lg:pt-0 border-slate-100">
            <div className="flex-1 lg:flex-none">
              <span className="block text-[0.6rem] font-black text-slate-400 uppercase tracking-widest mb-1">Status</span>
              <span className="text-sm font-bold text-slate-900">{complaint.status}</span>
            </div>
            <div className="flex-1 lg:flex-none">
              <span className="block text-[0.6rem] font-black text-slate-400 uppercase tracking-widest mb-1">Created</span>
              <span className="text-sm font-bold text-slate-900">{new Date(complaint.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>


        {/* Chat Component */}
        <ChatWindow 
          messages={messages} 
          onSendMessage={sendMessage} 
          isTyping={isTyping} 
          userRole={user.role}
          complaintId={id}
        />

        {/* Detailed Info (Staff only) */}
        {user.role === 'respondent' && (
          <div style={{
            background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '1rem',
            padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem'
          }}>
             <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#60a5fa' }}>
               <Info size={18} />
               <span style={{ fontWeight: 800, fontSize: '0.85rem' }}>Complaint Intelligence</span>
             </div>
             
             <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <div>
                  <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'rgba(241,245,249,0.4)', textTransform: 'uppercase' }}>Category</span>
                  <p style={{ margin: '0.2rem 0 0', fontWeight: 600, color: '#f1f5f9' }}>{complaint.category}</p>
                </div>
                <div>
                  <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'rgba(241,245,249,0.4)', textTransform: 'uppercase' }}>Citizen Info</span>
                  <p style={{ margin: '0.2rem 0 0', fontWeight: 600, color: '#f1f5f9' }}>{complaint.customerId?.name || 'Unknown'}</p>
                </div>
                {complaint.address && (
                  <div style={{ gridColumn: 'span 2' }}>
                    <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'rgba(241,245,249,0.4)', textTransform: 'uppercase' }}>Address</span>
                    <p style={{ margin: '0.2rem 0 0', fontWeight: 600, color: '#f1f5f9' }}>{complaint.address}</p>
                  </div>
                )}
                {complaint.location?.coordinates && (
                  <div style={{ gridColumn: 'span 2' }}>
                    <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'rgba(241,245,249,0.4)', textTransform: 'uppercase' }}>Captured Location</span>
                    <p style={{ margin: '0.2rem 0 0' }}>
                      <a 
                        href={`https://www.google.com/maps?q=${complaint.location.coordinates[1]},${complaint.location.coordinates[0]}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        style={{ color: '#60a5fa', fontWeight: 700, textDecoration: 'none', fontSize: '0.85rem' }}
                      >
                        📍 Open in Google Maps
                      </a>
                    </p>
                  </div>
                )}
                {/* ── Attached Image ──────────────────────────── */}
                {complaint.imageUrl && (
                  <div style={{ gridColumn: 'span 2' }}>
                    <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'rgba(241,245,249,0.4)', textTransform: 'uppercase', display: 'block', marginBottom: '0.5rem' }}>
                      Attached Evidence
                    </span>
                    <a href={complaint.imageUrl} target="_blank" rel="noopener noreferrer">
                      <img
                        src={complaint.imageUrl}
                        alt="Complaint evidence"
                        style={{
                          width: '100%', maxHeight: '280px',
                          objectFit: 'cover', borderRadius: '0.625rem',
                          border: '1px solid rgba(255,255,255,0.1)',
                          cursor: 'pointer',
                          transition: 'opacity 0.2s',
                        }}
                        onMouseOver={e => e.currentTarget.style.opacity = '0.85'}
                        onMouseOut={e => e.currentTarget.style.opacity = '1'}
                      />
                    </a>
                    <p style={{ margin: '0.4rem 0 0', fontSize: '0.7rem', color: 'rgba(241,245,249,0.35)' }}>
                      Click image to open full size
                    </p>
                  </div>
                )}
             </div>
             
             {complaint.aiSummary && (
               <div style={{ background: 'rgba(41,121,208,0.08)', padding: '1rem', borderRadius: '0.75rem', border: '1px solid rgba(41,121,208,0.2)' }}>
                 <p style={{ margin: 0, fontSize: '0.8rem', color: '#93c5fd', lineHeight: 1.6, fontStyle: 'italic' }}>
                   <strong>AI Digest:</strong> {complaint.aiSummary}
                 </p>
               </div>
             )}
          </div>
        )}

      </div>
    </div>
  );
};

export default ComplaintChat;
