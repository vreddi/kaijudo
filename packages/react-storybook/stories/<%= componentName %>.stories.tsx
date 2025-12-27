import type { Meta, StoryObj } from '@storybook/react';
import { ReactStorybook } from './ReactStorybook';

const meta = {
  title: 'Components/ReactStorybook',
  component: ReactStorybook,
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
} satisfies Meta<typeof ReactStorybook>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};

export const WithContent: Story = {
  args: {
    children: 'Hello from ReactStorybook!',
  },
};

export const WithClassName: Story = {
  args: {
    children: 'Styled ReactStorybook',
    className: 'p-4 border rounded',
  },
};
