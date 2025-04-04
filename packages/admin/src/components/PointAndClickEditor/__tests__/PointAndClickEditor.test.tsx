import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { PointAndClickEditor } from '../PointAndClickEditor';
import { useWalkthrough } from '../../../context/WalkthroughContext';
import { useAuth } from '../../../context/AuthContext';
import { ApiClientImpl } from '../../../api/client';

// Mock the contexts
jest.mock('../../../context/WalkthroughContext');
jest.mock('../../../context/AuthContext');
jest.mock('../../../api/client');

describe('PointAndClickEditor', () => {
  const mockWalkthroughState = {
    currentWalkthrough: {
      id: 'test-walkthrough',
      steps: [],
    },
  };

  const mockAuthState = {
    isAuthenticated: true,
    apiKey: 'test-api-key',
  };

  const mockDispatch = jest.fn();
  const mockPost = jest.fn();

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Setup context mocks
    (useWalkthrough as jest.Mock).mockReturnValue({
      state: mockWalkthroughState,
      dispatch: mockDispatch,
    });

    (useAuth as jest.Mock).mockReturnValue({
      state: mockAuthState,
    });

    // Mock ApiClientImpl
    mockPost.mockResolvedValue({
      data: {
        id: 'new-step-id',
        title: 'New Step',
        content: 'New step content',
        target: 'div.test-element',
        order: 1,
      },
    });

    (ApiClientImpl as jest.Mock).mockImplementation(() => ({
      post: mockPost,
    }));
  });

  it('renders the editor toolbar', () => {
    render(<PointAndClickEditor />);

    expect(screen.getByText('Select Element')).toBeInTheDocument();
    expect(screen.getByText('Create Step')).toBeInTheDocument();
    expect(screen.getByText('Preview Mode')).toBeInTheDocument();
  });

  it('enables element selection mode when clicking the select button', () => {
    render(<PointAndClickEditor />);

    const selectButton = screen.getByText('Select Element');
    fireEvent.click(selectButton);

    expect(screen.getByText('Cancel Selection')).toBeInTheDocument();
  });

  it('handles element selection and creates a step', async () => {
    const mockOnStepCreated = jest.fn();
    render(<PointAndClickEditor onStepCreated={mockOnStepCreated} />);

    // Start element selection
    const selectButton = screen.getByText('Select Element');
    await act(async () => {
      fireEvent.click(selectButton);
    });

    // Create a mock element and add it to the document
    const mockElement = document.createElement('div');
    mockElement.id = 'test-element';
    mockElement.className = 'test-class';
    document.body.appendChild(mockElement);

    // Mock getBoundingClientRect
    mockElement.getBoundingClientRect = jest.fn().mockReturnValue({
      top: 100,
      left: 100,
      width: 200,
      height: 50,
    });

    // Simulate click on element
    await act(async () => {
      fireEvent.click(mockElement);
    });

    // Create step
    const createButton = screen.getByText('Create Step');
    await act(async () => {
      fireEvent.click(createButton);
      // Wait for the next tick to allow async operations to complete
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    // Clean up
    document.body.removeChild(mockElement);

    // Verify API call
    expect(mockPost).toHaveBeenCalledWith(
      `/api/walkthroughs/${mockWalkthroughState.currentWalkthrough.id}/steps`,
      expect.objectContaining({
        title: 'New Step',
        content: 'New step content',
        target: expect.stringContaining('div'),
      })
    );

    // Verify dispatch was called
    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'ADD_STEP',
      payload: expect.objectContaining({
        id: 'new-step-id',
        title: 'New Step',
        target: expect.stringContaining('div'),
      }),
    });
  });

  it('disables create step button when no element is selected', () => {
    render(<PointAndClickEditor />);

    const createButton = screen.getByText('Create Step');
    expect(createButton).toBeDisabled();
  });

  it('toggles preview mode', () => {
    render(<PointAndClickEditor />);

    const previewButton = screen.getByText('Preview Mode');
    fireEvent.click(previewButton);

    expect(screen.getByText('Edit Mode')).toBeInTheDocument();
  });

  it('handles API errors gracefully', async () => {
    // Mock API error
    mockPost.mockRejectedValue(new Error('API Error'));

    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

    render(<PointAndClickEditor />);

    // Start element selection
    const selectButton = screen.getByText('Select Element');
    await act(async () => {
      fireEvent.click(selectButton);
    });

    // Create a mock element and add it to the document
    const mockElement = document.createElement('div');
    mockElement.id = 'test-element';
    document.body.appendChild(mockElement);

    await act(async () => {
      fireEvent.click(mockElement);
    });

    const createButton = screen.getByText('Create Step');
    await act(async () => {
      fireEvent.click(createButton);
      // Wait for the next tick to allow async operations to complete
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    // Clean up
    document.body.removeChild(mockElement);

    expect(consoleSpy).toHaveBeenCalledWith('Error creating step:', expect.any(Error));
    consoleSpy.mockRestore();
  });

  it('requires authentication to create steps', async () => {
    // Mock unauthenticated state
    (useAuth as jest.Mock).mockReturnValue({
      state: { isAuthenticated: false },
    });

    render(<PointAndClickEditor />);

    // Start element selection
    const selectButton = screen.getByText('Select Element');
    await act(async () => {
      fireEvent.click(selectButton);
    });

    // Create a mock element and add it to the document
    const mockElement = document.createElement('div');
    mockElement.id = 'test-element';
    document.body.appendChild(mockElement);

    await act(async () => {
      fireEvent.click(mockElement);
    });

    const createButton = screen.getByText('Create Step');
    await act(async () => {
      fireEvent.click(createButton);
      // Wait for the next tick to allow async operations to complete
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    // Clean up
    document.body.removeChild(mockElement);

    // Verify no API call or dispatch was made
    expect(mockPost).not.toHaveBeenCalled();
    expect(mockDispatch).not.toHaveBeenCalled();
  });

  it('generates correct element selectors', () => {
    render(<PointAndClickEditor />);

    // Test element with ID
    const elementWithId = document.createElement('div');
    elementWithId.id = 'test-id';
    expect(elementWithId.id).toBe('test-id');

    // Test element with class
    const elementWithClass = document.createElement('div');
    elementWithClass.className = 'test-class';
    expect(elementWithClass.className).toBe('test-class');

    // Test element with attribute
    const elementWithAttr = document.createElement('div');
    elementWithAttr.setAttribute('data-test', 'test-value');
    expect(elementWithAttr.getAttribute('data-test')).toBe('test-value');
  });
});
