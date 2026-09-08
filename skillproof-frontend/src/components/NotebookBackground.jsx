import React from 'react';

export const NotebookBackground = ({ children }) => {
  return (
    <div className="notebook-page">
      {/* Continuous Vertical Margin Guide */}
      <div className="notebook-margin-guide" aria-hidden="true" />
      
      {/* Main Page Container */}
      <main className="notebook-content">
        {children}
      </main>
    </div>
  );
};

export default NotebookBackground;
