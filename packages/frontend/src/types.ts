export interface Step {
  title: string;
  content: string;
  target: string;
  order: number;
}

export interface Walkthrough {
  id?: string;
  name: string;
  description: string;
  steps: Step[];
}
