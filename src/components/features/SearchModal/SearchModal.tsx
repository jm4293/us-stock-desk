import { Modal, SearchInput } from "@/components/ui";
import { useShowToast, useStockStore, useTheme, useUIActions, useUIStore } from "@/stores";
import { cn } from "@/utils/cn";
import React from "react";
import { useTranslation } from "react-i18next";

export const SearchModal: React.FC = () => {
  const { t } = useTranslation();
  const isSearchOpen = useUIStore((state) => state.isSearchOpen);
  const { closeSearch } = useUIActions();
  const addStock = useStockStore((state) => state.addStock);
  const theme = useTheme();
  const isDark = theme === "dark";
  const showToast = useShowToast();

  const handleSearch = (symbol: string, companyName: string) => {
    addStock(symbol.toUpperCase(), companyName);
    closeSearch();
    showToast(t("toast.stockAdded", { symbol: symbol.toUpperCase() }), "success");
  };

  return (
    <Modal open={isSearchOpen} onClose={closeSearch} allowOverflow>
      <h2 className={cn("mb-4 text-lg font-bold", isDark ? "text-white" : "text-slate-800")}>
        {t("search.title")}
      </h2>
      <SearchInput onSearch={handleSearch} />
      <button
        className={cn(
          "mt-4 w-full rounded-xl py-3 text-sm font-medium transition-colors",
          isDark
            ? "bg-white/15 text-white hover:bg-white/25"
            : "bg-slate-100 text-slate-700 hover:bg-slate-200"
        )}
        onClick={closeSearch}
      >
        {t("common.done")}
      </button>
    </Modal>
  );
};

SearchModal.displayName = "SearchModal";
