import React, { useState, useEffect, useRef } from 'react';
import { useWalkthrough } from '../../context/WalkthroughContext';
import { useAuth } from '../../context/AuthContext';
import { ApiClientImpl } from '../../api/client';
import { Step, Walkthrough } from '../../types/walkthrough';
import { ApiConfig } from '../../types/api';
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
  const editorRef = useRef<HTMLDivElement>(null);
  const { state: walkthroughState, dispatch } = useWalkthrough();
  const { state: authState } = useAuth();
  const apiClient = new ApiClientImpl({
    baseUrl: process.env.REACT_APP_API_URL || 'http://localhost:3000',
  });

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
    setIsSelecting(false);
    // Add selected class to the new element
    target.classList.add('element-selected');
  };

  const startElementSelection = () => {
    // Remove any existing selected element class
    if (selectedElement) {
      selectedElement.classList.remove('element-selected');
    }
    setIsSelecting(true);
    setSelectedElement(null);
    removeAllOutlines();
  };

  const createStep = async () => {
    if (!selectedElement || !authState.isAuthenticated || !walkthroughState.currentWalkthrough)
      return;

    try {
      const step: Omit<Step, 'id'> = {
        title: 'New Step',
        content: 'New step content',
        target: getElementSelector(selectedElement),
        order: walkthroughState.currentWalkthrough.steps.length + 1,
      };

      const response = await apiClient.post<Step>(
        `/api/walkthroughs/${walkthroughState.currentWalkthrough.id}/steps`,
        step
      );
      dispatch({ type: 'ADD_STEP', payload: response.data });
      onStepCreated?.(response.data);
    } catch (error) {
      console.error('Error creating step:', error);
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
        <button onClick={createStep} disabled={!selectedElement}>
          <CreateIcon />
          Create Step
        </button>
      </div>
    </div>
  );
};

export default PointAndClickEditor;
