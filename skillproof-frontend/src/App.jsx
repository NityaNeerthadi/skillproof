import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { NotebookBackground } from './components/NotebookBackground';
import { NotebookNavigation } from './components/NotebookNavigation';
import { LandingJournalView } from './views/LandingJournalView';
import { StudentDashboardView } from './views/StudentDashboardView';
import { RecruiterDashboardView } from './views/RecruiterDashboardView';
import { InstitutionDashboardView } from './views/InstitutionDashboardView';
import { CertificateVerifierView } from './views/CertificateVerifierView';
import { LoginPageView } from './views/LoginPageView';
import { GithubAuditModal } from './views/GithubAuditModal';
import { CertificateModal } from './views/CertificateModal';
import { JobApplyModal } from './views/JobApplyModal';
import { CreateJobModal } from './views/CreateJobModal';

function AppContent() {
  const { currentView, setCurrentView, currentUser, isCreateJobOpen, setIsCreateJobOpen } = useApp();

  // Global Modal States
  const [isGithubModalOpen, setIsGithubModalOpen] = useState(false);
  const [selectedJobToApply, setSelectedJobToApply] = useState(null);
  const [inspectedCredential, setInspectedCredential] = useState(null);

  // Role Protection: Ensure users strictly see their designated role views
  useEffect(() => {
    if (!currentUser) return;
    if (currentUser.role === 'student') {
      if (currentView !== 'student-dash') setCurrentView('student-dash');
    } else if (currentUser.role === 'recruiter') {
      if (currentView !== 'recruiter-dash') setCurrentView('recruiter-dash');
    } else if (currentUser.role === 'admin' || currentUser.role === 'institution') {
      if (currentView !== 'institution-dash') setCurrentView('institution-dash');
    }
  }, [currentUser, currentView, setCurrentView]);

  return (
    <NotebookBackground>
      {/* Stationery Notebook Header Navigation */}
      <NotebookNavigation />

      {/* Render active view with smooth transition */}
      <div key={currentView} className="notebook-view-transition">
        {currentView === 'journal' && (
          <LandingJournalView
            onOpenGithubAudit={() => setIsGithubModalOpen(true)}
            onInspectCredential={(cred) => setInspectedCredential(cred)}
            onOpenJobApply={(job) => setSelectedJobToApply(job)}
          />
        )}

        {currentView === 'student-dash' && (
          <StudentDashboardView
            onOpenGithubAudit={() => setIsGithubModalOpen(true)}
            onOpenJobApply={(job) => setSelectedJobToApply(job)}
            onInspectCredential={(cred) => setInspectedCredential(cred)}
          />
        )}

        {currentView === 'recruiter-dash' && (
          <RecruiterDashboardView
            onOpenCreateJob={() => setIsCreateJobOpen(true)}
            onInspectCredential={(cred) => setInspectedCredential(cred)}
          />
        )}

        {currentView === 'institution-dash' && (
          <InstitutionDashboardView
            onInspectCredential={(cred) => setInspectedCredential(cred)}
          />
        )}

        {currentView === 'verify' && (
          <CertificateVerifierView
            onInspectCredential={(cred) => setInspectedCredential(cred)}
          />
        )}

        {currentView === 'login' && (
          <LoginPageView />
        )}
      </div>

      {/* Global Stationery Modals */}
      <GithubAuditModal
        isOpen={isGithubModalOpen}
        onClose={() => setIsGithubModalOpen(false)}
      />

      <CertificateModal
        credential={inspectedCredential}
        onClose={() => setInspectedCredential(null)}
      />

      <JobApplyModal
        job={selectedJobToApply}
        onClose={() => setSelectedJobToApply(null)}
      />

      <CreateJobModal
        isOpen={isCreateJobOpen}
        onClose={() => setIsCreateJobOpen(false)}
      />
    </NotebookBackground>
  );
}

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('SkillProof Application Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <NotebookBackground>
          <div style={{ padding: '80px 20px', textAlign: 'center', maxWidth: '580px', margin: '0 auto' }}>
            <div
              style={{
                padding: '28px',
                backgroundColor: 'var(--paper-clean)',
                borderRadius: '4px',
                border: '1px dashed rgba(180, 120, 130, 0.4)',
                boxShadow: '0 4px 16px rgba(108, 90, 115, 0.08)'
              }}
            >
              <span className="notebook-page-marker">academic journal · recovery slip</span>
              <h2 style={{ fontFamily: 'var(--font-handwriting)', fontSize: '2rem', color: 'var(--ink-deep)', margin: '12px 0 6px 0' }}>
                study journal note
              </h2>
              <p style={{ fontSize: '0.88rem', color: 'var(--ink-muted)', marginBottom: '16px' }}>
                An unexpected condition was encountered while turning the journal page:
              </p>
              <pre
                style={{
                  padding: '12px',
                  backgroundColor: 'rgba(235, 221, 227, 0.5)',
                  borderRadius: '4px',
                  fontSize: '0.78rem',
                  color: 'var(--ink-deep)',
                  textAlign: 'left',
                  overflowX: 'auto',
                  marginBottom: '20px'
                }}
              >
                {this.state.error?.message || 'Unknown render error'}
              </pre>
              <button
                type="button"
                onClick={() => {
                  this.setState({ hasError: false, error: null });
                  window.location.reload();
                }}
                className="notebook-btn notebook-btn-primary"
                style={{ padding: '8px 20px', fontSize: '0.84rem' }}
              >
                refresh journal page →
              </button>
            </div>
          </div>
        </NotebookBackground>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  return (
    <ErrorBoundary>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </ErrorBoundary>
  );
}
