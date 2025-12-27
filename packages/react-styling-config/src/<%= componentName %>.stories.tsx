import type { Meta, StoryObj } from '@storybook/react';
import { UiConfig } from './UiConfig';

const meta = {
  title: 'Components/UiConfig',
  component: UiConfig,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    children: {
      control: 'text',
      description: 'The content to display',
    },
    className: {
      control: 'text',
      description: 'Additional CSS classes',
    },
  },
} satisfies Meta<typeof UiConfig>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};

export const WithContent: Story = {
  args: {
    children: 'Hello from UiConfig!',
  },
};

export const WithClassName: Story = {
  args: {
    children: 'Styled UiConfig',
    className: 'p-4 border rounded',
  },
};
