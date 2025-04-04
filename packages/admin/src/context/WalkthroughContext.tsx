import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { WalkthroughState, WalkthroughAction, Walkthrough } from '../types/walkthrough';

const initialState: WalkthroughState = {
  currentWalkthrough: null,
  walkthroughs: [],
  isLoading: false,
  error: null,
};

function walkthroughReducer(state: WalkthroughState, action: WalkthroughAction): WalkthroughState {
  switch (action.type) {
    case 'SET_CURRENT_WALKTHROUGH':
      return { ...state, currentWalkthrough: action.payload };
    case 'SET_WALKTHROUGHS':
      return { ...state, walkthroughs: action.payload };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'ADD_STEP':
      if (!state.currentWalkthrough) return state;
      return {
        ...state,
        currentWalkthrough: {
          ...state.currentWalkthrough,
          steps: [...state.currentWalkthrough.steps, action.payload],
        },
      };
    case 'REMOVE_STEP':
      if (!state.currentWalkthrough) return state;
      return {
        ...state,
        currentWalkthrough: {
          ...state.currentWalkthrough,
          steps: state.currentWalkthrough.steps.filter(step => step.id !== action.payload),
        },
      };
    case 'UPDATE_STEP':
      if (!state.currentWalkthrough) return state;
      return {
        ...state,
        currentWalkthrough: {
          ...state.currentWalkthrough,
          steps: state.currentWalkthrough.steps.map(step =>
            step.id === action.payload.id ? action.payload : step
          ),
        },
      };
    default:
      return state;
  }
}

interface WalkthroughContextType {
  state: WalkthroughState;
  dispatch: React.Dispatch<WalkthroughAction>;
}

const WalkthroughContext = createContext<WalkthroughContextType | undefined>(undefined);

export function WalkthroughProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(walkthroughReducer, initialState);

  return (
    <WalkthroughContext.Provider value={{ state, dispatch }}>
      {children}
    </WalkthroughContext.Provider>
  );
}

export function useWalkthrough() {
  const context = useContext(WalkthroughContext);
  if (context === undefined) {
    throw new Error('useWalkthrough must be used within a WalkthroughProvider');
  }
  return context;
}
