import { useEffect, useRef, useState } from "react";
import { useSettingsStore, useStockBoxStore } from "@/stores";
import { clearShareHash, decodeShareState, readShareHash, type SharedState } from "@/utils";

/**
 * 최초 로드 시 URL 해시(`#s=...`)에 공유 페이로드가 있으면 디코딩해 확인 대기 상태로 둔다.
 * 기존 종목/설정을 말없이 덮어쓰지 않도록, 실제 반영은 confirm() 호출 시에만 수행한다.
 */
export const useShareImport = () => {
  const [pending, setPending] = useState<SharedState | null>(null);
  const checkedRef = useRef(false);

  useEffect(() => {
    // StrictMode 이중 실행 및 리렌더에도 최초 1회만 검사
    if (checkedRef.current) return;
    checkedRef.current = true;

    const hash = readShareHash();
    if (!hash) return;

    let cancelled = false;
    void decodeShareState(hash).then((state) => {
      if (cancelled) return;
      if (state) {
        setPending(state);
      } else {
        // 손상되었거나 구버전 페이로드 → 조용히 해시만 제거
        clearShareHash();
      }
    });

    return () => {
      cancelled = true;
    };
  }, []);

  const confirm = () => {
    if (!pending) return;
    useStockBoxStore.getState().replaceStocks(pending.stocks);
    useSettingsStore.getState().applySettings(pending.settings);
    clearShareHash();
    setPending(null);
  };

  const cancel = () => {
    clearShareHash();
    setPending(null);
  };

  return { pending, confirm, cancel };
};
