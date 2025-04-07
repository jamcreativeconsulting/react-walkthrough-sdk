import React, { useRef, useEffect, useState } from 'react';
import { useWalkthrough } from '../../context/WalkthroughContext';
import { StepBuilder } from '../StepBuilder/StepBuilder';
import { StepPreview } from '../StepPreview/StepPreview';
import { Step, Walkthrough } from '../../types/walkthrough';
import { ApiClientImpl } from '../../api/client';
import { getElementSelector } from './elementSelector';
import './PointAndClickEditor.css';

interface Position {
  top: number;
  left: number;
  width: number;
  height: number;
}

export const PointAndClickEditor: React.FC = () => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [showStepBuilder, setShowStepBuilder] = useState(false);
  const [selectedElementSelector, setSelectedElementSelector] = useState<string>('');
  const [selectedPosition, setSelectedPosition] = useState<Position | null>(null);
  const [isSelecting, setIsSelecting] = useState(false);
  const [hoveredElement, setHoveredElement] = useState<HTMLElement | null>(null);
  const [activeStepIndex, setActiveStepIndex] = useState<number>(0);
  const { state, dispatch } = useWalkthrough();

  useEffect(() => {
    const apiClient = new ApiClientImpl({
      baseUrl: process.env.REACT_APP_API_URL || 'http://localhost:3000',
      apiKey: process.env.REACT_APP_API_KEY || '',
    });

    const mockWalkthrough: Walkthrough = {
      id: '1',
      title: 'Test Walkthrough',
      description: 'Test Description',
      steps: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    dispatch({ type: 'SET_CURRENT_WALKTHROUGH', payload: mockWalkthrough });
  }, [dispatch]);

  useEffect(() => {
    if (!isSelecting) return;

    const handleMouseOver = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (target.closest('.editor-controls') || target.closest('.step-builder-overlay')) return;

      if (hoveredElement) {
        hoveredElement.style.outline = '';
      }
      target.style.outline = '2px solid #3b82f6';
      setHoveredElement(target);
    };

    const handleMouseOut = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (target.closest('.editor-controls') || target.closest('.step-builder-overlay')) return;

      target.style.outline = '';
      setHoveredElement(null);
    };

    document.addEventListener('mouseover', handleMouseOver);
    document.addEventListener('mouseout', handleMouseOut);

    return () => {
      document.removeEventListener('mouseover', handleMouseOver);
      document.removeEventListener('mouseout', handleMouseOut);
      if (hoveredElement) {
        hoveredElement.style.outline = '';
      }
    };
  }, [isSelecting, hoveredElement]);

  const handleElementClick = (event: React.MouseEvent<HTMLElement>) => {
    if (showPreview || !isSelecting) return;

    event.preventDefault();
    event.stopPropagation();

    const target = event.target as HTMLElement;
    if (target.closest('.editor-controls') || target.closest('.step-builder-overlay')) return;

    if (hoveredElement) {
      hoveredElement.style.outline = '';
    }

    const selector = getElementSelector(target);
    const rect = target.getBoundingClientRect();

    const position = {
      top: rect.top,
      left: rect.left,
      width: rect.width,
      height: rect.height,
    };

    setSelectedElementSelector(selector);
    setSelectedPosition(position);
    setShowStepBuilder(true);
    setIsSelecting(false);
  };

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (showPreview || !isSelecting) return;

      const target = event.target as HTMLElement;
      if (target.closest('.editor-controls') || target.closest('.step-builder-overlay')) return;

      event.preventDefault();
      event.stopPropagation();

      if (hoveredElement) {
        hoveredElement.style.outline = '';
      }

      const selector = getElementSelector(target);
      const rect = target.getBoundingClientRect();

      const position = {
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height,
      };

      setSelectedElementSelector(selector);
      setSelectedPosition(position);
      setShowStepBuilder(true);
      setIsSelecting(false);
    };

    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [showPreview, isSelecting, hoveredElement]);

  const handleSaveStep = (step: Step) => {
    if (!state.currentWalkthrough) return;

    const newStep: Omit<Step, 'id'> = {
      title: step.title,
      content: step.content,
      targetElement: selectedElementSelector,
      position: selectedPosition!,
      order: state.currentWalkthrough.steps.length + 1,
    };

    dispatch({
      type: 'ADD_STEP',
      payload: {
        ...newStep,
        id: Date.now().toString(),
      },
    });

    setTimeout(() => {
      setShowStepBuilder(false);
      setSelectedElementSelector('');
      setSelectedPosition(null);
    }, 0);
  };

  const handleCancelStep = () => {
    setShowStepBuilder(false);
    setSelectedElementSelector('');
    setSelectedPosition(null);
    setIsSelecting(false);
  };

  const handleNextStep = () => {
    if (!state.currentWalkthrough?.steps.length) return;
    setActiveStepIndex(prev =>
      prev < state.currentWalkthrough!.steps.length - 1 ? prev + 1 : prev
    );
  };

  const handlePreviousStep = () => {
    setActiveStepIndex(prev => (prev > 0 ? prev - 1 : prev));
  };

  const handleSkip = () => {
    if (!state.currentWalkthrough?.steps.length) return;

    // Mark current step as completed
    dispatch({
      type: 'MARK_STEP_COMPLETED',
      payload: {
        stepId: state.currentWalkthrough.steps[activeStepIndex].id,
        completed: true,
      },
    });

    // If this was the last step, close the preview
    if (activeStepIndex === state.currentWalkthrough.steps.length - 1) {
      setShowPreview(false);
    } else {
      // Otherwise move to next step
      setActiveStepIndex(prev => prev + 1);
    }
  };

  return (
    <>
      <div className="editor-controls">
        <button onClick={() => setShowPreview(!showPreview)}>
          {showPreview ? 'Hide Preview' : 'Show Preview'}
        </button>
        <button onClick={() => setIsSelecting(true)} className={isSelecting ? 'active' : ''}>
          Select Element
        </button>
      </div>

      {isSelecting && (
        <div className="selection-mode-indicator">Click on any element to create a step</div>
      )}

      {showStepBuilder && selectedPosition && (
        <div
          className="step-builder-overlay"
          style={{
            top: selectedPosition.top,
            left: selectedPosition.left,
          }}
        >
          <StepBuilder
            step={{
              id: '',
              title: '',
              content: '',
              targetElement: selectedElementSelector,
              position: selectedPosition,
              order: state.currentWalkthrough?.steps.length || 0,
            }}
            onSave={handleSaveStep}
            onCancel={handleCancelStep}
          />
        </div>
      )}

      {showPreview && state.currentWalkthrough?.steps[activeStepIndex] && (
        <StepPreview
          step={state.currentWalkthrough.steps[activeStepIndex]}
          isActive={true}
          onClose={() => setShowPreview(false)}
          onPrevious={handlePreviousStep}
          onNext={handleNextStep}
          onSkip={handleSkip}
          isFirstStep={activeStepIndex === 0}
          isLastStep={activeStepIndex === (state.currentWalkthrough?.steps.length || 0) - 1}
        />
      )}

      {showPreview &&
        state.currentWalkthrough?.steps &&
        state.currentWalkthrough.steps.length > 0 && (
          <div className="preview-navigation">
            <button onClick={handlePreviousStep} disabled={activeStepIndex === 0}>
              Previous
            </button>
            <span>
              Step {activeStepIndex + 1} of {state.currentWalkthrough.steps.length}
            </span>
            <button
              onClick={handleNextStep}
              disabled={activeStepIndex === state.currentWalkthrough.steps.length - 1}
            >
              Next
            </button>
          </div>
        )}

      <div className="point-and-click-editor" ref={editorRef}>
        {state.currentWalkthrough?.steps.map(step => (
          <div key={step.id} className="step-marker">
            <div className="step-info">
              <h3>{step.title}</h3>
              <p>{step.content}</p>
              <p className="target-info">Target: {step.targetElement}</p>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default PointAndClickEditor;
