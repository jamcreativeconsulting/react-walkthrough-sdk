import React from 'react';
import { render, screen } from '@testing-library/react';
import { AccessibilityTest } from '../../stories/AccessibilityTest';

describe('AccessibilityTest', () => {
  it('renders all sections', () => {
    render(<AccessibilityTest />);
    
    // Check section headings
    expect(screen.getByText('Keyboard Navigation')).toBeInTheDocument();
    expect(screen.getByText('Screen Reader Support')).toBeInTheDocument();
    expect(screen.getByText('Focus Management')).toBeInTheDocument();
  });

  it('renders keyboard navigation targets', () => {
    render(<AccessibilityTest />);
    
    // Use IDs to find specific targets
    expect(screen.getByText('First Target', { selector: '#keyboard-target-1' })).toBeInTheDocument();
    expect(screen.getByText('Second Target', { selector: '#keyboard-target-2' })).toBeInTheDocument();
    expect(screen.getByText('Third Target', { selector: '#keyboard-target-3' })).toBeInTheDocument();
  });

  it('renders screen reader targets with proper ARIA attributes', () => {
    render(<AccessibilityTest />);
    
    // Use IDs to find specific targets
    const srTarget1 = screen.getByText('First Target', { selector: '#sr-target-1' });
    expect(srTarget1).toHaveAttribute('aria-label', 'First screen reader target with additional context');
    
    const srTarget2 = screen.getByText('Second Target', { selector: '#sr-target-2' });
    expect(srTarget2).toHaveAttribute('aria-describedby', 'sr-description-2');
  });

  it('renders focus management targets', () => {
    render(<AccessibilityTest />);
    
    expect(screen.getByText('Focus Target 1')).toBeInTheDocument();
    expect(screen.getByText('Focus Target 2')).toBeInTheDocument();
    expect(screen.getByText('Focus Target 3')).toBeInTheDocument();
  });

  it('renders descriptive text', () => {
    render(<AccessibilityTest />);
    
    expect(screen.getByText('This is a test environment for verifying accessibility features.')).toBeInTheDocument();
    expect(screen.getByText('Test keyboard navigation, screen reader support, and focus management.')).toBeInTheDocument();
  });
}); 