import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { StepBuilder } from '../StepBuilder';

describe('StepBuilder', () => {
  const mockStep = {
    id: '1',
    title: 'Test Step',
    content: 'Test content',
    target: '#test-element',
    order: 1,
  };

  const mockOnSave = jest.fn();
  const mockOnCancel = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders with empty form when no step is provided', () => {
    render(<StepBuilder onSave={mockOnSave} onCancel={mockOnCancel} />);

    expect(screen.getByLabelText('Title')).toHaveValue('');
    expect(screen.getByLabelText('Content')).toHaveValue('');
    expect(screen.getByLabelText('Target Element')).toHaveValue('');
  });

  it('renders with step data when step is provided', () => {
    render(<StepBuilder step={mockStep} onSave={mockOnSave} onCancel={mockOnCancel} />);

    expect(screen.getByLabelText('Title')).toHaveValue(mockStep.title);
    expect(screen.getByLabelText('Content')).toHaveValue(mockStep.content);
    expect(screen.getByLabelText('Target Element')).toHaveValue(mockStep.target);
  });

  it('calls onSave with form data when form is submitted', () => {
    render(<StepBuilder onSave={mockOnSave} onCancel={mockOnCancel} />);

    fireEvent.change(screen.getByLabelText('Title'), { target: { value: 'New Title' } });
    fireEvent.change(screen.getByLabelText('Content'), { target: { value: 'New Content' } });
    fireEvent.change(screen.getByLabelText('Target Element'), {
      target: { value: '#new-element' },
    });

    fireEvent.click(screen.getByText('Save Step'));

    expect(mockOnSave).toHaveBeenCalledWith({
      title: 'New Title',
      content: 'New Content',
      target: '#new-element',
      order: 0,
    });
  });

  it('calls onCancel when cancel button is clicked', () => {
    render(<StepBuilder onSave={mockOnSave} onCancel={mockOnCancel} />);

    fireEvent.click(screen.getByText('Cancel'));

    expect(mockOnCancel).toHaveBeenCalled();
  });

  it('calls onSave with empty values when form is submitted without input', () => {
    render(<StepBuilder onSave={mockOnSave} onCancel={mockOnCancel} />);

    const saveButton = screen.getByText('Save Step');
    fireEvent.click(saveButton);

    expect(mockOnSave).toHaveBeenCalledWith({
      title: '',
      content: '',
      target: '',
      order: 0,
    });
  });
});
