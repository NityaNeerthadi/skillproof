import React, { useState } from 'react';
import { SmallCapsHeading, HandwrittenAnnotation, Highlighter } from './Typography';
import { NotebookButton } from './NotebookButton';
import { SkillBadge } from './SkillBadge';
import { AnimatedNumber } from './AnimatedNumber';
import { useApp } from '../context/AppContext';

export const JobMatch = ({
  job,
  onApply,
  onOpenCourse,
  className = '',
  style = {}
}) => {
  const { allSkills, courseMap } = useApp();
  const [completedGaps, setCompletedGaps] = useState({});

  const skillDict = React.useMemo(() => {
    return Object.fromEntries(allSkills.map(s => [s.id, s]));
  }, [allSkills]);

  if (!job) {
    return (
      <div
        className={`job-match-card paper-note ${className}`}
        style={{ padding: '24px 28px', fontStyle: 'italic', color: 'var(--ink-muted)', ...style }}
      >
        No job opening selected.
      </div>
    );
  }

  const requiredSkills = job.requiredSkills || job.required_skills || [];
  const matchedSkills = job.matchedSkills || [];
  const missingSkills = job.missingSkills || [];

  // Calculate dynamic match if student toggles hypothetical checklist
  const totalRequired = requiredSkills.length;
  const currentMatchedCount = matchedSkills.length;
  const extraCheckedCount = Object.values(completedGaps).filter(Boolean).length;
  const dynamicPercentage = totalRequired > 0
    ? Math.min(100, Math.round(((currentMatchedCount + extraCheckedCount) / totalRequired) * 100))
    : (job.matchPercentage || 0);

  const toggleGapCheck = (skillId) => {
    setCompletedGaps(prev => ({
      ...prev,
      [skillId]: !prev[skillId]
    }));
  };

  const isApplied = Boolean(job.application);

  return (
    <div
      className={`job-match-card paper-note ${className}`}
      style={{
        padding: '24px 28px',
        ...style
      }}
    >
      {/* Top Header: Title, Company, Match % */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: '12px',
          marginBottom: '16px',
          borderBottom: '1px dashed rgba(108, 90, 115, 0.18)',
          paddingBottom: '16px'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span
              className="small-caps"
              style={{
                fontSize: '1.05rem',
                color: 'var(--ink-muted)',
                letterSpacing: '0.04em',
                fontFamily: 'var(--font-handwriting)'
              }}
            >
              {job.company} · {job.location}
            </span>
            <span
              style={{
                fontSize: '1.0rem',
                padding: '2px 8px',
                borderRadius: '3px',
                backgroundColor: 'var(--lavender-pale)',
                color: 'var(--ink-deep)',
                fontFamily: 'var(--font-handwriting)',
                fontWeight: 600
              }}
            >
              {job.type}
            </span>
          </div>

          <h3
            className="small-caps"
            style={{
              fontSize: '1.45rem',
              color: 'var(--ink-deep)',
              lineHeight: 1.2,
              fontFamily: 'var(--font-handwriting)'
            }}
          >
            {job.title}
          </h3>

          <div
            style={{
              fontSize: '1.15rem',
              color: 'var(--ink-primary)',
              fontWeight: 600,
              marginTop: '4px',
              fontFamily: 'var(--font-handwriting)'
            }}
          >
            {job.stipend}
          </div>
        </div>

        {/* Deterministic Match Badge */}
        <div style={{ textAlign: 'right' }}>
          <span
            className="small-caps"
            style={{
              fontSize: '1.05rem',
              color: 'var(--ink-muted)',
              letterSpacing: '0.04em',
              display: 'block',
              fontFamily: 'var(--font-handwriting)'
            }}
          >
            match score
          </span>
          <div style={{ display: 'inline-flex', alignItems: 'baseline', gap: '4px' }}>
            <span
              style={{
                fontFamily: 'var(--font-handwriting)',
                fontSize: '2.4rem',
                fontWeight: 600,
                color: dynamicPercentage === 100 ? 'var(--ink-deep)' : 'var(--ink-primary)',
                lineHeight: 1
              }}
            >
              <AnimatedNumber value={dynamicPercentage} suffix="%" />
            </span>
            {dynamicPercentage === 100 && (
              <span style={{ color: 'var(--ink-deep)', fontSize: '1.3rem' }}>✓</span>
            )}
          </div>
          <div
            style={{
              fontSize: '1.05rem',
              color: 'var(--ink-muted)',
              fontFamily: 'var(--font-handwriting)'
            }}
          >
            {matchedSkills.length + extraCheckedCount} of {totalRequired} skills matched
          </div>
        </div>
      </div>

      <p
        style={{
          fontSize: '1.12rem',
          color: 'var(--ink-body)',
          marginBottom: '20px',
          lineHeight: 1.5,
          fontFamily: 'var(--font-handwriting)'
        }}
      >
        {job.description}
      </p>

      {/* Matched Skills */}
      <div style={{ marginBottom: '16px' }}>
        <div
          className="small-caps"
          style={{
            fontSize: '1.1rem',
            color: 'var(--ink-muted)',
            letterSpacing: '0.04em',
            marginBottom: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontFamily: 'var(--font-handwriting)'
          }}
        >
          <span>✓ verified skills you have</span>
          <span style={{ fontSize: '1.05rem', opacity: 0.85 }}>({matchedSkills.length})</span>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {matchedSkills.map(skillId => {
            const skill = skillDict[skillId] || { name: skillId, color: 'lavender' };
            return (
              <SkillBadge
                key={skillId}
                name={skill.name}
                color={skill.color}
                proficiency="intermediate"
              />
            );
          })}
        </div>
      </div>

      {/* Skill Gap (Missing Skills) */}
      {missingSkills.length > 0 && (
        <div
          style={{
            marginBottom: '20px',
            paddingTop: '14px',
            borderTop: '1px dashed rgba(108, 90, 115, 0.14)'
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '10px'
            }}
          >
            <div
              className="small-caps"
              style={{
                fontSize: '1.1rem',
                color: 'var(--ink-deep)',
                letterSpacing: '0.04em',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontFamily: 'var(--font-handwriting)'
              }}
            >
              <span>△ skill gap checklist</span>
              <span style={{ fontSize: '1.02rem', color: 'var(--ink-muted)' }}>
                ({missingSkills.length} missing)
              </span>
            </div>

            <HandwrittenAnnotation style={{ fontSize: '1.15rem', color: 'var(--ink-primary)' }}>
              almost there →
            </HandwrittenAnnotation>
          </div>

          {/* Interactive Checklist to Close the Gap */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {missingSkills.map(skillId => {
              const skill = skillDict[skillId] || { name: skillId };
              const course = courseMap[skillId];
              const isChecked = Boolean(completedGaps[skillId]);

              return (
                <div
                  key={skillId}
                  className="notebook-checklist-item"
                  style={{
                    padding: '8px 12px',
                    borderRadius: '4px',
                    backgroundColor: isChecked ? 'rgba(238, 232, 242, 0.4)' : 'rgba(255, 242, 199, 0.3)',
                    border: '1px solid rgba(108, 90, 115, 0.12)'
                  }}
                >
                  <button
                    type="button"
                    className={`notebook-checkbox ${isChecked ? 'checked' : ''}`}
                    onClick={() => toggleGapCheck(skillId)}
                    aria-label={`Mark ${skill.name} studied`}
                  >
                    {isChecked ? '✓' : ''}
                  </button>

                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <Highlighter variant={isChecked ? 'lavender' : 'butter'}>
                        <span style={{ fontWeight: 600, fontSize: '1.12rem', fontFamily: 'var(--font-handwriting)' }}>{skill.name}</span>
                      </Highlighter>

                      {course && (
                        <a
                          href={course.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            fontSize: '1.05rem',
                            color: 'var(--ink-primary)',
                            textDecoration: 'none',
                            borderBottom: '1px dashed var(--ink-primary)',
                            fontFamily: 'var(--font-handwriting)'
                          }}
                          onClick={(e) => {
                            if (onOpenCourse) {
                              e.preventDefault();
                              onOpenCourse(course);
                            }
                          }}
                        >
                          → {course.title} ({course.duration})
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Action footer */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingTop: '16px',
          borderTop: '1px dashed rgba(108, 90, 115, 0.18)',
          marginTop: '12px'
        }}
      >
        <div style={{ fontSize: '0.8rem', color: 'var(--ink-muted)' }}>
          {isApplied ? (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                color: 'var(--ink-deep)',
                fontWeight: 600
              }}
            >
              ✓ Application submitted ({job.application.status})
            </span>
          ) : (
            <span style={{ fontFamily: 'var(--font-handwriting)', fontSize: '1.05rem', color: 'var(--ink-muted)' }}>
              {dynamicPercentage === 100
                ? 'you qualify today ♡'
                : `${missingSkills.length} skill${missingSkills.length > 1 ? 's' : ''} to reach 100%`}
            </span>
          )}
        </div>

        <NotebookButton
          variant={isApplied ? 'paper' : 'primary'}
          disabled={isApplied}
          onClick={() => onApply?.(job.id)}
        >
          {isApplied ? 'applied ✓' : 'apply now →'}
        </NotebookButton>
      </div>
    </div>
  );
};

export default JobMatch;
