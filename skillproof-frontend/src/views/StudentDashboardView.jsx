import React, { useState } from 'react';
import { SmallCapsHeading, HandwrittenAnnotation, Highlighter } from '../components/Typography';
import { NotebookButton } from '../components/NotebookButton';
import { SkillBadge } from '../components/SkillBadge';
import { JobMatch } from '../components/JobMatch';
import { PaperNote } from '../components/PaperNote';
import { TrustScore } from '../components/TrustScore';
import { AnimatedNumber } from '../components/AnimatedNumber';
import { Sparkle } from '../components/HandwrittenDoodles';
import { useApp } from '../context/AppContext';

export const StudentDashboardView = ({ onOpenGithubAudit, onOpenJobApply }) => {
  const {
    token,
    student,
    allSkills,
    readyNowJobs,
    almostThereJobs,
    applications,
    jobs,
    addStudentSkill,
    removeStudentSkill,
    updateSkillProficiency,
    setCurrentView,
    loading,
    studentTab,
    setStudentTab
  } = useApp();

  const [selectedCategory, setSelectedCategory] = useState('Backend');
  const [proficiencyDraft, setProficiencyDraft] = useState('intermediate');

  const categories = Array.from(new Set((allSkills || []).map(s => s.category)));
  const studentSkillIds = new Set((student?.skills || []).map(s => s.skillId || s.id));

  const skillDict = React.useMemo(() => {
    return Object.fromEntries((allSkills || []).map(s => [s.id, s]));
  }, [allSkills]);

  if (!student && !token) {
    return (
      <div style={{ padding: '60px 20px', textAlign: 'center', maxWidth: '540px', margin: '0 auto' }}>
        <PaperNote tape style={{ padding: '36px 28px' }}>
          <span className="notebook-page-marker">student study journal</span>
          <h2 style={{ fontFamily: 'var(--font-handwriting)', fontSize: '2rem', color: 'var(--ink-deep)', margin: '12px 0 6px 0' }}>
            sign in to view your journal
          </h2>
          <p style={{ fontSize: '0.88rem', color: 'var(--ink-muted)', marginBottom: '20px' }}>
            Your verified skill portfolio, deterministic role match math, and application status are stored in your secure academic ledger.
          </p>
          <NotebookButton variant="primary" onClick={() => setCurrentView('login')}>
            sign into journal →
          </NotebookButton>
        </PaperNote>
      </div>
    );
  }

  if (loading && !student) {
    return (
      <div style={{ padding: '80px 20px', textAlign: 'center' }}>
        <p style={{ fontFamily: 'var(--font-handwriting)', fontSize: '1.4rem', color: 'var(--ink-primary)' }}>
          "syncing study journal with academic ledger..." ✦
        </p>
      </div>
    );
  }

  return (
    <div className="student-dashboard" style={{ paddingTop: '24px', paddingBottom: '70px' }}>
      {/* Top Academic Journal Header */}
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
            student study journal · {student?.university || 'University Partner'}
          </span>
          <SmallCapsHeading level={1} style={{ fontSize: '2rem', color: 'var(--ink-deep)' }}>
            {student?.name || 'Student Scholar'}
          </SmallCapsHeading>
          <p style={{ fontSize: '1.18rem', color: 'var(--ink-muted)', marginTop: '2px' }}>
            {student?.degree || 'Degree Program'} · {student?.year || 'Class of 2026'}
          </p>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '6px' }}>
            <span style={{ fontSize: '1.05rem', color: 'var(--ink-deep)', fontWeight: 600 }}>
              {student?.githubVerified ? '✓ github verified' : '△ github unverified'}
            </span>
            <button
              type="button"
              onClick={onOpenGithubAudit}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--ink-primary)',
                textDecoration: 'underline',
                cursor: 'pointer',
                fontFamily: 'var(--font-handwriting)',
                fontSize: '1.05rem'
              }}
            >
              {student?.githubVerified ? 're-run audit →' : 'verify now →'}
            </button>
          </div>
        </div>

        <TrustScore score={student?.trustScore || 85} />
      </div>

      {/* Navigation Sub-Tabs in Notebook Style - Small & Refined */}
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
          onClick={() => setStudentTab('jobs')}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontFamily: 'var(--font-handwriting)',
            fontSize: '1.25rem',
            color: studentTab === 'jobs' ? 'var(--ink-deep)' : 'var(--ink-muted)',
            fontWeight: studentTab === 'jobs' ? 700 : 500,
            borderBottom: studentTab === 'jobs' ? '2px solid var(--ink-deep)' : '2px solid transparent',
            paddingBottom: '6px'
          }}
        >
          target roles & gaps (<AnimatedNumber value={jobs.length} />)
        </button>

        <button
          type="button"
          onClick={() => setStudentTab('skills')}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontFamily: 'var(--font-handwriting)',
            fontSize: '1.25rem',
            color: studentTab === 'skills' ? 'var(--ink-deep)' : 'var(--ink-muted)',
            fontWeight: studentTab === 'skills' ? 700 : 500,
            borderBottom: studentTab === 'skills' ? '2px solid var(--ink-deep)' : '2px solid transparent',
            paddingBottom: '6px'
          }}
        >
          my verified skills (<AnimatedNumber value={(student?.skills || []).length} />)
        </button>

        <button
          type="button"
          onClick={() => setStudentTab('applications')}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontFamily: 'var(--font-handwriting)',
            fontSize: '1.25rem',
            color: studentTab === 'applications' ? 'var(--ink-deep)' : 'var(--ink-muted)',
            fontWeight: studentTab === 'applications' ? 700 : 500,
            borderBottom: studentTab === 'applications' ? '2px solid var(--ink-deep)' : '2px solid transparent',
            paddingBottom: '6px'
          }}
        >
          applications tracker (<AnimatedNumber value={applications.filter(a => student && a.studentId === student.id).length} />)
        </button>
      </div>

      {/* ====================================================================
          TAB 1: TARGET ROLES & GAP EXPLORER
          ==================================================================== */}
      {studentTab === 'jobs' && (
        <div className="notebook-view-transition">
          {/* Section: Ready Now */}
          <div style={{ marginBottom: '40px' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', marginBottom: '16px' }}>
              <SmallCapsHeading level={2} style={{ fontSize: '1.4rem', color: 'var(--ink-deep)' }}>
                ready now (100% match)
              </SmallCapsHeading>
              <span style={{ fontSize: '0.85rem', color: 'var(--ink-muted)' }}>
                — roles your verified skills completely qualify for today
              </span>
            </div>

            {readyNowJobs.length === 0 ? (
              <p style={{ fontSize: '0.9rem', color: 'var(--ink-muted)', fontStyle: 'italic' }}>
                No 100% matches currently. Explore 'almost there' roles below to close your skill gaps!
              </p>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '24px' }}>
                {readyNowJobs.map(job => (
                  <JobMatch
                    key={job.id}
                    job={job}
                    onApply={() => onOpenJobApply(job)}
                    onOpenCourse={(course) => window.open(course.url, '_blank')}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Section: Almost There */}
          <div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', marginBottom: '16px' }}>
              <SmallCapsHeading level={2} style={{ fontSize: '1.4rem', color: 'var(--ink-deep)' }}>
                almost there (sorted by fewest missing skills)
              </SmallCapsHeading>
              <HandwrittenAnnotation style={{ fontSize: '1.1rem', color: 'var(--ink-primary)' }}>
                "the fastest wins come first ♡"
              </HandwrittenAnnotation>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '24px' }}>
              {almostThereJobs.map(job => (
                <JobMatch
                  key={job.id}
                  job={job}
                  onApply={() => onOpenJobApply(job)}
                  onOpenCourse={(course) => window.open(course.url, '_blank')}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ====================================================================
          TAB 2: MY SKILLS & FIXED TAXONOMY BROWSER
          ==================================================================== */}
      {studentTab === 'skills' && (
        <div className="notebook-view-transition">
          {/* Current Skills with Proficiency toggles */}
          <PaperNote style={{ marginBottom: '32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <SmallCapsHeading level={3} style={{ fontSize: '1.25rem', color: 'var(--ink-deep)' }}>
                  your active skill portfolio
                </SmallCapsHeading>
                <p style={{ fontSize: '0.85rem', color: 'var(--ink-muted)' }}>
                  Click proficiency dots to cycle: Beginner (1 dot) → Intermediate (2 dots) → Advanced (3 dots)
                </p>
              </div>

              <HandwrittenAnnotation style={{ fontSize: '1.05rem', color: 'var(--ink-primary)' }}>
                "honest self-assessment" ✦
              </HandwrittenAnnotation>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
              {(student?.skills || []).map(s => {
                const skillInfo = skillDict[s.skillId] || { name: s.skillId, color: 'lavender' };
                return (
                  <div
                    key={s.skillId}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '6px 12px',
                      borderRadius: 'var(--radius-sticker)',
                      backgroundColor: 'var(--paper-clean)',
                      border: '1px solid rgba(108, 90, 115, 0.22)'
                    }}
                  >
                    <span style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--ink-body)' }}>
                      {skillInfo.name}
                    </span>

                    {/* Proficiency Cycle Button */}
                    <button
                      type="button"
                      onClick={() => {
                        const next =
                          s.proficiency === 'beginner'
                            ? 'intermediate'
                            : s.proficiency === 'intermediate'
                            ? 'advanced'
                            : 'beginner';
                        updateSkillProficiency(s.skillId, next);
                      }}
                      title="Click to cycle proficiency"
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '2px 4px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '3px'
                      }}
                    >
                      <span className={`proficiency-dot filled`} />
                      <span className={`proficiency-dot ${s.proficiency !== 'beginner' ? 'filled' : ''}`} />
                      <span className={`proficiency-dot ${s.proficiency === 'advanced' ? 'filled' : ''}`} />
                      <span style={{ fontSize: '0.72rem', color: 'var(--ink-muted)', marginLeft: '3px' }}>
                        ({s.proficiency})
                      </span>
                    </button>

                    {/* Remove button */}
                    <button
                      type="button"
                      onClick={() => removeStudentSkill(s.skillId)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--ink-muted)',
                        cursor: 'pointer',
                        fontSize: '14px',
                        lineHeight: 1
                      }}
                      title="Remove skill"
                    >
                      ×
                    </button>
                  </div>
                );
              })}
            </div>
          </PaperNote>

          {/* Add Skills from Fixed Taxonomy (120+ Seeds) */}
          <PaperNote>
            <div style={{ marginBottom: '16px' }}>
              <SmallCapsHeading level={3} style={{ fontSize: '1.25rem', color: 'var(--ink-deep)' }}>
                browse fixed skill taxonomy (120+ skills)
              </SmallCapsHeading>
              <p style={{ fontSize: '0.85rem', color: 'var(--ink-muted)' }}>
                Select a domain category and add validated skills directly into your study journal
              </p>
            </div>

            {/* Category Filter Tabs */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '18px' }}>
              {categories.map(cat => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className="small-caps"
                  style={{
                    padding: '4px 12px',
                    borderRadius: '4px',
                    border: selectedCategory === cat ? '1px solid var(--ink-deep)' : '1px solid rgba(108, 90, 115, 0.2)',
                    backgroundColor: selectedCategory === cat ? 'var(--ink-deep)' : 'var(--paper-clean)',
                    color: selectedCategory === cat ? 'var(--paper)' : 'var(--ink-body)',
                    cursor: 'pointer',
                    fontSize: '0.78rem'
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Skills in current category */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {allSkills
                .filter(s => s.category === selectedCategory)
                .map(s => {
                  const alreadyAdded = studentSkillIds.has(s.id);
                  return (
                    <button
                      key={s.id}
                      type="button"
                      disabled={alreadyAdded}
                      onClick={() => addStudentSkill(s.id, 'intermediate')}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '6px 12px',
                        borderRadius: 'var(--radius-sticker)',
                        border: alreadyAdded
                          ? '1px dashed rgba(108, 90, 115, 0.25)'
                          : '1px solid rgba(108, 90, 115, 0.2)',
                        backgroundColor: alreadyAdded ? 'var(--lavender-pale)' : 'var(--paper-clean)',
                        color: alreadyAdded ? 'var(--ink-muted)' : 'var(--ink-body)',
                        fontSize: '0.85rem',
                        cursor: alreadyAdded ? 'default' : 'pointer',
                        transition: 'transform var(--transition-calm)'
                      }}
                    >
                      <span>{alreadyAdded ? '✓' : '+'}</span>
                      <span>{s.name}</span>
                    </button>
                  );
                })}
            </div>
          </PaperNote>
        </div>
      )}

      {/* ====================================================================
          TAB 3: APPLICATIONS TRACKER
          ==================================================================== */}
      {studentTab === 'applications' && (
        <div className="notebook-view-transition">
          <PaperNote>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <SmallCapsHeading level={3} style={{ fontSize: '1.25rem', color: 'var(--ink-deep)' }}>
              submitted applications ledger
            </SmallCapsHeading>
            <HandwrittenAnnotation style={{ fontSize: '1.1rem', color: 'var(--ink-primary)' }}>
              "status tracked across recruiter pipeline" ✦
            </HandwrittenAnnotation>
          </div>

          {applications.filter(a => student && a.studentId === student.id).length === 0 ? (
            <p style={{ fontSize: '0.9rem', color: 'var(--ink-muted)', fontStyle: 'italic' }}>
              You have not submitted any applications yet. Explore matching roles to apply!
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {applications
                .filter(a => student && a.studentId === student.id)
                .map(app => {
                  const job = jobs.find(j => j.id === app.jobId);
                  const statusColors = {
                    applied: { bg: 'var(--lavender-pale)', text: 'var(--ink-deep)', label: 'under review' },
                    shortlisted: { bg: 'var(--soft-yellow)', text: 'var(--ink-deep)', label: 'shortlisted ✓' },
                    rejected: { bg: 'var(--pastel-pink)', text: 'var(--ink-muted)', label: 'declined' },
                    placed: { bg: 'var(--pastel-green)', text: 'var(--ink-deep)', label: 'placed / offer ✓' }
                  };
                  const badge = statusColors[app.status] || statusColors.applied;

                  return (
                    <div
                      key={app.id}
                      style={{
                        padding: '16px 20px',
                        backgroundColor: 'var(--paper-clean)',
                        borderRadius: '4px',
                        border: '1px solid rgba(108, 90, 115, 0.16)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: '12px'
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <h4 className="small-caps" style={{ fontSize: '1.1rem', color: 'var(--ink-deep)' }}>
                            {job ? job.title : 'Software Role'}
                          </h4>
                          <span style={{ fontSize: '0.8rem', color: 'var(--ink-muted)' }}>
                            at {job ? job.company : 'Tech Co'}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--ink-muted)', marginTop: '4px' }}>
                          Applied on {app.appliedDate} · Match Score at application: {app.matchPercentage}%
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span
                          className="small-caps"
                          style={{
                            padding: '4px 10px',
                            borderRadius: '3px',
                            backgroundColor: badge.bg,
                            color: badge.text,
                            fontSize: '0.76rem',
                            fontWeight: 700
                          }}
                        >
                          {badge.label}
                        </span>
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </PaperNote>
        </div>
      )}
    </div>
  );
};

export default StudentDashboardView;
