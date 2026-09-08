import React, { useState, useMemo } from 'react';
import { SmallCapsHeading, HandwrittenAnnotation, Highlighter } from '../components/Typography';
import { NotebookButton } from '../components/NotebookButton';
import { VerificationStamp } from '../components/VerificationStamp';
import { PaperNote } from '../components/PaperNote';
import { AnimatedNumber } from '../components/AnimatedNumber';
import { TrustScore } from '../components/TrustScore';
import { CertificateVerifierView } from './CertificateVerifierView';
import { useApp } from '../context/AppContext';

const DEFAULT_MONITORED_STUDENTS = [
  {
    id: 'stu-101',
    name: 'Aarav Sharma',
    email: 'aarav.sharma@jaipur.manipal.edu',
    department: 'Computer Science',
    batch: '2026',
    trust_score: 94,
    skills: ['Python', 'FastAPI', 'PostgreSQL', 'Docker'],
    applications_count: 5,
    placement_status: 'placed',
    is_verified: true,
    github_verified: true
  },
  {
    id: 'stu-102',
    name: 'Priya Iyer',
    email: 'priya.iyer@jaipur.manipal.edu',
    department: 'Information Technology',
    batch: '2026',
    trust_score: 89,
    skills: ['React', 'TypeScript', 'Tailwind CSS', 'Next.js'],
    applications_count: 4,
    placement_status: 'shortlisted',
    is_verified: true,
    github_verified: true
  },
  {
    id: 'stu-103',
    name: 'Rohan Mehta',
    email: 'rohan.mehta@jaipur.manipal.edu',
    department: 'Computer Science',
    batch: '2026',
    trust_score: 82,
    skills: ['Docker', 'Kubernetes', 'AWS', 'Linux / Bash'],
    applications_count: 3,
    placement_status: 'applied',
    is_verified: false,
    github_verified: true
  },
  {
    id: 'stu-104',
    name: 'Ananya Verma',
    email: 'ananya.verma@jaipur.manipal.edu',
    department: 'Data Science',
    batch: '2026',
    trust_score: 91,
    skills: ['PyTorch', 'Pandas', 'NumPy', 'Python'],
    applications_count: 6,
    placement_status: 'placed',
    is_verified: true,
    github_verified: true
  },
  {
    id: 'stu-105',
    name: 'Vikram Patel',
    email: 'vikram.patel@jaipur.manipal.edu',
    department: 'Computer Science',
    batch: '2026',
    trust_score: 74,
    skills: ['Node.js', 'Express', 'MongoDB'],
    applications_count: 2,
    placement_status: 'applied',
    is_verified: false,
    github_verified: false
  },
  {
    id: 'stu-106',
    name: 'Neha Gupta',
    email: 'neha.gupta@jaipur.manipal.edu',
    department: 'Information Technology',
    batch: '2026',
    trust_score: 86,
    skills: ['Java', 'Spring Boot', 'MySQL', 'REST APIs'],
    applications_count: 4,
    placement_status: 'shortlisted',
    is_verified: true,
    github_verified: true
  }
];

