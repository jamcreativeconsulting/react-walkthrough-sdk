import React, { useContext } from 'react';
import { useWalkthrough } from '../../context/WalkthroughContext';
import { Step } from '../../types/walkthrough';
import './StepOrder.css';

interface StepOrderProps {
  onStepSelect: (index: number) => void;
}

export const StepOrder: React.FC<StepOrderProps> = ({ onStepSelect }) => {
  const { state, dispatch } = useWalkthrough();
  const { currentWalkthrough } = state;

  if (!currentWalkthrough?.steps) {
    return null;
  }

  const handleDragStart = (e: React.DragEvent, index: number) => {
    e.dataTransfer.setData('text/plain', index.toString());
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    const sourceIndex = parseInt(e.dataTransfer.getData('text/plain'));

    if (sourceIndex === targetIndex) {
      return;
    }

    const newSteps = [...currentWalkthrough.steps];
    const [movedStep] = newSteps.splice(sourceIndex, 1);
    newSteps.splice(targetIndex, 0, movedStep);

    // Update the order property for all steps
    const reorderedSteps = newSteps.map((step, index) => ({
      ...step,
      order: index,
    }));

    dispatch({
      type: 'UPDATE_STEP_ORDER',
      payload: reorderedSteps,
    });
  };

  return (
    <div className="step-order">
      <h3>Step Order</h3>
      <div className="step-order-list">
        {currentWalkthrough.steps
          .sort((a: Step, b: Step) => (a.order ?? 0) - (b.order ?? 0))
          .map((step: Step, index: number) => (
            <div
              key={step.id}
              className="step-order-item"
              draggable
              onDragStart={e => handleDragStart(e, index)}
              onDragOver={handleDragOver}
              onDrop={e => handleDrop(e, index)}
              onClick={() => onStepSelect(index)}
            >
              <span className="step-number">{index + 1}</span>
              <span className="step-title">{step.title}</span>
            </div>
          ))}
      </div>
    </div>
  );
};

export default StepOrder;
