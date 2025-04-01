import { EventManager } from './EventManager';
import { WalkthroughConfig, WalkthroughStep } from '../types';

export class WalkthroughSDK {
  private config: WalkthroughConfig;
  private eventManager: EventManager;
  private targetElement: HTMLElement | null = null;
  private currentStepIndex: number = -1;
  private steps: WalkthroughStep[] = [];

  constructor(config: WalkthroughConfig) {
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
      this.targetElement = this.resolveTarget();
      if (!this.targetElement) {
        throw new Error('Target element not found');
      }
      this.eventManager.emit('initialized');
    } catch (error) {
      console.error('Failed to initialize WalkthroughSDK:', error);
      this.eventManager.emit('error', error);
    }
  }

  private resolveTarget(): HTMLElement | null {
    if (typeof this.config.target === 'string') {
      return document.querySelector(this.config.target);
    }
    return this.config.target;
  }

  /**
   * Set the walkthrough steps
   * @param steps - Array of walkthrough steps
   */
  setSteps(steps: WalkthroughStep[]): void {
    this.steps = steps;
    this.eventManager.emit('stepsUpdated', steps);
  }

  /**
   * Start the walkthrough
   */
  start(): void {
    if (this.steps.length === 0) {
      throw new Error('No steps defined');
    }
    this.currentStepIndex = 0;
    this.eventManager.emit('started');
    this.showCurrentStep();
  }

  /**
   * Move to the next step
   */
  next(): void {
    if (this.currentStepIndex < this.steps.length - 1) {
      this.currentStepIndex++;
      this.showCurrentStep();
    } else {
      this.complete();
    }
  }

  /**
   * Move to the previous step
   */
  previous(): void {
    if (this.currentStepIndex > 0) {
      this.currentStepIndex--;
      this.showCurrentStep();
    }
  }

  /**
   * Skip the current walkthrough
   */
  skip(): void {
    if (this.config.skipable) {
      this.eventManager.emit('skipped');
      this.config.onSkip?.();
    }
  }

  /**
   * Complete the walkthrough
   */
  complete(): void {
    this.eventManager.emit('completed');
    if (this.config.onComplete) {
      this.config.onComplete();
    }
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
    this.eventManager.on(eventName, callback);
  }

  /**
   * Remove an event listener
   */
  off(eventName: string, callback: (data?: any) => void): void {
    this.eventManager.off(eventName, callback);
  }

  private showCurrentStep(): void {
    const step = this.getCurrentStep();
    if (!step) return;

    this.eventManager.emit('stepChange', {
      step,
      index: this.currentStepIndex,
    });
    this.config.onStepChange?.(this.currentStepIndex);
  }
} 