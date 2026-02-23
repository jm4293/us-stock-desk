import type { Meta, StoryObj } from "@storybook/react";
import { Header } from "./Header";

const meta = {
  title: "Organisms/Header",
  component: Header,
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof Header>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    onAddStock: () => console.log("종목 추가"),
    onOpenSettings: () => console.log("설정 열기"),
  },
};
