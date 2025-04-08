import React, { useEffect } from 'react';
import './StepPreview.css';

interface StepPreviewProps {
  step: {
    id: string;
    title: string;
    content: string;
    position: {
      top: number;
      left: number;
      width: number;
      height: number;
    };
    targetElement: string;
    order?: number;
  };
  isActive: boolean;
  onClose: () => void;
  onPrevious: () => void;
  onNext: () => void;
  onSkip: () => void;
  isFirstStep: boolean;
  isLastStep: boolean;
  currentStepIndex: number;
  totalSteps: number;
}

export const StepPreview: React.FC<StepPreviewProps> = ({
  step,
  isActive,
  onClose,
  onPrevious,
  onNext,
  onSkip,
  isFirstStep,
  isLastStep,
  currentStepIndex,
  totalSteps,
}) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isActive) return;

      switch (event.key) {
        case 'ArrowLeft':
        case 'p':
        case 'P':
          if (!isFirstStep) {
            onPrevious();
          }
          break;
        case 'ArrowRight':
        case 'n':
        case 'N':
        case 'Enter':
          if (!isLastStep) {
            onNext();
          }
          break;
        case 's':
        case 'S':
        case 'Escape':
          onSkip();
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isActive, isFirstStep, isLastStep, onPrevious, onNext, onSkip]);

  if (!isActive) return null;

  return (
    <>
      <div className="step-preview">
        <div className="preview-header">
          <h2>Step Preview</h2>
          <button className="close-button" onClick={onClose}>
            ×
          </button>
        </div>
        <div className="preview-content">
          <div className="progress-indicator">
            Step {currentStepIndex + 1} of {totalSteps}
          </div>
          <h3 data-testid="preview-title">{step.title}</h3>
          <p data-testid="preview-content">{step.content}</p>
        </div>
      </div>

      <div
        className="target-highlight"
        style={{
          top: step.position.top,
          left: step.position.left,
          width: step.position.width,
          height: step.position.height,
        }}
        data-testid="target-highlight"
      />

      <div
        className="step-popover"
        style={{
          top: step.position.top + step.position.height + 10,
          left: step.position.left,
        }}
      >
        <div className="popover-content">
          <h3>{step.title}</h3>
          <p>{step.content}</p>
          <div className="popover-actions">
            <button className="popover-button prev" onClick={onPrevious} disabled={isFirstStep}>
              Prev
            </button>
            <button className="popover-button skip" onClick={onSkip}>
              Skip
            </button>
            <button className="popover-button next" onClick={onNext} disabled={isLastStep}>
              Next
            </button>
          </div>
        </div>
        <div className="popover-arrow" />
      </div>
    </>
  );
};
