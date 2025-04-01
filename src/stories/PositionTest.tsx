import React from 'react';

interface PositionTestProps {
  position: 'top' | 'right' | 'bottom' | 'left';
}

export const PositionTest: React.FC<PositionTestProps> = ({ position }) => {
  return (
    <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <h2>Position Testing: {position}</h2>
      <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
        <button id="top-target" style={{ padding: '10px' }}>
          Top Target
        </button>
        <button id="right-target" style={{ padding: '10px' }}>
          Right Target
        </button>
        <button id="bottom-target" style={{ padding: '10px' }}>
          Bottom Target
        </button>
        <button id="left-target" style={{ padding: '10px' }}>
          Left Target
        </button>
      </div>
      <div style={{ marginTop: '20px' }}>
        <p>This is a test environment for verifying popover positioning.</p>
        <p>Each button will show the popover in the specified position.</p>
      </div>
    </div>
  );
}; 