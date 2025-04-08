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
        currentStepIndex={0}
        totalSteps={1}
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
        currentStepIndex={0}
        totalSteps={1}
      />
    );
    expect(screen.getByText('Step Preview')).toBeInTheDocument();
    expect(screen.getByTestId('preview-title')).toHaveTextContent('Test Step');
    expect(screen.getByTestId('preview-content')).toHaveTextContent('This is a test step');
  });

  it('displays correct progress indicator', () => {
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
        currentStepIndex={2}
        totalSteps={5}
      />
    );
    expect(screen.getByText('Step 3 of 5')).toBeInTheDocument();
  });

  it('displays correct progress indicator for first step', () => {
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
        currentStepIndex={0}
        totalSteps={3}
      />
    );
    expect(screen.getByText('Step 1 of 3')).toBeInTheDocument();
  });

  it('displays correct progress indicator for last step', () => {
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
        currentStepIndex={4}
        totalSteps={5}
      />
    );
    expect(screen.getByText('Step 5 of 5')).toBeInTheDocument();
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
        currentStepIndex={0}
        totalSteps={1}
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
        currentStepIndex={0}
        totalSteps={1}
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
        currentStepIndex={0}
        totalSteps={1}
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
        currentStepIndex={1}
        totalSteps={3}
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
        currentStepIndex={1}
        totalSteps={3}
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
        currentStepIndex={1}
        totalSteps={3}
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
        currentStepIndex={1}
        totalSteps={3}
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

  it('calls onPrevious when left arrow key is pressed', () => {
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
        currentStepIndex={1}
        totalSteps={3}
      />
    );
    fireEvent.keyDown(window, { key: 'ArrowLeft' });
    expect(handlePrevious).toHaveBeenCalled();
  });

  it('calls onNext when right arrow key is pressed', () => {
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
        currentStepIndex={1}
        totalSteps={3}
      />
    );
    fireEvent.keyDown(window, { key: 'ArrowRight' });
    expect(handleNext).toHaveBeenCalled();
  });

  it('calls onSkip when Escape key is pressed', () => {
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
        currentStepIndex={1}
        totalSteps={3}
      />
    );
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(handleSkip).toHaveBeenCalled();
  });

  it('does not call onPrevious when left arrow is pressed and isFirstStep is true', () => {
    const handlePrevious = jest.fn();
    render(
      <StepPreview
        step={mockStep}
        isActive={true}
        onClose={() => {}}
        onPrevious={handlePrevious}
        onNext={() => {}}
        onSkip={() => {}}
        isFirstStep={true}
        isLastStep={false}
        currentStepIndex={0}
        totalSteps={3}
      />
    );
    fireEvent.keyDown(window, { key: 'ArrowLeft' });
    expect(handlePrevious).not.toHaveBeenCalled();
  });

  it('does not call onNext when right arrow is pressed and isLastStep is true', () => {
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
        isLastStep={true}
        currentStepIndex={2}
        totalSteps={3}
      />
    );
    fireEvent.keyDown(window, { key: 'ArrowRight' });
    expect(handleNext).not.toHaveBeenCalled();
  });

  it('supports alternative keyboard shortcuts (P, N, S)', () => {
    const handlePrevious = jest.fn();
    const handleNext = jest.fn();
    const handleSkip = jest.fn();
    render(
      <StepPreview
        step={mockStep}
        isActive={true}
        onClose={() => {}}
        onPrevious={handlePrevious}
        onNext={handleNext}
        onSkip={handleSkip}
        isFirstStep={false}
        isLastStep={false}
        currentStepIndex={1}
        totalSteps={3}
      />
    );
    fireEvent.keyDown(window, { key: 'p' });
    expect(handlePrevious).toHaveBeenCalled();

    fireEvent.keyDown(window, { key: 'n' });
    expect(handleNext).toHaveBeenCalled();

    fireEvent.keyDown(window, { key: 's' });
    expect(handleSkip).toHaveBeenCalled();
  });
});
