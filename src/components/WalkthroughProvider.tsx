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
    console.log('WalkthroughProvider mounted with steps:', steps);
    
    // Store the currently focused element
    previousFocusRef.current = document.activeElement as HTMLElement;

    // Initialize the SDK with the first step's target
    const firstStep = steps[0];
    if (!firstStep) {
      console.error('No steps provided to WalkthroughProvider');
      return;
    }

    console.log('Initializing WalkthroughProvider with first step:', firstStep);
    sdkRef.current = new WalkthroughSDK({
      ...config,
      target: firstStep.target,
      onComplete,
      onStepChange,
      onSkip,
    });

    // Set the steps
    console.log('Setting steps:', steps);
    sdkRef.current.setSteps(steps);

    // Set up event listeners
    const handleStepChange = (event: WalkthroughEvent) => {
      console.log('Step change event received:', event);
      if (event.type === 'stepChange' && event.step) {
        console.log('Updating current step:', event.step);
        setCurrentStep(event.step);
      }
    };

    sdkRef.current.on('stepChange', handleStepChange);

    // Set up keyboard navigation
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!sdkRef.current) return;
      console.log('Key pressed:', event.key);

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

    // Start the walkthrough
    console.log('Starting walkthrough');
    sdkRef.current.start();

    // Cleanup on unmount
    return () => {
      console.log('WalkthroughProvider unmounting');
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

  if (!currentStep) {
    console.log('No current step, not rendering Popover');
    return null;
  }

  console.log('Rendering Popover with step:', currentStep);
  return (
    <Popover
      step={currentStep}
      onNext={() => {
        console.log('Next button clicked');
        sdkRef.current?.next();
      }}
      onPrevious={() => {
        console.log('Previous button clicked');
        sdkRef.current?.previous();
      }}
      onSkip={() => {
        console.log('Skip button clicked');
        sdkRef.current?.skip();
      }}
      onClose={() => {
        console.log('Close button clicked');
        sdkRef.current?.complete();
      }}
      position={currentStep.position || config?.defaultPosition || 'bottom'}
    />
  );
}; 