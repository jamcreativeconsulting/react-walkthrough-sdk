import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { Walkthrough, Step, WalkthroughState } from '../types/walkthrough';

export type WalkthroughAction =
  | { type: 'SET_CURRENT_WALKTHROUGH'; payload: Walkthrough }
  | { type: 'SET_WALKTHROUGHS'; payload: Walkthrough[] }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'ADD_STEP'; payload: Step }
  | { type: 'REMOVE_STEP'; payload: string }
  | { type: 'UPDATE_STEP'; payload: Step }
  | { type: 'MARK_STEP_COMPLETED'; payload: { stepId: string; completed: boolean } };

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
      if (!state.currentWalkthrough) {
        return {
          ...state,
          currentWalkthrough: {
            id: crypto.randomUUID(),
            title: 'New Walkthrough',
            description: '',
            steps: [action.payload],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        };
      }
      return {
        ...state,
        currentWalkthrough: {
          ...state.currentWalkthrough,
          steps: [...state.currentWalkthrough.steps, action.payload],
          updatedAt: new Date().toISOString(),
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
    case 'MARK_STEP_COMPLETED':
      if (!state.currentWalkthrough) return state;

      return {
        ...state,
        currentWalkthrough: {
          ...state.currentWalkthrough,
          steps: state.currentWalkthrough.steps.map(step =>
            step.id === action.payload.stepId
              ? { ...step, completed: action.payload.completed }
              : step
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
