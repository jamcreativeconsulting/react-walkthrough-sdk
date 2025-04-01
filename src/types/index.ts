export interface WalkthroughStep {
  targetId: string;
  content: string;
  position?: 'top' | 'right' | 'bottom' | 'left';
  title?: string;
  skipable?: boolean;
}

export interface WalkthroughConfig {
  target: string | HTMLElement;
  mode?: 'admin' | 'presentation';
  onComplete?: () => void;
  onSkip?: () => void;
  onStepChange?: (stepIndex: number) => void;
  defaultPosition?: 'top' | 'right' | 'bottom' | 'left';
  skipable?: boolean;
}

export interface EventCallback {
  (data?: any): void;
}

export interface EventRegistry {
  [key: string]: EventCallback[];
} 