import React, { FC } from 'react';

export const Demo: FC = () => {
  return (
    <div style={{ padding: '20px' }}>
      <h1>Walkthrough Demo</h1>
      <div style={{ marginTop: '20px' }}>
        <button id="target1" style={{ marginRight: '10px' }}>
          First Button
        </button>
        <button id="target2">
          Second Button
        </button>
      </div>
      <div style={{ marginTop: '20px' }}>
        <p>This is a demo page to showcase the walkthrough functionality.</p>
      </div>
    </div>
  );
}; 