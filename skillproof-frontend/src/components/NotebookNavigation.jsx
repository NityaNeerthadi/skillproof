import React from 'react';
import { Sparkle, HandDrawnUnderline } from './HandwrittenDoodles';
import { useApp } from '../context/AppContext';

export const NotebookNavigation = () => {
  const { currentView, setCurrentView, activeRole, setActiveRole, currentUser, logout } = useApp();

  const navLinks = [
    { id: 'journal', label: 'journal overview' },
    { id: 'student-dash', label: 'students' },
    { id: 'recruiter-dash', label: 'recruiters' },
    { id: 'institution-dash', label: 'universities' },
    { id: 'verify', label: 'verify certificate' }
  ];

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
          onClick={() => setCurrentView('journal')}
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
            skills tell stories
          </span>
        </div>

        {/* Main Navigation Items - Small & Refined */}
        <nav
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '20px',
            flexWrap: 'wrap'
          }}
        >
          {navLinks.map(link => {
            const isActive = currentView === link.id;
            return (
              <div
                key={link.id}
                style={{
                  position: 'relative',
                  paddingBottom: '2px'
                }}
              >
                <button
                  type="button"
                  onClick={() => {
                    setCurrentView(link.id);
                    if (link.id === 'student-dash') setActiveRole('student');
                    if (link.id === 'recruiter-dash') setActiveRole('recruiter');
                    if (link.id === 'institution-dash') setActiveRole('institution');
                  }}
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
                gap: '8px',
                padding: '4px 10px',
                borderRadius: 'var(--radius-paper)',
                backgroundColor: 'var(--paper-card)',
                border: '1px solid rgba(108, 90, 115, 0.2)',
                fontSize: '0.78rem'
              }}
            >
              <span style={{ fontWeight: 600, color: 'var(--ink-deep)' }}>
                {currentUser.name || currentUser.email}
              </span>
              <span
                style={{
                  fontSize: '0.7rem',
                  padding: '2px 6px',
                  backgroundColor: 'var(--lavender-pale)',
                  borderRadius: '3px',
                  color: 'var(--ink-deep)',
                  fontWeight: 600
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
                  fontSize: '1.05rem',
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
                if (currentUser.role === 'student') setCurrentView('student-dash');
                else if (currentUser.role === 'recruiter') setCurrentView('recruiter-dash');
                else setCurrentView('institution-dash');
              }
            }}
            className="notebook-btn notebook-btn-primary"
            style={{ padding: '6px 14px', fontSize: '1.15rem' }}
          >
            {currentUser ? 'open journal →' : 'get started →'}
          </button>
        </div>
      </div>
    </header>
  );
};

export default NotebookNavigation;
