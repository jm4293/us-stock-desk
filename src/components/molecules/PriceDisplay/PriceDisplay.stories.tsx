import type { Meta, StoryObj } from "@storybook/react";
import { PriceDisplay } from "./PriceDisplay";
import type { StockPrice } from "@/types/stock";

const meta = {
  title: "Molecules/PriceDisplay",
  component: PriceDisplay,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof PriceDisplay>;

export default meta;
type Story = StoryObj<typeof meta>;

const mockPrice: StockPrice = {
  symbol: "AAPL",
  current: 182.5,
  open: 180.0,
  high: 184.0,
  low: 179.5,
  close: 180.0,
  change: 2.5,
  changePercent: 1.39,
  volume: 50000000,
  timestamp: Date.now(),
};

export const Positive: Story = {
  args: {
    price: mockPrice,
  },
};

export const Negative: Story = {
  args: {
    price: { ...mockPrice, change: -2.5, changePercent: -1.39 },
  },
};

export const Neutral: Story = {
  args: {
    price: { ...mockPrice, change: 0, changePercent: 0 },
  },
};

export const Loading: Story = {
  args: {
    price: null,
    loading: true,
  },
};
