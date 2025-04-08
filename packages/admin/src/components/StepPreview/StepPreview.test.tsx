import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { StepPreview } from './StepPreview';
import { Step } from '../../types/walkthrough';

const mockStep: Step = {
  id: 'step-1',
  title: 'Test Step',
  content: 'Test content',
  targetElement: '.test-target',
  position: {
    top: 100,
    left: 100,
    width: 200,
    height: 50,
  },
  order: 1,
  completed: false,
};

describe('StepPreview', () => {
  const mockOnClose = jest.fn();
  const mockOnPrevious = jest.fn();
  const mockOnNext = jest.fn();
  const mockOnSkip = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders nothing when not active', () => {
    render(
      <StepPreview
        step={mockStep}
        isActive={false}
        onClose={mockOnClose}
        onPrevious={mockOnPrevious}
        onNext={mockOnNext}
        onSkip={mockOnSkip}
        isFirstStep={true}
        isLastStep={false}
        currentStepIndex={0}
        totalSteps={3}
      />
    );
    expect(screen.queryByTestId('preview-title')).not.toBeInTheDocument();
  });

  it('renders step preview when active', () => {
    render(
      <StepPreview
        step={mockStep}
        isActive={true}
        onClose={mockOnClose}
        onPrevious={mockOnPrevious}
        onNext={mockOnNext}
        onSkip={mockOnSkip}
        isFirstStep={true}
        isLastStep={false}
        currentStepIndex={0}
        totalSteps={3}
      />
    );
    expect(screen.getByTestId('preview-title')).toHaveTextContent('Test Step');
    expect(screen.getByTestId('preview-content')).toHaveTextContent('Test content');
  });

  it('displays correct progress indicator', () => {
    render(
      <StepPreview
        step={mockStep}
        isActive={true}
        onClose={mockOnClose}
        onPrevious={mockOnPrevious}
        onNext={mockOnNext}
        onSkip={mockOnSkip}
        isFirstStep={false}
        isLastStep={false}
        currentStepIndex={1}
        totalSteps={3}
      />
    );
    expect(screen.getByText('Step 2 of 3')).toBeInTheDocument();
  });

  it('handles button clicks correctly', () => {
    render(
      <StepPreview
        step={mockStep}
        isActive={true}
        onClose={mockOnClose}
        onPrevious={mockOnPrevious}
        onNext={mockOnNext}
        onSkip={mockOnSkip}
        isFirstStep={false}
        isLastStep={false}
        currentStepIndex={1}
        totalSteps={3}
      />
    );

    fireEvent.click(screen.getByText('Next'));
    expect(mockOnNext).toHaveBeenCalled();

    fireEvent.click(screen.getByText('Prev'));
    expect(mockOnPrevious).toHaveBeenCalled();

    fireEvent.click(screen.getByText('Skip'));
    expect(mockOnSkip).toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: '×' }));
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('disables Prev button on first step', () => {
    render(
      <StepPreview
        step={mockStep}
        isActive={true}
        onClose={mockOnClose}
        onPrevious={mockOnPrevious}
        onNext={mockOnNext}
        onSkip={mockOnSkip}
        isFirstStep={true}
        isLastStep={false}
        currentStepIndex={0}
        totalSteps={3}
      />
    );
    expect(screen.getByText('Prev')).toBeDisabled();
  });

  it('disables Next button on last step', () => {
    render(
      <StepPreview
        step={mockStep}
        isActive={true}
        onClose={mockOnClose}
        onPrevious={mockOnPrevious}
        onNext={mockOnNext}
        onSkip={mockOnSkip}
        isFirstStep={false}
        isLastStep={true}
        currentStepIndex={2}
        totalSteps={3}
      />
    );
    expect(screen.getByText('Next')).toBeDisabled();
  });

  it('renders target highlight with correct position', () => {
    render(
      <StepPreview
        step={mockStep}
        isActive={true}
        onClose={mockOnClose}
        onPrevious={mockOnPrevious}
        onNext={mockOnNext}
        onSkip={mockOnSkip}
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
