import React, { useEffect, useRef } from 'react';
import { WalkthroughSDK } from '../core/WalkthroughSDK';
import type { WalkthroughConfig, WalkthroughStep } from '../types';

interface WalkthroughProviderProps {
  steps: WalkthroughStep[];
  config?: Omit<WalkthroughConfig, 'steps'>;
  onComplete?: () => void;
  onStepChange?: (stepIndex: number) => void;
  onSkip?: () => void;
}

export const WalkthroughProvider: React.FC<WalkthroughProviderProps> = ({
  steps,
  config,
  onComplete,
  onStepChange,
  onSkip,
}) => {
  const sdkRef = useRef<WalkthroughSDK | null>(null);

  useEffect(() => {
    // Initialize the SDK
    sdkRef.current = new WalkthroughSDK({
      ...config,
      onComplete,
      onStepChange,
      onSkip,
    });

    // Set the steps
    sdkRef.current.setSteps(steps);

    // Start the walkthrough
    sdkRef.current.start();

    // Cleanup on unmount
    return () => {
      if (sdkRef.current) {
        sdkRef.current.destroy();
      }
    };
  }, [steps, config, onComplete, onStepChange, onSkip]);

  return null; // This component doesn't render anything
}; 