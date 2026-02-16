import { finnhubApi } from "@/services/api/finnhubApi";
import { useTheme } from "@/stores/settingsStore";
import { cn } from "@/utils/cn";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

interface SearchResult {
  symbol: string;
  description: string;
}

interface SearchInputProps {
  onSearch: (symbol: string, companyName: string) => void;
  className?: string;
}

export const SearchInput: React.FC<SearchInputProps> = ({ onSearch, className }) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const isDark = theme === "dark";
  const [value, setValue] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const search = useCallback(async (query: string) => {
    if (!query.trim()) {
      setResults([]);
      setShowDropdown(false);
      return;
    }
    setIsLoading(true);
    try {
      const res = await finnhubApi.searchSymbol(query);
      if (res.success && res.data) {
        const data = res.data as { result?: { symbol: string; description: string }[] };
        const items = (data.result ?? [])
          .filter((r) => r.symbol && !r.symbol.includes("."))
          .slice(0, 8);
        setResults(items);
        setShowDropdown(items.length > 0);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    setValue(v);
    setActiveIndex(-1);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(v), 300);
  };

  const handleSelect = (item: SearchResult) => {
    onSearch(item.symbol, item.description);
    setValue("");
    setResults([]);
    setShowDropdown(false);
  };

  const handleDirectSearch = () => {
    const trimmed = value.trim();
    if (!trimmed) return;
    onSearch(trimmed.toUpperCase(), trimmed.toUpperCase());
    setValue("");
    setResults([]);
    setShowDropdown(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showDropdown) {
      if (e.key === "Enter") handleDirectSearch();
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, -1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (activeIndex >= 0 && results[activeIndex]) {
        handleSelect(results[activeIndex]);
      } else {
        handleDirectSearch();
      }
    } else if (e.key === "Escape") {
      setShowDropdown(false);
      setActiveIndex(-1);
    }
  };

  const hasValue = value.trim().length > 0;

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      {/* Input + 검색 버튼 (같은 행) + 드롭다운 기준점 */}
      <div className="relative flex gap-2">
        <div className="relative flex-1">
          <input
            ref={inputRef}
            value={value}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onFocus={() => results.length > 0 && setShowDropdown(true)}
            placeholder={t("search.placeholder")}
            autoComplete="off"
            className={cn(
              "w-full rounded-lg border px-4 py-2.5 text-sm outline-none transition-colors",
              isDark
                ? "border-white/20 bg-white/10 text-white placeholder-gray-400 focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
                : "border-slate-200 bg-slate-50 text-slate-800 placeholder-slate-400 focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
            )}
          />
          {/* 로딩 스피너 */}
          {isLoading && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <svg className="h-4 w-4 animate-spin text-blue-400" fill="none" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                />
              </svg>
            </div>
          )}
        </div>

        {/* 검색 버튼 */}
        <button
          onClick={handleDirectSearch}
          disabled={!hasValue}
          className={cn(
            "shrink-0 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors disabled:cursor-not-allowed",
            isDark
              ? hasValue
                ? "border-white/40 bg-white/20 text-white hover:bg-white/30"
                : "border-white/10 bg-white/5 text-gray-500"
              : hasValue
                ? "border-blue-500 bg-blue-50 text-blue-700 hover:bg-blue-100"
                : "border-slate-200 bg-slate-50 text-slate-400"
          )}
        >
          {t("search.button")}
        </button>

        {/* 자동완성 드롭다운 — absolute (relative flex 행 기준) */}
        {showDropdown && (
          <div
            className={cn(
              "absolute left-0 right-0 top-full z-50 mt-1 overflow-hidden rounded-lg border shadow-2xl",
              isDark ? "border-white/20 bg-gray-900" : "border-slate-200 bg-white"
            )}
          >
            {results.map((item, idx) => (
              <button
                key={item.symbol}
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  handleSelect(item);
                }}
                className={cn(
                  "flex w-full items-center gap-3 px-4 py-3 text-left text-sm transition-colors",
                  activeIndex === idx
                    ? isDark
                      ? "bg-white/10"
                      : "bg-blue-50"
                    : isDark
                      ? "hover:bg-white/5"
                      : "hover:bg-slate-50"
                )}
              >
                <span
                  className={cn(
                    "w-16 shrink-0 rounded px-1.5 py-0.5 text-center text-xs font-bold",
                    isDark ? "bg-white/10 text-blue-300" : "bg-blue-100 text-blue-700"
                  )}
                >
                  {item.symbol}
                </span>
                <span className={cn("truncate", isDark ? "text-gray-300" : "text-slate-600")}>
                  {item.description}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

SearchInput.displayName = "SearchInput";
