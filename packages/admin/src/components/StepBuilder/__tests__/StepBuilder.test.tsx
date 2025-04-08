import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { StepBuilder } from '../StepBuilder';
import { Step } from '../../../types/walkthrough';

describe('StepBuilder', () => {
  const mockStep: Step = {
    id: '1',
    title: 'Test Step',
    content: 'Test Content',
    targetElement: '#test-element',
    position: {
      top: 0,
      left: 0,
      width: 100,
      height: 100,
    },
    order: 1,
  };

  beforeEach(() => {
    // Mock window.alert
    window.alert = jest.fn();
  });

  it('renders with initial step data', () => {
    render(
      <StepBuilder step={mockStep} onSave={() => {}} onCancel={() => {}} onDelete={() => {}} />
    );
    expect(screen.getByDisplayValue('Test Step')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Test Content')).toBeInTheDocument();
    expect(screen.getByDisplayValue('#test-element')).toBeInTheDocument();
  });

  it('calls onSave with updated step data', () => {
    const handleSave = jest.fn();
    render(
      <StepBuilder step={mockStep} onSave={handleSave} onCancel={() => {}} onDelete={() => {}} />
    );

    const titleInput = screen.getByLabelText('Title');
    const contentInput = screen.getByLabelText('Content');
    const saveButton = screen.getByText('Save');

    fireEvent.change(titleInput, { target: { value: 'New Title' } });
    fireEvent.change(contentInput, { target: { value: 'New Content' } });
    fireEvent.click(saveButton);

    expect(handleSave).toHaveBeenCalledWith({
      ...mockStep,
      title: 'New Title',
      content: 'New Content',
    });
  });

  it('validates required fields before saving', () => {
    const handleSave = jest.fn();
    render(
      <StepBuilder step={mockStep} onSave={handleSave} onCancel={() => {}} onDelete={() => {}} />
    );

    const titleInput = screen.getByLabelText('Title');
    const contentInput = screen.getByLabelText('Content');
    const saveButton = screen.getByText('Save');

    fireEvent.change(titleInput, { target: { value: '' } });
    fireEvent.change(contentInput, { target: { value: '' } });
    fireEvent.click(saveButton);

    expect(handleSave).not.toHaveBeenCalled();
    expect(window.alert).toHaveBeenCalledWith('Please fill in all fields');
  });

  it('calls onCancel when cancel button is clicked', () => {
    const handleCancel = jest.fn();
    render(
      <StepBuilder step={mockStep} onSave={() => {}} onCancel={handleCancel} onDelete={() => {}} />
    );

    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);

    expect(handleCancel).toHaveBeenCalled();
  });

  it('calls onDelete when delete button is clicked', () => {
    const handleDelete = jest.fn();
    render(
      <StepBuilder step={mockStep} onSave={() => {}} onCancel={() => {}} onDelete={handleDelete} />
    );

    const deleteButton = screen.getByText('Delete');
    fireEvent.click(deleteButton);

    expect(handleDelete).toHaveBeenCalled();
  });
});
