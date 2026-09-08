import React, { useState } from 'react';
import { SmallCapsHeading, HandwrittenAnnotation, Highlighter } from '../components/Typography';
import { NotebookButton } from '../components/NotebookButton';
import { VerificationStamp } from '../components/VerificationStamp';
import { PaperNote } from '../components/PaperNote';
import { AnimatedNumber } from '../components/AnimatedNumber';
import { useApp } from '../context/AppContext';

export const InstitutionDashboardView = ({ onInspectCredential }) => {
  const { cohortStats, student } = useApp();

  const [pendingQueue, setPendingQueue] = useState([
    {
      id: 'ver-101',
      studentName: 'Yash Pandey',
      degree: 'B.Tech CSE',
      skillOrInternship: 'Python & Distributed Systems',
      status: 'approved',
      timestamp: '2026-09-02'
    },
    {
      id: 'ver-102',
      studentName: 'Rohan Mehta',
      degree: 'B.Tech CSE',
      skillOrInternship: 'Docker & Kubernetes Cloud Lab',
      status: 'pending',
      timestamp: '2026-09-06'
    },
    {
      id: 'ver-103',
      studentName: 'Priya Iyer',
      degree: 'B.Tech IT',
      skillOrInternship: 'PostgreSQL Relational DB Lab',
      status: 'pending',
      timestamp: '2026-09-07'
    }
  ]);

  const handleApprove = (id) => {
    setPendingQueue(prev =>
      prev.map(item => (item.id === id ? { ...item, status: 'approved' } : item))
    );
  };

  return (
    <div className="institution-dashboard notebook-view-transition" style={{ paddingTop: '24px', paddingBottom: '70px' }}>
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
            academic administration · cohort analytics journal
          </span>
          <SmallCapsHeading level={1} style={{ fontSize: '2rem', color: 'var(--ink-deep)' }}>
            Manipal University Jaipur
          </SmallCapsHeading>
          <p style={{ fontSize: '0.86rem', color: 'var(--ink-muted)', marginTop: '2px' }}>
            Faculty of Engineering · School of Computer Science & Information Technology
          </p>
        </div>

        <VerificationStamp
          status="ACCREDITED"
          id="MUJ-DEAN-2026"
          date="SEP 2026"
        />
      </div>

      {/* Cohort Placement Metrics */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
          marginBottom: '36px'
        }}
      >
        <div style={{ padding: '16px', backgroundColor: 'var(--paper-clean)', borderRadius: '4px', border: '1px solid rgba(108, 90, 115, 0.16)' }}>
          <span className="small-caps" style={{ fontSize: '1.05rem', color: 'var(--ink-muted)', fontFamily: 'var(--font-handwriting)' }}>
            enrolled senior cohort
          </span>
          <div style={{ fontSize: '2.0rem', fontWeight: 700, color: 'var(--ink-deep)', fontFamily: 'var(--font-handwriting)' }}>
            <AnimatedNumber value={cohortStats.totalStudents} /> students
          </div>
        </div>

        <div style={{ padding: '16px', backgroundColor: 'var(--paper-clean)', borderRadius: '4px', border: '1px solid rgba(108, 90, 115, 0.16)' }}>
          <span className="small-caps" style={{ fontSize: '1.05rem', color: 'var(--ink-muted)', fontFamily: 'var(--font-handwriting)' }}>
            verified academic profiles
          </span>
          <div style={{ fontSize: '2.0rem', fontWeight: 700, color: 'var(--ink-deep)', fontFamily: 'var(--font-handwriting)' }}>
            <AnimatedNumber value={cohortStats.verifiedProfiles || 0} /> (<AnimatedNumber value={cohortStats.totalStudents ? Math.round(((cohortStats.verifiedProfiles || 0) / cohortStats.totalStudents) * 100) : 0} suffix="%" />)
          </div>
        </div>

        <div style={{ padding: '16px', backgroundColor: 'var(--paper-clean)', borderRadius: '4px', border: '1px solid rgba(108, 90, 115, 0.16)' }}>
          <span className="small-caps" style={{ fontSize: '1.05rem', color: 'var(--ink-muted)', fontFamily: 'var(--font-handwriting)' }}>
            placed in industry
          </span>
          <div style={{ fontSize: '2.0rem', fontWeight: 700, color: 'var(--ink-deep)', fontFamily: 'var(--font-handwriting)' }}>
            <AnimatedNumber value={cohortStats.placedStudents} /> students
          </div>
        </div>

        <div style={{ padding: '16px', backgroundColor: 'var(--paper-clean)', borderRadius: '4px', border: '1px solid rgba(108, 90, 115, 0.16)' }}>
          <span className="small-caps" style={{ fontSize: '1.05rem', color: 'var(--ink-muted)', fontFamily: 'var(--font-handwriting)' }}>
            active verified internships
          </span>
          <div style={{ fontSize: '2.0rem', fontWeight: 700, color: 'var(--ink-deep)', fontFamily: 'var(--font-handwriting)' }}>
            <AnimatedNumber value={cohortStats.activeInternships} />
          </div>
        </div>
      </div>

      {/* ====================================================================
          1. SKILL GAP HEATMAP (Muted Palette: Lavender, Yellow, Pink, Blue)
          ==================================================================== */}
      <div style={{ marginBottom: '40px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
          <div>
            <SmallCapsHeading level={2} style={{ fontSize: '1.4rem', color: 'var(--ink-deep)' }}>
              cohort skill-gap heatmap
            </SmallCapsHeading>
            <p style={{ fontSize: '0.85rem', color: 'var(--ink-muted)' }}>
              Aggregate industry requirement deficits across 340 Computer Science students
            </p>
          </div>

          <HandwrittenAnnotation style={{ fontSize: '1.05rem', color: 'var(--ink-primary)' }}>
            "muted stationery palette — calm clarity" ✦
          </HandwrittenAnnotation>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '16px'
          }}
        >
          {(cohortStats.skillGapHeatmap || []).map((item, idx) => {
            // Muted palette background
            const bgPalette = ['var(--lavender-pale)', 'var(--soft-yellow)', 'var(--pastel-pink)', 'var(--pastel-blue)'];
            const bg = bgPalette[idx % bgPalette.length];

            return (
              <PaperNote
                key={item.skillName}
                style={{
                  padding: '18px 22px',
                  backgroundColor: 'var(--paper-clean)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <div>
                    <span className="small-caps" style={{ fontSize: '0.72rem', color: 'var(--ink-muted)' }}>
                      {item.category}
                    </span>
                    <h4 className="small-caps" style={{ fontSize: '1.1rem', color: 'var(--ink-deep)' }}>
                      {item.skillName}
                    </h4>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <span
                      style={{
                        fontFamily: 'var(--font-handwriting)',
                        fontSize: '1.6rem',
                        fontWeight: 700,
                        color: 'var(--ink-deep)',
                        lineHeight: 1
                      }}
                    >
                      <AnimatedNumber value={item.percentMissing} suffix="%" />
                    </span>
                    <span style={{ fontSize: '0.98rem', color: 'var(--ink-muted)', display: 'block', fontFamily: 'var(--font-handwriting)' }}>
                      lack skill
                    </span>
                  </div>
                </div>

                {/* Subtle muted bar with smooth width transition */}
                <div
                  style={{
                    height: '8px',
                    width: '100%',
                    backgroundColor: 'rgba(108, 90, 115, 0.1)',
                    borderRadius: '4px',
                    overflow: 'hidden',
                    marginBottom: '8px'
                  }}
                >
                  <div
                    style={{
                      height: '100%',
                      width: `${item.percentMissing}%`,
                      backgroundColor: bg,
                      borderRight: '2px solid rgba(94, 74, 104, 0.5)',
                      transition: 'width 0.8s cubic-bezier(0.16, 1, 0.3, 1)'
                    }}
                  />
                </div>

                <div style={{ fontSize: '0.78rem', color: 'var(--ink-muted)' }}>
                  {item.count} currently missing this verified requirement
                </div>
              </PaperNote>
            );
          })}
        </div>
      </div>

      {/* ====================================================================
          2. PLACEMENT FUNNEL (Notebook Process Diagram)
          ==================================================================== */}
      <div style={{ marginBottom: '40px' }}>
        <SmallCapsHeading level={2} style={{ fontSize: '1.4rem', color: 'var(--ink-deep)', marginBottom: '16px' }}>
          placement funnel process diagram
        </SmallCapsHeading>

        <PaperNote style={{ padding: '28px' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-around',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '24px',
              textAlign: 'center'
            }}
          >
            <div>
              <span className="small-caps" style={{ fontSize: '1.02rem', color: 'var(--ink-muted)', display: 'block', fontFamily: 'var(--font-handwriting)' }}>
                step 01
              </span>
              <div style={{ fontSize: '2.4rem', fontWeight: 700, color: 'var(--ink-deep)', fontFamily: 'var(--font-handwriting)' }}>
                {cohortStats.placementFunnel?.applied || 0}
              </div>
              <span className="small-caps" style={{ fontSize: '1.1rem', color: 'var(--ink-deep)', fontFamily: 'var(--font-handwriting)' }}>
                applications submitted
              </span>
            </div>

            <span style={{ fontFamily: 'var(--font-handwriting)', fontSize: '2rem', color: 'var(--ink-primary)' }}>
              ↓
            </span>

            <div>
              <span className="small-caps" style={{ fontSize: '1.02rem', color: 'var(--ink-muted)', display: 'block', fontFamily: 'var(--font-handwriting)' }}>
                step 02
              </span>
              <div style={{ fontSize: '2.4rem', fontWeight: 700, color: 'var(--ink-deep)', fontFamily: 'var(--font-handwriting)' }}>
                {cohortStats.placementFunnel?.shortlisted || 0}
              </div>
              <span className="small-caps" style={{ fontSize: '1.1rem', color: 'var(--ink-deep)', fontFamily: 'var(--font-handwriting)' }}>
                candidates shortlisted
              </span>
            </div>

            <span style={{ fontFamily: 'var(--font-handwriting)', fontSize: '2rem', color: 'var(--ink-primary)' }}>
              ↓
            </span>

            <div>
              <span className="small-caps" style={{ fontSize: '1.02rem', color: 'var(--ink-muted)', display: 'block', fontFamily: 'var(--font-handwriting)' }}>
                step 03
              </span>
              <div style={{ fontSize: '2.4rem', fontWeight: 700, color: 'var(--ink-deep)', fontFamily: 'var(--font-handwriting)' }}>
                {cohortStats.placementFunnel?.placed || 0}
              </div>
              <span className="small-caps" style={{ fontSize: '1.1rem', color: 'var(--ink-deep)', fontFamily: 'var(--font-handwriting)' }}>
                verified placed in industry
              </span>
            </div>
          </div>
        </PaperNote>
      </div>

      {/* ====================================================================
          3. STUDENT VERIFICATION QUEUE (Purple Ink Stamp Action)
          ==================================================================== */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '16px' }}>
          <SmallCapsHeading level={2} style={{ fontSize: '1.4rem', color: 'var(--ink-deep)' }}>
            institutional verification queue
          </SmallCapsHeading>
          <HandwrittenAnnotation style={{ fontSize: '1.05rem', color: 'var(--ink-primary)' }}>
            "official stamp seals student integrity" ✦
          </HandwrittenAnnotation>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {pendingQueue.map(item => (
            <div
              key={item.id}
              style={{
                padding: '16px 20px',
                backgroundColor: 'var(--paper-clean)',
                borderRadius: '4px',
                border: '1px solid rgba(108, 90, 115, 0.18)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '12px'
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <h4 className="small-caps" style={{ fontSize: '1.15rem', color: 'var(--ink-deep)' }}>
                    {item.studentName}
                  </h4>
                  <span style={{ fontSize: '0.8rem', color: 'var(--ink-muted)' }}>
                    ({item.degree})
                  </span>
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--ink-primary)', marginTop: '2px' }}>
                  Verification requested for: <strong>{item.skillOrInternship}</strong>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                {item.status === 'approved' ? (
                  <VerificationStamp
                    status="VERIFIED"
                    id={item.id}
                    date="SEP 2026"
                  />
                ) : (
                  <NotebookButton
                    variant="primary"
                    onClick={() => handleApprove(item.id)}
                    style={{ padding: '6px 14px', fontSize: '0.82rem' }}
                  >
                    stamp & verify credential →
                  </NotebookButton>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default InstitutionDashboardView;
