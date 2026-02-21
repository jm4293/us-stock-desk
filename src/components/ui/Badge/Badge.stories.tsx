import type { Meta, StoryObj } from "@storybook/react";
import { Badge } from "./Badge";

const meta = {
  title: "Atoms/Badge",
  component: Badge,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Positive: Story = {
  args: {
    children: "+1.25%",
    variant: "positive",
  },
};

export const Negative: Story = {
  args: {
    children: "-0.83%",
    variant: "negative",
  },
};

export const Neutral: Story = {
  args: {
    children: "0.00%",
    variant: "neutral",
  },
};
