import type { Meta, StoryObj } from '@storybook/react';
import { WalkthroughProvider } from '../components/WalkthroughProvider';
import { Demo } from './Demo';

const meta: Meta<typeof WalkthroughProvider> = {
  title: 'Core/WalkthroughProvider',
  component: WalkthroughProvider,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div style={{ padding: '20px' }}>
        <Demo />
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof WalkthroughProvider>;

export const Default: Story = {
  args: {
    steps: [
      {
        id: 'step1',
        target: '#target1',
        content: 'This is the first step of the walkthrough.',
      },
      {
        id: 'step2',
        target: '#target2',
        content: 'This is the second step of the walkthrough.',
      },
    ],
  },
};

export const WithCustomConfig: Story = {
  args: {
    steps: [
      {
        id: 'step1',
        target: '#target1',
        content: 'This is the first step with custom configuration.',
      },
      {
        id: 'step2',
        target: '#target2',
        content: 'This is the second step with custom configuration.',
      },
    ],
    config: {
      position: 'bottom',
      offset: 10,
      zIndex: 1000,
    },
  },
}; 