import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { StepOrder } from '../StepOrder';
import { WalkthroughProvider } from '../../../context/WalkthroughContext';
import { Step } from '../../../types/walkthrough';

const mockSteps: Step[] = [
  {
    id: '1',
    title: 'First Step',
    content: 'First step content',
    targetElement: 'button',
    position: { top: 0, left: 0, width: 100, height: 50 },
    order: 0,
    completed: false,
  },
  {
    id: '2',
    title: 'Second Step',
    content: 'Second step content',
    targetElement: 'input',
    position: { top: 100, left: 0, width: 200, height: 30 },
    order: 1,
    completed: false,
  },
];

const mockWalkthrough = {
  id: 'test-walkthrough',
  title: 'Test Walkthrough',
  description: 'Test description',
  steps: mockSteps,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const mockDispatch = jest.fn();
const mockOnStepSelect = jest.fn();

const renderStepOrder = () => {
  return render(
    <WalkthroughProvider>
      <StepOrder onStepSelect={mockOnStepSelect} />
    </WalkthroughProvider>
  );
};

describe('StepOrder', () => {
  beforeEach(() => {
    mockDispatch.mockClear();
    mockOnStepSelect.mockClear();

    // Mock the WalkthroughContext
    jest.spyOn(React, 'useContext').mockImplementation(() => ({
      state: {
        currentWalkthrough: mockWalkthrough,
        walkthroughs: [],
        loading: false,
        error: null,
      },
      dispatch: mockDispatch,
    }));
  });

  it('renders step order list', () => {
    renderStepOrder();

    // Check if steps are rendered
    expect(screen.getByText('First Step')).toBeInTheDocument();
    expect(screen.getByText('Second Step')).toBeInTheDocument();

    // Check if step numbers are correct
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('handles step selection', () => {
    renderStepOrder();

    // Click on first step
    fireEvent.click(screen.getByText('First Step'));
    expect(mockOnStepSelect).toHaveBeenCalledWith(0);

    // Click on second step
    fireEvent.click(screen.getByText('Second Step'));
    expect(mockOnStepSelect).toHaveBeenCalledWith(1);
  });

  it('handles drag and drop', async () => {
    const { container } = renderStepOrder();

    // Get the step elements
    const steps = container.querySelectorAll('.step-order-item');
    expect(steps.length).toBe(2);

    const firstStep = steps[0];
    const secondStep = steps[1];

    // Mock dataTransfer with setData and getData methods
    const mockDataTransfer = {
      effectAllowed: '',
      dropEffect: '',
      data: {} as Record<string, string>,
      setData: function (type: string, data: string) {
        this.data[type] = data;
      },
      getData: function (type: string) {
        return this.data[type];
      },
    };

    // Start dragging the first step
    fireEvent.dragStart(firstStep, {
      dataTransfer: mockDataTransfer,
    });

    // Drag over the second step
    fireEvent.dragOver(secondStep, {
      dataTransfer: mockDataTransfer,
    });

    // Drop on the second step
    fireEvent.drop(secondStep, {
      dataTransfer: mockDataTransfer,
    });

    // Verify the steps were reordered
    await waitFor(() => {
      expect(mockDispatch).toHaveBeenCalledWith({
        type: 'UPDATE_STEP_ORDER',
        payload: expect.arrayContaining([
          expect.objectContaining({ id: '1', order: 1 }),
          expect.objectContaining({ id: '2', order: 0 }),
        ]),
      });
    });
  });
});