export const InstitutionDashboardView = ({ onInspectCredential }) => {
  const {
    cohortStats,
    adminTab,
    setAdminTab,
    adminStudents,
    verifyStudentProfile
  } = useApp();

  const [studentSearch, setStudentSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'placed' | 'shortlisted' | 'applied' | 'unverified'
  const [locallyVerified, setLocallyVerified] = useState({});

  const [pendingQueue, setPendingQueue] = useState([
    {
      id: 'ver-101',
      studentName: 'Aarav Sharma',
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

  const handleApproveQueueItem = (id) => {
    setPendingQueue(prev =>
      prev.map(item => (item.id === id ? { ...item, status: 'approved' } : item))
    );
  };

  const handleVerifyStudent = async (studentId) => {
    setLocallyVerified(prev => ({ ...prev, [studentId]: true }));
    if (verifyStudentProfile) {
      await verifyStudentProfile(studentId);
    }
  };

  const effectiveStudents = useMemo(() => {
    const list = (adminStudents && adminStudents.length > 0) ? adminStudents : DEFAULT_MONITORED_STUDENTS;
    return list.map(s => (locallyVerified[s.id] ? { ...s, is_verified: true } : s));
  }, [adminStudents, locallyVerified]);

  const filteredStudents = useMemo(() => {
    return effectiveStudents.filter(student => {
      const q = studentSearch.trim().toLowerCase();
      const matchesSearch =
        !q ||
        (student.name || '').toLowerCase().includes(q) ||
        (student.email || '').toLowerCase().includes(q) ||
        (student.skills || []).some(s => {
          const sName = typeof s === 'string' ? s : (s.name || s.skill_id || '');
          return sName.toLowerCase().includes(q);
        });

      if (!matchesSearch) return false;

      if (statusFilter === 'placed') return student.placement_status === 'placed';
      if (statusFilter === 'shortlisted') return student.placement_status === 'shortlisted';
      if (statusFilter === 'applied') return student.placement_status === 'applied';
      if (statusFilter === 'unverified') return !student.is_verified;
      return true;
    });
  }, [effectiveStudents, studentSearch, statusFilter]);

  const verifiedCount = effectiveStudents.filter(s => s.is_verified).length;
  const placedCount = effectiveStudents.filter(s => s.placement_status === 'placed').length;
  const avgTrustScore = effectiveStudents.length > 0
    ? Math.round(effectiveStudents.reduce((acc, s) => acc + (s.trust_score || 85), 0) / effectiveStudents.length)
    : 85;

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

      {/* Institution Navigation Sub-Tabs */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '20px',
          marginBottom: '28px',
          borderBottom: '1px dashed rgba(108, 90, 115, 0.16)',
          paddingBottom: '6px',
          flexWrap: 'wrap'
        }}
      >
        <button
          type="button"
          onClick={() => setAdminTab('analytics')}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontFamily: 'var(--font-handwriting)',
            fontSize: '1.25rem',
            color: adminTab === 'analytics' ? 'var(--ink-deep)' : 'var(--ink-muted)',
            fontWeight: adminTab === 'analytics' ? 600 : 400,
            borderBottom: adminTab === 'analytics' ? '2px solid var(--ink-deep)' : '2px solid transparent',
            paddingBottom: '6px'
          }}
        >
          cohort heatmap & analytics
        </button>

        <button
          type="button"
          onClick={() => setAdminTab('students')}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontFamily: 'var(--font-handwriting)',
            fontSize: '1.25rem',
            color: adminTab === 'students' ? 'var(--ink-deep)' : 'var(--ink-muted)',
            fontWeight: adminTab === 'students' ? 600 : 400,
            borderBottom: adminTab === 'students' ? '2px solid var(--ink-deep)' : '2px solid transparent',
            paddingBottom: '6px'
          }}
        >
          student monitoring roster (<AnimatedNumber value={effectiveStudents.length} />)
        </button>

        <button
          type="button"
          onClick={() => setAdminTab('verify')}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontFamily: 'var(--font-handwriting)',
            fontSize: '1.25rem',
            color: adminTab === 'verify' ? 'var(--ink-deep)' : 'var(--ink-muted)',
            fontWeight: adminTab === 'verify' ? 600 : 400,
            borderBottom: adminTab === 'verify' ? '2px solid var(--ink-deep)' : '2px solid transparent',
            paddingBottom: '6px'
          }}
        >
          verify academic credentials
        </button>
      </div>

      {/* ====================================================================
          TAB 1: COHORT HEATMAP & ANALYTICS
          ==================================================================== */}
      {adminTab === 'analytics' && (
        <div className="notebook-view-transition">
          {/* Cohort Placement Metrics */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '16px',
              marginBottom: '36px'
            }}
          >
            <div className="notebook-metric-card">
              <span className="small-caps" style={{ fontSize: '1.08rem', color: 'var(--ink-muted)', fontFamily: 'var(--font-handwriting)' }}>
                enrolled senior cohort
              </span>
              <div style={{ fontSize: '2.0rem', fontWeight: 600, color: 'var(--ink-deep)', fontFamily: 'var(--font-handwriting)' }}>
                <AnimatedNumber value={cohortStats?.totalStudents || 340} /> students
              </div>
            </div>

            <div className="notebook-metric-card">
              <span className="small-caps" style={{ fontSize: '1.08rem', color: 'var(--ink-muted)', fontFamily: 'var(--font-handwriting)' }}>
                verified academic profiles
              </span>
              <div style={{ fontSize: '2.0rem', fontWeight: 600, color: 'var(--ink-deep)', fontFamily: 'var(--font-handwriting)' }}>
                <AnimatedNumber value={cohortStats?.verifiedProfiles || verifiedCount || 215} /> (<AnimatedNumber value={cohortStats?.totalStudents ? Math.round(((cohortStats.verifiedProfiles || verifiedCount || 215) / cohortStats.totalStudents) * 100) : 63} suffix="%" />)
              </div>
            </div>

            <div className="notebook-metric-card">
              <span className="small-caps" style={{ fontSize: '1.08rem', color: 'var(--ink-muted)', fontFamily: 'var(--font-handwriting)' }}>
                placed in industry
              </span>
              <div style={{ fontSize: '2.0rem', fontWeight: 600, color: 'var(--ink-deep)', fontFamily: 'var(--font-handwriting)' }}>
                <AnimatedNumber value={cohortStats?.placedStudents || placedCount || 88} /> students
              </div>
            </div>

            <div className="notebook-metric-card">
              <span className="small-caps" style={{ fontSize: '1.08rem', color: 'var(--ink-muted)', fontFamily: 'var(--font-handwriting)' }}>
                active verified internships
              </span>
              <div style={{ fontSize: '2.0rem', fontWeight: 600, color: 'var(--ink-deep)', fontFamily: 'var(--font-handwriting)' }}>
                <AnimatedNumber value={cohortStats?.activeInternships || 42} />
              </div>
            </div>
          </div>

          {/* Skill Gap Heatmap */}
          <div style={{ marginBottom: '40px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
              <div>
                <SmallCapsHeading level={2} style={{ fontSize: '1.4rem', color: 'var(--ink-deep)' }}>
                  cohort skill-gap heatmap
                </SmallCapsHeading>
                <p style={{ fontSize: '0.85rem', color: 'var(--ink-muted)' }}>
                  aggregate industry requirement deficits across 340 computer science students
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
              {(cohortStats?.skillGapHeatmap || []).map((item, idx) => {
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
                            fontWeight: 600,
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

          {/* Placement Funnel Process Diagram */}
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
                  <div style={{ fontSize: '2.4rem', fontWeight: 600, color: 'var(--ink-deep)', fontFamily: 'var(--font-handwriting)' }}>
                    <AnimatedNumber value={cohortStats?.placementFunnel?.applied || 280} />
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
                  <div style={{ fontSize: '2.4rem', fontWeight: 600, color: 'var(--ink-deep)', fontFamily: 'var(--font-handwriting)' }}>
                    <AnimatedNumber value={cohortStats?.placementFunnel?.shortlisted || 142} />
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
                  <div style={{ fontSize: '2.4rem', fontWeight: 600, color: 'var(--ink-deep)', fontFamily: 'var(--font-handwriting)' }}>
                    <AnimatedNumber value={cohortStats?.placementFunnel?.placed || 88} />
                  </div>
                  <span className="small-caps" style={{ fontSize: '1.1rem', color: 'var(--ink-deep)', fontFamily: 'var(--font-handwriting)' }}>
                    verified placed in industry
                  </span>
                </div>
              </div>
            </PaperNote>
          </div>
        </div>
      )}

      {/* ====================================================================
          TAB 2: STUDENT MONITORING ROSTER (Admins Monitor Cohort Students)
          ==================================================================== */}
      {adminTab === 'students' && (
        <div className="notebook-view-transition">
          {/* Summary Metric Cards on Ruled Notebook Paper */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '16px',
              marginBottom: '28px'
            }}
          >
            <div className="notebook-metric-card">
              <span className="small-caps" style={{ fontSize: '1.08rem', color: 'var(--ink-muted)', fontFamily: 'var(--font-handwriting)' }}>
                monitored cohort students
              </span>
              <div style={{ fontSize: '2.0rem', fontWeight: 600, color: 'var(--ink-deep)', fontFamily: 'var(--font-handwriting)' }}>
                <AnimatedNumber value={effectiveStudents.length} />
              </div>
            </div>

            <div className="notebook-metric-card">
              <span className="small-caps" style={{ fontSize: '1.08rem', color: 'var(--ink-muted)', fontFamily: 'var(--font-handwriting)' }}>
                verified academic ledgers
              </span>
              <div style={{ fontSize: '2.0rem', fontWeight: 600, color: 'var(--ink-deep)', fontFamily: 'var(--font-handwriting)' }}>
                <AnimatedNumber value={verifiedCount} /> (<AnimatedNumber value={Math.round((verifiedCount / (effectiveStudents.length || 1)) * 100)} suffix="%" />)
              </div>
            </div>

            <div className="notebook-metric-card">
              <span className="small-caps" style={{ fontSize: '1.08rem', color: 'var(--ink-muted)', fontFamily: 'var(--font-handwriting)' }}>
                placed in industry
              </span>
              <div style={{ fontSize: '2.0rem', fontWeight: 600, color: 'var(--ink-deep)', fontFamily: 'var(--font-handwriting)' }}>
                <AnimatedNumber value={placedCount} /> students
              </div>
            </div>

            <div className="notebook-metric-card">
              <span className="small-caps" style={{ fontSize: '1.08rem', color: 'var(--ink-muted)', fontFamily: 'var(--font-handwriting)' }}>
                average trust score
              </span>
              <div style={{ fontSize: '2.0rem', fontWeight: 600, color: 'var(--ink-deep)', fontFamily: 'var(--font-handwriting)' }}>
                <AnimatedNumber value={avgTrustScore} /> / 100
              </div>
            </div>
          </div>

          {/* Search & Filter Bar on Stationery Ruled Line */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '16px',
              marginBottom: '24px',
              padding: '16px 20px',
              backgroundColor: 'var(--paper-clean)',
              borderRadius: '4px',
              border: '1px solid rgba(108, 90, 115, 0.18)'
            }}
          >
            {/* Search Input in Notebook Handwriting */}
            <div style={{ flex: '1 1 280px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '1.1rem', color: 'var(--ink-muted)', fontFamily: 'var(--font-handwriting)' }}>
                search scholar:
              </span>
              <input
                type="text"
                value={studentSearch}
                onChange={(e) => setStudentSearch(e.target.value)}
                placeholder="search by name, email, or skill..."
                style={{
                  flex: 1,
                  background: 'transparent',
                  border: 'none',
                  borderBottom: '1px dashed rgba(108, 90, 115, 0.4)',
                  padding: '4px 8px',
                  fontFamily: 'var(--font-handwriting)',
                  fontSize: '1.15rem',
                  color: 'var(--ink-deep)',
                  outline: 'none'
                }}
              />
            </div>

            {/* Filter Pills */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              {[
                { id: 'all', label: 'all scholars' },
                { id: 'placed', label: 'placed' },
                { id: 'shortlisted', label: 'shortlisted' },
                { id: 'applied', label: 'interviewing' },
                { id: 'unverified', label: 'needs verification' }
              ].map(tab => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setStatusFilter(tab.id)}
                  style={{
                    background: statusFilter === tab.id ? 'var(--lavender-pale)' : 'transparent',
                    border: '1px solid rgba(108, 90, 115, 0.25)',
                    borderRadius: '3px',
                    padding: '3px 10px',
                    fontFamily: 'var(--font-handwriting)',
                    fontSize: '1.05rem',
                    cursor: 'pointer',
                    color: statusFilter === tab.id ? 'var(--ink-deep)' : 'var(--ink-muted)',
                    fontWeight: statusFilter === tab.id ? 600 : 400
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Student Monitoring Roster Cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {filteredStudents.length === 0 ? (
              <PaperNote style={{ padding: '32px', textAlign: 'center' }}>
                <p style={{ fontFamily: 'var(--font-handwriting)', fontSize: '1.3rem', color: 'var(--ink-muted)' }}>
                  no students match the selected filter criteria.
                </p>
              </PaperNote>
            ) : (
              filteredStudents.map(student => {
                const skillsList = Array.isArray(student.skills)
                  ? student.skills.map(s => (typeof s === 'string' ? s : (s.name || s.skill_id || 'Skill')))
                  : [];

                const isVerified = student.is_verified || locallyVerified[student.id];

                let statusBadgeBg = 'var(--lavender-pale)';
                let statusBadgeText = 'var(--ink-deep)';
                let statusLabel = 'seeking opportunities';

                if (student.placement_status === 'placed') {
                  statusBadgeBg = 'rgba(76, 175, 80, 0.15)';
                  statusBadgeText = '#2e7d32';
                  statusLabel = 'placed in industry';
                } else if (student.placement_status === 'shortlisted') {
                  statusBadgeBg = 'var(--soft-yellow)';
                  statusBadgeText = 'var(--ink-deep)';
                  statusLabel = 'shortlisted candidate';
                } else if (student.placement_status === 'applied') {
                  statusBadgeBg = 'var(--pastel-blue)';
                  statusBadgeText = 'var(--ink-deep)';
                  statusLabel = 'actively interviewing';
                }

                return (
                  <PaperNote
                    key={student.id}
                    style={{
                      padding: '20px 24px',
                      backgroundColor: 'var(--paper-clean)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: '16px'
                    }}
                  >
                    {/* Left Details */}
                    <div style={{ flex: '1 1 320px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                        <h3
                          style={{
                            fontFamily: 'var(--font-handwriting)',
                            fontSize: '1.6rem',
                            color: 'var(--ink-deep)',
                            margin: 0
                          }}
                        >
                          {student.name}
                        </h3>
                        <span
                          style={{
                            fontSize: '0.98rem',
                            padding: '2px 8px',
                            borderRadius: '3px',
                            backgroundColor: statusBadgeBg,
                            color: statusBadgeText,
                            fontFamily: 'var(--font-handwriting)',
                            fontWeight: 600
                          }}
                        >
                          {statusLabel}
                        </span>
                      </div>

                      <p style={{ fontSize: '1.05rem', color: 'var(--ink-muted)', marginTop: '4px', marginBottom: '8px', fontFamily: 'var(--font-handwriting)' }}>
                        {student.department || 'Computer Science'} · batch {student.batch || '2026'} · {student.email}
                      </p>

                      {/* Verified Skills Tag Pills */}
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '6px' }}>
                        {skillsList.map((skillName, sIdx) => {
                          const tagBgs = ['var(--lavender-pale)', 'var(--soft-yellow)', 'var(--pastel-pink)', 'var(--pastel-blue)'];
                          const tagBg = tagBgs[sIdx % tagBgs.length];

                          return (
                            <span
                              key={skillName + sIdx}
                              style={{
                                fontSize: '0.95rem',
                                padding: '1px 8px',
                                borderRadius: '3px',
                                backgroundColor: tagBg,
                                color: 'var(--ink-deep)',
                                fontFamily: 'var(--font-handwriting)'
                              }}
                            >
                              {skillName}
                            </span>
                          );
                        })}
                      </div>
                    </div>

                    {/* Middle: Trust Score */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <div style={{ textAlign: 'center' }}>
                        <span style={{ fontSize: '0.95rem', color: 'var(--ink-muted)', display: 'block', fontFamily: 'var(--font-handwriting)' }}>
                          trust score
                        </span>
                        <TrustScore score={student.trust_score || 85} />
                      </div>
                    </div>

                    {/* Right: Administrative Stamp / Verification Action */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      {isVerified ? (
                        <VerificationStamp
                          status="VERIFIED"
                          id={student.id.replace('stu-', 'MUJ-')}
                          date="SEP 2026"
                        />
                      ) : (
                        <NotebookButton
                          variant="primary"
                          onClick={() => handleVerifyStudent(student.id)}
                          style={{ padding: '8px 16px', fontSize: '0.85rem' }}
                        >
                          stamp & verify profile →
                        </NotebookButton>
                      )}
                    </div>
                  </PaperNote>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ====================================================================
          TAB 3: VERIFY ACADEMIC CREDENTIALS (Verifier & Approval Queue)
          ==================================================================== */}
      {adminTab === 'verify' && (
        <div className="notebook-view-transition">
          {/* Embedded Certificate Verifier */}
          <div style={{ marginBottom: '40px' }}>
            <CertificateVerifierView onInspectCredential={onInspectCredential} />
          </div>

          {/* Institutional Verification Queue (Seal Action) */}
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
                      verification requested for: <strong>{item.skillOrInternship}</strong>
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
                        onClick={() => handleApproveQueueItem(item.id)}
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
      )}
    </div>
  );
};

export default InstitutionDashboardView;
