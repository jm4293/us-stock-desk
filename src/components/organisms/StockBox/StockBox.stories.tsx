import type { Meta, StoryObj } from "@storybook/react";
import { StockBox } from "./StockBox";

const meta = {
  title: "Organisms/StockBox",
  component: StockBox,
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof StockBox>;

export default meta;
type Story = StoryObj<typeof meta>;

const defaultArgs = {
  id: "story-id",
  symbol: "AAPL",
  companyName: "Apple Inc.",
  position: { x: 50, y: 50 },
  size: { width: 400, height: 300 },
  zIndex: 1,
  focused: false,
  onFocus: () => {},
  onClose: () => {},
  onPositionChange: () => {},
  onSizeChange: () => {},
};

export const Default: Story = {
  args: defaultArgs,
};

export const Focused: Story = {
  args: { ...defaultArgs, focused: true, zIndex: 50 },
};

export const Loading: Story = {
  args: { ...defaultArgs, loading: true },
};

export const WithError: Story = {
  args: { ...defaultArgs, error: "실시간 데이터를 불러올 수 없습니다" },
};

export const Tesla: Story = {
  args: {
    ...defaultArgs,
    id: "tesla-id",
    symbol: "TSLA",
    companyName: "Tesla, Inc.",
  },
};
