import { WalkthroughSDK } from '../../core/WalkthroughSDK';
import { WalkthroughStep } from '../../types';

describe('WalkthroughSDK', () => {
  let sdk: WalkthroughSDK;
  let mockElement: HTMLElement;
  const mockSteps: WalkthroughStep[] = [
    { targetId: 'step1', content: 'First step' },
    { targetId: 'step2', content: 'Second step' },
  ];

  beforeEach(() => {
    mockElement = document.createElement('div');
    document.body.appendChild(mockElement);
    sdk = new WalkthroughSDK({ target: mockElement });
  });

  afterEach(() => {
    document.body.removeChild(mockElement);
  });

  it('should initialize with default config', () => {
    expect(sdk.getCurrentStepIndex()).toBe(-1);
    expect(sdk.getTotalSteps()).toBe(0);
  });

  it('should set and get steps', () => {
    sdk.setSteps(mockSteps);
    expect(sdk.getTotalSteps()).toBe(2);
  });

  it('should start walkthrough', () => {
    sdk.setSteps(mockSteps);
    sdk.start();
    expect(sdk.getCurrentStepIndex()).toBe(0);
  });

  it('should throw error when starting without steps', () => {
    expect(() => sdk.start()).toThrow('No steps defined');
  });

  it('should move to next step', () => {
    sdk.setSteps(mockSteps);
    sdk.start();
    sdk.next();
    expect(sdk.getCurrentStepIndex()).toBe(1);
  });

  it('should move to previous step', () => {
    sdk.setSteps(mockSteps);
    sdk.start();
    sdk.next();
    sdk.previous();
    expect(sdk.getCurrentStepIndex()).toBe(0);
  });

  it('should complete walkthrough when reaching last step', () => {
    const onComplete = jest.fn();
    sdk = new WalkthroughSDK({ target: mockElement, onComplete });
    sdk.setSteps(mockSteps);
    sdk.start();
    sdk.next();
    sdk.next();
    expect(onComplete).toHaveBeenCalled();
  });

  it('should skip walkthrough when allowed', () => {
    const onSkip = jest.fn();
    sdk = new WalkthroughSDK({ target: mockElement, onSkip });
    sdk.setSteps(mockSteps);
    sdk.start();
    sdk.skip();
    expect(onSkip).toHaveBeenCalled();
  });

  it('should not skip walkthrough when not allowed', () => {
    const onSkip = jest.fn();
    sdk = new WalkthroughSDK({ target: mockElement, onSkip, skipable: false });
    sdk.setSteps(mockSteps);
    sdk.start();
    sdk.skip();
    expect(onSkip).not.toHaveBeenCalled();
  });

  it('should emit events', () => {
    const onStarted = jest.fn();
    const onStepChange = jest.fn();
    sdk.on('started', onStarted);
    sdk.on('stepChange', onStepChange);
    sdk.setSteps(mockSteps);
    sdk.start();
    expect(onStarted).toHaveBeenCalled();
    expect(onStepChange).toHaveBeenCalled();
  });

  it('should handle target element not found', () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation();
    sdk = new WalkthroughSDK({ target: '#non-existent' });
    expect(consoleError).toHaveBeenCalled();
    consoleError.mockRestore();
  });
}); 