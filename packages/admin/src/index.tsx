import React from 'react';
import { useWalkthrough } from '@walkthrough-sdk/core';
import './styles.css';

export const AdminPanel: React.FC = () => {
  const walkthrough = useWalkthrough();

  return (
    <div className="admin-panel">
      <div className="admin-header">
        <h2>Walkthrough Admin</h2>
      </div>
      <div className="admin-content">
        <div className="admin-section">
          <h3>Create New Walkthrough</h3>
          <button className="admin-button">Start Creating</button>
        </div>
        <div className="admin-section">
          <h3>Manage Existing</h3>
          <div className="admin-list">
            <p>No walkthroughs created yet</p>
          </div>
        </div>
      </div>
    </div>
  );
}; 