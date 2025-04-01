import type { Meta, StoryObj } from '@storybook/react';
import { PositionTest } from './PositionTest';
import { WalkthroughProvider } from '../components/WalkthroughProvider';

const meta: Meta<typeof PositionTest> = {
  title: 'Testing/PositionTest',
  component: PositionTest,
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
              id: 'top-step',
              target: '#top-target',
              content: 'This is the top position test.',
              position: 'top',
            },
            {
              id: 'right-step',
              target: '#right-target',
              content: 'This is the right position test.',
              position: 'right',
            },
            {
              id: 'bottom-step',
              target: '#bottom-target',
              content: 'This is the bottom position test.',
              position: 'bottom',
            },
            {
              id: 'left-step',
              target: '#left-target',
              content: 'This is the left position test.',
              position: 'left',
            },
          ]}
        />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof PositionTest>;

export const Default: Story = {
  args: {
    position: 'top',
  },
};

export const RightPosition: Story = {
  args: {
    position: 'right',
  },
};

export const BottomPosition: Story = {
  args: {
    position: 'bottom',
  },
};

export const LeftPosition: Story = {
  args: {
    position: 'left',
  },
}; 