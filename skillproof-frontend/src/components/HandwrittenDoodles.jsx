import React from 'react';

export const Sparkle = ({ size = 16, color = 'var(--ink-primary)', className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={{ display: 'inline-block', verticalAlign: 'middle' }}
  >
    <path
      d="M12 2C12.5 7.5 16.5 11.5 22 12C16.5 12.5 12.5 16.5 12 22C11.5 16.5 7.5 12.5 2 12C7.5 11.5 11.5 7.5 12 2Z"
      fill={color}
    />
  </svg>
);

export const HeartDoodle = ({ size = 18, color = 'var(--ink-primary)', className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    style={{ display: 'inline-block', verticalAlign: 'middle' }}
  >
    <path d="M19.5 12.572L12 20l-7.5-7.428A5 5 0 1112 6.006a5 5 0 117.5 6.572" />
  </svg>
);

export const HandwrittenArrow = ({ size = 28, color = 'var(--ink-primary)', className = '' }) => (
  <svg
    width={size}
    height={size * 0.45}
    viewBox="0 0 60 26"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path
      d="M2 13C16 11 36 9 56 12M56 12C50 7 46 4 44 2M56 12C49 17 46 20 44 24"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const CurvedArrowDown = ({ size = 32, color = 'var(--ink-primary)', className = '' }) => (
  <svg
    width={size}
    height={size * 1.2}
    viewBox="0 0 32 40"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path
      d="M8 4C18 10 24 20 18 34M18 34L11 28M18 34L25 29"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const HandDrawnUnderline = ({ width = 140, height = 12, color = 'var(--ink-primary)' }) => (
  <svg
    width={width}
    height={height}
    viewBox="0 0 140 12"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={{ display: 'block', marginTop: '2px' }}
  >
    <path
      d="M2 8C35 4 85 3 138 7"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      opacity="0.75"
    />
  </svg>
);

export const NotebookPaperClip = ({ size = 28, color = 'rgba(108, 90, 115, 0.45)' }) => (
  <svg
    width={size}
    height={size * 1.8}
    viewBox="0 0 24 44"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M8 12V34C8 38 11 41 15 41C19 41 22 38 22 34V8C22 4.5 19 2 15 2C11 2 8 4.5 8 8V32C8 34 9.5 36 12 36C14.5 36 16 34 16 32V12"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
