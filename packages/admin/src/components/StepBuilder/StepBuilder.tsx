import React, { useState } from 'react';
import { Step } from '../../types/walkthrough';
import './StepBuilder.css';

interface StepBuilderProps {
  step?: Step;
  onSave: (step: Partial<Step>) => void;
  onCancel: () => void;
}

export const StepBuilder: React.FC<StepBuilderProps> = ({ step, onSave, onCancel }) => {
  const [title, setTitle] = useState(step?.title || '');
  const [content, setContent] = useState(step?.content || '');
  const [target, setTarget] = useState(step?.target || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      title,
      content,
      target,
      elementSelector: step?.elementSelector || '',
      position: step?.position || {
        top: 0,
        left: 0,
        width: 0,
        height: 0,
      },
      order: step?.order || 0,
    });
  };

  return (
    <div className="step-builder">
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="title">Title</label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="content">Content</label>
          <textarea
            id="content"
            value={content}
            onChange={e => setContent(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="target">Target Element</label>
          <input
            id="target"
            type="text"
            value={target}
            onChange={e => setTarget(e.target.value)}
            required
            readOnly
          />
        </div>

        <div className="button-group">
          <button type="submit" className="save-button">
            Save Step
          </button>
          <button type="button" className="cancel-button" onClick={onCancel}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};
