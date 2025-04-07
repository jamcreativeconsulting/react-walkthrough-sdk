import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { WalkthroughProvider, useWalkthrough } from '../WalkthroughContext';
import { Walkthrough, Step } from '../../types/walkthrough';

describe('WalkthroughContext', () => {
  const mockWalkthrough: Walkthrough = {
    id: '1',
    title: 'Test Walkthrough',
    description: 'Test Description',
    steps: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const mockStep = {
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

  const TestComponent = () => {
    const { state, dispatch } = useWalkthrough();
    return (
      <div>
        <button
          onClick={() => dispatch({ type: 'SET_CURRENT_WALKTHROUGH', payload: mockWalkthrough })}
        >
          Set Walkthrough
        </button>
        <button onClick={() => dispatch({ type: 'ADD_STEP', payload: mockStep })}>Add Step</button>
        <div data-testid="walkthrough-title">{state.currentWalkthrough?.title}</div>
        <div data-testid="steps-count">{state.currentWalkthrough?.steps.length}</div>
      </div>
    );
  };

  it('provides walkthrough state and dispatch', () => {
    render(
      <WalkthroughProvider>
        <TestComponent />
      </WalkthroughProvider>
    );

    fireEvent.click(screen.getByText('Set Walkthrough'));
    expect(screen.getByTestId('walkthrough-title')).toHaveTextContent('Test Walkthrough');
  });

  it('adds steps to current walkthrough', () => {
    render(
      <WalkthroughProvider>
        <TestComponent />
      </WalkthroughProvider>
    );

    fireEvent.click(screen.getByText('Set Walkthrough'));
    fireEvent.click(screen.getByText('Add Step'));
    expect(screen.getByTestId('steps-count')).toHaveTextContent('1');
  });

  it('throws error when used outside provider', () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<TestComponent />)).toThrow();
    consoleError.mockRestore();
  });
});
