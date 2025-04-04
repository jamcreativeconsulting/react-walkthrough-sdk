import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { WalkthroughProvider, useWalkthrough } from '../WalkthroughContext';
import { WalkthroughAction } from '../../types/walkthrough';

// Mock child component to test the context
const TestComponent = () => {
  const { state, dispatch } = useWalkthrough();
  return (
    <div>
      <div data-testid="current-walkthrough">
        {state.currentWalkthrough ? 'Has Walkthrough' : 'No Walkthrough'}
      </div>
      <button
        onClick={() =>
          dispatch({
            type: 'SET_CURRENT_WALKTHROUGH',
            payload: {
              id: '1',
              name: 'Test Walkthrough',
              description: 'Test Description',
              steps: [],
              isActive: true,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          })
        }
      >
        Set Walkthrough
      </button>
    </div>
  );
};

describe('WalkthroughContext', () => {
  it('provides initial state', () => {
    render(
      <WalkthroughProvider>
        <TestComponent />
      </WalkthroughProvider>
    );

    expect(screen.getByTestId('current-walkthrough').textContent).toBe('No Walkthrough');
  });

  it('updates state when dispatching actions', () => {
    render(
      <WalkthroughProvider>
        <TestComponent />
      </WalkthroughProvider>
    );

    const button = screen.getByText('Set Walkthrough');
    act(() => {
      button.click();
    });

    expect(screen.getByTestId('current-walkthrough').textContent).toBe('Has Walkthrough');
  });

  it('throws error when used outside provider', () => {
    const TestComponentWithoutProvider = () => {
      useWalkthrough();
      return null;
    };

    expect(() => {
      render(<TestComponentWithoutProvider />);
    }).toThrow('useWalkthrough must be used within a WalkthroughProvider');
  });
});
