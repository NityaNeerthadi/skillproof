import React from 'react';

export const NotebookButton = ({
  children,
  variant = 'primary', // 'primary' | 'secondary' | 'paper'
  onClick,
  disabled = false,
  className = '',
  style = {},
  type = 'button'
}) => {
  const variantClass =
    variant === 'secondary'
      ? 'notebook-btn-secondary'
      : variant === 'paper'
      ? 'notebook-btn-paper'
      : 'notebook-btn-primary';

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`notebook-btn ${variantClass} ${className}`}
      style={{
        opacity: disabled ? 0.6 : 1,
        cursor: disabled ? 'not-allowed' : 'pointer',
        ...style
      }}
    >
      {children}
    </button>
  );
};

export default NotebookButton;
