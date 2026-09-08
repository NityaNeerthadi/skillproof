import React from 'react';

export const SkillBadge = ({
  name,
  color = 'lavender', // 'lavender' | 'blue' | 'yellow' | 'pink' | 'green'
  proficiency = null, // 'beginner' | 'intermediate' | 'advanced' | null
  onRemove = null,
  onClick = null,
  className = '',
  style = {}
}) => {
  const colorClass =
    color === 'blue'
      ? 'skill-badge-blue'
      : color === 'yellow'
      ? 'skill-badge-yellow'
      : color === 'pink'
      ? 'skill-badge-pink'
      : color === 'green'
      ? 'skill-badge-green'
      : 'skill-badge-lavender';

  const proficiencyLevels = {
    beginner: 1,
    intermediate: 2,
    advanced: 3
  };

  const level = proficiency ? proficiencyLevels[proficiency] || 1 : null;

  return (
    <span
      className={`skill-badge ${colorClass} ${className}`}
      onClick={onClick}
      style={{
        cursor: onClick ? 'pointer' : 'default',
        ...style
      }}
    >
      <span>{name}</span>

      {/* Proficiency indicator dots */}
      {level && (
        <span
          className="proficiency-mark"
          title={`Proficiency: ${proficiency}`}
          aria-label={`Proficiency: ${proficiency}`}
        >
          <span className={`proficiency-dot ${level >= 1 ? 'filled' : ''}`} />
          <span className={`proficiency-dot ${level >= 2 ? 'filled' : ''}`} />
          <span className={`proficiency-dot ${level >= 3 ? 'filled' : ''}`} />
        </span>
      )}

      {/* Optional remove button for editing student skills */}
      {onRemove && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--ink-muted)',
            cursor: 'pointer',
            fontSize: '13px',
            marginLeft: '4px',
            lineHeight: 1,
            padding: 0
          }}
          aria-label={`Remove ${name}`}
        >
          ×
        </button>
      )}
    </span>
  );
};

export default SkillBadge;
