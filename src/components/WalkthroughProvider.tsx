import * as React from 'react';
import { WalkthroughSDK } from '../core/WalkthroughSDK';
import { Popover } from './Popover';
import type { WalkthroughConfig, WalkthroughStep, WalkthroughEvent } from '../types';

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
  const sdkRef = React.useRef<WalkthroughSDK | null>(null);
  const [currentStep, setCurrentStep] = React.useState<WalkthroughStep | null>(null);
  const previousFocusRef = React.useRef<HTMLElement | null>(null);

  React.useEffect(() => {
    // Store the currently focused element
    previousFocusRef.current = document.activeElement as HTMLElement;

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

    // Set up event listeners
    const handleStepChange = (event: WalkthroughEvent) => {
      if (event.type === 'stepChange' && event.step) {
        setCurrentStep(event.step);
      }
    };

    sdkRef.current.on('stepChange', handleStepChange);

    // Set up keyboard navigation
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!sdkRef.current) return;

      switch (event.key) {
        case 'ArrowRight':
          event.preventDefault();
          sdkRef.current.next();
          break;
        case 'ArrowLeft':
          event.preventDefault();
          sdkRef.current.previous();
          break;
        case 'Escape':
          event.preventDefault();
          sdkRef.current.skip();
          break;
        case 'Enter':
          event.preventDefault();
          sdkRef.current.next();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    // Cleanup on unmount
    return () => {
      if (sdkRef.current) {
        sdkRef.current.off('stepChange', handleStepChange);
        sdkRef.current.destroy();
      }
      window.removeEventListener('keydown', handleKeyDown);
      
      // Restore focus
      if (previousFocusRef.current) {
        previousFocusRef.current.focus();
      }
    };
  }, [steps, config, onComplete, onStepChange, onSkip]);

  if (!currentStep) return null;

  return (
    <Popover
      step={currentStep}
      onNext={() => sdkRef.current?.next()}
      onPrevious={() => sdkRef.current?.previous()}
      onSkip={() => sdkRef.current?.skip()}
      onClose={() => sdkRef.current?.complete()}
      position={currentStep.position || config?.defaultPosition || 'bottom'}
    />
  );
}; 