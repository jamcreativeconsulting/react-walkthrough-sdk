import React, { useState, useEffect } from 'react';
import { Step } from '../../types/walkthrough';
import './StepBuilder.css';

interface StepBuilderProps {
  step: Step;
  onSave: (step: Step) => void;
  onCancel: () => void;
  onDelete: () => void;
}

export const StepBuilder: React.FC<StepBuilderProps> = ({ step, onSave, onCancel, onDelete }) => {
  const [title, setTitle] = useState(step.title);
  const [content, setContent] = useState(step.content);

  useEffect(() => {
    setTitle(step.title);
    setContent(step.content);
  }, [step]);

  const handleSave = () => {
    if (!title.trim() || !content.trim()) {
      alert('Please fill in all fields');
      return;
    }

    onSave({
      ...step,
      title: title.trim(),
      content: content.trim(),
    });
  };

  return (
    <div className="step-builder" role="dialog" aria-label="Edit Step">
      <h3>Edit Step</h3>
      <div className="form-group">
        <label htmlFor="title">Title</label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="Enter step title"
        />
      </div>
      <div className="form-group">
        <label htmlFor="content">Content</label>
        <textarea
          id="content"
          value={content}
          onChange={e => setContent(e.target.value)}
          placeholder="Enter step content"
        />
      </div>
      <div className="form-group">
        <label>Target Element</label>
        <input
          type="text"
          value={step.targetElement}
          readOnly
          placeholder="Click on an element to select it"
        />
      </div>
      <div className="button-group">
        <button onClick={handleSave}>Save</button>
        <button onClick={onCancel}>Cancel</button>
        <button onClick={onDelete} className="delete-button">
          Delete
        </button>
      </div>
    </div>
  );
};
