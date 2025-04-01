import React from 'react';

export const AccessibilityTest: React.FC = () => {
  return (
    <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <h2>Accessibility Testing</h2>
      
      <section aria-label="Keyboard Navigation Test">
        <h3>Keyboard Navigation</h3>
        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
          <button id="keyboard-target-1" style={{ padding: '10px' }}>
            First Target
          </button>
          <button id="keyboard-target-2" style={{ padding: '10px' }}>
            Second Target
          </button>
          <button id="keyboard-target-3" style={{ padding: '10px' }}>
            Third Target
          </button>
        </div>
      </section>

      <section aria-label="Screen Reader Test">
        <h3>Screen Reader Support</h3>
        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
          <button 
            id="sr-target-1" 
            style={{ padding: '10px' }}
            aria-label="First screen reader target with additional context"
          >
            First Target
          </button>
          <button 
            id="sr-target-2" 
            style={{ padding: '10px' }}
            aria-describedby="sr-description-2"
          >
            Second Target
          </button>
          <p id="sr-description-2" style={{ display: 'none' }}>
            Additional description for screen readers
          </p>
        </div>
      </section>

      <section aria-label="Focus Management Test">
        <h3>Focus Management</h3>
        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
          <button id="focus-target-1" style={{ padding: '10px' }}>
            Focus Target 1
          </button>
          <button id="focus-target-2" style={{ padding: '10px' }}>
            Focus Target 2
          </button>
          <button id="focus-target-3" style={{ padding: '10px' }}>
            Focus Target 3
          </button>
        </div>
      </section>

      <div style={{ marginTop: '20px' }}>
        <p>This is a test environment for verifying accessibility features.</p>
        <p>Test keyboard navigation, screen reader support, and focus management.</p>
      </div>
    </div>
  );
}; 