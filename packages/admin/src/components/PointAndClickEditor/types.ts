import { Step, ElementPosition } from '../../types/walkthrough';

export interface PointAndClickEditorProps {
  onStepCreated?: (step: Step) => void;
  onStepUpdated?: (step: Step) => void;
  onStepDeleted?: (stepId: string) => void;
}

export interface WalkthroughContextType {
  walkthrough: {
    id: string;
    name: string;
    steps: Step[];
  };
  dispatch: React.Dispatch<any>;
}

export interface AuthContextType {
  state: {
    isAuthenticated: boolean;
    apiKey: string | null;
  };
  dispatch: React.Dispatch<any>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  setApiKey: (apiKey: string) => void;
}
