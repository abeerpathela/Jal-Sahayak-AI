import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, ShieldCheck } from 'lucide-react';

// Fixed appearance per sender type — same in ALL windows
const senderStyle = {
  customer:   { label: 'Citizen',   Icon: User,        bg: '#1b4d89', color: 'white'   },
  ai:         { label: 'Jal AI',    Icon: Bot,         bg: '#f1f5f9', color: '#1f2937' },
  respondent: { label: 'Staff',     Icon: ShieldCheck, bg: '#0f2f57', color: 'white'   },
};

// Determine if this message is "from me" based on viewerRole
const isMine = (sender, viewerRole) => sender === viewerRole;

const ChatWindow = ({ messages, onSendMessage, isTyping, userRole, complaintId }) => {
  const [input, setInput] = useState('');
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const submit = (e) => {
    e.preventDefault();
    if (input.trim()) { onSendMessage(input.trim()); setInput(''); }
  };

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', height: '580px',
      background: '#f8fafc', borderRadius: '1rem',
      border: '1px solid #e2e8f0', overflow: 'hidden',
      boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
    }}>
      {/* Header */}
      <div style={{
        background: 'white', padding: '1rem 1.25rem',
        borderBottom: '1px solid #e5e7eb',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
          <div style={{ width: '10px', height: '10px', background: '#22c55e', borderRadius: '50%', animation: 'pulse 1.5s infinite' }} />
          <span style={{ fontWeight: 700, color: '#1e293b', fontSize: '0.95rem' }}>Live Support Chat</span>
        </div>
        {complaintId && (
          <span style={{ fontSize: '0.7rem', color: '#9ca3af', fontFamily: 'monospace' }}>
            {complaintId.slice(-8)}
          </span>
        )}
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {messages.map((msg, i) => {
          const cfg = senderStyle[msg.sender] || senderStyle.ai;
          const mine = isMine(msg.sender, userRole);
          const align = mine ? 'flex-end' : 'flex-start';
          const bubbleRadius = mine
            ? '1rem 1rem 0.25rem 1rem'   // top-full, right corner flattened
            : '1rem 1rem 1rem 0.25rem';  // left corner flattened
          const { Icon } = cfg;

          return (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: align }}>
              {/* Sender label + avatar */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.3rem',
                flexDirection: mine ? 'row-reverse' : 'row' }}>
                <div style={{
                  width:'1.6rem', height:'1.6rem', background: cfg.bg,
                  borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center',
                }}>
                  <Icon size={10} color={cfg.color} />
                </div>
                <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {mine ? 'You' : cfg.label}
                </span>
              </div>

              {/* Image bubble — shown when imageUrl exists */}
              {msg.imageUrl && (
                <a href={msg.imageUrl} target="_blank" rel="noopener noreferrer"
                  style={{ maxWidth: '72%', display: 'block' }}>
                  <img
                    src={msg.imageUrl}
                    alt="Attached evidence"
                    style={{
                      width: '100%', maxHeight: '240px',
                      objectFit: 'cover',
                      borderRadius: bubbleRadius,
                      border: `2px solid ${cfg.bg}`,
                      cursor: 'pointer',
                      boxShadow: '0 2px 12px rgba(0,0,0,0.2)',
                      display: 'block',
                      transition: 'opacity 0.2s',
                    }}
                    onMouseOver={e => e.currentTarget.style.opacity = '0.85'}
                    onMouseOut={e => e.currentTarget.style.opacity = '1'}
                  />
                  <span style={{ fontSize: '0.62rem', color: '#94a3b8', display: 'block', marginTop: '0.2rem',
                    textAlign: mine ? 'right' : 'left' }}>
                    📎 Click to view full image
                  </span>
                </a>
              )}

              {/* Text bubble — only shown if message text is non-empty */}
              {msg.message && (
                <div style={{
                  background: cfg.bg, color: cfg.color,
                  padding: '0.75rem 1rem', borderRadius: bubbleRadius,
                  maxWidth: '78%', fontSize: '0.875rem', lineHeight: 1.6,
                  boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
                  whiteSpace: 'pre-wrap', wordBreak: 'break-word',
                  marginTop: msg.imageUrl ? '0.4rem' : '0',
                }}>
                  {msg.message}
                </div>
              )}

              <span style={{ fontSize: '0.65rem', color: '#cbd5e1', marginTop: '0.25rem', paddingLeft: '0.25rem' }}>
                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          );
        })}

        {/* Typing indicator */}
        {isTyping && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.3rem' }}>
              <div style={{ width:'1.6rem', height:'1.6rem', background:'#f3f4f6', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center' }}>
                <Bot size={10} color="#6b7280" />
              </div>
              <span style={{ fontSize: '0.68rem', fontWeight:700, color:'#9ca3af', textTransform:'uppercase' }}>Jal AI</span>
            </div>
            <div style={{ background:'white', padding:'0.75rem 1rem', borderRadius:'1rem 1rem 1rem 0.25rem', border:'1px solid #e5e7eb' }}>
              <div style={{ display:'flex', gap:'0.3rem', alignItems:'center' }}>
                {[0,1,2].map(i => (
                  <div key={i} style={{
                    width:'7px', height:'7px', background:'#94a3b8', borderRadius:'50%',
                    animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite`,
                  }} />
                ))}
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={submit} style={{
        padding: '1rem', background: 'white', borderTop: '1px solid #e5e7eb',
        display: 'flex', gap: '0.625rem',
      }}>
        <input
          type="text" value={input} onChange={e => setInput(e.target.value)}
          placeholder="Type your message..."
          style={{
            flex: 1, padding: '0.7rem 1rem',
            border: '1.5px solid #e2e8f0', borderRadius: '0.625rem',
            fontSize: '0.9rem', outline: 'none', background: '#f8fafc',
            transition: 'border-color 0.15s',
          }}
          onFocus={e => e.target.style.borderColor = '#1b4d89'}
          onBlur={e => e.target.style.borderColor = '#e2e8f0'}
        />
        <button type="submit" style={{
          background: '#1b4d89', color: 'white',
          border: 'none', padding: '0.7rem 1.1rem',
          borderRadius: '0.625rem', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'background 0.15s',
          boxShadow: '0 2px 8px rgba(27,77,137,0.3)',
        }}
          onMouseOver={e => e.currentTarget.style.background = '#0f2f57'}
          onMouseOut={e => e.currentTarget.style.background = '#1b4d89'}
        >
          <Send size={18} />
        </button>
      </form>
    </div>
  );
};

export default ChatWindow;
