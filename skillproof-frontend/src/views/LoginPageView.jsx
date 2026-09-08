import React, { useState } from 'react';
import { HandwrittenAnnotation } from '../components/Typography';
import { NotebookButton } from '../components/NotebookButton';
import { PaperNote } from '../components/PaperNote';
import { Sparkle, HeartDoodle } from '../components/HandwrittenDoodles';
import { useApp } from '../context/AppContext';

export const LoginPageView = () => {
  const { loginAsync, verify2FAAsync, signupAsync, setCurrentView, apiError } = useApp();

  const [mode, setMode] = useState('login'); // 'login' | 'register' | '2fa'
  const [selectedRole, setSelectedRole] = useState('student'); // 'student' | 'recruiter' | 'institution'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [organization, setOrganization] = useState('');
  const [totpCode, setTotpCode] = useState('');
  const [tempToken, setTempToken] = useState(null);
  const [formError, setFormError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleDemoFill = (roleKey) => {
    setFormError(null);
    setMode('login');
    if (roleKey === 'admin' || roleKey === 'institution') {
      setSelectedRole('institution');
      setEmail('dean.cse@university.edu');
      setPassword('Password123!');
    } else if (roleKey === 'recruiter') {
      setSelectedRole('recruiter');
      setEmail('recruiter@acme.com');
      setPassword('Password123!');
    } else {
      setSelectedRole('student');
      setEmail('kunjshah4456@gmail.com');
      setPassword('12345678');
    }
  };

  // ==========================================================================
  // ASYNC AUTHENTICATION (POST /api/v1/auth/login)
  // ==========================================================================
  const handleLogin = async (e) => {
    e.preventDefault();
    setFormError(null);
    setIsSubmitting(true);

    try {
      const result = await loginAsync({ email: email.trim(), password });

      // Handle 2FA Verification Requirement
      if (result.requires2FA) {
        setTempToken(result.tempToken);
        setMode('2fa');
      } else {
        // Direct successful login -> route to appropriate dashboard based on returned user role
        const role = result.user?.role || (selectedRole === 'institution' ? 'admin' : selectedRole);
        if (role === 'admin' || role === 'institution') setCurrentView('institution-dash');
        else if (role === 'recruiter') setCurrentView('recruiter-dash');
        else setCurrentView('student-dash');
      }
    } catch (err) {
      setFormError(err.message || 'Authentication failed. Please verify your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ==========================================================================
  // ASYNC 2FA TOTP VERIFICATION (POST /api/v1/auth/verify-2fa)
  // ==========================================================================
  const handleVerify2FA = async (e) => {
    e.preventDefault();
    setFormError(null);
    setIsSubmitting(true);

    try {
      const result = await verify2FAAsync({
        tempToken,
        totpCode: totpCode.trim()
      });

      // Verification successful -> route to appropriate dashboard based on user role
      const role = result?.user?.role || (selectedRole === 'institution' ? 'admin' : selectedRole);
      if (role === 'admin' || role === 'institution') setCurrentView('institution-dash');
      else if (role === 'recruiter') setCurrentView('recruiter-dash');
      else setCurrentView('student-dash');
    } catch (err) {
      setFormError(err.message || 'Invalid two-factor code. Please check your authenticator app.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ==========================================================================
  // ASYNC REGISTRATION (POST /api/v1/auth/signup)
  // ==========================================================================
  const handleRegister = async (e) => {
    e.preventDefault();
    setFormError(null);
    setIsSubmitting(true);

    try {
      const result = await signupAsync({
        name: name.trim(),
        email: email.trim(),
        password,
        role: selectedRole === 'institution' ? 'admin' : selectedRole,
        organization: organization.trim()
      });

      if (result.requires2FA) {
        setTempToken(result.tempToken);
        setMode('2fa');
      } else {
        if (selectedRole === 'student') setCurrentView('student-dash');
        else if (selectedRole === 'recruiter') setCurrentView('recruiter-dash');
        else setCurrentView('institution-dash');
      }
    } catch (err) {
      setFormError(err.message || 'Registration failed. Please check your details.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="login-page-view"
      style={{
        minHeight: '75vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: '20px',
        paddingBottom: '60px'
      }}
    >
      <div style={{ maxWidth: '480px', width: '100%' }}>
        {/* Header note in cursive and small text */}
        <div style={{ textAlign: 'center', marginBottom: '18px' }}>
          <span
            style={{
              fontFamily: 'var(--font-handwriting)',
              fontSize: '0.95rem',
              color: 'var(--ink-muted)',
              letterSpacing: '0.02em',
              display: 'block'
            }}
          >
            academic access slip ✦
          </span>

          <h1
            style={{
              fontFamily: 'var(--font-handwriting)',
              fontSize: '2.1rem',
              fontWeight: 600,
              color: 'var(--ink-deep)',
              margin: '2px 0 6px 0',
              lineHeight: 1.15
            }}
          >
            {mode === '2fa' ? 'two-factor authentication' : 'sign into skillproof'}
          </h1>

          <p
            style={{
              fontFamily: 'var(--font-handwriting)',
              fontSize: '1.18rem',
              color: 'var(--ink-primary)',
              margin: 0
            }}
          >
            {mode === '2fa'
              ? '"security protects your verified competence" ✦'
              : '"welcome back to your study journal" ♡'}
          </p>
        </div>

        {/* Paper Note / Academic Access Card */}
        <PaperNote tape style={{ padding: '28px 26px', backgroundColor: 'var(--paper-clean)' }}>
          {/* Error Banner */}
          {(formError || apiError) && (
            <div
              style={{
                padding: '10px 14px',
                borderRadius: '4px',
                backgroundColor: 'rgba(235, 221, 227, 0.65)',
                border: '1px dashed rgba(180, 120, 130, 0.5)',
                color: 'var(--ink-deep)',
                fontSize: '0.82rem',
                marginBottom: '16px',
                lineHeight: 1.4
              }}
            >
              <strong style={{ display: 'block', fontSize: '0.78rem', color: 'var(--ink-deep)' }}>
                △ Notice
              </strong>
              <div>
                {typeof (formError || apiError) === 'string'
                  ? (formError || apiError)
                  : JSON.stringify(formError || apiError)}
              </div>
              <div style={{ marginTop: '6px', fontSize: '0.76rem', color: 'var(--ink-muted)' }}>
                Tip: Click one of the 1-click demo buttons below to fill working test credentials.
              </div>
            </div>
          )}

          {/* MODE 1: 2FA TOTP VERIFICATION VIEW */}
          {mode === '2fa' ? (
            <form onSubmit={handleVerify2FA}>
              <div style={{ marginBottom: '18px', textAlign: 'center' }}>
                <p style={{ fontSize: '0.85rem', color: 'var(--ink-muted)', marginBottom: '12px' }}>
                  Enter the 6-digit verification code from your authenticator application (Google Authenticator, Authy, or 1Password).
                </p>

                <label
                  style={{
                    display: 'block',
                    fontFamily: 'var(--font-handwriting)',
                    fontSize: '1.15rem',
                    color: 'var(--ink-deep)',
                    marginBottom: '8px'
                  }}
                >
                  6-digit TOTP code
                </label>

                <input
                  type="text"
                  required
                  maxLength={6}
                  pattern="\d{6}"
                  value={totpCode}
                  onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="000000"
                  className="notebook-input"
                  style={{
                    textAlign: 'center',
                    fontSize: '1.6rem',
                    letterSpacing: '0.35em',
                    fontWeight: 700,
                    maxWidth: '220px',
                    margin: '0 auto',
                    display: 'block'
                  }}
                  autoFocus
                />
              </div>

              <NotebookButton
                type="submit"
                variant="primary"
                disabled={isSubmitting || totpCode.length !== 6}
                style={{ width: '100%', padding: '9px', fontSize: '0.84rem' }}
              >
                {isSubmitting ? 'verifying TOTP...' : 'verify and open journal →'}
              </NotebookButton>

              <div style={{ textAlign: 'center', marginTop: '16px' }}>
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setTempToken(null);
                    setTotpCode('');
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontFamily: 'var(--font-handwriting)',
                    fontSize: '1.08rem',
                    color: 'var(--ink-muted)',
                    cursor: 'pointer',
                    textDecoration: 'underline'
                  }}
                >
                  ← back to sign in
                </button>
              </div>
            </form>
          ) : (
            /* MODE 2: SIGN IN & REGISTRATION FORMS */
            <div>
              {/* Sign In vs Register Toggle */}
              <div
                style={{
                  display: 'flex',
                  borderBottom: '1px dashed rgba(108, 90, 115, 0.18)',
                  marginBottom: '16px',
                  paddingBottom: '6px'
                }}
              >
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setFormError(null);
                  }}
                  style={{
                    flex: 1,
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontFamily: 'var(--font-handwriting)',
                    fontSize: '1.15rem',
                    color: mode === 'login' ? 'var(--ink-deep)' : 'var(--ink-muted)',
                    fontWeight: mode === 'login' ? 700 : 500,
                    borderBottom: mode === 'login' ? '2px solid var(--ink-deep)' : '2px solid transparent',
                    paddingBottom: '6px',
                    transition: 'all var(--transition-calm)'
                  }}
                >
                  sign in to journal
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setMode('register');
                    setFormError(null);
                  }}
                  style={{
                    flex: 1,
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontFamily: 'var(--font-handwriting)',
                    fontSize: '1.15rem',
                    color: mode === 'register' ? 'var(--ink-deep)' : 'var(--ink-muted)',
                    fontWeight: mode === 'register' ? 700 : 500,
                    borderBottom: mode === 'register' ? '2px solid var(--ink-deep)' : '2px solid transparent',
                    paddingBottom: '6px',
                    transition: 'all var(--transition-calm)'
                  }}
                >
                  new registration
                </button>
              </div>

              {/* Role Selection Tabs */}
              <div style={{ marginBottom: '16px' }}>
                <span
                  style={{
                    display: 'block',
                    fontFamily: 'var(--font-handwriting)',
                    fontSize: '0.95rem',
                    color: 'var(--ink-muted)',
                    marginBottom: '6px'
                  }}
                >
                  select user role:
                </span>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '6px' }}>
                  {[
                    { id: 'student', label: 'student' },
                    { id: 'recruiter', label: 'recruiter' },
                    { id: 'institution', label: 'institution' }
                  ].map(r => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => setSelectedRole(r.id)}
                      style={{
                        padding: '6px 10px',
                        borderRadius: '4px',
                        border: selectedRole === r.id ? '1px solid var(--ink-deep)' : '1px solid rgba(108, 90, 115, 0.2)',
                        backgroundColor: selectedRole === r.id ? 'var(--lavender-pale)' : 'var(--paper-card)',
                        color: selectedRole === r.id ? 'var(--ink-deep)' : 'var(--ink-muted)',
                        cursor: 'pointer',
                        fontFamily: 'var(--font-handwriting)',
                        fontSize: '1.08rem',
                        fontWeight: selectedRole === r.id ? 700 : 500,
                        textAlign: 'center',
                        transition: 'all var(--transition-calm)'
                      }}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quick 1-Click Demo Logins */}
              <div
                style={{
                  marginBottom: '18px',
                  padding: '10px 12px',
                  backgroundColor: 'rgba(235, 230, 240, 0.5)',
                  borderRadius: '6px',
                  border: '1px dashed rgba(108, 90, 115, 0.3)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span
                    style={{
                      fontFamily: 'var(--font-handwriting)',
                      fontSize: '1.02rem',
                      fontWeight: 600,
                      color: 'var(--ink-deep)'
                    }}
                  >
                    quick demo accounts (1-click autofill):
                  </span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '6px' }}>
                  <button
                    type="button"
                    onClick={() => handleDemoFill('student')}
                    style={{
                      padding: '6px 4px',
                      borderRadius: '4px',
                      border: '1px solid rgba(108, 90, 115, 0.25)',
                      backgroundColor: 'var(--paper-card)',
                      color: 'var(--ink-deep)',
                      cursor: 'pointer',
                      fontFamily: 'var(--font-handwriting)',
                      fontSize: '1.05rem',
                      fontWeight: 600,
                      textAlign: 'center'
                    }}
                  >
                    🎓 student
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDemoFill('recruiter')}
                    style={{
                      padding: '6px 4px',
                      borderRadius: '4px',
                      border: '1px solid rgba(108, 90, 115, 0.25)',
                      backgroundColor: 'var(--paper-card)',
                      color: 'var(--ink-deep)',
                      cursor: 'pointer',
                      fontFamily: 'var(--font-handwriting)',
                      fontSize: '1.05rem',
                      fontWeight: 600,
                      textAlign: 'center'
                    }}
                  >
                    💼 recruiter
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDemoFill('institution')}
                    style={{
                      padding: '6px 4px',
                      borderRadius: '4px',
                      border: '1px solid rgba(108, 90, 115, 0.25)',
                      backgroundColor: 'var(--paper-card)',
                      color: 'var(--ink-deep)',
                      cursor: 'pointer',
                      fontFamily: 'var(--font-handwriting)',
                      fontSize: '1.05rem',
                      fontWeight: 600,
                      textAlign: 'center'
                    }}
                  >
                    🏛️ admin
                  </button>
                </div>
                <div style={{ marginTop: '6px', fontSize: '0.74rem', color: 'var(--ink-muted)', textAlign: 'center' }}>
                  Student: <em>kunjshah4456@gmail.com</em> • Admin: <em>dean.cse@university.edu</em>
                </div>
              </div>

              {/* Standard Form */}
              <form onSubmit={mode === 'login' ? handleLogin : handleRegister}>
                {mode === 'register' && (
                  <div style={{ marginBottom: '12px' }}>
                    <label style={{ display: 'block', fontSize: '1.05rem', color: 'var(--ink-muted)', marginBottom: '3px', fontFamily: 'var(--font-handwriting)' }}>
                      full legal name *
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Yash Pandey"
                      className="notebook-input"
                    />
                  </div>
                )}

                <div style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', fontSize: '1.05rem', color: 'var(--ink-muted)', marginBottom: '3px', fontFamily: 'var(--font-handwriting)' }}>
                    {selectedRole === 'student'
                      ? 'university email (.edu / official) *'
                      : selectedRole === 'recruiter'
                      ? 'company work email *'
                      : 'institution administrative email *'}
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="user@domain.com"
                    className="notebook-input"
                  />
                </div>

                {mode === 'register' && (
                  <div style={{ marginBottom: '12px' }}>
                    <label style={{ display: 'block', fontSize: '1.05rem', color: 'var(--ink-muted)', marginBottom: '3px', fontFamily: 'var(--font-handwriting)' }}>
                      {selectedRole === 'student' || selectedRole === 'institution'
                        ? 'university or institution name *'
                        : 'company organization name *'}
                    </label>
                    <input
                      type="text"
                      required
                      value={organization}
                      onChange={(e) => setOrganization(e.target.value)}
                      placeholder="e.g. Manipal University Jaipur"
                      className="notebook-input"
                    />
                  </div>
                )}

                <div style={{ marginBottom: '18px' }}>
                  <label style={{ display: 'block', fontSize: '1.05rem', color: 'var(--ink-muted)', marginBottom: '3px', fontFamily: 'var(--font-handwriting)' }}>
                    access key / password *
                  </label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="notebook-input"
                  />
                </div>

                <NotebookButton
                  type="submit"
                  variant="primary"
                  disabled={isSubmitting}
                  style={{ width: '100%', padding: '9px', fontSize: '1.15rem' }}
                >
                  {isSubmitting
                    ? 'connecting to API...'
                    : mode === 'login'
                    ? 'sign into journal →'
                    : 'create academic account →'}
                </NotebookButton>
              </form>
            </div>
          )}

          <div style={{ textAlign: 'center', marginTop: '16px' }}>
            <span style={{ fontFamily: 'var(--font-handwriting)', fontSize: '1.1rem', color: 'var(--ink-primary)' }}>
              "skills tell stories ♡"
            </span>
          </div>
        </PaperNote>
      </div>
    </div>
  );
};

export default LoginPageView;
