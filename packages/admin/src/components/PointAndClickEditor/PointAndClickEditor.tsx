import React, { useState, useEffect, useRef } from 'react';
import { useWalkthrough } from '../../context/WalkthroughContext';
import { useAuth } from '../../context/AuthContext';
import { ApiClientImpl } from '../../api/client';
import { Step } from '../../types/walkthrough';
import { StepBuilder } from '../StepBuilder/StepBuilder';
import './PointAndClickEditor.css';

// Simple SVG icons
const SelectIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
  </svg>
);

const CreateIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 5v14M5 12h14" />
  </svg>
);

interface PointAndClickEditorProps {
  onStepCreated?: (step: Step) => void;
  onStepUpdated?: (step: Step) => void;
  onStepDeleted?: (stepId: string) => void;
}

export const getElementSelector = (element: HTMLElement): string => {
  // Start with the element itself
  let selector = '';
  let currentElement: HTMLElement | null = element;

  while (currentElement && currentElement !== document.body) {
    // Get the element's tag name
    const tagName = currentElement.tagName.toLowerCase();

    // Try to find a unique identifier
    let identifier = '';

    // Check for ID first
    if (currentElement.id) {
      identifier = `#${currentElement.id}`;
    } else {
      // Check for class names
      const classNames = Array.from(currentElement.classList);
      if (classNames.length > 0) {
        identifier = `.${classNames.join('.')}`;
      }

      // If no class names, try to find a unique attribute
      if (!identifier) {
        const attributes = Array.from(currentElement.attributes);
        const uniqueAttr = attributes.find(
          attr => attr.name !== 'class' && attr.name !== 'id' && attr.value
        );
        if (uniqueAttr) {
          identifier = `[${uniqueAttr.name}="${uniqueAttr.value}"]`;
        }
      }

      // If still no identifier, use nth-child
      if (!identifier) {
        const parent = currentElement.parentElement;
        if (parent) {
          const index = Array.from(parent.children).indexOf(currentElement) + 1;
          identifier = `:nth-child(${index})`;
        }
      }
    }

    // Build the selector
    selector = `${tagName}${identifier}${selector ? ' > ' + selector : ''}`;

    // Move up to the parent element
    currentElement = currentElement.parentElement;
  }

  return selector;
};

