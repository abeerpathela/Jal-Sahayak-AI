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
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#f3f4f6' }}>
      <Navbar />

      <div style={{ maxWidth: '64rem', margin: '0 auto', width: '100%', flex: 1, padding: '1.5rem 1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        
        {/* Sub Header / Breadcrumb */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button 
            onClick={() => navigate(user.role === 'respondent' ? '/respondent-dashboard' : '/customer-dashboard')}
            style={{ 
              display: 'flex', alignItems: 'center', gap: '0.4rem', border: 'none', background: 'none',
              color: '#1b4d89', fontWeight: 700, cursor: 'pointer', fontSize: '0.85rem'
            }}
          >
            <ChevronLeft size={18} />
            Back to Dashboard
          </button>
          
          {user.role === 'respondent' && complaint.status !== 'RESOLVED' && (
            <button 
              onClick={resolve}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.5rem',
                background: '#16a34a', color: 'white', border: 'none',
                padding: '0.6rem 1rem', borderRadius: '0.625rem', 
                fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(22,163,74,0.25)',
              }}
            >
              <CheckCircle2 size={16} /> Mark Resolved
            </button>
          )}
        </div>

        {/* Info Bar */}
        <div style={{
          background: 'white', borderRadius: '1rem', padding: '1.25rem 1.5rem',
          border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ background: '#eff6ff', padding: '0.75rem', borderRadius: '0.875rem' }}>
              <Shield size={24} color="#1b4d89" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <h1 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#0f2f57' }}>
                  {complaint.complaintNumber}
                </h1>
                <span style={{ 
                  background: complaint.priority === 'HIGH' ? '#fef2f2' : '#fffbeb',
                  color: complaint.priority === 'HIGH' ? '#b91c1c' : '#b45309',
                  fontSize: '0.65rem', fontWeight: 800, padding: '0.2rem 0.5rem', borderRadius: '999px',
                  border: `1px solid ${complaint.priority === 'HIGH' ? '#fca5a5' : '#fcd34d'}`
                }}>
                  {complaint.priority}
                </span>
              </div>
              <p style={{ margin: '0.1rem 0 0', fontSize: '0.825rem', color: '#6b7280' }}>
                {complaint.title}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
            <div style={{ textAlign: 'right' }}>
              <span style={{ display: 'block', fontSize: '0.65rem', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase' }}>Status</span>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#111827' }}>{complaint.status}</span>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span style={{ display: 'block', fontSize: '0.65rem', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase' }}>Created</span>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#111827' }}>{new Date(complaint.createdAt).toLocaleDateString()}</span>
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
