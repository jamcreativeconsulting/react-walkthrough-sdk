import React from 'react';
import { render, screen, fireEvent, within, waitFor } from '@testing-library/react';
import { PointAndClickEditor } from '../PointAndClickEditor';
import { WalkthroughProvider } from '../../../context/WalkthroughContext';
import { Step } from '../../../types/walkthrough';

// Mock crypto.randomUUID
const mockUUID = '123e4567-e89b-12d3-a456-426614174000';
global.crypto = {
  ...global.crypto,
  randomUUID: () => mockUUID,
};

// Create a function to get fresh mock data for each test
const getMockWalkthrough = () => ({
  id: '1',
  title: 'Test Walkthrough',
  description: 'Test Description',
  steps: [] as Step[],
});

// Mock the WalkthroughContext with a function to update state
const createMockState = () => ({
  currentWalkthrough: getMockWalkthrough(),
  walkthroughs: [getMockWalkthrough()],
  loading: false,
  error: null,
});

const mockDispatch = jest.fn(action => {
  // Update mockState based on the action
  switch (action.type) {
    case 'UPDATE_STEP':
      mockState.currentWalkthrough.steps = [
        ...mockState.currentWalkthrough.steps.filter(step => step.id !== action.payload.id),
        action.payload,
      ];
      break;
    case 'REMOVE_STEP':
      mockState.currentWalkthrough.steps = mockState.currentWalkthrough.steps.filter(
        step => step.id !== action.payload
      );
      break;
  }
});

let mockState = createMockState();

jest.mock('../../../context/WalkthroughContext', () => ({
  ...jest.requireActual('../../../context/WalkthroughContext'),
  useWalkthrough: () => ({
    state: mockState,
    dispatch: mockDispatch,
  }),
}));

const renderEditor = () => {
  return render(
    <WalkthroughProvider>
      <div id="test-element">Test Element</div>
      <PointAndClickEditor />
    </WalkthroughProvider>
  );
};

describe('PointAndClickEditor', () => {
  beforeEach(() => {
    mockDispatch.mockClear();
    mockState = createMockState();
  });

  it('saves a new step', async () => {
    renderEditor();

    // Click the test element to start creating a step
    const testElement = screen.getByText('Test Element');
    fireEvent.click(testElement);

    // Now the StepBuilder should be rendered
    const stepBuilder = await screen.findByRole('dialog', { name: 'Edit Step' });
    const titleInput = within(stepBuilder).getByLabelText('Title');
    const contentInput = within(stepBuilder).getByLabelText('Content');

    fireEvent.change(titleInput, { target: { value: 'Test Step' } });
    fireEvent.change(contentInput, { target: { value: 'Test Content' } });

    // Click save button in the StepBuilder
    const saveButton = within(stepBuilder).getByText('Save');
    fireEvent.click(saveButton);

    // Verify step is added to the list
    await waitFor(() => {
      const stepItem = screen.getByText((content, element) => {
        return element?.textContent === '1. Test Step';
      });
      expect(stepItem).toBeInTheDocument();
    });

    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'UPDATE_STEP',
      payload: expect.objectContaining({
        title: 'Test Step',
        content: 'Test Content',
      }),
    });
  });

  it('shows step preview', async () => {
    renderEditor();

    // Click the test element to create a step
    const testElement = screen.getByText('Test Element');
    fireEvent.click(testElement);

    // Fill in step details
    const stepBuilder = await screen.findByRole('dialog', { name: 'Edit Step' });
    const titleInput = within(stepBuilder).getByLabelText('Title');
    const contentInput = within(stepBuilder).getByLabelText('Content');

    fireEvent.change(titleInput, { target: { value: 'Test Step' } });
    fireEvent.change(contentInput, { target: { value: 'Test Content' } });

    // Save the step
    const saveButton = within(stepBuilder).getByText('Save');
    fireEvent.click(saveButton);

    // Wait for the step to be added and StepBuilder to be closed
    await waitFor(() => {
      expect(screen.getByText('1. Test Step')).toBeInTheDocument();
      expect(screen.queryByRole('dialog', { name: 'Edit Step' })).not.toBeInTheDocument();
    });

    // Click the test element again to show preview
    fireEvent.click(testElement);

    // Verify preview is shown
    await waitFor(() => {
      const stepPreview = screen.getByTestId('preview-title');
      expect(stepPreview).toBeInTheDocument();
      expect(stepPreview).toHaveTextContent('Test Step');
      expect(screen.getByTestId('preview-content')).toHaveTextContent('Test Content');
      expect(screen.getByText('Step 1 of 1')).toBeInTheDocument();
    });
  });

  it('edits an existing step', async () => {
    // Add a step to the mock state
    mockState.currentWalkthrough.steps = [
      {
        id: mockUUID,
        title: 'Initial Step',
        content: 'Initial Content',
        targetElement: 'test-element',
        position: { top: 0, left: 0, width: 100, height: 100 },
        order: 0,
      },
    ];

    renderEditor();

    // Click edit button in the steps list
    const editButton = screen.getByText('Edit');
    fireEvent.click(editButton);

    // Update step details in the StepBuilder
    const stepBuilder = await screen.findByRole('dialog', { name: 'Edit Step' });
    const titleInput = within(stepBuilder).getByLabelText('Title');
    const contentInput = within(stepBuilder).getByLabelText('Content');

    fireEvent.change(titleInput, { target: { value: 'Updated Step' } });
    fireEvent.change(contentInput, { target: { value: 'Updated Content' } });

    // Save the updated step
    const saveButton = within(stepBuilder).getByText('Save');
    fireEvent.click(saveButton);

    // Verify step is updated
    await waitFor(() => {
      const stepItem = screen.getByText((content, element) => {
        return element?.textContent === '1. Updated Step';
      });
      expect(stepItem).toBeInTheDocument();
    });

    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'UPDATE_STEP',
      payload: expect.objectContaining({
        title: 'Updated Step',
        content: 'Updated Content',
      }),
    });
  });

  it('deletes a step', async () => {
    // Add a step to the mock state
    mockState.currentWalkthrough.steps = [
      {
        id: mockUUID,
        title: 'Test Step',
        content: 'Test Content',
        targetElement: 'test-element',
        position: { top: 0, left: 0, width: 100, height: 100 },
        order: 0,
      },
    ];

    renderEditor();

    // Click edit button in the steps list
    const editButton = screen.getByText('Edit');
    fireEvent.click(editButton);

    // Click delete button in the StepBuilder
    const stepBuilder = await screen.findByRole('dialog', { name: 'Edit Step' });
    const deleteButton = within(stepBuilder).getByText('Delete');
    fireEvent.click(deleteButton);

    // Verify step is removed
    await waitFor(() => {
      const stepItem = screen.queryByText((content, element) => {
        return element?.textContent === '1. Test Step';
      });
      expect(stepItem).not.toBeInTheDocument();
    });

    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'REMOVE_STEP',
      payload: mockUUID,
    });
  });
});
