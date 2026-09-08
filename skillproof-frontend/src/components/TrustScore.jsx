import React from 'react';
import { HandwrittenAnnotation } from './Typography';
import { AnimatedNumber } from './AnimatedNumber';

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
          fontSize: '1.15rem',
          color: 'var(--ink-muted)',
          letterSpacing: '0.04em',
          marginBottom: '4px',
          fontFamily: 'var(--font-handwriting)'
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
            padding: '5px 16px',
            backgroundColor: 'var(--paper-card)',
            backdropFilter: 'var(--glass-blur)',
            WebkitBackdropFilter: 'var(--glass-blur)',
            border: '1.5px solid rgba(88, 63, 107, 0.22)',
            borderRadius: 'var(--radius-paper)',
            boxShadow: 'var(--shadow-weightless-sm)'
          }}
        >
          <span
            style={{
              fontFamily: 'var(--font-handwriting)',
              fontSize: '2.1rem',
              fontWeight: 600,
              color: 'var(--ink-deep)',
              lineHeight: 1
            }}
          >
            <AnimatedNumber value={score} />
          </span>
          <span
            style={{
              fontFamily: 'var(--font-handwriting)',
              fontSize: '1.3rem',
              color: 'var(--ink-muted)',
              marginLeft: '6px'
            }}
          >
            / {maxScore}
          </span>
        </div>

        {showAnnotation && (
          <HandwrittenAnnotation style={{ fontSize: '1.18rem', color: 'var(--ink-primary)' }}>
            verified academic profile ✦
          </HandwrittenAnnotation>
        )}
      </div>
    </div>
  );
};

export default TrustScore;