export const PointAndClickEditor: React.FC<PointAndClickEditorProps> = ({
  onStepCreated,
  onStepUpdated,
  onStepDeleted,
}) => {
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectedElement, setSelectedElement] = useState<HTMLElement | null>(null);
  const [showStepBuilder, setShowStepBuilder] = useState(false);
  const [selectedElementSelector, setSelectedElementSelector] = useState<string>('');
  const editorRef = useRef<HTMLDivElement>(null);
  const { state: walkthroughState, dispatch } = useWalkthrough();
  const { state: authState, login, setApiKey } = useAuth();
  const apiClient = new ApiClientImpl({
    baseUrl: process.env.REACT_APP_API_URL || 'http://localhost:3000',
  });

  useEffect(() => {
    // Initialize mock authentication
    login('admin@example.com', 'password');
    setApiKey('mock-api-key');

    // Initialize mock walkthrough
    const mockWalkthrough = {
      id: '1',
      name: 'Test Walkthrough',
      description: 'A test walkthrough',
      steps: [],
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    dispatch({ type: 'SET_CURRENT_WALKTHROUGH', payload: mockWalkthrough });
  }, []);

  useEffect(() => {
    if (isSelecting) {
      document.addEventListener('mouseover', handleElementHover);
      document.addEventListener('mouseout', handleElementHoverOut);
      document.addEventListener('click', handleElementClick);
    }

    return () => {
      document.removeEventListener('mouseover', handleElementHover);
      document.removeEventListener('mouseout', handleElementHoverOut);
      document.removeEventListener('click', handleElementClick);
      // Clean up any remaining outlines
      removeAllOutlines();
    };
  }, [isSelecting]);

  const removeAllOutlines = () => {
    document.querySelectorAll('.element-hover').forEach(el => {
      el.classList.remove('element-hover');
    });
  };

  const handleElementHover = (e: MouseEvent) => {
    if (!isSelecting) return;

    const target = e.target as HTMLElement;
    if (target && target !== selectedElement) {
      removeAllOutlines();
      target.classList.add('element-hover');
    }
  };

  const handleElementHoverOut = (e: MouseEvent) => {
    if (!isSelecting) return;

    const target = e.target as HTMLElement;
    if (target && target !== selectedElement) {
      target.classList.remove('element-hover');
    }
  };

  const handleElementClick = (e: MouseEvent) => {
    e.preventDefault();
    if (!isSelecting) return;

    const target = e.target as HTMLElement;
    // Remove any existing selected element class
    if (selectedElement) {
      selectedElement.classList.remove('element-selected');
    }
    // Remove hover outlines
    removeAllOutlines();
    // Set the new selected element
    setSelectedElement(target);
    // Generate and store the selector
    const selector = getElementSelector(target);
    setSelectedElementSelector(selector);
    setIsSelecting(false);
    // Add selected class to the new element
    target.classList.add('element-selected');
    // Show the step builder
    setShowStepBuilder(true);
  };

  const startElementSelection = () => {
    // Remove any existing selected element class
    if (selectedElement) {
      selectedElement.classList.remove('element-selected');
    }
    setIsSelecting(true);
    setSelectedElement(null);
    setSelectedElementSelector('');
    removeAllOutlines();
  };

  const handleStepBuilderSave = async (stepData: Partial<Step>) => {
    console.log('Saving step with data:', stepData);
    if (!selectedElement || !authState.isAuthenticated || !walkthroughState.currentWalkthrough) {
      console.log('Missing required data:', {
        selectedElement: !!selectedElement,
        isAuthenticated: authState.isAuthenticated,
        currentWalkthrough: !!walkthroughState.currentWalkthrough,
      });
      return;
    }

    try {
      const step: Omit<Step, 'id' | 'createdAt' | 'updatedAt'> = {
        title: stepData.title || 'New Step',
        content: stepData.content || 'New step content',
        target: selectedElementSelector,
        order: walkthroughState.currentWalkthrough.steps.length + 1,
        elementSelector: selectedElementSelector,
        position: {
          top: selectedElement.offsetTop,
          left: selectedElement.offsetLeft,
          width: selectedElement.offsetWidth,
          height: selectedElement.offsetHeight,
        },
      };

      console.log('Creating step with data:', step);
      const response = await apiClient.createStep(walkthroughState.currentWalkthrough.id, step);
      console.log('Step created successfully:', response);
      dispatch({ type: 'ADD_STEP', payload: response });
      onStepCreated?.(response);
      setShowStepBuilder(false);
    } catch (error) {
      console.error('Error creating step:', error);
    }
  };

  const handleStepBuilderCancel = () => {
    setShowStepBuilder(false);
    if (selectedElement) {
      selectedElement.classList.remove('element-selected');
      setSelectedElement(null);
    }
  };

  const calculateElementPosition = (element: HTMLElement) => {
    const rect = element.getBoundingClientRect();
    return {
      top: rect.top,
      left: rect.left,
      width: rect.width,
      height: rect.height,
    };
  };

  return (
    <div className="point-and-click-editor" ref={editorRef}>
      <div className="editor-toolbar">
        <button
          onClick={startElementSelection}
          className={`selection-button ${isSelecting ? 'active' : ''}`}
        >
          <SelectIcon />
          {isSelecting ? 'Cancel Selection' : 'Select Element'}
        </button>
      </div>
      {showStepBuilder && selectedElement && (
        <StepBuilder
          onSave={handleStepBuilderSave}
          onCancel={handleStepBuilderCancel}
          step={{
            title: '',
            content: '',
            target: selectedElementSelector,
            elementSelector: selectedElementSelector,
            position: {
              top: selectedElement.offsetTop,
              left: selectedElement.offsetLeft,
              width: selectedElement.offsetWidth,
              height: selectedElement.offsetHeight,
            },
            order: 0,
          }}
        />
      )}

      <div className="steps-list">
        <h3>Steps</h3>
        {walkthroughState.currentWalkthrough?.steps.map(step => (
          <div key={step.id} className="step-item">
            <h4>{step.title}</h4>
            <p>{step.content}</p>
            <p className="target-info">Target: {step.target}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PointAndClickEditor;
