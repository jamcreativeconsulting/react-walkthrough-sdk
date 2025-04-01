import type { Meta, StoryObj } from '@storybook/react';
import { AccessibilityTest } from './AccessibilityTest';
import { WalkthroughProvider } from '../components/WalkthroughProvider';

const meta: Meta<typeof AccessibilityTest> = {
  title: 'Testing/AccessibilityTest',
  component: AccessibilityTest,
  parameters: {
    layout: 'centered',
  },
  decorators: [
    (Story) => (
      <div style={{ padding: '20px' }}>
        <Story />
        <WalkthroughProvider
          steps={[
            {
              id: 'keyboard-step-1',
              target: '#keyboard-target-1',
              content: 'First step with keyboard navigation test.',
              title: 'Keyboard Navigation',
            },
            {
              id: 'sr-step-1',
              target: '#sr-target-1',
              content: 'Screen reader test with additional context.',
              title: 'Screen Reader Support',
            },
            {
              id: 'focus-step-1',
              target: '#focus-target-1',
              content: 'Focus management test.',
              title: 'Focus Management',
            },
          ]}
          config={{
            skipable: true,
            defaultPosition: 'bottom',
          }}
        />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof AccessibilityTest>;

export const Default: Story = {}; 