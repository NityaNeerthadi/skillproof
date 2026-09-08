import React from 'react';
import { Sparkle } from './HandwrittenDoodles';

export const CredentialBadge = ({
  title,
  issuer,
  issueDate,
  id,
  hash,
  onInspect,
  className = '',
  style = {}
}) => {
  return (
    <div
      className={`credential-badge-item ${className}`}
      onClick={onInspect}
      style={style}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onInspect?.();
        }
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
        <Sparkle size={14} color="var(--ink-deep)" />
        <span
          className="small-caps"
          style={{
            fontSize: '1.02rem',
            color: 'var(--ink-muted)',
            letterSpacing: '0.04em',
            fontFamily: 'var(--font-handwriting)'
          }}
        >
          {id}
        </span>
      </div>

      <h4
        className="small-caps"
        style={{
          fontSize: '1.25rem',
          color: 'var(--ink-deep)',
          marginBottom: '6px',
          lineHeight: 1.3,
          fontFamily: 'var(--font-handwriting)'
        }}
      >
        {title}
      </h4>

      <p
        style={{
          fontSize: '1.08rem',
          color: 'var(--ink-muted)',
          marginBottom: '12px',
          lineHeight: 1.4,
          fontFamily: 'var(--font-handwriting)'
        }}
      >
        {issuer} · <span style={{ opacity: 0.85 }}>{issueDate}</span>
      </p>

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingTop: '8px',
          borderTop: '1px dashed rgba(88, 63, 107, 0.16)'
        }}
      >
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: '1.05rem',
            fontFamily: 'var(--font-handwriting)',
            color: 'var(--ink-primary)',
            fontWeight: 600
          }}
        >
          ✓ verified document
        </span>

        <span
          className="view-credential-cta"
          style={{
            fontFamily: 'var(--font-handwriting)',
            fontSize: '1.15rem',
            color: 'var(--ink-deep)',
            fontWeight: 600
          }}
        >
          view credential →
        </span>
      </div>
    </div>
  );
};

export default CredentialBadge;
