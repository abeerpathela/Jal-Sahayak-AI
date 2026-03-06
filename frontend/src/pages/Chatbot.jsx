import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, ImagePlus, X, CheckCircle, PhoneCall } from 'lucide-react';
import Navbar from '../components/Navbar';
import ChatWindow from '../components/ChatWindow';
import api from '../services/api';

const Chatbot = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));
  const [messages, setMessages] = useState([{
    sender: 'ai',
    message: `Namaste ${user?.name || 'Citizen'}! 🙏 I am Jal Sahayak AI, your water service assistant.\n\nI can help you with:\n• Water supply schedule & outages\n• Water quality issues\n• Jal Jeevan Mission & govt schemes\n• Billing inquiries\n• Complaint tracking\n\nWhat can I help you with today?`,
    timestamp: new Date(),
  }]);
  const [isTyping, setIsTyping] = useState(false);
  const [showEscalate, setShowEscalate] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null); // actual File object
  const [submitting, setSubmitting] = useState(false);
  const [created, setCreated] = useState(null);
  const [address, setAddress] = useState('');
  const [location, setLocation] = useState(null);
  const [locationStatus, setLocationStatus] = useState(''); // '', 'fetching', 'captured', 'denied', 'failed'

  // Fetch location when modal opens
  React.useEffect(() => {
    if (showForm) {
      // Reset location state each time form opens
      setLocation(null);
      setAddress('');
      setLocationStatus('fetching');

      if (!navigator.geolocation) {
        setLocationStatus('failed');
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const { longitude, latitude } = pos.coords;
          setLocation({ type: 'Point', coordinates: [longitude, latitude] });

          // Reverse Geocoding to auto-fill address (street-level specific)
          try {
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`);
            const data = await res.json();
            if (data && data.address) {
              const a = data.address;
              const parts = [
                a.road,
                a.neighbourhood || a.suburb || a.quarter,
                a.village || a.town || a.city,
                a.state_district,
                a.state,
                a.postcode,
              ].filter(Boolean);
              setAddress(parts.join(', '));
            }
          } catch (err) {
            console.warn('Reverse geocoding failed:', err);
          }
          setLocationStatus('captured');
        },
        (err) => {
          console.warn('Location error:', err.message);
          if (err.code === 1) {
            setLocationStatus('denied');
          } else {
            setLocationStatus('failed');
          }
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
      );
    }
  }, [showForm]);

  const handleSend = async (text) => {
    setMessages(p => [...p, { sender: 'customer', message: text, timestamp: new Date() }]);
    setIsTyping(true);
    try {
      const { data } = await api.post('/chat/ai', { message: text });
      setMessages(p => [...p, { sender: 'ai', message: data.message, timestamp: new Date() }]);
      const triggers = ['complaint', 'urgent', 'not solved', 'escalate', 'contact', 'frustrated', 'no water', 'days'];
      if (triggers.some(k => text.toLowerCase().includes(k))) setShowEscalate(true);
    } catch {
      setMessages(p => [...p, { sender: 'ai', message: "I'm temporarily unavailable. Please click 'Contact Support' to speak with our team.", timestamp: new Date() }]);
      setShowEscalate(true);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    setSubmitting(true);
    try {
      // 1. Upload image to Cloudinary first (if selected)
      let imageUrl = null;
      if (imageFile) {
        const formData = new FormData();
        formData.append('image', imageFile);
        try {
          const uploadRes = await api.post('/upload/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });
          imageUrl = uploadRes.data.imageUrl;
        } catch (uploadErr) {
          console.warn('Image upload failed, continuing without image:', uploadErr);
          // Don't block complaint creation if image upload fails
        }
      }

      // 2. Create the complaint with the Cloudinary URL (or null)
      const desc = messages.filter(m => m.sender === 'customer').map(m => m.message).join('. ') || title;
      const { data } = await api.post('/complaints/create', {
        title,
        description: desc,
        imageUrl,
        address,
        location
      });
      setCreated(data);
      setShowForm(false);
      setMessages(p => [...p, {
        sender: 'ai',
        message: `✅ Complaint registered!\n\n📋 Number: ${data.complaintNumber}\n🏷️ Category: ${data.category}\n🚨 Priority: ${data.priority}\n\nA department officer will join this chat shortly. You can track it from your Dashboard.`,
        timestamp: new Date(),
      }]);
    } catch (err) {
      console.error('Complaint creation error:', err);
      alert('Failed to create complaint. Please ensure you are logged in and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ minHeight:'100vh', background:'#060f1e', display:'flex', flexDirection:'column', fontFamily:"'Inter',system-ui,sans-serif" }}>
      <Navbar />
      <div style={{ maxWidth:'56rem', margin:'0 auto', width:'100%', padding:'2rem 1.25rem', display:'flex', flexDirection:'column', gap:'1rem' }}>
        {/* Header card */}
        <div style={{ background:'rgba(255,255,255,0.04)', borderRadius:'0.875rem', padding:'1.25rem 1.5rem', border:'1px solid rgba(255,255,255,0.08)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <div>
            <h1 style={{ margin:0, fontSize:'1.1rem', fontWeight:800, color:'#f1f5f9', letterSpacing:'-0.02em' }}>Jal Sahayak AI Assistant</h1>
            <p style={{ margin:'0.2rem 0 0', fontSize:'0.8rem', color:'rgba(241,245,249,0.4)' }}>Ask me anything about Jal Shakti water services</p>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:'0.5rem', background:'rgba(34,197,94,0.1)', padding:'0.4rem 0.875rem', borderRadius:'999px', border:'1px solid rgba(34,197,94,0.25)' }}>
            <div style={{ width:'8px', height:'8px', background:'#22c55e', borderRadius:'50%', boxShadow:'0 0 6px #22c55e' }} />
            <span style={{ fontSize:'0.75rem', fontWeight:700, color:'#4ade80' }}>AI Online</span>
          </div>
        </div>

        <ChatWindow messages={messages} onSendMessage={handleSend} isTyping={isTyping} userRole="customer" />

        {/* Escalation banner */}
        {!created && (
          <div style={{
            background: showEscalate ? 'rgba(245,158,11,0.08)' : 'rgba(255,255,255,0.04)',
            border: `1px solid ${showEscalate ? 'rgba(245,158,11,0.3)' : 'rgba(255,255,255,0.08)'}`,
            borderRadius:'0.875rem', padding:'1rem 1.25rem',
            display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:'0.75rem',
            transition:'all 0.3s',
          }}>
            <div style={{ display:'flex', alignItems:'flex-start', gap:'0.75rem', flex:1 }}>
              <AlertTriangle size={20} color="#fbbf24" style={{ flexShrink:0, marginTop:'0.1rem' }} />
              <p style={{ margin:0, fontSize:'0.85rem', color:'rgba(241,245,249,0.65)', lineHeight:1.5 }}>
                {showEscalate
                  ? "It looks like you need further assistance. Register a formal complaint to speak with a department officer."
                  : "If AI couldn't resolve your issue, you can directly contact a water department officer."}
              </p>
            </div>
            <button onClick={() => setShowForm(true)} style={{
              display:'flex', alignItems:'center', gap:'0.5rem',
              background:'#2979d0', color:'white', border:'none',
              padding:'0.625rem 1.25rem', borderRadius:'0.625rem',
              fontWeight:700, fontSize:'0.85rem', cursor:'pointer', whiteSpace:'nowrap',
              boxShadow:'0 4px 16px rgba(41,121,208,0.35)',
            }}>
              <PhoneCall size={15} /> Contact Support
            </button>
          </div>
        )}

        {/* Success card */}
        {created && (
          <div style={{
            background:'rgba(34,197,94,0.08)', border:'1px solid rgba(34,197,94,0.25)', borderRadius:'0.875rem',
            padding:'1rem 1.25rem', display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:'0.75rem',
          }}>
            <div style={{ display:'flex', alignItems:'center', gap:'0.75rem' }}>
              <CheckCircle size={22} color="#4ade80" />
              <div>
                <p style={{ margin:0, fontWeight:700, color:'#4ade80', fontSize:'0.9rem' }}>
                  Complaint #{created.complaintNumber} Registered
                </p>
                <p style={{ margin:0, fontSize:'0.78rem', color:'rgba(74,222,128,0.7)' }}>Priority: <strong>{created.priority}</strong></p>
              </div>
            </div>
            <button onClick={() => navigate('/customer-dashboard')} style={{
              background:'#22c55e', color:'white', border:'none',
              padding:'0.5rem 1rem', borderRadius:'0.5rem', fontWeight:700, fontSize:'0.8rem', cursor:'pointer',
            }}>
              My Dashboard →
            </button>
          </div>
        )}
      </div>

      {/* Complaint Form Modal */}
      {showForm && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.75)', backdropFilter:'blur(6px)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000, padding:'1rem' }}>
          <div style={{ background:'#0d1f3c', border:'1px solid rgba(41,121,208,0.25)', borderRadius:'1.25rem', padding:'2rem', maxWidth:'30rem', width:'100%', boxShadow:'0 24px 80px rgba(0,0,0,0.6)' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.5rem' }}>
              <h2 style={{ margin:0, fontSize:'1.2rem', fontWeight:800, color:'#f1f5f9', letterSpacing:'-0.02em' }}>Register Complaint</h2>
              <button onClick={() => setShowForm(false)} style={{ background:'none', border:'none', cursor:'pointer', color:'rgba(241,245,249,0.4)', padding:'0.25rem' }}>
                <X size={22} />
              </button>
            </div>
            <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
              <div>
                <label style={{ display:'block', fontSize:'0.75rem', fontWeight:700, color:'rgba(241,245,249,0.6)', marginBottom:'0.4rem' }}>
                  Complaint Title *
                </label>
                <input type="text" required value={title} onChange={e => setTitle(e.target.value)}
                  placeholder="e.g. No water supply since 3 days in our area"
                  style={{
                    width:'100%', boxSizing:'border-box', padding:'0.75rem',
                    border:'1px solid rgba(255,255,255,0.1)', borderRadius:'0.5rem',
                    fontSize:'0.9rem', outline:'none',
                    background:'rgba(255,255,255,0.04)', color:'#f1f5f9',
                    marginBottom: '0.5rem', transition:'border-color 0.2s',
                  }}
                  onFocus={e => e.target.style.borderColor='rgba(41,121,208,0.6)'}
                  onBlur={e => e.target.style.borderColor='rgba(255,255,255,0.1)'}
                />
              </div>

              <div>
                <label style={{ display:'block', fontSize:'0.75rem', fontWeight:700, color:'rgba(241,245,249,0.6)', marginBottom:'0.4rem' }}>
                  Specific Address (Please add House/Flat No.) *
                </label>
                <textarea required value={address} onChange={e => setAddress(e.target.value)}
                  placeholder="e.g. House No. 123, Street Name, and nearby landmark"
                  rows={2}
                  style={{
                    width:'100%', boxSizing:'border-box', padding:'0.75rem',
                    border:'1px solid rgba(255,255,255,0.1)', borderRadius:'0.5rem',
                    fontSize:'0.9rem', outline:'none',
                    background:'rgba(255,255,255,0.04)', color:'#f1f5f9',
                    resize:'vertical', transition:'border-color 0.2s',
                  }}
                  onFocus={e => e.target.style.borderColor='rgba(41,121,208,0.6)'}
                  onBlur={e => e.target.style.borderColor='rgba(255,255,255,0.1)'}
                />
                <div style={{ fontSize: '0.72rem', fontWeight: 600, marginTop: '0.3rem',
                  color: locationStatus === 'captured' ? '#4ade80' : locationStatus === 'denied' ? '#fca5a5' : locationStatus === 'failed' ? '#fbbf24' : 'rgba(241,245,249,0.35)'
                }}>
                  {locationStatus === 'fetching' && '⌛ Getting your location, please wait...'}
                  {locationStatus === 'captured' && '📍 Location captured automatically — please add your House/Flat No. above'}
                  {locationStatus === 'denied' && '🚫 Location access denied — please type your address manually'}
                  {locationStatus === 'failed' && '⚠️ Could not detect location — please type your address manually'}
                </div>
              </div>

              <div>
                <label style={{ display:'block', fontSize:'0.8rem', fontWeight:700, color:'#374151', marginBottom:'0.4rem' }}>
                  Attach Image (Optional)
                </label>
                <label style={{
                  display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
                  height:'8rem', border:'2px dashed #d1d5db', borderRadius:'0.625rem', cursor:'pointer',
                  background:'#f9fafb', transition:'border-color 0.15s', overflow:'hidden',
                }}>
                  {imagePreview
                    ? <img src={imagePreview} style={{ height:'100%', width:'100%', objectFit:'cover' }} alt="preview" />
                    : <><ImagePlus size={28} color="#9ca3af" /><span style={{ fontSize:'0.8rem', color:'#9ca3af', marginTop:'0.5rem' }}>Click to upload</span></>
                  }
                  <input type="file" accept="image/*" style={{ display:'none' }} onChange={e => {
                    const f = e.target.files[0];
                    if (f) {
                      setImageFile(f);
                      const r = new FileReader();
                      r.onloadend = () => setImagePreview(r.result);
                      r.readAsDataURL(f);
                    }
                  }} />
                </label>
              </div>

              <div style={{ background:'#eff6ff', borderRadius:'0.5rem', padding:'0.75rem 1rem', border:'1px solid #bae6fd', fontSize:'0.78rem', color:'#1e40af', lineHeight:1.5 }}>
                💡 Your chat history will be included to help AI classify and prioritize your complaint.
              </div>

              <div style={{ display:'flex', gap:'0.75rem' }}>
                <button type="button" onClick={() => setShowForm(false)} style={{ flex:1, padding:'0.75rem', border:'1.5px solid #e5e7eb', borderRadius:'0.625rem', background:'white', fontWeight:600, color:'#6b7280', cursor:'pointer' }}>
                  Cancel
                </button>
                <button type="submit" disabled={submitting} style={{ flex:1, padding:'0.75rem', background:'#1b4d89', color:'white', border:'none', borderRadius:'0.625rem', fontWeight:700, cursor:'pointer', opacity: submitting ? 0.7 : 1 }}>
                  {submitting ? 'Registering...' : 'Submit Complaint'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chatbot;
