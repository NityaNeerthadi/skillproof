import React, { useState } from 'react';
import { SmallCapsHeading, HandwrittenAnnotation } from '../components/Typography';
import { NotebookButton } from '../components/NotebookButton';
import { useApp } from '../context/AppContext';

export const JobApplyModal = ({ job, onClose }) => {
  const { applyForJob, student } = useApp();
  const [submitted, setSubmitted] = useState(false);

  if (!job) return null;

  const handleConfirmApply = () => {
    applyForJob(job.id);
    setSubmitted(true);
    setTimeout(() => {
      onClose();
    }, 1200);
  };

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
          maxWidth: '520px',
          width: '100%',
          backgroundColor: 'var(--paper-clean)',
          border: '1px solid rgba(108, 90, 115, 0.22)',
          padding: '30px',
          position: 'relative'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: '16px',
            borderBottom: '1px dashed rgba(108, 90, 115, 0.18)',
            paddingBottom: '12px'
          }}
        >
          <div>
            <span
              className="small-caps"
              style={{
                fontSize: '0.74rem',
                color: 'var(--ink-muted)',
                letterSpacing: '0.12em'
              }}
            >
              student application dispatch
            </span>
            <SmallCapsHeading level={3} style={{ fontSize: '1.35rem' }}>
              apply for {job.title}
            </SmallCapsHeading>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '1.4rem',
              color: 'var(--ink-muted)',
              cursor: 'pointer'
            }}
          >
            ×
          </button>
        </div>

        {submitted ? (
          <div style={{ textAlign: 'center', padding: '24px 0' }}>
            <span style={{ fontSize: '2rem', color: 'var(--ink-deep)', display: 'block', marginBottom: '8px' }}>
              ✓
            </span>
            <SmallCapsHeading level={4} style={{ fontSize: '1.2rem', marginBottom: '6px' }}>
              application submitted to {job.company}
            </SmallCapsHeading>
            <p style={{ fontSize: '0.88rem', color: 'var(--ink-muted)' }}>
              your verified academic profile and trust score have been linked.
            </p>
          </div>
        ) : (
          <div>
            <p style={{ fontSize: '0.9rem', color: 'var(--ink-body)', marginBottom: '16px', lineHeight: 1.5 }}>
              You are applying as{' '}
              <strong style={{ color: 'var(--ink-deep)' }}>{student?.name || 'Student Scholar'}</strong> ({student?.university || 'Academic University'})
              with a deterministic match score of{' '}
              <strong style={{ color: 'var(--ink-deep)' }}>{job.matchPercentage || 0}%</strong>.
            </p>

            <div
              style={{
                padding: '14px',
                backgroundColor: 'var(--paper-card)',
                borderRadius: '4px',
                border: '1px solid rgba(108, 90, 115, 0.14)',
                marginBottom: '20px',
                fontSize: '0.85rem'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span className="small-caps" style={{ color: 'var(--ink-muted)' }}>company</span>
                <span style={{ fontWeight: 600, color: 'var(--ink-deep)' }}>{job.company}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span className="small-caps" style={{ color: 'var(--ink-muted)' }}>stipend / compensation</span>
                <span style={{ fontWeight: 600, color: 'var(--ink-deep)' }}>{job.stipend}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span className="small-caps" style={{ color: 'var(--ink-muted)' }}>verified skills included</span>
                <span style={{ fontWeight: 600, color: 'var(--ink-deep)' }}>{job.matchedSkills.length} of {job.requiredSkills.length}</span>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <HandwrittenAnnotation style={{ fontSize: '1.1rem', color: 'var(--ink-primary)' }}>
                "ready when you are ♡"
              </HandwrittenAnnotation>

              <div style={{ display: 'flex', gap: '10px' }}>
                <NotebookButton variant="paper" onClick={onClose}>
                  cancel
                </NotebookButton>
                <NotebookButton variant="primary" onClick={handleConfirmApply}>
                  submit application →
                </NotebookButton>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default JobApplyModal;
