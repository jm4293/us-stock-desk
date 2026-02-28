import React from "react";
import { Modal, SearchInput } from "@/components";
import {
  selectCloseSearch,
  selectIsSearchOpen,
  selectShowToast,
  selectTheme,
  useSettingsStore,
  useStockBoxStore,
  useToastStore,
  useUIStore,
} from "@/stores";
import { cn } from "@/utils";
import { useTranslation } from "react-i18next";

export const SearchModal: React.FC = () => {
  const { t } = useTranslation();

  const showToast = useToastStore(selectShowToast);
  const isSearchOpen = useUIStore(selectIsSearchOpen);
  const closeSearch = useUIStore(selectCloseSearch);
  const theme = useSettingsStore(selectTheme);
  const isDark = theme === "dark";

  const handleSearch = (symbol: string, companyName: string) => {
    useStockBoxStore.getState().addStock(symbol.toUpperCase(), companyName);
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
