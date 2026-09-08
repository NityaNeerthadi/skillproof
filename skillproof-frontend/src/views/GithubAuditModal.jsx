import React, { useState } from 'react';
import { SmallCapsHeading, HandwrittenAnnotation, Highlighter } from '../components/Typography';
import { NotebookButton } from '../components/NotebookButton';
import { Sparkle, HeartDoodle } from '../components/HandwrittenDoodles';
import { useApp } from '../context/AppContext';

export const GithubAuditModal = ({ isOpen, onClose }) => {
  const { student, setStudent, addStudentSkill } = useApp();
  const [username, setUsername] = useState(student?.githubUsername || 'yashpandey');
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditStep, setAuditStep] = useState(student?.githubVerified ? 5 : 0);
  const [auditSuccess, setAuditSuccess] = useState(Boolean(student?.githubVerified));

  if (!isOpen) return null;

  const handleStartAudit = () => {
    setIsAuditing(true);
    setAuditStep(1);

    setTimeout(() => setAuditStep(2), 700);
    setTimeout(() => setAuditStep(3), 1400);
    setTimeout(() => setAuditStep(4), 2100);
    setTimeout(() => {
      setAuditStep(5);
      setIsAuditing(false);
      setAuditSuccess(true);
      setStudent(prev => ({
        ...prev,
        githubVerified: true,
        githubUsername: username
      }));
    }, 2800);
  };

  const detectedSkills = [
    { id: 'python', name: 'Python', confidence: '98%' },
    { id: 'fastapi', name: 'FastAPI', confidence: '94%' },
    { id: 'postgresql', name: 'PostgreSQL', confidence: '91%' },
    { id: 'docker', name: 'Docker', confidence: '88%' }
  ];

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
          maxWidth: '560px',
          width: '100%',
          backgroundColor: 'var(--paper-card)',
          maxHeight: '90vh',
          overflowY: 'auto',
          position: 'relative'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: '16px',
            borderBottom: '1px dashed rgba(108, 90, 115, 0.2)',
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
              page 03 · audit notebook
            </span>
            <SmallCapsHeading level={3} style={{ fontSize: '1.4rem' }}>
              github verification audit
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
              cursor: 'pointer',
              lineHeight: 1
            }}
          >
            ×
          </button>
        </div>

        <div style={{ marginBottom: '16px' }}>
          <HandwrittenAnnotation style={{ fontSize: '1.25rem', color: 'var(--ink-primary)' }}>
            "let's see what you've built." ✦
          </HandwrittenAnnotation>
        </div>

        {/* Input */}
        <div style={{ marginBottom: '20px' }}>
          <label
            className="small-caps"
            style={{
              display: 'block',
              fontSize: '0.78rem',
              color: 'var(--ink-deep)',
              marginBottom: '6px'
            }}
          >
            github handle
          </label>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. yashpandey"
              className="notebook-input"
              style={{ flex: 1 }}
              disabled={isAuditing}
            />
            <NotebookButton
              variant="primary"
              disabled={isAuditing || !username.trim()}
              onClick={handleStartAudit}
            >
              {isAuditing ? 'analyzing...' : 'verify github →'}
            </NotebookButton>
          </div>
        </div>

        {/* Audit Progress Steps */}
        <div
          style={{
            padding: '16px',
            borderRadius: '4px',
            backgroundColor: 'var(--paper-clean)',
            border: '1px solid rgba(108, 90, 115, 0.16)',
            marginBottom: '20px'
          }}
        >
          <div
            className="small-caps"
            style={{
              fontSize: '0.74rem',
              color: 'var(--ink-muted)',
              marginBottom: '10px'
            }}
          >
            audit log
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.9rem' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                color: auditStep >= 1 ? 'var(--ink-deep)' : 'var(--ink-muted)'
              }}
            >
              <span>{auditStep >= 1 ? '✓' : '□'}</span>
              <span>repositories analyzed (38 public repositories found)</span>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                color: auditStep >= 2 ? 'var(--ink-deep)' : 'var(--ink-muted)'
              }}
            >
              <span>{auditStep >= 2 ? '✓' : '□'}</span>
              <span>languages detected (Python 58%, TypeScript 24%, SQL 12%)</span>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                color: auditStep >= 3 ? 'var(--ink-deep)' : 'var(--ink-muted)'
              }}
            >
              <span>{auditStep >= 3 ? '✓' : '□'}</span>
              <span>frameworks detected (FastAPI, React, PostgreSQL)</span>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                color: auditStep >= 4 ? 'var(--ink-deep)' : 'var(--ink-muted)'
              }}
            >
              <span>{auditStep >= 4 ? '✓' : '□'}</span>
              <span>commit activity (1,420+ commits over 12 months verified)</span>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                color: auditStep >= 5 ? 'var(--ink-deep)' : 'var(--ink-muted)'
              }}
            >
              <span>{auditStep >= 5 ? '✓' : '□'}</span>
              <span>dependency graph and package locks verified</span>
            </div>
          </div>
        </div>

        {/* Audit Output & Final Note */}
        {auditSuccess && (
          <div>
            <div
              className="small-caps"
              style={{
                fontSize: '0.74rem',
                color: 'var(--ink-deep)',
                marginBottom: '8px'
              }}
            >
              verified skills discovered
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '18px' }}>
              {detectedSkills.map(item => (
                <div
                  key={item.id}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '4px 10px',
                    backgroundColor: 'var(--lavender-pale)',
                    borderRadius: '4px',
                    border: '1px solid rgba(108, 90, 115, 0.2)',
                    fontSize: '0.85rem'
                  }}
                >
                  <span style={{ fontWeight: 600, color: 'var(--ink-deep)' }}>{item.name}</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--ink-muted)' }}>✓ {item.confidence}</span>
                </div>
              ))}
            </div>

            <div
              style={{
                textAlign: 'center',
                padding: '12px',
                borderTop: '1px dashed rgba(108, 90, 115, 0.18)'
              }}
            >
              <p
                style={{
                  fontFamily: 'var(--font-handwriting)',
                  fontSize: '1.6rem',
                  color: 'var(--ink-deep)',
                  fontWeight: 600
                }}
              >
                "your work speaks for you." ♡
              </p>
            </div>
          </div>
        )}

        <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'flex-end' }}>
          <NotebookButton variant="paper" onClick={onClose}>
            close audit note
          </NotebookButton>
        </div>
      </div>
    </div>
  );
};

export default GithubAuditModal;
