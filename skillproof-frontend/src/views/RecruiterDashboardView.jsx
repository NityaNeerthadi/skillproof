import React, { useState } from 'react';
import { SmallCapsHeading, HandwrittenAnnotation } from '../components/Typography';
import { NotebookButton } from '../components/NotebookButton';
import { SkillBadge } from '../components/SkillBadge';
import { PaperNote } from '../components/PaperNote';
import { AnimatedNumber } from '../components/AnimatedNumber';
import { CertificateVerifierView } from './CertificateVerifierView';
import { useApp } from '../context/AppContext';

export const RecruiterDashboardView = ({ onOpenCreateJob, onInspectCredential }) => {
  const { jobs, applications, updateApplicationStatus, student, allSkills, recruiterTab, setRecruiterTab } = useApp();
  const [filter, setFilter] = useState('all'); // 'all' | 'ready-now' | 'in-progress' | 'shortlisted' | 'placed'

  const skillDict = React.useMemo(() => {
    return Object.fromEntries(allSkills.map(s => [s.id, s]));
  }, [allSkills]);

  // Filtered applications
  const filteredApps = applications.filter(app => {
    if (filter === 'ready-now') return app.matchPercentage === 100;
    if (filter === 'in-progress') return app.matchPercentage < 100;
    if (filter === 'shortlisted') return app.status === 'shortlisted';
    if (filter === 'placed') return app.status === 'placed';
    return true;
  });

  return (
    <div className="recruiter-dashboard notebook-view-transition" style={{ paddingTop: '24px', paddingBottom: '70px' }}>
      {/* Top Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: '20px',
          marginBottom: '28px',
          borderBottom: '1px dashed rgba(108, 90, 115, 0.2)',
          paddingBottom: '20px'
        }}
      >
        <div>
          <span className="notebook-page-marker">
            recruiter talent journal · verified applicant pipeline
          </span>
          <SmallCapsHeading level={1} style={{ fontSize: '2rem', color: 'var(--ink-deep)' }}>
            Acme Cloud Systems & Network
          </SmallCapsHeading>
          <p style={{ fontSize: '0.86rem', color: 'var(--ink-muted)', marginTop: '2px' }}>
            deterministic match ranking · verified student audits · transparent math
          </p>
        </div>

        <NotebookButton variant="primary" onClick={onOpenCreateJob} style={{ fontSize: '0.82rem', padding: '8px 16px' }}>
          + post new job listing
        </NotebookButton>
      </div>

      {/* Recruiter Navigation Sub-Tabs */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '20px',
          marginBottom: '28px',
          borderBottom: '1px dashed rgba(108, 90, 115, 0.16)',
          paddingBottom: '6px'
        }}
      >
        <button
          type="button"
          onClick={() => setRecruiterTab('pipeline')}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontFamily: 'var(--font-handwriting)',
            fontSize: '1.25rem',
            color: recruiterTab === 'pipeline' ? 'var(--ink-deep)' : 'var(--ink-muted)',
            fontWeight: recruiterTab === 'pipeline' ? 600 : 400,
            borderBottom: recruiterTab === 'pipeline' ? '2px solid var(--ink-deep)' : '2px solid transparent',
            paddingBottom: '6px'
          }}
        >
          talent pipeline (<AnimatedNumber value={applications.length} />)
        </button>

        <button
          type="button"
          onClick={() => setRecruiterTab('verify')}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontFamily: 'var(--font-handwriting)',
            fontSize: '1.25rem',
            color: recruiterTab === 'verify' ? 'var(--ink-deep)' : 'var(--ink-muted)',
            fontWeight: recruiterTab === 'verify' ? 600 : 400,
            borderBottom: recruiterTab === 'verify' ? '2px solid var(--ink-deep)' : '2px solid transparent',
            paddingBottom: '6px'
          }}
        >
          verify candidate credentials
        </button>
      </div>

      {recruiterTab === 'pipeline' && (
        <div className="notebook-view-transition">
          {/* Summary Metrics on ruled lines */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '18px',
              marginBottom: '32px'
            }}
          >
        <div className="notebook-metric-card">
          <span className="small-caps" style={{ fontSize: '1.08rem', color: 'var(--ink-muted)' }}>
            active job postings
          </span>
          <div style={{ fontSize: '2.0rem', fontWeight: 600, color: 'var(--ink-deep)', lineHeight: 1.2 }}>
            <AnimatedNumber value={jobs.length} />
          </div>
        </div>

        <div className="notebook-metric-card">
          <span className="small-caps" style={{ fontSize: '1.08rem', color: 'var(--ink-muted)' }}>
            total applicants received
          </span>
          <div style={{ fontSize: '2.0rem', fontWeight: 600, color: 'var(--ink-deep)', lineHeight: 1.2 }}>
            <AnimatedNumber value={applications.length} />
          </div>
        </div>

        <div className="notebook-metric-card">
          <span className="small-caps" style={{ fontSize: '1.08rem', color: 'var(--ink-muted)' }}>
            ready now (100% matched)
          </span>
          <div style={{ fontSize: '2.0rem', fontWeight: 600, color: 'var(--ink-deep)', lineHeight: 1.2 }}>
            <AnimatedNumber value={applications.filter(a => a.matchPercentage === 100).length} />
          </div>
        </div>

        <div className="notebook-metric-card">
          <span className="small-caps" style={{ fontSize: '1.08rem', color: 'var(--ink-muted)' }}>
            shortlisted candidates
          </span>
          <div style={{ fontSize: '2.0rem', fontWeight: 600, color: 'var(--ink-deep)', lineHeight: 1.2 }}>
            <AnimatedNumber value={applications.filter(a => a.status === 'shortlisted').length} />
          </div>
        </div>
      </div>

      {/* Active Published Job Openings */}
      <div style={{ marginBottom: '36px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '14px' }}>
          <div>
            <SmallCapsHeading level={2} style={{ fontSize: '1.35rem', color: 'var(--ink-deep)' }}>
              active published job listings ({jobs.length})
            </SmallCapsHeading>
            <p style={{ fontSize: '0.85rem', color: 'var(--ink-muted)', margin: '2px 0 0 0' }}>
              deterministic match criteria actively screening senior cohort
            </p>
          </div>

          <NotebookButton variant="paper" onClick={onOpenCreateJob} style={{ padding: '6px 14px', fontSize: '0.82rem' }}>
            + publish another opening
          </NotebookButton>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
          {jobs.map(job => {
            const reqSkills = (job.requiredSkills || (job.required_skills ? job.required_skills.map(s => s.skill_id || s.id || s) : []) || [])
              .map(s => (typeof s === 'string' ? s : (s.skill_id || s.id || '')))
              .filter(Boolean);
            const jobAppsCount = applications.filter(a => a.jobId === job.id).length;

            return (
              <PaperNote
                key={job.id}
                style={{
                  padding: '18px 20px',
                  backgroundColor: 'var(--paper-clean)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  border: '1px solid rgba(108, 90, 115, 0.18)'
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px', marginBottom: '6px' }}>
                    <h4
                      style={{
                        fontFamily: 'var(--font-handwriting)',
                        fontSize: '1.45rem',
                        color: 'var(--ink-deep)',
                        margin: 0
                      }}
                    >
                      {job.title}
                    </h4>
                    <span
                      style={{
                        fontSize: '0.78rem',
                        padding: '2px 8px',
                        borderRadius: '3px',
                        backgroundColor: 'var(--lavender-pale)',
                        color: 'var(--ink-deep)',
                        fontFamily: 'var(--font-handwriting)',
                        fontWeight: 600,
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {job.type || 'Full-time'}
                    </span>
                  </div>

                  <p style={{ fontSize: '0.92rem', color: 'var(--ink-primary)', margin: '0 0 8px 0', fontFamily: 'var(--font-handwriting)', fontWeight: 600 }}>
                    {job.stipend || 'Competitive Package'} · {job.location || 'Hybrid'}
                  </p>

                  <p style={{ fontSize: '0.82rem', color: 'var(--ink-muted)', marginBottom: '12px', lineHeight: 1.4 }}>
                    {job.description?.slice(0, 110)}{job.description?.length > 110 ? '...' : ''}
                  </p>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '12px' }}>
                    {reqSkills.map(sId => {
                      const sObj = skillDict[sId] || { name: sId };
                      return (
                        <span
                          key={sId}
                          style={{
                            fontSize: '0.8rem',
                            padding: '2px 7px',
                            borderRadius: '3px',
                            backgroundColor: 'rgba(108, 90, 115, 0.08)',
                            color: 'var(--ink-deep)',
                            fontFamily: 'var(--font-handwriting)'
                          }}
                        >
                          {sObj.name || sId}
                        </span>
                      );
                    })}
                  </div>
                </div>

                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    paddingTop: '10px',
                    borderTop: '1px dashed rgba(108, 90, 115, 0.16)'
                  }}
                >
                  <span style={{ fontSize: '0.9rem', color: 'var(--ink-muted)', fontFamily: 'var(--font-handwriting)' }}>
                    {jobAppsCount} applicant{jobAppsCount === 1 ? '' : 's'} received
                  </span>
                  <span style={{ fontSize: '0.85rem', color: '#2e7d32', fontFamily: 'var(--font-handwriting)', fontWeight: 600 }}>
                    ● actively accepting
                  </span>
                </div>
              </PaperNote>
            );
          })}
        </div>
      </div>

      {/* Applicant Filter Tabs */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '12px' }}>
          <SmallCapsHeading level={2} style={{ fontSize: '1.35rem', color: 'var(--ink-deep)' }}>
            applicant pipeline ledger
          </SmallCapsHeading>

          <HandwrittenAnnotation style={{ fontSize: '1.1rem', color: 'var(--ink-primary)' }}>
            "ranked descending by deterministic match %" ✦
          </HandwrittenAnnotation>
        </div>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {[
            { id: 'all', label: 'all applicants' },
            { id: 'ready-now', label: 'ready now (100%)' },
            { id: 'in-progress', label: 'in progress (<100%)' },
            { id: 'shortlisted', label: 'shortlisted' },
            { id: 'placed', label: 'placed' }
          ].map(tab => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilter(tab.id)}
              className="small-caps"
              style={{
                padding: '4px 12px',
                borderRadius: '4px',
                border: filter === tab.id ? '1px solid var(--ink-deep)' : '1px solid rgba(108, 90, 115, 0.2)',
                backgroundColor: filter === tab.id ? 'var(--ink-deep)' : 'var(--paper-clean)',
                color: filter === tab.id ? 'var(--paper)' : 'var(--ink-body)',
                cursor: 'pointer',
                fontSize: '0.78rem'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Applicants List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '40px' }}>
        {filteredApps.length === 0 ? (
          <PaperNote>
            <p style={{ fontSize: '0.9rem', color: 'var(--ink-muted)', fontStyle: 'italic' }}>
              No candidates currently match this filter.
            </p>
          </PaperNote>
        ) : (
          filteredApps.map(app => {
            const job = jobs.find(j => j.id === app.jobId);
            const isCurrentStudent = Boolean(student && app.studentId === student.id);

            return (
              <PaperNote
                key={app.id}
                style={{
                  padding: '20px 24px',
                  backgroundColor: 'var(--paper-clean)'
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    flexWrap: 'wrap',
                    gap: '16px'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <h3 className="small-caps" style={{ fontSize: '1.25rem', color: 'var(--ink-deep)' }}>
                        {app.studentName}
                      </h3>
                      <span style={{ fontSize: '0.78rem', color: 'var(--ink-muted)' }}>
                        ({app.university || 'University'})
                      </span>
                      {isCurrentStudent && student?.githubVerified && (
                        <span style={{ fontSize: '0.72rem', padding: '1px 6px', backgroundColor: 'var(--lavender-pale)', color: 'var(--ink-deep)', borderRadius: '3px', fontWeight: 600 }}>
                          ✓ github verified
                        </span>
                      )}
                    </div>

                    <div style={{ fontSize: '0.85rem', color: 'var(--ink-primary)', marginTop: '2px' }}>
                      Applied for: <strong>{job ? job.title : 'Software Role'}</strong> · Applied on {app.appliedDate}
                    </div>

                    {/* Candidate verified skills pills */}
                    {isCurrentStudent && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '10px' }}>
                        {(student?.skills || []).map(s => {
                          const skillInfo = skillDict[s.skillId] || { name: s.skillId, color: 'lavender' };
                          return (
                            <SkillBadge
                              key={s.skillId}
                              name={skillInfo.name}
                              color={skillInfo.color}
                              proficiency={s.proficiency}
                            />
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Match Score & Action Controls */}
                  <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'baseline', gap: '4px' }}>
                      <span className="small-caps" style={{ fontSize: '0.74rem', color: 'var(--ink-muted)', marginRight: '4px' }}>
                        match:
                      </span>
                      <span
                        style={{
                          fontSize: '1.6rem',
                          fontWeight: 600,
                          color: app.matchPercentage === 100 ? 'var(--ink-deep)' : 'var(--ink-primary)',
                          lineHeight: 1
                        }}
                      >
                        <AnimatedNumber value={app.matchPercentage} suffix="%" />
                      </span>
                    </div>

                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      <NotebookButton
                        variant="paper"
                        style={{
                          padding: '4px 10px',
                          fontSize: '0.76rem',
                          backgroundColor: app.status === 'shortlisted' ? 'var(--soft-yellow)' : 'var(--paper-clean)'
                        }}
                        onClick={() => updateApplicationStatus(app.id, 'shortlisted')}
                      >
                        {app.status === 'shortlisted' ? '✓ shortlisted' : 'shortlist'}
                      </NotebookButton>

                      <NotebookButton
                        variant="paper"
                        style={{
                          padding: '4px 10px',
                          fontSize: '0.76rem',
                          backgroundColor: app.status === 'placed' ? 'var(--pastel-green)' : 'var(--paper-clean)'
                        }}
                        onClick={() => updateApplicationStatus(app.id, 'placed')}
                      >
                        {app.status === 'placed' ? '✓ placed' : 'mark placed'}
                      </NotebookButton>

                      <NotebookButton
                        variant="paper"
                        style={{
                          padding: '4px 8px',
                          fontSize: '0.76rem',
                          color: 'var(--ink-muted)'
                        }}
                        onClick={() => updateApplicationStatus(app.id, 'rejected')}
                      >
                        reject
                      </NotebookButton>
                    </div>
                  </div>
                </div>
              </PaperNote>
            );
          })
        )}
      </div>

      {/* Active Jobs Section */}
      <div>
        <SmallCapsHeading level={2} style={{ fontSize: '1.35rem', color: 'var(--ink-deep)', marginBottom: '14px' }}>
          published job listings ({jobs.length})
        </SmallCapsHeading>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
          {jobs.map(j => (
            <PaperNote key={j.id} style={{ padding: '18px 22px' }}>
              <h4 className="small-caps" style={{ fontSize: '1.1rem', color: 'var(--ink-deep)', marginBottom: '4px' }}>
                {j.title}
              </h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--ink-muted)', marginBottom: '8px' }}>
                {j.location} · {j.stipend}
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                {(j.requiredSkills || j.required_skills || []).map(sId => {
                  const s = skillDict[sId] || { name: sId };
                  return (
                    <span
                      key={sId}
                      style={{
                        fontSize: '0.74rem',
                        padding: '2px 6px',
                        borderRadius: '3px',
                        backgroundColor: 'var(--lavender-pale)',
                        color: 'var(--ink-deep)'
                      }}
                    >
                      {s.name}
                    </span>
                  );
                })}
              </div>
            </PaperNote>
          ))}
        </div>
      </div>
      </div>
      )}

      {recruiterTab === 'verify' && (
        <div className="notebook-view-transition">
          <CertificateVerifierView onInspectCredential={onInspectCredential} />
        </div>
      )}
    </div>
  );
};

export default RecruiterDashboardView;
