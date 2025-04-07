import React from 'react';
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import { PointAndClickEditor } from '../PointAndClickEditor';
import { WalkthroughProvider } from '../../../context/WalkthroughContext';
import { AuthProvider } from '../../../context/AuthContext';
import { Step } from '../../../types/walkthrough';

describe('PointAndClickEditor', () => {
  const mockStep: Step = {
    id: '1',
    title: 'Test Step',
    content: 'This is a test step',
    targetElement: '#test-element',
    position: {
      top: 100,
      left: 100,
      width: 200,
      height: 50,
    },
    order: 1,
  };

  const mockWalkthrough = {
    id: '1',
    title: 'Test Walkthrough',
    description: 'Test Description',
    steps: [mockStep],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const renderWithProviders = () => {
    return render(
      <AuthProvider>
        <WalkthroughProvider>
          <PointAndClickEditor />
        </WalkthroughProvider>
      </AuthProvider>
    );
  };

  let editor: HTMLElement | null = null;
  let testElement: HTMLElement | null = null;
  let originalAlert: typeof window.alert;

  beforeEach(() => {
    jest.clearAllMocks();
    originalAlert = window.alert;
    window.alert = jest.fn();
  });

  afterEach(() => {
    if (testElement && editor) {
      editor.removeChild(testElement);
    }
    editor = null;
    testElement = null;
    window.alert = originalAlert;
  });

  it('renders with preview button', () => {
    renderWithProviders();
    expect(screen.getByText('Show Preview')).toBeInTheDocument();
  });

  it('toggles preview mode', () => {
    renderWithProviders();
    const previewButton = screen.getByText('Show Preview');
    fireEvent.click(previewButton);
    expect(screen.getByText('Hide Preview')).toBeInTheDocument();
  });

  it('shows step builder when element is clicked', () => {
    const { container } = renderWithProviders();
    const editor = container.querySelector('.point-and-click-editor');
    const testElement = document.createElement('div');
    testElement.id = 'test-element';
    editor?.appendChild(testElement);

    act(() => {
      fireEvent.click(testElement);
    });

    expect(screen.getByText('Edit Step')).toBeInTheDocument();
  });

  it('saves step when form is submitted', async () => {
    const { container } = renderWithProviders();
    const editor = container.querySelector('.point-and-click-editor');
    const testElement = document.createElement('div');
    testElement.id = 'test-element';
    editor?.appendChild(testElement);

    act(() => {
      fireEvent.click(testElement);
    });

    const titleInput = screen.getByLabelText('Title');
    const contentInput = screen.getByLabelText('Content');
    const saveButton = screen.getByText('Save');

    fireEvent.change(titleInput, { target: { value: 'New Step' } });
    fireEvent.change(contentInput, { target: { value: 'New Content' } });
    fireEvent.click(saveButton);

    await waitFor(
      () => {
        expect(screen.queryByText('Edit Step')).not.toBeInTheDocument();
      },
      { timeout: 2000 }
    );
  });
});
