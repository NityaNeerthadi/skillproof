import React from 'react';
import { HandwrittenAnnotation } from './Typography';

export const TrustScore = ({
  score = 87,
  maxScore = 100,
  showAnnotation = true,
  className = '',
  style = {}
}) => {
  return (
    <div
      className={`trust-score-container ${className}`}
      style={{
        display: 'inline-flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        ...style
      }}
    >
      <span
        className="small-caps"
        style={{
          fontSize: '0.78rem',
          color: 'var(--ink-muted)',
          letterSpacing: '0.12em',
          marginBottom: '4px'
        }}
      >
        trust score
      </span>

      <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '6px 14px',
            backgroundColor: 'var(--paper-card)',
            border: '1.5px solid rgba(108, 90, 115, 0.3)',
            borderRadius: '4px',
            boxShadow: 'inset 0 1px 3px rgba(108, 90, 115, 0.06)'
          }}
        >
          <span
            style={{
              fontFamily: 'var(--font-ui)',
              fontSize: '1.6rem',
              fontWeight: 700,
              color: 'var(--ink-deep)',
              lineHeight: 1
            }}
          >
            {score}
          </span>
          <span
            style={{
              fontFamily: 'var(--font-ui)',
              fontSize: '0.95rem',
              color: 'var(--ink-muted)',
              marginLeft: '4px'
            }}
          >
            / {maxScore}
          </span>
        </div>

        {showAnnotation && (
          <HandwrittenAnnotation style={{ fontSize: '1.05rem', color: 'var(--ink-primary)' }}>
            verified academic profile ✦
          </HandwrittenAnnotation>
        )}
      </div>
    </div>
  );
};

export default TrustScore;
