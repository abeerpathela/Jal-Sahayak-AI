import React from 'react';
import { Link } from 'react-router-dom';

const pBg = {
  HIGH:   { bg: 'rgba(239,68,68,0.12)', color: '#fca5a5',  border: '1px solid rgba(239,68,68,0.25)' },
  MEDIUM: { bg: 'rgba(245,158,11,0.12)', color: '#fcd34d', border: '1px solid rgba(245,158,11,0.25)' },
  LOW:    { bg: 'rgba(34,197,94,0.12)',  color: '#4ade80',  border: '1px solid rgba(34,197,94,0.25)' },
};
const sBg = {
  OPEN:        { bg: 'rgba(59,130,246,0.12)', color: '#93c5fd' },
  IN_PROGRESS: { bg: 'rgba(139,92,246,0.12)', color: '#c4b5fd' },
  RESOLVED:    { bg: 'rgba(34,197,94,0.12)',  color: '#4ade80'  },
  REOPENED:    { bg: 'rgba(249,115,22,0.12)', color: '#fdba74'  },
};

const ComplaintCard = ({ complaint, isRespondent = false }) => {
  const ps = pBg[complaint.priority] || {};
  const ss = sBg[complaint.status] || {};

  return (
    <div style={{
      background: 'rgba(255,255,255,0.04)',
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: '0.875rem', padding: '1.25rem',
      display: 'flex', flexDirection: 'column', gap: '0.75rem',
      transition: 'border-color 0.2s, box-shadow 0.2s, transform 0.2s',
    }}
      onMouseOver={e => { e.currentTarget.style.borderColor = 'rgba(41,121,208,0.35)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(41,121,208,0.12)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
      onMouseOut={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'translateY(0)'; }}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ flex: 1 }}>
          <span style={{ fontSize: '0.65rem', fontWeight: 700, color: 'rgba(241,245,249,0.3)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            {complaint.complaintNumber}
          </span>
          <h3 style={{ margin: '0.2rem 0 0', fontSize: '0.9rem', fontWeight: 700, color: '#f1f5f9', lineHeight: 1.4 }}>
            {complaint.title}
          </h3>
        </div>
        <span style={{
          ...ps, padding: '0.2rem 0.625rem', borderRadius: '999px',
          fontSize: '0.65rem', fontWeight: 800, marginLeft: '0.75rem', whiteSpace: 'nowrap',
          textTransform: 'uppercase', letterSpacing: '0.06em',
        }}>
          {complaint.priority}
        </span>
      </div>

      {/* Meta grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
        <MetaItem label="Category" value={complaint.category} />
        <MetaItem label="Date" value={new Date(complaint.createdAt).toLocaleDateString('en-IN')} />
        {complaint.address && (
          <div style={{ gridColumn: 'span 2' }}>
            <MetaItem label="Address" value={complaint.address} />
          </div>
        )}
        {complaint.location?.coordinates && (
          <div style={{ gridColumn: 'span 2' }}>
            <span style={{ fontSize: '0.65rem', color: 'rgba(241,245,249,0.35)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '0.2rem' }}>Location</span>
            <a
              href={`https://www.google.com/maps?q=${complaint.location.coordinates[1]},${complaint.location.coordinates[0]}`}
              target="_blank" rel="noopener noreferrer"
              style={{ fontSize: '0.78rem', color: '#60a5fa', fontWeight: 600, textDecoration: 'none' }}
              onMouseOver={e => e.currentTarget.style.textDecoration = 'underline'}
              onMouseOut={e => e.currentTarget.style.textDecoration = 'none'}
            >
              📍 View on Google Maps
            </a>
          </div>
        )}
        {isRespondent && complaint.customerId?.name && (
          <MetaItem label="Citizen" value={complaint.customerId.name} />
        )}
      </div>

      {/* AI Summary (respondent only) */}
      {isRespondent && complaint.aiSummary && (
        <div style={{
          background: 'rgba(41,121,208,0.08)',
          border: '1px solid rgba(41,121,208,0.2)',
          borderRadius: '0.5rem', padding: '0.6rem 0.875rem',
          fontSize: '0.75rem', color: 'rgba(148,197,253,0.85)', lineHeight: 1.55,
          fontStyle: 'italic',
        }}>
          🤖 {complaint.aiSummary}
        </div>
      )}

      {/* Footer */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.625rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <span style={{
          ...ss, padding: '0.25rem 0.75rem', borderRadius: '0.375rem',
          fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em',
        }}>
          {complaint.status.replace('_', ' ')}
        </span>
        <Link to={`/complaint/${complaint._id}`} style={{
          color: '#60a5fa', fontWeight: 700, fontSize: '0.78rem',
          textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.25rem',
          transition: 'color 0.15s',
        }}
          onMouseOver={e => e.currentTarget.style.color = '#93c5fd'}
          onMouseOut={e => e.currentTarget.style.color = '#60a5fa'}
        >
          View Chat →
        </Link>
      </div>
    </div>
  );
};

const MetaItem = ({ label, value }) => (
  <div>
    <span style={{ fontSize: '0.65rem', color: 'rgba(241,245,249,0.35)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '0.2rem' }}>{label}</span>
    <span style={{ fontSize: '0.8rem', color: 'rgba(241,245,249,0.75)', fontWeight: 500 }}>{value}</span>
  </div>
);

export default ComplaintCard;
