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
  });

  it('enables element selection mode when clicking the select button', () => {
    render(<PointAndClickEditor />);
    const selectButton = screen.getByText('Select Element');
    fireEvent.click(selectButton);
    expect(screen.getByText('Cancel Selection')).toBeInTheDocument();
  });

  it('shows step builder when element is selected', async () => {
    render(<PointAndClickEditor />);

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

    // Simulate click on element
    await act(async () => {
      fireEvent.click(mockElement);
    });

    // Verify step builder is shown
    expect(screen.getByLabelText('Title')).toBeInTheDocument();
    expect(screen.getByLabelText('Content')).toBeInTheDocument();
    expect(screen.getByLabelText('Target Element')).toBeInTheDocument();

    // Clean up
    document.body.removeChild(mockElement);
  });

  it('creates a step when step builder form is submitted', async () => {
    render(<PointAndClickEditor />);

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

    // Simulate click on element
    await act(async () => {
      fireEvent.click(mockElement);
    });

    // Fill in step builder form
    fireEvent.change(screen.getByLabelText('Title'), { target: { value: 'Test Title' } });
    fireEvent.change(screen.getByLabelText('Content'), { target: { value: 'Test Content' } });

    // Submit form
    await act(async () => {
      fireEvent.click(screen.getByText('Save Step'));
    });

    // Verify API call
    expect(mockPost).toHaveBeenCalledWith(
      `/api/walkthroughs/${mockWalkthroughState.currentWalkthrough.id}/steps`,
      expect.objectContaining({
        title: 'Test Title',
        content: 'Test Content',
        target: expect.stringContaining('div'),
      })
    );

    // Clean up
    document.body.removeChild(mockElement);
  });

  it('cancels step creation when cancel button is clicked', async () => {
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

    // Simulate click on element
    await act(async () => {
      fireEvent.click(mockElement);
    });

    // Click cancel button
    await act(async () => {
      fireEvent.click(screen.getByText('Cancel'));
    });

    // Verify step builder is hidden
    expect(screen.queryByLabelText('Title')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Content')).not.toBeInTheDocument();

    // Clean up
    document.body.removeChild(mockElement);
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

    // Fill in step builder form
    fireEvent.change(screen.getByLabelText('Title'), { target: { value: 'Test Title' } });
    fireEvent.change(screen.getByLabelText('Content'), { target: { value: 'Test Content' } });

    // Submit form
    await act(async () => {
      fireEvent.click(screen.getByText('Save Step'));
    });

    // Verify no API call was made
    expect(mockPost).not.toHaveBeenCalled();

    // Clean up
    document.body.removeChild(mockElement);
  });
});
