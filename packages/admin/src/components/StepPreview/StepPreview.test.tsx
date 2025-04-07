import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { StepPreview } from './StepPreview';

const mockStep = {
  id: '1',
  title: 'Test Step',
  content: 'This is a test step',
  position: {
    top: 100,
    left: 100,
    width: 200,
    height: 50,
  },
  targetElement: '#test-element',
  order: 1,
};

describe('StepPreview', () => {
  it('renders nothing when not active', () => {
    render(
      <StepPreview
        step={mockStep}
        isActive={false}
        onClose={() => {}}
        onPrevious={() => {}}
        onNext={() => {}}
        onSkip={() => {}}
        isFirstStep={false}
        isLastStep={false}
      />
    );
    expect(screen.queryByText('Step Preview')).not.toBeInTheDocument();
  });

  it('renders step preview when active', () => {
    render(
      <StepPreview
        step={mockStep}
        isActive={true}
        onClose={() => {}}
        onPrevious={() => {}}
        onNext={() => {}}
        onSkip={() => {}}
        isFirstStep={false}
        isLastStep={false}
      />
    );
    expect(screen.getByText('Step Preview')).toBeInTheDocument();
    expect(screen.getByText('Test Step')).toBeInTheDocument();
    expect(screen.getByText('This is a test step')).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    const handleClose = jest.fn();
    render(
      <StepPreview
        step={mockStep}
        isActive={true}
        onClose={handleClose}
        onPrevious={() => {}}
        onNext={() => {}}
        onSkip={() => {}}
        isFirstStep={false}
        isLastStep={false}
      />
    );
    fireEvent.click(screen.getByText('×'));
    expect(handleClose).toHaveBeenCalled();
  });

  it('disables prev button when isFirstStep is true', () => {
    render(
      <StepPreview
        step={mockStep}
        isActive={true}
        onClose={() => {}}
        onPrevious={() => {}}
        onNext={() => {}}
        onSkip={() => {}}
        isFirstStep={true}
        isLastStep={false}
      />
    );
    expect(screen.getByText('Prev')).toBeDisabled();
  });

  it('disables next button when isLastStep is true', () => {
    render(
      <StepPreview
        step={mockStep}
        isActive={true}
        onClose={() => {}}
        onPrevious={() => {}}
        onNext={() => {}}
        onSkip={() => {}}
        isFirstStep={false}
        isLastStep={true}
      />
    );
    expect(screen.getByText('Next')).toBeDisabled();
  });

  it('calls onPrevious when prev button is clicked', () => {
    const handlePrevious = jest.fn();
    render(
      <StepPreview
        step={mockStep}
        isActive={true}
        onClose={() => {}}
        onPrevious={handlePrevious}
        onNext={() => {}}
        onSkip={() => {}}
        isFirstStep={false}
        isLastStep={false}
      />
    );
    fireEvent.click(screen.getByText('Prev'));
    expect(handlePrevious).toHaveBeenCalled();
  });

  it('calls onNext when next button is clicked', () => {
    const handleNext = jest.fn();
    render(
      <StepPreview
        step={mockStep}
        isActive={true}
        onClose={() => {}}
        onPrevious={() => {}}
        onNext={handleNext}
        onSkip={() => {}}
        isFirstStep={false}
        isLastStep={false}
      />
    );
    fireEvent.click(screen.getByText('Next'));
    expect(handleNext).toHaveBeenCalled();
  });

  it('calls onSkip when skip button is clicked', () => {
    const handleSkip = jest.fn();
    render(
      <StepPreview
        step={mockStep}
        isActive={true}
        onClose={() => {}}
        onPrevious={() => {}}
        onNext={() => {}}
        onSkip={handleSkip}
        isFirstStep={false}
        isLastStep={false}
      />
    );
    fireEvent.click(screen.getByText('Skip'));
    expect(handleSkip).toHaveBeenCalled();
  });

  it('renders target highlight with correct position', () => {
    render(
      <StepPreview
        step={mockStep}
        isActive={true}
        onClose={() => {}}
        onPrevious={() => {}}
        onNext={() => {}}
        onSkip={() => {}}
        isFirstStep={false}
        isLastStep={false}
      />
    );
    const highlight = screen.getByTestId('target-highlight');
    expect(highlight).toHaveStyle({
      top: '100px',
      left: '100px',
      width: '200px',
      height: '50px',
    });
  });
});
