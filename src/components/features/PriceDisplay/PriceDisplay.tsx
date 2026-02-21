import { useExchangeRate } from "@/hooks";
import { useColorScheme, useCurrency, useTheme } from "@/stores";
import type { StockPrice } from "@/types/stock";
import { cn } from "@/utils/cn";
import {
  formatChangeKRW,
  formatChangeUSD,
  formatKRW,
  formatPercent,
  formatUSD,
} from "@/utils/formatters";
import React from "react";
import { useTranslation } from "react-i18next";

interface PriceDisplayProps {
  price: StockPrice | null;
  loading?: boolean;
  /** 현재 마켓 상태: pre/post일 때 확장 거래 가격 표시 */
  marketStatus?: "open" | "pre" | "post" | "closed";
  className?: string;

  /** 헤더 통합용 옵션 props (데스크탑/모바일 인라인 레이아웃) */
  companyName?: string;
  symbol?: string;
  actionNode?: React.ReactNode;
}

export const PriceDisplay: React.FC<PriceDisplayProps> = ({
  price,
  loading = false,
  marketStatus,
  className,
  companyName,
  symbol,
  actionNode,
}) => {
  const { t } = useTranslation();
  const colorScheme = useColorScheme();
  const currency = useCurrency();
  const { rate: exchangeRate } = useExchangeRate();
  const theme = useTheme();
  const isDark = theme === "dark";

  const upClass = colorScheme === "kr" ? "text-up-kr" : "text-up-us";
  const downClass = colorScheme === "kr" ? "text-blue-600" : "text-down-us";

  if (loading || !price || !price.current) {
    return (
      <div className={cn(className)}>
        <div className="flex items-start justify-between">
          <div className="min-w-0 flex-1 pr-4">
            {companyName ? (
              <h3 className="truncate text-lg font-bold text-white">{companyName}</h3>
            ) : (
              symbol && <h3 className="truncate text-lg font-bold text-white">{symbol}</h3>
            )}
            {companyName && symbol && (
              <p className="text-sm font-medium text-gray-400/80">{symbol}</p>
            )}
          </div>
          <div className="flex shrink-0 items-start">
            <div
              data-testid="price-skeleton"
              className="flex animate-pulse flex-col items-end space-y-2"
            >
              <div className={cn("h-8 w-32 rounded", isDark ? "bg-white/10" : "bg-black/10")} />
              <div className={cn("h-4 w-24 rounded", isDark ? "bg-white/10" : "bg-black/10")} />
              <div className={cn("h-3 w-40 rounded", isDark ? "bg-white/10" : "bg-black/10")} />
            </div>
            {actionNode && <div className="-mr-2 -mt-1 ml-2">{actionNode}</div>}
          </div>
        </div>
      </div>
    );
  }

  const isPositive = price.change >= 0;
  const priceColorClass = isPositive ? upClass : downClass;

  const displayPrice =
    currency === "KRW" ? formatKRW(price.current * exchangeRate) : formatUSD(price.current);

  const displayChange =
    currency === "KRW"
      ? formatChangeKRW(price.change * exchangeRate)
      : formatChangeUSD(price.change);

  const displayHigh =
    currency === "KRW" ? formatKRW(price.high * exchangeRate) : formatUSD(price.high);

  const displayLow =
    currency === "KRW" ? formatKRW(price.low * exchangeRate) : formatUSD(price.low);

  // 세션 레이블: pre/post는 현재가가 확장가로 교체됨, closed는 종가 유지
  const sessionLabel =
    marketStatus === "pre"
      ? t("stockBox.preMarket")
      : marketStatus === "post"
        ? t("stockBox.postMarket")
        : null;

  // closed 상태에서 postMarket 보조 표시
  const closedPostMarket = price.postMarket;
  const displayClosedPost = closedPostMarket
    ? currency === "KRW"
      ? formatKRW(closedPostMarket.price * exchangeRate)
      : formatUSD(closedPostMarket.price)
    : null;
  const closedPostChange = closedPostMarket
    ? currency === "KRW"
      ? formatChangeKRW(closedPostMarket.change * exchangeRate)
      : formatChangeUSD(closedPostMarket.change)
    : null;
  const isClosedPostPositive = closedPostMarket ? closedPostMarket.change >= 0 : true;
  const closedPostColorClass = isClosedPostPositive ? upClass : downClass;

  // preMarket 보조 표시
  const preMarket = price.preMarket;
  const displayPreMarket = preMarket
    ? currency === "KRW"
      ? formatKRW(preMarket.price * exchangeRate)
      : formatUSD(preMarket.price)
    : null;
  const preMarketChange = preMarket
    ? currency === "KRW"
      ? formatChangeKRW(preMarket.change * exchangeRate)
      : formatChangeUSD(preMarket.change)
    : null;
  const isPreMarketPositive = preMarket ? preMarket.change >= 0 : true;
  const preMarketColorClass = isPreMarketPositive ? upClass : downClass;

  // 정규장 종가 보조 표시
  // 메인 가격이 현재 세션에 따라 바뀌므로, 훼손되지 않은 원본 정규장 가격을 하단에 항상 표시합니다.
  const displayCloseNum = price.regularMarketPrice ?? price.current;
  const displayClose =
    currency === "KRW" ? formatKRW(displayCloseNum * exchangeRate) : formatUSD(displayCloseNum);

  return (
    <div className={cn(className)}>
      <div className="flex items-start justify-between">
        {/* 좌측: 이름 및 티커 */}
        <div className="min-w-0 flex-1 pr-4">
          {companyName ? (
            <h3 className="truncate text-lg font-bold text-white">{companyName}</h3>
          ) : (
            symbol && <h3 className="truncate text-lg font-bold text-white">{symbol}</h3>
          )}
          {companyName && symbol && (
            <p className="text-sm font-medium text-gray-400/80">{symbol}</p>
          )}
        </div>

        {/* 우측: 가격/변동률 (우측 정렬) + X 버튼 */}
        <div className="flex shrink-0 items-center">
          <div className="flex flex-col items-end">
            <div className={cn("text-2xl font-bold tracking-tight", priceColorClass)}>
              {displayPrice}
            </div>
            <div className="mt-0.5 flex items-center justify-end gap-1.5 text-sm">
              {sessionLabel && (
                <span
                  className={cn(
                    "rounded px-1.5 py-0.5 text-[10px] font-medium leading-none",
                    isDark ? "bg-white/10 text-gray-300" : "bg-slate-100 text-slate-500"
                  )}
                >
                  {sessionLabel}
                </span>
              )}
              <span className={priceColorClass}>{displayChange}</span>
              <span className={priceColorClass}>{formatPercent(price.changePercent)}</span>
            </div>
          </div>
          {/* X 버튼을 가격/변동률 블록의 우측에 고정 */}
          {actionNode && <div className="-mr-2 -mt-1 ml-2">{actionNode}</div>}
        </div>
      </div>

      <div className="flex flex-col text-xs">
        {/* 프리마켓 (pre/post/closed 상태에서 보조 표시) */}
        {displayPreMarket && (
          <div className="flex items-center justify-between">
            <span className={isDark ? "text-gray-400" : "text-slate-500"}>
              {t("stockBox.preMarket")}
            </span>
            <div className="flex items-center gap-1.5">
              <span className={cn("font-medium tabular-nums", preMarketColorClass)}>
                {displayPreMarket}
              </span>
              {preMarketChange && (
                <span className={cn("text-[10px] tabular-nums", preMarketColorClass)}>
                  {preMarketChange}
                </span>
              )}
            </div>
          </div>
        )}

        {/* 정규장 종가 */}
        {displayClose && (
          <div className="flex items-center gap-2">
            <span className={isDark ? "text-gray-400" : "text-slate-500"}>
              {t("stockBox.regularClose") || "Regular Close"}
            </span>
            <span
              className={cn(
                "font-medium tabular-nums",
                isDark ? "text-gray-300" : "text-slate-700"
              )}
            >
              {displayClose}
            </span>
          </div>
        )}

        {/* 애프터마켓 */}
        {displayClosedPost && (
          <div className="flex items-center justify-between">
            <span className={isDark ? "text-gray-400" : "text-slate-500"}>
              {t("stockBox.postMarket")}
            </span>
            <div className="flex items-center gap-1.5">
              <span className={cn("font-medium tabular-nums", closedPostColorClass)}>
                {displayClosedPost}
              </span>
              {closedPostChange && (
                <span className={cn("text-[10px] tabular-nums", closedPostColorClass)}>
                  {closedPostChange}
                </span>
              )}
            </div>
          </div>
        )}

        {/* 오늘 최고가 / 최저가 (한 줄로 통합) */}
        <div
          className={cn("mt-0.5 flex gap-3 text-xs", isDark ? "text-gray-400" : "text-slate-500")}
        >
          <span>
            <span className={`mr-1 ${isDark ? "text-gray-400" : "text-slate-500"}`}>
              {t("stockBox.high")}
            </span>
            <span className={upClass}>{displayHigh}</span>
          </span>
          <span>
            <span className={`mr-1 ${isDark ? "text-gray-400" : "text-slate-500"}`}>
              {t("stockBox.low")}
            </span>
            <span className={downClass}>{displayLow}</span>
          </span>
        </div>
      </div>
    </div>
  );
};

PriceDisplay.displayName = "PriceDisplay";
