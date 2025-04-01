export interface WalkthroughStep {
  id: string;
  target: string;
  content: string;
  position?: 'top' | 'right' | 'bottom' | 'left';
  title?: string;
  skipable?: boolean;
}

export interface WalkthroughConfig {
  steps: WalkthroughStep[];
  target?: string | HTMLElement;
  mode?: 'admin' | 'presentation';
  onComplete?: () => void;
  onSkip?: () => void;
  onStepChange?: (stepIndex: number) => void;
  defaultPosition?: 'top' | 'right' | 'bottom' | 'left';
  skipable?: boolean;
  position?: 'top' | 'right' | 'bottom' | 'left';
  offset?: number;
  zIndex?: number;
}

export interface WalkthroughEvent {
  type: 'stepChange' | 'complete' | 'skip' | 'error';
  step?: WalkthroughStep;
  stepIndex?: number;
  error?: Error;
}

export type WalkthroughEventHandler = (event: WalkthroughEvent) => void;

export interface EventCallback {
  (data?: any): void;
}

export interface EventRegistry {
  [key: string]: EventCallback[];
} 