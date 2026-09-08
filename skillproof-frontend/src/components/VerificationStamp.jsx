import React from 'react';

export const VerificationStamp = ({
  status = 'VERIFIED',
  id = 'SKP-2026-9942A',
  date = 'AUG 2026',
  circular = false,
  className = '',
  style = {}
}) => {
  if (circular) {
    return (
      <div
        className={`ink-stamp ink-stamp-circle ${className}`}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          lineHeight: 1.1,
          ...style
        }}
      >
        <span style={{ fontSize: '0.62rem', letterSpacing: '0.14em', opacity: 0.8 }}>
          ACADEMIC
        </span>
        <span style={{ fontSize: '0.78rem', fontWeight: 800, margin: '2px 0' }}>
          ✓ {status}
        </span>
        <span style={{ fontSize: '0.58rem', letterSpacing: '0.08em', opacity: 0.85 }}>
          {date}
        </span>
      </div>
    );
  }

  return (
    <div
      className={`ink-stamp ${className}`}
      style={style}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <span style={{ fontSize: '1.1rem' }}>✓</span>
        <span style={{ fontSize: '0.88rem', letterSpacing: '0.14em' }}>{status}</span>
      </div>
      <div
        style={{
          fontSize: '0.62rem',
          letterSpacing: '0.09em',
          opacity: 0.82,
          marginTop: '2px'
        }}
      >
        {id} · {date}
      </div>
    </div>
  );
};

export default VerificationStamp;
