import React from 'react';

export const PaperNote = ({
  children,
  tilt = 'none', // 'left' | 'right' | 'none'
  tape = false,
  className = '',
  style = {}
}) => {
  const tiltClass =
    tilt === 'left'
      ? 'paper-note-tilted-left'
      : tilt === 'right'
      ? 'paper-note-tilted-right'
      : '';

  const tapeClass = tape ? 'paper-note-tape' : '';

  return (
    <div
      className={`paper-note ${tiltClass} ${tapeClass} ${className}`}
      style={style}
    >
      {children}
    </div>
  );
};

export default PaperNote;
