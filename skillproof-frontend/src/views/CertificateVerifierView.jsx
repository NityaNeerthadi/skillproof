import React, { useState } from 'react';
import { SmallCapsHeading, HandwrittenAnnotation } from '../components/Typography';
import { NotebookButton } from '../components/NotebookButton';
import { VerificationStamp } from '../components/VerificationStamp';
import { PaperNote } from '../components/PaperNote';
import { Sparkle } from '../components/HandwrittenDoodles';
import { useApp } from '../context/AppContext';

const PUBLIC_REGISTRY = [
  {
    id: 'SKP-2026-9942A',
    candidateName: 'Student Scholar',
    title: 'Python Core & Distributed Systems Verification',
    issuer: 'SkillProof Academic Board & MUJ',
    issueDate: 'AUG 2026',
    hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'
  },
  {
    id: 'SKP-2026-8819B',
    candidateName: 'Aarav Sharma',
    title: 'PostgreSQL Relational Storage & Indexing',
    issuer: 'Faculty of Engineering, MUJ',
    issueDate: 'JUL 2026',
    hash: '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08'
  }
];

export const CertificateVerifierView = ({ onInspectCredential }) => {
  const { student } = useApp();

  const allCredentials = React.useMemo(() => {
    return [...(student?.credentials || []), ...PUBLIC_REGISTRY];
  }, [student]);

  const [query, setQuery] = useState('SKP-2026-9942A');
  const [result, setResult] = useState(allCredentials[0]);
  const [hasSearched, setHasSearched] = useState(true);

  const handleSearch = (e) => {
    e?.preventDefault();
    const clean = query.trim().toUpperCase();
    const match = allCredentials.find(
      c => c.id.toUpperCase() === clean || c.hash.toUpperCase() === clean
    );

    setResult(match || null);
    setHasSearched(true);
  };

  return (
    <div className="certificate-verifier" style={{ paddingTop: '24px', paddingBottom: '70px' }}>
      {/* Header */}
      <div
        style={{
          borderBottom: '1px dashed rgba(108, 90, 115, 0.2)',
          paddingBottom: '20px',
          marginBottom: '28px'
        }}
      >
        <span className="notebook-page-marker">
          public registry · university document verification
        </span>
        <SmallCapsHeading level={1} style={{ fontSize: '2rem', color: 'var(--ink-deep)' }}>
          cryptographic credential verifier
        </SmallCapsHeading>
        <p style={{ fontSize: '0.86rem', color: 'var(--ink-muted)', marginTop: '2px' }}>
          confirm authentic academic competence via sha-256 integrity signatures
        </p>
      </div>

      {/* Search Input in Notebook Style */}
      <div style={{ maxWidth: '680px', marginBottom: '36px' }}>
        <form onSubmit={handleSearch}>
          <label className="small-caps" style={{ display: 'block', fontSize: '0.78rem', marginBottom: '6px' }}>
            enter credential id or sha-256 hash
          </label>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g. SKP-2026-9942A"
              className="notebook-input"
              style={{ flex: 1, minWidth: '260px' }}
            />
            <NotebookButton type="submit" variant="primary">
              verify document →
            </NotebookButton>
          </div>
        </form>

        {/* Quick-test buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '10px' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--ink-muted)' }}>test query:</span>
          <button
            type="button"
            onClick={() => {
              setQuery('SKP-2026-9942A');
              setResult(PUBLIC_REGISTRY[0]);
              setHasSearched(true);
            }}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--ink-primary)',
              textDecoration: 'underline',
              fontSize: '0.78rem',
              cursor: 'pointer'
            }}
          >
            SKP-2026-9942A (Python)
          </button>
          <span style={{ color: 'var(--ink-muted)', fontSize: '0.75rem' }}>·</span>
          <button
            type="button"
            onClick={() => {
              setQuery('SKP-2026-8819B');
              setResult(PUBLIC_REGISTRY[1]);
              setHasSearched(true);
            }}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--ink-primary)',
              textDecoration: 'underline',
              fontSize: '0.78rem',
              cursor: 'pointer'
            }}
          >
            SKP-2026-8819B (PostgreSQL)
          </button>
        </div>
      </div>

      {/* Search Result */}
      {hasSearched && (
        <div style={{ maxWidth: '820px' }}>
          {result ? (
            <PaperNote tape style={{ padding: '36px', backgroundColor: 'var(--paper-clean)' }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  flexWrap: 'wrap',
                  gap: '20px',
                  marginBottom: '24px',
                  borderBottom: '1px dashed rgba(108, 90, 115, 0.2)',
                  paddingBottom: '20px'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <Sparkle size={16} color="var(--ink-deep)" />
                    <span className="small-caps" style={{ fontSize: '0.76rem', color: 'var(--ink-muted)' }}>
                      verified academic credential record
                    </span>
                  </div>

                  <h3 className="small-caps" style={{ fontSize: '1.5rem', color: 'var(--ink-deep)' }}>
                    {result.title}
                  </h3>

                  <p style={{ fontSize: '0.9rem', color: 'var(--ink-body)', marginTop: '4px' }}>
                    Candidate: <strong>{result.candidateName || student?.name || 'Verified Scholar'}</strong> · Issued by <strong>{result.issuer}</strong>
                  </p>
                </div>

                <VerificationStamp
                  status="VERIFIED"
                  id={result.id}
                  date={result.issueDate}
                />
              </div>

              {/* Integrity Details */}
              <div
                style={{
                  padding: '16px',
                  backgroundColor: 'var(--paper-card)',
                  borderRadius: '4px',
                  border: '1px dashed rgba(108, 90, 115, 0.18)',
                  marginBottom: '24px',
                  fontSize: '0.85rem'
                }}
              >
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
                  <div>
                    <span className="small-caps" style={{ color: 'var(--ink-muted)', display: 'block' }}>
                      credential id
                    </span>
                    <span style={{ fontWeight: 600, color: 'var(--ink-deep)' }}>{result.id}</span>
                  </div>

                  <div>
                    <span className="small-caps" style={{ color: 'var(--ink-muted)', display: 'block' }}>
                      issue date
                    </span>
                    <span style={{ fontWeight: 600, color: 'var(--ink-deep)' }}>{result.issueDate}</span>
                  </div>
                </div>

                <div>
                  <span className="small-caps" style={{ color: 'var(--ink-muted)', display: 'block', fontSize: '0.74rem' }}>
                    sha-256 integrity hash
                  </span>
                  <code style={{ fontSize: '0.76rem', color: 'var(--ink-primary)', wordBreak: 'break-all' }}>
                    {result.hash}
                  </code>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <HandwrittenAnnotation style={{ fontSize: '1.15rem', color: 'var(--ink-primary)' }}>
                  "immutable academic proof" ✦
                </HandwrittenAnnotation>

                <NotebookButton variant="secondary" onClick={() => onInspectCredential(result)}>
                  view full paper certificate →
                </NotebookButton>
              </div>
            </PaperNote>
          ) : (
            <PaperNote>
              <p style={{ fontSize: '0.95rem', color: 'var(--ink-muted)', fontStyle: 'italic' }}>
                No verified record found matching "{query}". Check the credential ID or try the test samples above.
              </p>
            </PaperNote>
          )}
        </div>
      )}
    </div>
  );
};

export default CertificateVerifierView;
