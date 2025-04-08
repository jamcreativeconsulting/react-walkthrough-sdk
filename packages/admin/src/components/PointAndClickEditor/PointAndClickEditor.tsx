import React, { useRef, useState, useEffect } from 'react';
import { useWalkthrough } from '../../context/WalkthroughContext';
import { Step } from '../../types/walkthrough';
import { StepPreview } from '../StepPreview/StepPreview';
import { StepBuilder } from '../StepBuilder/StepBuilder';
import './PointAndClickEditor.css';

export const PointAndClickEditor: React.FC = () => {
  const { state, dispatch } = useWalkthrough();
  const [selectedElement, setSelectedElement] = useState<HTMLElement | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const editorRef = useRef<HTMLDivElement>(null);

  const totalSteps = state.currentWalkthrough?.steps.length || 0;

  useEffect(() => {
    if (saveMessage) {
      const timer = setTimeout(() => setSaveMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [saveMessage]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (!isEditing && editorRef.current) {
        const target = e.target as HTMLElement;
        if (!editorRef.current.contains(target)) {
          // Check if there's already a step for this element
          const existingStepIndex = state.currentWalkthrough?.steps.findIndex(
            step => step.targetElement === (target.id || target.tagName.toLowerCase())
          );

          if (existingStepIndex !== undefined && existingStepIndex >= 0) {
            setCurrentStepIndex(existingStepIndex);
            setSelectedElement(target);
          } else {
            handleElementSelect(target);
          }
        }
      }
    };

    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [isEditing, state.currentWalkthrough?.steps]);

  const handleElementSelect = (element: HTMLElement) => {
    const newStep: Step = {
      id: crypto.randomUUID(),
      title: '',
      content: '',
      targetElement: element.id || element.tagName.toLowerCase(),
      position: {
        top: element.offsetTop,
        left: element.offsetLeft,
        width: element.offsetWidth,
        height: element.offsetHeight,
      },
      order: state.currentWalkthrough?.steps.length || 0,
      completed: false,
    };

    // First add the step to create the walkthrough if needed
    dispatch({ type: 'ADD_STEP', payload: newStep });

    // Then set the UI state
    setSelectedElement(element);
    setIsEditing(true);
    setCurrentStepIndex(state.currentWalkthrough?.steps.length || 0);
  };

  const handlePrevStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  const handleNextStep = () => {
    if (currentStepIndex < totalSteps - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
      dispatch({
        type: 'UPDATE_STEP',
        payload: {
          ...state.currentWalkthrough!.steps[currentStepIndex],
          completed: true,
        },
      });
    }
  };

  const handleSkipStep = () => {
    if (currentStepIndex < totalSteps - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    }
  };

  const handleClosePreview = () => {
    setSelectedElement(null);
    setIsEditing(false);
  };

  const handleSaveStep = (step: Step) => {
    if (state.currentWalkthrough?.steps.some(s => s.id === step.id)) {
      dispatch({ type: 'UPDATE_STEP', payload: step });
      setSaveMessage('Step updated successfully!');
    } else {
      dispatch({ type: 'ADD_STEP', payload: step });
      setSaveMessage('Step added successfully!');
    }
    setIsEditing(false);
  };

  const handleEditStep = (index: number) => {
    setCurrentStepIndex(index);
    setIsEditing(true);
  };

  const handleDeleteStep = (stepId: string) => {
    dispatch({ type: 'REMOVE_STEP', payload: stepId });
    setIsEditing(false);
  };

  return (
    <div ref={editorRef} className="point-and-click-editor">
      <div className="editor-header">
        <h2>Point and Click Editor</h2>
        <div className="editor-controls">
          <button onClick={() => setIsEditing(false)}>Cancel</button>
          <button
            onClick={() => {
              if (state.currentWalkthrough) {
                dispatch({
                  type: 'SET_WALKTHROUGHS',
                  payload: [...state.walkthroughs, state.currentWalkthrough],
                });
                setSaveMessage('Walkthrough saved successfully!');
              }
            }}
          >
            Save
          </button>
        </div>
      </div>

      {saveMessage && <div className="save-message">{saveMessage}</div>}

      {state.currentWalkthrough &&
        state.currentWalkthrough.steps &&
        state.currentWalkthrough.steps.length > 0 && (
          <div className="steps-list">
            <h3>Steps ({totalSteps})</h3>
            {state.currentWalkthrough.steps.map((step, index) => (
              <div key={step.id} className="step-item">
                <span>
                  {index + 1}. {step.title || 'Untitled Step'}
                </span>
                <div className="step-actions">
                  <button onClick={() => handleEditStep(index)}>Edit</button>
                  <button onClick={() => handleDeleteStep(step.id)}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}

      {isEditing && (state.currentWalkthrough?.steps[currentStepIndex] || selectedElement) && (
        <StepBuilder
          step={
            state.currentWalkthrough?.steps[currentStepIndex] || {
              id: crypto.randomUUID(),
              title: '',
              content: '',
              targetElement: selectedElement?.id || selectedElement?.tagName.toLowerCase() || '',
              position: selectedElement
                ? {
                    top: selectedElement.offsetTop,
                    left: selectedElement.offsetLeft,
                    width: selectedElement.offsetWidth,
                    height: selectedElement.offsetHeight,
                  }
                : { top: 0, left: 0, width: 0, height: 0 },
              order: state.currentWalkthrough?.steps.length || 0,
              completed: false,
            }
          }
          onSave={handleSaveStep}
          onCancel={() => setIsEditing(false)}
          onDelete={() => {
            if (state.currentWalkthrough?.steps[currentStepIndex]) {
              handleDeleteStep(state.currentWalkthrough.steps[currentStepIndex].id);
            }
          }}
        />
      )}

      {selectedElement && state.currentWalkthrough?.steps[currentStepIndex] && !isEditing && (
        <StepPreview
          step={state.currentWalkthrough.steps[currentStepIndex]}
          isActive={true}
          onPrevious={handlePrevStep}
          onNext={handleNextStep}
          onSkip={handleSkipStep}
          onClose={handleClosePreview}
          isFirstStep={currentStepIndex === 0}
          isLastStep={currentStepIndex === totalSteps - 1}
          currentStepIndex={currentStepIndex}
          totalSteps={totalSteps}
        />
      )}
    </div>
  );
};

export default PointAndClickEditor;
