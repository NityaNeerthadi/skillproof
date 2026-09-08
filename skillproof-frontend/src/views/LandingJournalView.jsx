import React, { useState } from 'react';
import { SmallCapsHeading, HandwrittenHeading, HandwrittenAnnotation, Highlighter } from '../components/Typography';
import { NotebookButton } from '../components/NotebookButton';
import { SkillBadge } from '../components/SkillBadge';
import { CredentialBadge } from '../components/CredentialBadge';
import { PaperNote } from '../components/PaperNote';
import { VerificationStamp } from '../components/VerificationStamp';
import { TrustScore } from '../components/TrustScore';
import { JobMatch } from '../components/JobMatch';
import { Sparkle, HeartDoodle, HandwrittenArrow, CurvedArrowDown } from '../components/HandwrittenDoodles';
import { useApp } from '../context/AppContext';

export const LandingJournalView = ({ onOpenGithubAudit, onInspectCredential, onOpenJobApply }) => {
  const { student, jobs, setCurrentView, setActiveRole } = useApp();

  // Demonstration student and job for the interactive study journal preview
  const sampleStudent = {
    name: 'Yash Pandey',
    degree: 'B.Tech Computer Science & Engineering',
    university: 'Manipal University Jaipur',
    year: 'Class of 2026',
    avatarInitials: 'YP',
    githubUsername: 'yashpandey',
    githubVerified: true,
    trustScore: 94,
    bio: 'Distributed systems & backend engineering student focused on high-throughput asynchronous services and deterministic algorithms.',
    credentials: [
      {
        id: 'SKP-2026-9942A',
        title: 'Python Core & Distributed Systems Verification',
        issuer: 'SkillProof Academic Board & MUJ',
        issueDate: 'AUG 2026',
        hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'
      }
    ]
  };

  const currentStudent = student || sampleStudent;

  const sampleJob = {
    id: 'job-demo',
    title: 'Distributed Systems Backend Intern',
    company: 'Acme Cloud Systems',
    location: 'Bangalore, India (Hybrid)',
    type: 'Internship',
    stipend: '₹50,000 / month',
    description: 'Build robust asynchronous microservices using FastAPI, Redis caching, and PostgreSQL transaction pools.',
    requiredSkills: ['python', 'fastapi', 'postgresql', 'redis'],
    matchedSkills: ['python', 'fastapi', 'postgresql'],
    missingSkills: ['redis'],
    gapCount: 1,
    matchPercentage: 75,
    application: null
  };

  const demoJob = (jobs && jobs.length > 0) ? (jobs.find(j => j.id === 'job-1') || jobs[0]) : sampleJob;

  return (
    <div className="landing-journal">
      {/* ====================================================================
          PAGE 01 · BUILD · HERO
          ==================================================================== */}
      <section
        className="notebook-section"
        style={{
          minHeight: '75vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          paddingTop: '40px',
          paddingBottom: '60px'
        }}
      >
        <div style={{ maxWidth: '820px' }}>
          {/* Subtle page marker */}
          <span className="notebook-page-marker">
            page 01 · build
          </span>

          {/* Small handwritten annotation */}
          <div style={{ marginBottom: '18px' }}>
            <HandwrittenAnnotation style={{ fontSize: '1.35rem', color: 'var(--ink-primary)' }}>
              "your journey starts here ✦"
            </HandwrittenAnnotation>
          </div>

          {/* Hero Heading: Build skills. prove them. in cursive and small */}
          <h1
            style={{
              margin: '0 0 12px 0',
              lineHeight: 1.15
            }}
          >
            <span
              style={{
                fontFamily: 'var(--font-handwriting)',
                display: 'block',
                fontSize: 'clamp(2.2rem, 4.5vw, 3.4rem)',
                fontWeight: 600,
                color: 'var(--ink-deep)',
                letterSpacing: '0.01em'
              }}
            >
              build skills.
            </span>
            <span
              className="cursive-flowing"
              style={{
                display: 'inline-block',
                fontSize: 'clamp(2.6rem, 5.5vw, 4.2rem)',
                color: 'var(--ink-primary)',
                fontWeight: 600,
                lineHeight: 1,
                transform: 'rotate(-1.5deg)',
                marginTop: '2px'
              }}
            >
              prove them.
            </span>
          </h1>

          {/* Minimal supporting tagline in cursive */}
          <p
            style={{
              fontFamily: 'var(--font-handwriting)',
              fontSize: '1.3rem',
              color: 'var(--ink-muted)',
              marginBottom: '26px',
              fontWeight: 400
            }}
          >
            learn · verify · grow
          </p>

          {/* Primary CTA button */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
            <NotebookButton
              variant="primary"
              onClick={() => {
                setCurrentView('student-dash');
                setActiveRole('student');
              }}
              style={{ fontSize: '0.88rem', padding: '10px 22px' }}
            >
              start your journey →
            </NotebookButton>

            <NotebookButton
              variant="secondary"
              onClick={() => {
                const el = document.getElementById('how-it-works');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              style={{ fontSize: '0.84rem' }}
            >
              read the journal ↓
            </NotebookButton>
          </div>

          {/* Tiny handwritten note beneath button */}
          <div style={{ marginTop: '16px' }}>
            <HandwrittenAnnotation style={{ fontSize: '1.15rem', color: 'var(--ink-primary)' }}>
              "one step at a time ♡"
            </HandwrittenAnnotation>
          </div>
        </div>
      </section>

      <div className="handdrawn-divider" />

      {/* ====================================================================
          PAGE 02 · LEARN · HOW IT WORKS
          ==================================================================== */}
      <section id="how-it-works" className="notebook-section">
        <span className="notebook-page-marker">
          page 02 · learn
        </span>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap', gap: '12px', marginBottom: '32px' }}>
          <div>
            <SmallCapsHeading level={2} style={{ fontSize: '1.8rem', color: 'var(--ink-deep)' }}>
              how skillproof works
            </SmallCapsHeading>
            <p style={{ fontSize: '0.92rem', color: 'var(--ink-muted)', marginTop: '4px' }}>
              connecting student competence to real industry requirements
            </p>
          </div>

          <HandwrittenAnnotation style={{ fontSize: '1.2rem', color: 'var(--ink-primary)' }}>
            three steps in your study notebook →
          </HandwrittenAnnotation>
        </div>

        {/* 3 Step Journal Progression Written on the Lines */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '32px'
          }}
        >
          {/* Step 01 */}
          <div style={{ position: 'relative' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', marginBottom: '8px' }}>
              <span
                style={{
                  fontFamily: 'var(--font-handwriting)',
                  fontSize: '2rem',
                  fontWeight: 700,
                  color: 'var(--ink-primary)',
                  lineHeight: 1
                }}
              >
                01
              </span>
              <SmallCapsHeading level={3} style={{ fontSize: '1.2rem' }}>
                choose your skills
              </SmallCapsHeading>
            </div>

            <p style={{ fontSize: '0.9rem', color: 'var(--ink-body)', lineHeight: 1.6 }}>
              Select verified skills from a fixed taxonomy of 120+ foundational technologies and declare your proficiency.
            </p>

            <div style={{ marginTop: '12px', display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              <SkillBadge name="Python" color="lavender" proficiency="advanced" />
              <SkillBadge name="FastAPI" color="pink" proficiency="intermediate" />
            </div>
          </div>

          {/* Step 02 */}
          <div style={{ position: 'relative' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', marginBottom: '8px' }}>
              <span
                style={{
                  fontFamily: 'var(--font-handwriting)',
                  fontSize: '2rem',
                  fontWeight: 700,
                  color: 'var(--ink-primary)',
                  lineHeight: 1
                }}
              >
                02
              </span>
              <SmallCapsHeading level={3} style={{ fontSize: '1.2rem' }}>
                prove your work
              </SmallCapsHeading>
            </div>

            <p style={{ fontSize: '0.9rem', color: 'var(--ink-body)', lineHeight: 1.6 }}>
              Connect your repositories for an automated audit or earn official university verification stamps backed by tamper-proof hashes.
            </p>

            <div style={{ marginTop: '12px' }}>
              <span
                style={{
                  fontFamily: 'var(--font-handwriting)',
                  fontSize: '1.15rem',
                  color: 'var(--ink-deep)',
                  fontWeight: 600
                }}
              >
                ✓ verified git commits + coursework
              </span>
            </div>
          </div>

          {/* Step 03 */}
          <div style={{ position: 'relative' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', marginBottom: '8px' }}>
              <span
                style={{
                  fontFamily: 'var(--font-handwriting)',
                  fontSize: '2rem',
                  fontWeight: 700,
                  color: 'var(--ink-primary)',
                  lineHeight: 1
                }}
              >
                03
              </span>
              <SmallCapsHeading level={3} style={{ fontSize: '1.2rem' }}>
                find your next step
              </SmallCapsHeading>
            </div>

            <p style={{ fontSize: '0.9rem', color: 'var(--ink-body)', lineHeight: 1.6 }}>
              Discover jobs you qualify for today, and turn missing requirements into a bite-sized study checklist with linked courses.
            </p>

            <div style={{ marginTop: '12px' }}>
              <Highlighter variant="butter">
                <span style={{ fontSize: '0.86rem', fontWeight: 600 }}>deterministic match math</span>
              </Highlighter>
            </div>
          </div>
        </div>
      </section>

      <div className="handdrawn-divider" />

      {/* ====================================================================
          PAGE 03 · VERIFY · GITHUB AUDIT PREVIEW
          ==================================================================== */}
      <section className="notebook-section">
        <span className="notebook-page-marker">
          page 03 · verify
        </span>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '28px' }}>
          <div>
            <SmallCapsHeading level={2} style={{ fontSize: '1.8rem', color: 'var(--ink-deep)' }}>
              github verification audit
            </SmallCapsHeading>
            <HandwrittenAnnotation style={{ fontSize: '1.25rem', color: 'var(--ink-primary)', marginTop: '4px' }}>
              "let's see what you've built." ✦
            </HandwrittenAnnotation>
          </div>

          <NotebookButton variant="paper" onClick={onOpenGithubAudit}>
            run interactive audit →
          </NotebookButton>
        </div>

        {/* Audit Sheet in Notebook Style */}
        <PaperNote tape style={{ maxWidth: '780px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px dashed rgba(108, 90, 115, 0.18)', paddingBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="small-caps" style={{ fontSize: '0.85rem', color: 'var(--ink-deep)' }}>
                github account:
              </span>
              <span style={{ fontFamily: 'monospace', fontSize: '0.9rem', color: 'var(--ink-primary)', fontWeight: 600 }}>
                @{currentStudent.githubUsername}
              </span>
              <span style={{ fontSize: '0.75rem', padding: '2px 8px', borderRadius: '3px', backgroundColor: 'var(--lavender-pale)', color: 'var(--ink-deep)', fontWeight: 600 }}>
                ✓ verified
              </span>
            </div>

            <span className="small-caps" style={{ fontSize: '0.74rem', color: 'var(--ink-muted)' }}>
              38 repositories analyzed
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '20px' }}>
            <div>
              <span className="small-caps" style={{ fontSize: '0.74rem', color: 'var(--ink-muted)', display: 'block' }}>
                languages detected
              </span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '6px' }}>
                <SkillBadge name="Python (58%)" color="lavender" />
                <SkillBadge name="TypeScript (24%)" color="blue" />
                <SkillBadge name="SQL (12%)" color="yellow" />
              </div>
            </div>

            <div>
              <span className="small-caps" style={{ fontSize: '0.74rem', color: 'var(--ink-muted)', display: 'block' }}>
                frameworks found
              </span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '6px' }}>
                <SkillBadge name="FastAPI" color="pink" />
                <SkillBadge name="PostgreSQL" color="yellow" />
                <SkillBadge name="React" color="blue" />
              </div>
            </div>

            <div>
              <span className="small-caps" style={{ fontSize: '0.74rem', color: 'var(--ink-muted)', display: 'block' }}>
                activity integrity
              </span>
              <div style={{ marginTop: '6px', fontSize: '0.86rem', color: 'var(--ink-deep)', fontWeight: 600 }}>
                1,420+ commits in past 12m
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--ink-muted)' }}>
                dependencies verified
              </div>
            </div>
          </div>

          <div style={{ textAlign: 'center', paddingTop: '12px', borderTop: '1px dashed rgba(108, 90, 115, 0.16)' }}>
            <p
              style={{
                fontFamily: 'var(--font-handwriting)',
                fontSize: '1.55rem',
                color: 'var(--ink-deep)',
                fontWeight: 600
              }}
            >
              "your work speaks for you." ♡
            </p>
          </div>
        </PaperNote>
      </section>

      <div className="handdrawn-divider" />

      {/* ====================================================================
          PAGE 04 · PROVE · STUDENT PROFILE
          ==================================================================== */}
      <section className="notebook-section">
        <span className="notebook-page-marker">
          page 04 · prove
        </span>

        <div style={{ marginBottom: '28px' }}>
          <SmallCapsHeading level={2} style={{ fontSize: '1.8rem', color: 'var(--ink-deep)' }}>
            student academic profile
          </SmallCapsHeading>
          <p style={{ fontSize: '0.92rem', color: 'var(--ink-muted)', marginTop: '4px' }}>
            an academic journal page showcasing real competence
          </p>
        </div>

        {/* Student Profile Card (Yash Pandey) */}
        <PaperNote tilt="left" style={{ maxWidth: '860px', padding: '32px' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              flexWrap: 'wrap',
              gap: '20px',
              marginBottom: '24px',
              borderBottom: '1px dashed rgba(108, 90, 115, 0.18)',
              paddingBottom: '20px'
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '8px' }}>
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--lavender-pale)',
                    border: '1.5px solid rgba(108, 90, 115, 0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: 'var(--font-ui)',
                    fontWeight: 700,
                    color: 'var(--ink-deep)',
                    fontSize: '1.1rem'
                  }}
                >
                  {currentStudent.avatarInitials}
                </div>

                <div>
                  <h3
                    style={{
                      fontFamily: 'var(--font-ui)',
                      fontSize: '1.6rem',
                      fontWeight: 700,
                      color: 'var(--ink-deep)',
                      lineHeight: 1.15
                    }}
                  >
                    {currentStudent.name}
                  </h3>
                  <div className="small-caps" style={{ fontSize: '0.8rem', color: 'var(--ink-muted)' }}>
                    {currentStudent.degree} · {currentStudent.university}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '8px' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--ink-deep)', fontWeight: 600 }}>
                  ✓ github verified
                </span>
                <span style={{ color: 'var(--ink-muted)', fontSize: '0.8rem' }}>·</span>
                <span style={{ fontSize: '0.78rem', color: 'var(--ink-muted)' }}>
                  {currentStudent.year}
                </span>
              </div>
            </div>

            <TrustScore score={currentStudent.trustScore} />
          </div>

          {/* Bio note */}
          <p
            style={{
              fontSize: '0.92rem',
              color: 'var(--ink-body)',
              fontStyle: 'italic',
              marginBottom: '24px',
              lineHeight: 1.6
            }}
          >
            "{currentStudent.bio}"
          </p>

          {/* Verified Skills stickers */}
          <div style={{ marginBottom: '24px' }}>
            <span
              className="small-caps"
              style={{
                fontSize: '0.76rem',
                color: 'var(--ink-muted)',
                letterSpacing: '0.1em',
                display: 'block',
                marginBottom: '10px'
              }}
            >
              verified skills · fixed taxonomy
            </span>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              <SkillBadge name="Python" color="lavender" proficiency="advanced" />
              <SkillBadge name="Docker" color="blue" proficiency="intermediate" />
              <SkillBadge name="SQL" color="yellow" proficiency="intermediate" />
              <SkillBadge name="FastAPI" color="pink" proficiency="advanced" />
              <SkillBadge name="PostgreSQL" color="yellow" proficiency="intermediate" />
              <SkillBadge name="Git" color="lavender" proficiency="intermediate" />
            </div>
          </div>

          {/* Verified Academic Credentials */}
          <div>
            <span
              className="small-caps"
              style={{
                fontSize: '0.76rem',
                color: 'var(--ink-muted)',
                letterSpacing: '0.1em',
                display: 'block',
                marginBottom: '10px'
              }}
            >
              verified credentials slips
            </span>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
              {(currentStudent.credentials || []).map(cred => (
                <CredentialBadge
                  key={cred.id}
                  title={cred.title}
                  issuer={cred.issuer}
                  issueDate={cred.issueDate}
                  id={cred.id}
                  hash={cred.hash}
                  onInspect={() => onInspectCredential(cred)}
                />
              ))}
            </div>
          </div>
        </PaperNote>
      </section>

      <div className="handdrawn-divider" />

      {/* ====================================================================
          PAGE 05 · MATCH · RECRUITER MATCHING
          ==================================================================== */}
      <section className="notebook-section">
        <span className="notebook-page-marker">
          page 05 · match
        </span>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap', gap: '12px', marginBottom: '28px' }}>
          <div>
            <SmallCapsHeading level={2} style={{ fontSize: '1.8rem', color: 'var(--ink-deep)' }}>
              deterministic job matching & study checklist
            </SmallCapsHeading>
            <p style={{ fontSize: '0.92rem', color: 'var(--ink-muted)', marginTop: '4px' }}>
              transparent set-intersection logic — no mysterious black-box AI
            </p>
          </div>

          <HandwrittenAnnotation style={{ fontSize: '1.15rem', color: 'var(--ink-primary)' }}>
            "interactive checklist: tick to close gap" ✦
          </HandwrittenAnnotation>
        </div>

        {/* Interactive Job Match demo card */}
        <div style={{ maxWidth: '860px' }}>
          <JobMatch
            job={demoJob}
            onApply={(jobId) => onOpenJobApply(demoJob)}
            onOpenCourse={(course) => window.open(course.url, '_blank')}
          />
        </div>
      </section>

      <div className="handdrawn-divider" />

      {/* ====================================================================
          PAGE 06 · CREDENTIALS · CERTIFICATE VERIFICATION
          ==================================================================== */}
      <section className="notebook-section">
        <span className="notebook-page-marker">
          page 06 · credentials
        </span>

        <div style={{ marginBottom: '28px' }}>
          <SmallCapsHeading level={2} style={{ fontSize: '1.8rem', color: 'var(--ink-deep)' }}>
            university document verification
          </SmallCapsHeading>
          <p style={{ fontSize: '0.92rem', color: 'var(--ink-muted)', marginTop: '4px' }}>
            cryptographic integrity with realistic purple ink validation stamp
          </p>
        </div>

        <PaperNote style={{ maxWidth: '820px', padding: '30px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px', marginBottom: '20px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                <span className="small-caps" style={{ fontSize: '0.78rem', color: 'var(--ink-muted)' }}>
                  credential registry query
                </span>
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--ink-deep)' }}>
                  SKP-2026-9942A
                </span>
              </div>

              <h3 className="small-caps" style={{ fontSize: '1.3rem', color: 'var(--ink-deep)' }}>
                Python Core & Distributed Systems Verification
              </h3>

              <p style={{ fontSize: '0.88rem', color: 'var(--ink-body)', marginTop: '4px' }}>
                Issued by SkillProof Academic Board & Manipal University Jaipur
              </p>
            </div>

            <VerificationStamp
              status="VERIFIED"
              id="SKP-2026-9942A"
              date="AUG 2026"
            />
          </div>

          {/* Hash line */}
          <div
            style={{
              padding: '12px 14px',
              backgroundColor: 'var(--paper-clean)',
              borderRadius: '4px',
              border: '1px dashed rgba(108, 90, 115, 0.18)',
              marginBottom: '18px'
            }}
          >
            <span className="small-caps" style={{ fontSize: '0.72rem', color: 'var(--ink-muted)', display: 'block' }}>
              sha-256 integrity hash:
            </span>
            <code style={{ fontSize: '0.78rem', color: 'var(--ink-primary)', wordBreak: 'break-all' }}>
              e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855
            </code>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <HandwrittenAnnotation style={{ fontSize: '1.1rem', color: 'var(--ink-primary)' }}>
              "verified on ledger without intermediaries" ✦
            </HandwrittenAnnotation>

            <NotebookButton
              variant="secondary"
              onClick={() => onInspectCredential(currentStudent.credentials?.[0])}
            >
              inspect full certificate →
            </NotebookButton>
          </div>
        </PaperNote>
      </section>

      <div className="handdrawn-divider" />

      {/* ====================================================================
          PAGE 07 · GROW · FINAL CALL TO ACTION
          ==================================================================== */}
      <section
        className="notebook-section"
        style={{
          textAlign: 'center',
          padding: '80px 0 100px 0'
        }}
      >
        <span className="notebook-page-marker">
          page 07 · grow
        </span>

        <div style={{ maxWidth: '640px', margin: '0 auto' }}>
          <h2
            style={{
              marginBottom: '16px',
              lineHeight: 1.2
            }}
          >
            <span
              className="small-caps"
              style={{
                display: 'block',
                fontSize: 'clamp(2rem, 4vw, 3rem)',
                color: 'var(--ink-deep)',
                fontWeight: 700
              }}
            >
              ready to write your
            </span>
            <span
              className="cursive-flowing"
              style={{
                display: 'inline-block',
                fontSize: 'clamp(2.5rem, 5vw, 3.8rem)',
                color: 'var(--ink-primary)',
                fontWeight: 600,
                transform: 'rotate(-1deg)'
              }}
            >
              next chapter?
            </span>
          </h2>

          <p
            style={{
              fontSize: '1rem',
              color: 'var(--ink-muted)',
              marginBottom: '32px'
            }}
          >
            Step inside your study journal. Pick your skills, audit your work, and let your code tell your story.
          </p>

          <NotebookButton
            variant="primary"
            onClick={() => {
              setCurrentView('student-dash');
              setActiveRole('student');
            }}
            style={{ fontSize: '1.1rem', padding: '14px 34px' }}
          >
            start your journey →
          </NotebookButton>

          <div style={{ marginTop: '24px' }}>
            <HandwrittenAnnotation style={{ fontSize: '1.25rem', color: 'var(--ink-primary)' }}>
              "skills tell stories" ✦ Yash Pandey & SkillProof
            </HandwrittenAnnotation>
          </div>
        </div>
      </section>

      {/* Footer Page Counter */}
      <footer
        style={{
          borderTop: '1px dashed rgba(108, 90, 115, 0.18)',
          padding: '24px 0 36px 0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          fontSize: '0.82rem',
          color: 'var(--ink-muted)'
        }}
      >
        <span className="small-caps">
          skillproof academic journal · page 1 of 1
        </span>

        <span style={{ fontFamily: 'var(--font-handwriting)', fontSize: '1.05rem', color: 'var(--ink-deep)' }}>
          warm paper · quiet focus · honest proof
        </span>

        <div style={{ display: 'flex', gap: '16px' }}>
          <span
            onClick={() => setCurrentView('student-dash')}
            style={{ cursor: 'pointer', borderBottom: '1px dashed var(--ink-muted)' }}
          >
            students
          </span>
          <span
            onClick={() => setCurrentView('recruiter-dash')}
            style={{ cursor: 'pointer', borderBottom: '1px dashed var(--ink-muted)' }}
          >
            recruiters
          </span>
          <span
            onClick={() => setCurrentView('institution-dash')}
            style={{ cursor: 'pointer', borderBottom: '1px dashed var(--ink-muted)' }}
          >
            universities
          </span>
        </div>
      </footer>
    </div>
  );
};

export default LandingJournalView;
