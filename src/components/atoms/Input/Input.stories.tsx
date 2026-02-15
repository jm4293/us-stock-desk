import type { Meta, StoryObj } from "@storybook/react";
import { Input } from "./Input";

const meta = {
  title: "Atoms/Input",
  component: Input,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    placeholder: "텍스트를 입력하세요",
  },
};

export const WithLabel: Story = {
  args: {
    label: "종목 심볼",
    placeholder: "예: AAPL",
  },
};

export const WithError: Story = {
  args: {
    label: "종목 심볼",
    placeholder: "예: AAPL",
    error: "유효하지 않은 종목 심볼입니다",
  },
};

export const Disabled: Story = {
  args: {
    placeholder: "비활성화된 입력",
    disabled: true,
  },
};
