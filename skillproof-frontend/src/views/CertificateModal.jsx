import React from 'react';
import { SmallCapsHeading, HandwrittenAnnotation } from '../components/Typography';
import { NotebookButton } from '../components/NotebookButton';
import { VerificationStamp } from '../components/VerificationStamp';
import { Sparkle } from '../components/HandwrittenDoodles';

export const CertificateModal = ({ credential, onClose }) => {
  if (!credential) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(69, 64, 71, 0.45)',
        backdropFilter: 'blur(2px)',
        zIndex: 999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}
      onClick={onClose}
    >
      <div
        className="paper-note paper-note-tape"
        style={{
          maxWidth: '640px',
          width: '100%',
          backgroundColor: 'var(--paper-clean)',
          border: '1.5px solid rgba(108, 90, 115, 0.25)',
          padding: '36px',
          maxHeight: '90vh',
          overflowY: 'auto',
          position: 'relative'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Certificate Header */}
        <div
          style={{
            textAlign: 'center',
            borderBottom: '2px solid rgba(108, 90, 115, 0.2)',
            paddingBottom: '20px',
            marginBottom: '24px'
          }}
        >
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <Sparkle size={18} color="var(--ink-deep)" />
            <span
              className="small-caps"
              style={{
                fontSize: '1.1rem',
                letterSpacing: '0.14em',
                color: 'var(--ink-deep)',
                fontWeight: 700
              }}
            >
              skillproof academic credentials registry
            </span>
            <Sparkle size={18} color="var(--ink-deep)" />
          </div>

          <h2
            className="small-caps"
            style={{
              fontSize: '1.5rem',
              color: 'var(--ink-deep)',
              lineHeight: 1.2
            }}
          >
            certificate of verified competence
          </h2>
        </div>

        {/* Certificate Body */}
        <div style={{ marginBottom: '28px', lineHeight: 1.7 }}>
          <p style={{ fontSize: '0.86rem', color: 'var(--ink-muted)', marginBottom: '4px' }}>
            this official record confirms that
          </p>

          <h3
            style={{
              fontFamily: 'var(--font-ui)',
              fontSize: '1.5rem',
              fontWeight: 700,
              color: 'var(--ink-deep)',
              marginBottom: '12px'
            }}
          >
            {credential.candidateName || 'Verified Scholar'}
          </h3>

          <p style={{ fontSize: '0.92rem', color: 'var(--ink-body)', marginBottom: '16px' }}>
            has demonstrated verified proficiency in{' '}
            <span style={{ fontWeight: 700, color: 'var(--ink-deep)' }}>
              {credential.title}
            </span>{' '}
            validated via university coursework and production git audit.
          </p>

          {/* Key Metadata Table */}
          <div
            style={{
              padding: '16px',
              backgroundColor: 'var(--paper-card)',
              borderRadius: '4px',
              border: '1px dashed rgba(108, 90, 115, 0.22)',
              marginBottom: '24px'
            }}
          >
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '0.84rem' }}>
              <div>
                <span className="small-caps" style={{ color: 'var(--ink-muted)', display: 'block' }}>
                  credential id
                </span>
                <span style={{ fontWeight: 600, color: 'var(--ink-deep)' }}>{credential.id}</span>
              </div>

              <div>
                <span className="small-caps" style={{ color: 'var(--ink-muted)', display: 'block' }}>
                  issued date
                </span>
                <span style={{ fontWeight: 600, color: 'var(--ink-deep)' }}>{credential.issueDate}</span>
              </div>

              <div>
                <span className="small-caps" style={{ color: 'var(--ink-muted)', display: 'block' }}>
                  issuing authority
                </span>
                <span style={{ fontWeight: 600, color: 'var(--ink-deep)' }}>{credential.issuer}</span>
              </div>

              <div>
                <span className="small-caps" style={{ color: 'var(--ink-muted)', display: 'block' }}>
                  audit protocol
                </span>
                <span style={{ fontWeight: 600, color: 'var(--ink-deep)' }}>Deterministic Git + Exam</span>
              </div>
            </div>

            {/* SHA-256 Hash */}
            <div style={{ marginTop: '14px', paddingTop: '10px', borderTop: '1px dashed rgba(108, 90, 115, 0.15)' }}>
              <span className="small-caps" style={{ color: 'var(--ink-muted)', display: 'block', fontSize: '0.74rem' }}>
                cryptographic sha-256 integrity hash
              </span>
              <code
                style={{
                  fontFamily: 'monospace',
                  fontSize: '0.72rem',
                  color: 'var(--ink-primary)',
                  wordBreak: 'break-all',
                  display: 'block',
                  marginTop: '2px'
                }}
              >
                {credential.hash}
              </code>
            </div>
          </div>

          {/* Stamp & Seal Area */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingTop: '12px'
            }}
          >
            <div>
              <HandwrittenAnnotation style={{ fontSize: '1.2rem', color: 'var(--ink-primary)' }}>
                "skills tell stories" ✦
              </HandwrittenAnnotation>
              <p style={{ fontSize: '0.75rem', color: 'var(--ink-muted)', marginTop: '2px' }}>
                academic registry signature #SKP-MUJ-99
              </p>
            </div>

            <VerificationStamp
              status="VERIFIED"
              id={credential.id}
              date={credential.issueDate}
            />
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <NotebookButton variant="paper" onClick={onClose}>
            close certificate
          </NotebookButton>
        </div>
      </div>
    </div>
  );
};

export default CertificateModal;
