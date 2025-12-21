import type { Meta, StoryObj } from '@storybook/react';
import { <%= componentName %> } from './<%= componentName %>';

const meta = {
  title: 'Components/<%= componentName %>',
  component: <%= componentName %>,
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
} satisfies Meta<typeof <%= componentName %>>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};

export const WithContent: Story = {
  args: {
    children: 'Hello from <%= componentName %>!',
  },
};

export const WithClassName: Story = {
  args: {
    children: 'Styled <%= componentName %>',
    className: 'p-4 border rounded',
  },
};
