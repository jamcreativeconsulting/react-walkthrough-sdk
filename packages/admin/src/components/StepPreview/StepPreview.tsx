import React from 'react';
import { Step } from '../../types/walkthrough';
import './StepPreview.css';

interface StepPreviewProps {
  step: Step;
  isActive: boolean;
  onClose: () => void;
  onPrevious: () => void;
  onNext: () => void;
  onSkip: () => void;
  isFirstStep: boolean;
  isLastStep: boolean;
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
}) => {
  if (!isActive) return null;

  return (
    <>
      <div className="step-preview">
        <div className="preview-header">
          <h3>Step Preview</h3>
          <button className="close-button" onClick={onClose}>
            ×
          </button>
        </div>
        <div className="preview-content">
          <h4>{step.title}</h4>
          <p>{step.content}</p>
        </div>
      </div>
      <div
        className="target-highlight"
        data-testid="target-highlight"
        style={{
          top: step.position.top,
          left: step.position.left,
          width: step.position.width,
          height: step.position.height,
        }}
      />
      <div
        className="step-popover"
        style={{
          top: step.position.top + step.position.height + 10,
          left: step.position.left,
        }}
      >
        <div className="popover-content">
          <h4>{step.title}</h4>
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
