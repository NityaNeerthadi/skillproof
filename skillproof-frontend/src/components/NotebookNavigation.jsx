import React from 'react';
import { Sparkle, HandDrawnUnderline } from './HandwrittenDoodles';
import { useApp } from '../context/AppContext';

export const NotebookNavigation = () => {
  const {
    currentView,
    setCurrentView,
    currentUser,
    logout,
    studentTab,
    setStudentTab,
    setIsCreateJobOpen
  } = useApp();

  // Dedicated Role-Segregated Navigation
  let navLinks = [];
  let roleSubtitle = 'skills tell stories';

  if (currentUser?.role === 'student') {
    roleSubtitle = 'student study journal ✦';
    navLinks = [
      {
        id: 'student-dash',
        tab: 'jobs',
        label: 'my journal',
        onClick: () => {
          setCurrentView('student-dash');
          setStudentTab('jobs');
        }
      },
      {
        id: 'student-dash',
        tab: 'skills',
        label: 'verified skills',
        onClick: () => {
          setCurrentView('student-dash');
          setStudentTab('skills');
        }
      },
      {
        id: 'student-dash',
        tab: 'applications',
        label: 'applications tracker',
        onClick: () => {
          setCurrentView('student-dash');
          setStudentTab('applications');
        }
      },
      {
        id: 'verify',
        label: 'verify certificate',
        onClick: () => setCurrentView('verify')
      }
    ];
  } else if (currentUser?.role === 'recruiter') {
    roleSubtitle = 'recruiter talent journal ✦';
    navLinks = [
      {
        id: 'recruiter-dash',
        label: 'talent pipeline',
        onClick: () => setCurrentView('recruiter-dash')
      },
      {
        id: 'post-job',
        label: '+ post new opening',
        isAction: true,
        onClick: () => setIsCreateJobOpen(true)
      },
      {
        id: 'verify',
        label: 'verify credentials',
        onClick: () => setCurrentView('verify')
      }
    ];
  } else if (currentUser?.role === 'admin' || currentUser?.role === 'institution') {
    roleSubtitle = 'academic administration ✦';
    navLinks = [
      {
        id: 'institution-dash',
        label: 'cohort heatmap & analytics',
        onClick: () => setCurrentView('institution-dash')
      },
      {
        id: 'verify',
        label: 'verify credentials',
        onClick: () => setCurrentView('verify')
      }
    ];
  } else {
    // Unauthenticated Guest View
    roleSubtitle = 'skills tell stories';
    navLinks = [
      {
        id: 'journal',
        label: 'journal overview',
        onClick: () => setCurrentView('journal')
      },
      {
        id: 'verify',
        label: 'verify certificate',
        onClick: () => setCurrentView('verify')
      }
    ];
  }

  const handleBrandClick = () => {
    if (!currentUser) {
      setCurrentView('journal');
    } else if (currentUser.role === 'student') {
      setCurrentView('student-dash');
      setStudentTab('jobs');
    } else if (currentUser.role === 'recruiter') {
      setCurrentView('recruiter-dash');
    } else {
      setCurrentView('institution-dash');
    }
  };

  return (
    <header
      style={{
        paddingTop: '20px',
        paddingBottom: '16px',
        borderBottom: '1px dashed rgba(108, 90, 115, 0.18)',
        marginBottom: '16px'
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px'
        }}
      >
        {/* Brand Wordmark in Cursive Handwriting */}
        <div
          onClick={handleBrandClick}
          style={{
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'baseline',
            gap: '6px'
          }}
        >
          <span
            style={{
              fontFamily: 'var(--font-handwriting)',
              fontSize: '1.75rem',
              fontWeight: 700,
              color: 'var(--ink-deep)',
              letterSpacing: '0.02em',
              lineHeight: 1
            }}
          >
            skillproof
          </span>
          <Sparkle size={13} color="var(--ink-primary)" />
          <span
            style={{
              fontFamily: 'var(--font-handwriting)',
              fontSize: '1.1rem',
              color: 'var(--ink-muted)',
              marginLeft: '2px'
            }}
          >
            {roleSubtitle}
          </span>
        </div>

        {/* Main Navigation Items - Segregated Strictly by Role */}
        <nav
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '20px',
            flexWrap: 'wrap'
          }}
        >
          {navLinks.map((link, idx) => {
            const isActive = link.isAction
              ? false
              : currentView === link.id && (!link.tab || studentTab === link.tab);

            return (
              <div
                key={link.id + (link.tab || '') + idx}
                style={{
                  position: 'relative',
                  paddingBottom: '2px'
                }}
              >
                <button
                  type="button"
                  onClick={link.onClick}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontFamily: 'var(--font-handwriting)',
                    fontSize: '1.2rem',
                    color: isActive ? 'var(--ink-deep)' : 'var(--ink-muted)',
                    fontWeight: isActive ? 700 : 500,
                    letterSpacing: '0.02em',
                    transition: 'color var(--transition-calm)',
                    padding: '2px 0'
                  }}
                >
                  {link.label}
                </button>

                {/* Hand-drawn underline beneath active item */}
                {isActive && (
                  <div
                    style={{
                      position: 'absolute',
                      bottom: '-5px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      pointerEvents: 'none'
                    }}
                  >
                    <HandDrawnUnderline width={48} height={6} color="var(--ink-deep)" />
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* User Session & Sign-in CTA */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}
        >
          {/* Active User Session or Sign In Link */}
          {currentUser ? (
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '10px',
                padding: '4px 12px',
                borderRadius: 'var(--radius-paper)',
                backgroundColor: 'var(--paper-card)',
                border: '1px solid rgba(108, 90, 115, 0.22)',
                fontSize: '1.12rem'
              }}
            >
              <span style={{ fontWeight: 600, color: 'var(--ink-deep)', fontFamily: 'var(--font-handwriting)' }}>
                {currentUser.name || currentUser.email}
              </span>
              <span
                style={{
                  fontSize: '1.02rem',
                  padding: '2px 8px',
                  backgroundColor: 'var(--lavender-pale)',
                  borderRadius: '3px',
                  color: 'var(--ink-deep)',
                  fontWeight: 600,
                  fontFamily: 'var(--font-handwriting)'
                }}
              >
                {currentUser.role}
              </span>
              <button
                type="button"
                onClick={logout}
                title="Sign out of journal"
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--ink-muted)',
                  cursor: 'pointer',
                  fontFamily: 'var(--font-handwriting)',
                  fontSize: '1.12rem',
                  textDecoration: 'underline',
                  marginLeft: '4px'
                }}
              >
                sign out
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setCurrentView('login')}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontFamily: 'var(--font-handwriting)',
                fontSize: '1.2rem',
                color: currentView === 'login' ? 'var(--ink-deep)' : 'var(--ink-primary)',
                fontWeight: 600,
                textDecoration: 'underline'
              }}
            >
              sign in
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              if (!currentUser) {
                setCurrentView('login');
              } else {
                if (currentUser.role === 'student') {
                  setCurrentView('student-dash');
                  setStudentTab('jobs');
                } else if (currentUser.role === 'recruiter') {
                  setCurrentView('recruiter-dash');
                } else {
                  setCurrentView('institution-dash');
                }
              }
            }}
            className="notebook-btn notebook-btn-primary"
            style={{ padding: '6px 14px', fontSize: '1.15rem' }}
          >
            {currentUser
              ? (currentUser.role === 'student'
                  ? 'my journal →'
                  : currentUser.role === 'recruiter'
                  ? 'recruiter dash →'
                  : 'admin analytics →')
              : 'get started →'}
          </button>
        </div>
      </div>
    </header>
  );
};

export default NotebookNavigation;
