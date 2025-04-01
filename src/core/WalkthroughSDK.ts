import { EventManager } from './EventManager';
import { WalkthroughConfig, WalkthroughStep } from '../types';

export class WalkthroughSDK {
  private config: Omit<WalkthroughConfig, 'steps'>;
  private eventManager: EventManager;
  private targetElement: HTMLElement | null = null;
  private currentStepIndex: number = -1;
  private steps: WalkthroughStep[] = [];

  constructor(config: Omit<WalkthroughConfig, 'steps'>) {
    this.config = {
      mode: 'presentation',
      defaultPosition: 'bottom',
      skipable: true,
      ...config,
    };
    this.eventManager = new EventManager();
    this.initialize();
  }

  private initialize(): void {
    try {
      console.log('Initializing WalkthroughSDK with config:', this.config);
      this.targetElement = this.resolveTarget();
      if (!this.targetElement) {
        console.error('Target element not found:', this.config.target);
        throw new Error('Target element not found');
      }
      console.log('Target element found:', this.targetElement);
      this.eventManager.emit('initialized');
    } catch (error) {
      console.error('Failed to initialize WalkthroughSDK:', error);
      this.eventManager.emit('error', error);
    }
  }

  private resolveTarget(): HTMLElement | null {
    if (typeof this.config.target === 'string') {
      const element = document.querySelector(this.config.target);
      console.log('Resolving string target:', this.config.target, 'Found:', element);
      return element as HTMLElement | null;
    }
    console.log('Resolving HTMLElement target:', this.config.target);
    return this.config.target || null;
  }

  /**
   * Set the walkthrough steps
   * @param steps - Array of walkthrough steps
   */
  setSteps(steps: WalkthroughStep[]): void {
    if (!steps || steps.length === 0) {
      throw new Error('No steps defined');
    }
    console.log('Setting steps:', steps);
    this.steps = steps;
    this.eventManager.emit('stepsUpdated', { steps });
  }

  /**
   * Start the walkthrough
   */
  start(): void {
    if (this.steps.length === 0) {
      console.error('Cannot start walkthrough: No steps defined');
      throw new Error('No steps defined');
    }
    console.log('Starting walkthrough with steps:', this.steps);
    this.currentStepIndex = 0;
    this.showCurrentStep();
    this.eventManager.emit('started');
  }

  /**
   * Move to the next step
   */
  next(): void {
    console.log('Moving to next step. Current index:', this.currentStepIndex);
    if (this.currentStepIndex < this.steps.length - 1) {
      this.currentStepIndex++;
      this.showCurrentStep();
    } else {
      console.log('Reached last step, completing walkthrough');
      this.complete();
    }
  }

  /**
   * Move to the previous step
   */
  previous(): void {
    console.log('Moving to previous step. Current index:', this.currentStepIndex);
    if (this.currentStepIndex > 0) {
      this.currentStepIndex--;
      this.showCurrentStep();
    }
  }

  /**
   * Skip the current walkthrough
   */
  skip(): void {
    console.log('Skipping walkthrough');
    if (this.config.skipable) {
      this.eventManager.emit('skipped');
      this.config.onSkip?.();
      this.complete(); // Ensure cleanup happens
    }
  }

  /**
   * Complete the walkthrough
   */
  complete(): void {
    console.log('Completing walkthrough');
    this.eventManager.emit('completed');
    if (this.config.onComplete) {
      this.config.onComplete();
    }
    this.destroy(); // Clean up resources
  }

  /**
   * Get the current step
   */
  getCurrentStep(): WalkthroughStep | null {
    return this.steps[this.currentStepIndex] || null;
  }

  /**
   * Get the current step index
   */
  getCurrentStepIndex(): number {
    return this.currentStepIndex;
  }

  /**
   * Get the total number of steps
   */
  getTotalSteps(): number {
    return this.steps.length;
  }

  /**
   * Register an event listener
   */
  on(eventName: string, callback: (data?: any) => void): void {
    console.log('Registering event listener for:', eventName);
    this.eventManager.on(eventName, callback);
  }

  /**
   * Remove an event listener
   */
  off(eventName: string, callback: (data?: any) => void): void {
    console.log('Removing event listener for:', eventName);
    this.eventManager.off(eventName, callback);
  }

  private showCurrentStep(): void {
    const step = this.getCurrentStep();
    if (!step) {
      console.log('No current step to show');
      return;
    }

    console.log('Showing current step:', step);
    this.eventManager.emit('stepChange', {
      type: 'stepChange',
      step,
      index: this.currentStepIndex,
    });
    this.config.onStepChange?.(this.currentStepIndex);
  }

  /**
   * Clean up resources and stop the walkthrough
   */
  destroy(): void {
    console.log('Destroying WalkthroughSDK');
    this.eventManager.emit('destroyed');
    this.currentStepIndex = -1;
    this.steps = [];
    this.targetElement = null;
  }
} 