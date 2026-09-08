import React, { useState } from 'react';
import { SmallCapsHeading, HandwrittenAnnotation } from '../components/Typography';
import { NotebookButton } from '../components/NotebookButton';
import { SkillBadge } from '../components/SkillBadge';
import { useApp } from '../context/AppContext';

export const CreateJobModal = ({ isOpen, onClose }) => {
  const { allSkills, createJob } = useApp();

  const [title, setTitle] = useState('');
  const [company, setCompany] = useState('Acme Cloud Systems');
  const [type, setType] = useState('Full-time');
  const [location, setLocation] = useState('Bangalore, India (Hybrid)');
  const [stipend, setStipend] = useState('₹12,00,000 - ₹16,00,000 / yr');
  const [description, setDescription] = useState('');
  const [selectedSkills, setSelectedSkills] = useState(['python', 'fastapi', 'postgresql']);
  const [selectedCategory, setSelectedCategory] = useState('Backend');

  if (!isOpen) return null;

  const categories = Array.from(new Set(allSkills.map(s => s.category)));

  const toggleSkill = (skillId) => {
    if (selectedSkills.includes(skillId)) {
      setSelectedSkills(prev => prev.filter(id => id !== skillId));
    } else {
      setSelectedSkills(prev => [...prev, skillId]);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() || selectedSkills.length === 0) return;

    createJob({
      title,
      company,
      type,
      location,
      stipend,
      description: description || 'Exciting engineering role working on core infrastructure and modern services.',
      requiredSkills: selectedSkills
    });

    onClose();
  };

  const skillDict = Object.fromEntries(allSkills.map(s => [s.id, s]));

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(69, 64, 71, 0.45)',
        backdropFilter: 'blur(2px)',
        zIndex: 999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}
      onClick={onClose}
    >
      <div
        className="paper-note paper-note-tape"
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

            <div>
              <label className="small-caps" style={{ display: 'block', fontSize: '0.76rem', marginBottom: '4px' }}>
                engagement type
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="notebook-select"
                style={{ width: '100%' }}
              >
                <option value="Full-time">Full-time</option>
                <option value="Internship">Internship</option>
                <option value="Apprenticeship">Apprenticeship</option>
              </select>
            </div>

            <div>
              <label className="small-caps" style={{ display: 'block', fontSize: '0.76rem', marginBottom: '4px' }}>
                stipend / compensation
              </label>
              <input
                type="text"
                value={stipend}
                onChange={(e) => setStipend(e.target.value)}
                className="notebook-input"
              />
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
              <NotebookButton type="submit" variant="primary" disabled={selectedSkills.length === 0 || !title.trim()}>
                publish job listing →
              </NotebookButton>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateJobModal;
