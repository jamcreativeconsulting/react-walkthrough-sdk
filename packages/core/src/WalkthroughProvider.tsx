import React, { createContext, useContext, useState, useEffect } from 'react';

interface WalkthroughContextType {
  isAdmin: boolean;
  setIsAdmin: (value: boolean) => void;
  currentStep: number;
  setCurrentStep: (step: number) => void;
  totalSteps: number;
  setTotalSteps: (steps: number) => void;
}

const WalkthroughContext = createContext<WalkthroughContextType | null>(null);

const log = (message: string, data?: any) => {
  console.log(`[Walkthrough] ${message}`, data ? data : '');
};

const logError = (message: string, error: any) => {
  console.error(`[Walkthrough] ${message}`, error);
};

export const useWalkthrough = () => {
  const context = useContext(WalkthroughContext);
  if (!context) {
    logError('Context Error', 'useWalkthrough must be used within a WalkthroughProvider');
    throw new Error('useWalkthrough must be used within a WalkthroughProvider');
  }
  return context;
};

export const WalkthroughProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  try {
    const [isAdmin, setIsAdmin] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);
    const [totalSteps, setTotalSteps] = useState(0);

    useEffect(() => {
      log('Provider initialized');
      return () => {
        log('Provider cleanup');
      };
    }, []);

    useEffect(() => {
      log('Step change', { currentStep, totalSteps });
    }, [currentStep, totalSteps]);

    useEffect(() => {
      log('Admin mode change', { isAdmin });
    }, [isAdmin]);

    const value = {
      isAdmin,
      setIsAdmin: (value: boolean) => {
        log('Setting admin mode', { value });
        setIsAdmin(value);
      },
      currentStep,
      setCurrentStep: (step: number) => {
        log('Setting current step', { step });
        setCurrentStep(step);
      },
      totalSteps,
      setTotalSteps: (steps: number) => {
        log('Setting total steps', { steps });
        setTotalSteps(steps);
      },
    };

    return <WalkthroughContext.Provider value={value}>{children}</WalkthroughContext.Provider>;
  } catch (error) {
    logError('Provider Error', error);
    return (
      <div className="error">
        <h2>Error Loading Walkthrough</h2>
        <p>Please check the console for details.</p>
      </div>
    );
  }
};
