import React, { useState } from "react";
import { cn } from "@/utils/cn";
import { Input } from "@/components/atoms/Input";
import { Button } from "@/components/atoms/Button";

interface SearchInputProps {
  onSearch: (query: string) => void;
  className?: string;
}

export const SearchInput: React.FC<SearchInputProps> = ({ onSearch, className }) => {
  const [value, setValue] = useState("");

  const handleSearch = () => {
    const trimmed = value.trim();
    if (!trimmed) return;
    onSearch(trimmed.toUpperCase());
    setValue("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div className={cn("flex gap-2", className)}>
      <Input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="종목 검색 (예: AAPL)"
      />
      <Button onClick={handleSearch} aria-label="검색">
        검색
      </Button>
    </div>
  );
};

SearchInput.displayName = "SearchInput";
