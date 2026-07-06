import React from "react";
import { Modal } from "@/components";
import { useShareImport } from "@/hooks";
import { selectTheme, useSettingsStore } from "@/stores";
import { cn } from "@/utils";
import { useTranslation } from "react-i18next";

/**
 * 공유 링크(`#s=...`)로 접속했을 때 뜨는 불러오기 확인 모달.
 * 사용자가 명시적으로 "불러오기"를 눌러야 기존 종목/설정을 대체한다.
 */
export const ShareImportModal: React.FC = () => {
  const { t } = useTranslation();
  const { pending, confirm, cancel } = useShareImport();

  const theme = useSettingsStore(selectTheme);
  const isDark = theme === "dark";

  return (
    <Modal open={!!pending} onClose={cancel}>
      <h2 className={cn("mb-2 text-lg font-bold", isDark ? "text-white" : "text-slate-800")}>
        {t("share.importTitle")}
      </h2>
      <p className={cn("mb-4 text-sm", isDark ? "text-gray-300" : "text-slate-600")}>
        {t("share.importDesc", { count: pending?.stocks.length ?? 0 })}
      </p>
      <p className={cn("mb-5 text-xs", isDark ? "text-gray-500" : "text-slate-400")}>
        {t("share.importWarning")}
      </p>

      <div className="flex gap-2">
        <button
          onClick={cancel}
          className={cn(
            "flex-1 rounded-xl py-3 text-sm font-medium transition-colors",
            isDark
              ? "bg-white/10 text-gray-300 hover:bg-white/20"
              : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
          )}
        >
          {t("common.cancel")}
        </button>
        <button
          onClick={confirm}
          className={cn(
            "flex-1 rounded-xl py-3 text-sm font-semibold transition-colors",
            isDark
              ? "bg-white/25 text-white hover:bg-white/35"
              : "bg-slate-800 text-white hover:bg-slate-700"
          )}
        >
          {t("share.importConfirm")}
        </button>
      </div>
    </Modal>
  );
};

ShareImportModal.displayName = "ShareImportModal";
