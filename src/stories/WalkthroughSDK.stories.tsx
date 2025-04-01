import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Demo } from './Demo';

const meta: Meta<typeof Demo> = {
  title: 'Core/Demo',
  component: Demo,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Demo>;

export const Default: Story = {}; 