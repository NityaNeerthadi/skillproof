import React, { useState } from 'react';
import { SmallCapsHeading, HandwrittenAnnotation } from '../components/Typography';
import { NotebookButton } from '../components/NotebookButton';
import { SkillBadge } from '../components/SkillBadge';
import { AnimatedNumber } from '../components/AnimatedNumber';
import { useApp } from '../context/AppContext';

export const CreateJobModal = ({ isOpen, onClose }) => {
  const { allSkills, createJob } = useApp();

  const [title, setTitle] = useState('');
  const [company, setCompany] = useState('Acme Cloud Systems');
  const [type, setType] = useState('Full-time');
  const [location, setLocation] = useState('Bangalore, India (Hybrid)');
  
  // Smooth Compensation State (Lakhs vs Thousands)
  const [compMode, setCompMode] = useState('lakhs'); // 'lakhs' | 'thousands' | 'custom'
  const [lakhAmount, setLakhAmount] = useState(14.0);
  const [thousandAmount, setThousandAmount] = useState(25000);
  const [customStipend, setCustomStipend] = useState('₹12,00,000 - ₹16,00,000 / yr');

  const [description, setDescription] = useState('');
  const [selectedSkills, setSelectedSkills] = useState(['python', 'fastapi', 'postgresql']);
  const [selectedCategory, setSelectedCategory] = useState('Backend');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const categories = Array.from(new Set(allSkills.map(s => s.category)));

  const toggleSkill = (skillId) => {
    if (selectedSkills.includes(skillId)) {
      setSelectedSkills(prev => prev.filter(id => id !== skillId));
    } else {
      setSelectedSkills(prev => [...prev, skillId]);
    }
  };

  const handleTypeChange = (newType) => {
    setType(newType);
    if (newType === 'Internship' || newType === 'Apprenticeship') {
      setCompMode('thousands');
    } else {
      setCompMode('lakhs');
    }
  };

  const currentStipendString = compMode === 'lakhs'
    ? `₹${Math.round(lakhAmount * 100000).toLocaleString('en-IN')} / yr (${lakhAmount.toFixed(1)} LPA)`
    : compMode === 'thousands'
    ? `₹${thousandAmount.toLocaleString('en-IN')} / month`
    : customStipend;

  const handleSubmit = async (e) => {
    if (e?.preventDefault) e.preventDefault();
    if (!title.trim() || selectedSkills.length === 0 || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await createJob({
        title: title.trim(),
        company: company.trim() || 'Acme Cloud Systems',
        type,
        location: location.trim() || 'Bangalore, India (Hybrid)',
        stipend: currentStipendString,
        description: (description || 'Exciting engineering role working on core infrastructure and modern services.').trim(),
        required_skill_ids: selectedSkills,
        requiredSkills: selectedSkills
      });

      setTitle('');
      setDescription('');
      onClose();
    } catch (err) {
      console.error('Failed to publish job:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const skillDict = Object.fromEntries(allSkills.map(s => [s.id, s]));

  return (
    <div
      className="notebook-modal-backdrop"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(69, 64, 71, 0.52)',
        backdropFilter: 'blur(3px)',
        zIndex: 999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}
      onClick={onClose}
    >
      <div
        className="paper-note paper-note-tape notebook-modal-paper"
        style={{
          maxWidth: '680px',
          width: '100%',
          backgroundColor: 'var(--paper-clean)',
          maxHeight: '90vh',
          overflowY: 'auto',
          position: 'relative',
          padding: '32px'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: '16px',
            borderBottom: '1px dashed rgba(108, 90, 115, 0.2)',
            paddingBottom: '12px'
          }}
        >
          <div>
            <span
              className="small-caps"
              style={{
                fontSize: '0.74rem',
                color: 'var(--ink-muted)',
                letterSpacing: '0.12em'
              }}
            >
              recruiter notebook · create opening
            </span>
            <SmallCapsHeading level={3} style={{ fontSize: '1.4rem' }}>
              post job with verified taxonomy skills
            </SmallCapsHeading>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '1.4rem',
              color: 'var(--ink-muted)',
              cursor: 'pointer'
            }}
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
            <div>
              <label className="small-caps" style={{ display: 'block', fontSize: '0.76rem', marginBottom: '4px' }}>
                job title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Backend Platform Engineer"
                className="notebook-input"
              />
            </div>

            <div>
              <label className="small-caps" style={{ display: 'block', fontSize: '0.76rem', marginBottom: '4px' }}>
                company name
              </label>
              <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="notebook-input"
              />
            </div>

            <div style={{ gridColumn: 'span 2' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '14px' }}>
                <div>
                  <label className="small-caps" style={{ display: 'block', fontSize: '0.76rem', marginBottom: '4px' }}>
                    engagement type
                  </label>
                  <select
                    value={type}
                    onChange={(e) => handleTypeChange(e.target.value)}
                    className="notebook-select"
                    style={{ width: '100%' }}
                  >
                    <option value="Full-time">Full-time</option>
                    <option value="Internship">Internship</option>
                    <option value="Apprenticeship">Apprenticeship</option>
                  </select>
                </div>

                {/* Smooth Stipend / Compensation Panel */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <label className="small-caps" style={{ fontSize: '0.76rem' }}>
                      stipend / compensation
                    </label>

                    {/* Smooth Unit Switcher (Lakhs vs Thousands) */}
                    <div style={{ display: 'inline-flex', gap: '4px', background: 'var(--lavender-pale)', padding: '2px', borderRadius: '4px' }}>
                      <button
                        type="button"
                        onClick={() => setCompMode('thousands')}
                        className="smooth-unit-pill"
                        style={{
                          border: 'none',
                          padding: '2px 8px',
                          borderRadius: '3px',
                          fontSize: '0.72rem',
                          fontFamily: 'var(--font-handwriting)',
                          fontWeight: compMode === 'thousands' ? 600 : 400,
                          backgroundColor: compMode === 'thousands' ? 'var(--ink-deep)' : 'transparent',
                          color: compMode === 'thousands' ? 'var(--paper)' : 'var(--ink-muted)',
                          cursor: 'pointer'
                        }}
                      >
                        ₹ / mo (thousands)
                      </button>
                      <button
                        type="button"
                        onClick={() => setCompMode('lakhs')}
                        className="smooth-unit-pill"
                        style={{
                          border: 'none',
                          padding: '2px 8px',
                          borderRadius: '3px',
                          fontSize: '0.72rem',
                          fontFamily: 'var(--font-handwriting)',
                          fontWeight: compMode === 'lakhs' ? 600 : 400,
                          backgroundColor: compMode === 'lakhs' ? 'var(--ink-deep)' : 'transparent',
                          color: compMode === 'lakhs' ? 'var(--paper)' : 'var(--ink-muted)',
                          cursor: 'pointer'
                        }}
                      >
                        ₹ / yr (lakhs · LPA)
                      </button>
                      <button
                        type="button"
                        onClick={() => setCompMode('custom')}
                        className="smooth-unit-pill"
                        style={{
                          border: 'none',
                          padding: '2px 6px',
                          borderRadius: '3px',
                          fontSize: '0.72rem',
                          fontFamily: 'var(--font-handwriting)',
                          fontWeight: compMode === 'custom' ? 600 : 400,
                          backgroundColor: compMode === 'custom' ? 'var(--ink-deep)' : 'transparent',
                          color: compMode === 'custom' ? 'var(--paper)' : 'var(--ink-muted)',
                          cursor: 'pointer'
                        }}
                      >
                        custom
                      </button>
                    </div>
                  </div>

                  {/* Compensation Display & Sliders */}
                  {compMode === 'custom' ? (
                    <input
                      type="text"
                      value={customStipend}
                      onChange={(e) => setCustomStipend(e.target.value)}
                      placeholder="e.g. ₹12,00,000 - ₹16,00,000 / yr"
                      className="notebook-input"
                    />
                  ) : (
                    <div
                      style={{
                        padding: '8px 12px',
                        backgroundColor: 'var(--paper-card)',
                        borderRadius: '4px',
                        border: '1px solid rgba(108, 90, 115, 0.22)'
                      }}
                    >
                      {/* Live Animated Number Representation */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '6px' }}>
                        <span style={{ fontFamily: 'var(--font-handwriting)', fontSize: '1.25rem', fontWeight: 600, color: 'var(--ink-deep)' }}>
                          {compMode === 'thousands' ? (
                            <>
                              ₹<AnimatedNumber value={thousandAmount} format="currency-in" /> / month
                            </>
                          ) : (
                            <>
                              ₹<AnimatedNumber value={lakhAmount} decimals={1} /> LPA{' '}
                              <span style={{ fontSize: '0.92rem', color: 'var(--ink-muted)', fontWeight: 500 }}>
                                (₹<AnimatedNumber value={Math.round(lakhAmount * 100000)} format="currency-in" /> / yr)
                              </span>
                            </>
                          )}
                        </span>

                        <span style={{ fontSize: '0.8rem', color: 'var(--ink-primary)', fontFamily: 'var(--font-handwriting)' }}>
                          {compMode === 'thousands' ? 'stipend' : 'annual package'}
                        </span>
                      </div>

                      {/* Interactive Smooth Slider */}
                      {compMode === 'thousands' ? (
                        <div>
                          <input
                            type="range"
                            min={10000}
                            max={120000}
                            step={2500}
                            value={thousandAmount}
                            onChange={(e) => setThousandAmount(Number(e.target.value))}
                            className="smooth-slider"
                            style={{ width: '100%', display: 'block', marginBottom: '6px' }}
                          />
                          <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                            {[15000, 25000, 40000, 60000, 80000, 100000].map((amt) => (
                              <button
                                key={amt}
                                type="button"
                                onClick={() => setThousandAmount(amt)}
                                style={{
                                  padding: '1px 6px',
                                  fontSize: '0.78rem',
                                  fontFamily: 'var(--font-handwriting)',
                                  borderRadius: '3px',
                                  border: thousandAmount === amt ? '1px solid var(--ink-deep)' : '1px solid rgba(108, 90, 115, 0.2)',
                                  backgroundColor: thousandAmount === amt ? 'var(--lavender-pale)' : 'var(--paper-clean)',
                                  color: 'var(--ink-deep)',
                                  cursor: 'pointer'
                                }}
                              >
                                {amt >= 100000 ? '₹1L/mo' : `₹${amt / 1000}k`}
                              </button>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div>
                          <input
                            type="range"
                            min={4.0}
                            max={40.0}
                            step={0.5}
                            value={lakhAmount}
                            onChange={(e) => setLakhAmount(Number(e.target.value))}
                            className="smooth-slider"
                            style={{ width: '100%', display: 'block', marginBottom: '6px' }}
                          />
                          <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                            {[6.0, 10.0, 14.0, 18.0, 24.0, 32.0].map((amt) => (
                              <button
                                key={amt}
                                type="button"
                                onClick={() => setLakhAmount(amt)}
                                style={{
                                  padding: '1px 6px',
                                  fontSize: '0.78rem',
                                  fontFamily: 'var(--font-handwriting)',
                                  borderRadius: '3px',
                                  border: lakhAmount === amt ? '1px solid var(--ink-deep)' : '1px solid rgba(108, 90, 115, 0.2)',
                                  backgroundColor: lakhAmount === amt ? 'var(--lavender-pale)' : 'var(--paper-clean)',
                                  color: 'var(--ink-deep)',
                                  cursor: 'pointer'
                                }}
                              >
                                {amt.toFixed(0)} LPA
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div style={{ marginBottom: '14px' }}>
            <label className="small-caps" style={{ display: 'block', fontSize: '0.76rem', marginBottom: '4px' }}>
              role description
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the challenges, tech stack, and responsibilities..."
              className="notebook-input"
              style={{ resize: 'vertical' }}
            />
          </div>

          {/* Fixed Taxonomy Required Skills Picker */}
          <div
            style={{
              padding: '16px',
              backgroundColor: 'var(--paper-card)',
              borderRadius: '4px',
              border: '1px solid rgba(108, 90, 115, 0.16)',
              marginBottom: '20px'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <span className="small-caps" style={{ fontSize: '0.78rem', color: 'var(--ink-deep)' }}>
                required skills ({selectedSkills.length} selected)
              </span>

              {/* Category tabs */}
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {categories.map(cat => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    style={{
                      border: 'none',
                      background: selectedCategory === cat ? 'var(--ink-deep)' : 'transparent',
                      color: selectedCategory === cat ? 'var(--paper)' : 'var(--ink-muted)',
                      padding: '2px 8px',
                      borderRadius: '3px',
                      fontSize: '0.74rem',
                      cursor: 'pointer'
                    }}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Currently selected skills pills */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '12px' }}>
              {selectedSkills.map(skillId => {
                const s = skillDict[skillId] || { name: skillId, color: 'lavender' };
                return (
                  <SkillBadge
                    key={skillId}
                    name={s.name}
                    color={s.color}
                    onRemove={() => toggleSkill(skillId)}
                  />
                );
              })}
            </div>

            {/* Category skill pills to click */}
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '6px',
                paddingTop: '10px',
                borderTop: '1px dashed rgba(108, 90, 115, 0.16)'
              }}
            >
              {allSkills
                .filter(s => s.category === selectedCategory)
                .map(s => {
                  const isSelected = selectedSkills.includes(s.id);
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => toggleSkill(s.id)}
                      style={{
                        padding: '3px 8px',
                        borderRadius: '3px',
                        border: isSelected
                          ? '1px solid var(--ink-deep)'
                          : '1px solid rgba(108, 90, 115, 0.2)',
                        backgroundColor: isSelected ? 'var(--lavender-pale)' : 'var(--paper-clean)',
                        color: 'var(--ink-body)',
                        fontSize: '0.8rem',
                        cursor: 'pointer'
                      }}
                    >
                      {isSelected ? '✓ ' : '+ '}
                      {s.name}
                    </button>
                  );
                })}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <HandwrittenAnnotation style={{ fontSize: '1.05rem', color: 'var(--ink-primary)' }}>
              "deterministic matching active" ✦
            </HandwrittenAnnotation>

            <div style={{ display: 'flex', gap: '10px' }}>
              <NotebookButton variant="paper" onClick={onClose}>
                cancel
              </NotebookButton>
              <NotebookButton
                type="submit"
                variant="primary"
                onClick={handleSubmit}
                disabled={selectedSkills.length === 0 || !title.trim() || isSubmitting}
              >
                {isSubmitting ? 'publishing...' : 'publish job listing →'}
              </NotebookButton>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateJobModal;
