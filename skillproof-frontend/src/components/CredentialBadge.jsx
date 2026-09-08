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
            fontSize: '0.72rem',
            color: 'var(--ink-muted)',
            letterSpacing: '0.1em'
          }}
        >
          {id}
        </span>
      </div>

      <h4
        className="small-caps"
        style={{
          fontSize: '1rem',
          color: 'var(--ink-deep)',
          marginBottom: '6px',
          lineHeight: 1.3
        }}
      >
        {title}
      </h4>

      <p
        style={{
          fontSize: '0.85rem',
          color: 'var(--ink-muted)',
          marginBottom: '12px',
          lineHeight: 1.4
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
          borderTop: '1px dashed rgba(108, 90, 115, 0.16)'
        }}
      >
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: '0.78rem',
            fontFamily: 'var(--font-ui)',
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
            fontSize: '1.05rem',
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
