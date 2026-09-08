import React from 'react';

export const SmallCapsHeading = ({
  level = 2,
  children,
  className = '',
  style = {}
}) => {
  const Tag = `h${level}`;
  const defaultSizes = {
    1: '1.95rem',
    2: '1.5rem',
    3: '1.25rem',
    4: '1.1rem'
  };

  return (
    <Tag
      className={`handwritten ${className}`}
      style={{
        margin: 0,
        fontFamily: 'var(--font-heading)',
        fontSize: defaultSizes[level] || '1.35rem',
        fontWeight: 600,
        color: 'var(--ink-deep)',
        letterSpacing: '0.01em',
        lineHeight: 1.25,
        ...style
      }}
    >
      {children}
    </Tag>
  );
};

export const HandwrittenHeading = ({
  level = 2,
  children,
  className = '',
  style = {}
}) => {
  const Tag = `h${level}`;
  const defaultSizes = {
    1: '1.95rem',
    2: '1.5rem',
    3: '1.25rem',
    4: '1.1rem'
  };

  return (
    <Tag
      className={`handwritten ${className}`}
      style={{
        margin: 0,
        fontFamily: 'var(--font-heading)',
        fontSize: defaultSizes[level] || '1.35rem',
        fontWeight: 600,
        color: 'var(--ink-deep)',
        letterSpacing: '0.01em',
        lineHeight: 1.25,
        ...style
      }}
    >
      {children}
    </Tag>
  );
};

export const HandwrittenAnnotation = ({
  children,
  className = '',
  style = {}
}) => {
  return (
    <span
      className={`handwritten-annotation ${className}`}
      style={{
        fontFamily: 'var(--font-handwriting)',
        fontSize: '1.15rem',
        color: 'var(--ink-primary)',
        userSelect: 'none',
        ...style
      }}
    >
      {children}
    </span>
  );
};

export const Highlighter = ({
  children,
  variant = 'butter', // 'butter' | 'soft' | 'lavender'
  className = '',
  style = {}
}) => {
  const variantClass =
    variant === 'soft'
      ? 'highlighter-soft'
      : variant === 'lavender'
      ? 'highlighter-lavender'
      : '';

  return (
    <span
      className={`highlighter ${variantClass} ${className}`}
      style={style}
    >
      {children}
    </span>
  );
};
