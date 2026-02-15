import type { Meta, StoryObj } from "@storybook/react";
import { SearchInput } from "./SearchInput";

const meta = {
  title: "Molecules/SearchInput",
  component: SearchInput,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof SearchInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    onSearch: (symbol: string) => console.log("검색:", symbol),
  },
};

export const WithPlaceholder: Story = {
  args: {
    onSearch: (symbol: string) => console.log("검색:", symbol),
    placeholder: "종목 코드를 입력하세요",
  },
};
