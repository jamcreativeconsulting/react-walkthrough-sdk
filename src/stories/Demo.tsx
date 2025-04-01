import React, { FC } from 'react';
import { WalkthroughProvider } from '../components/WalkthroughProvider';
import type { WalkthroughStep } from '../types';

export const Demo: FC = () => {
  const [showWalkthrough, setShowWalkthrough] = React.useState(false);
  const [activeStep, setActiveStep] = React.useState<WalkthroughStep | null>(null);

  const handleClick = (buttonId: string) => {
    console.log('Button clicked:', buttonId);
    const step = steps.find(s => s.id === buttonId);
    if (step) {
      console.log('Found matching step:', step);
      setActiveStep(step);
      setShowWalkthrough(true);
    } else {
      console.error('No matching step found for button:', buttonId);
    }
  };

  const steps: WalkthroughStep[] = [
    {
      id: 'target1',
      target: '#target1',
      content: 'This is the first step of the walkthrough.',
      position: 'bottom'
    },
    {
      id: 'target2',
      target: '#target2',
      content: 'This is the second step of the walkthrough.',
      position: 'bottom'
    }
  ];

  const handleComplete = () => {
    console.log('Walkthrough completed');
    setShowWalkthrough(false);
    setActiveStep(null);
  };

  const handleSkip = () => {
    console.log('Walkthrough skipped');
    setShowWalkthrough(false);
    setActiveStep(null);
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Walkthrough Demo</h1>
      <div style={{ marginTop: '20px' }}>
        <button 
          id="target1" 
          style={{ marginRight: '10px' }}
          onClick={() => handleClick('target1')}
        >
          First Button
        </button>
        <button 
          id="target2"
          onClick={() => handleClick('target2')}
        >
          Second Button
        </button>
      </div>
      <div style={{ marginTop: '20px' }}>
        <p>This is a demo page to showcase the walkthrough functionality.</p>
      </div>
      {showWalkthrough && (
        <WalkthroughProvider
          steps={steps}
          config={{
            defaultPosition: 'bottom',
            skipable: true
          }}
          onComplete={handleComplete}
          onSkip={handleSkip}
        />
      )}
    </div>
  );
}; 