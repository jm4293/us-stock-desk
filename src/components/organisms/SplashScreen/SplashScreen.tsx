import { cn } from "@/utils/cn";
import { gsap } from "gsap";
import { useEffect, useRef } from "react";

interface SplashScreenProps {
  isDark: boolean;
  onComplete: () => void;
}

export const SplashScreen = ({ isDark, onComplete }: SplashScreenProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const loaderRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  // onComplete를 ref로 보관 → 인라인 함수여도 useEffect 재실행 방지
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    const tl = gsap.timeline({
      onComplete: () => {
        // 스플래시 fade-out 후 onComplete 호출
        gsap.to(containerRef.current, {
          opacity: 0,
          duration: 0.5,
          ease: "power2.inOut",
          onComplete: () => onCompleteRef.current(),
        });
      },
    });

    // 초기 상태
    gsap.set([logoRef.current, titleRef.current, subtitleRef.current, loaderRef.current], {
      opacity: 0,
      y: 20,
    });

    // 등장 애니메이션
    tl.to(logoRef.current, { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" })
      .to(titleRef.current, { opacity: 1, y: 0, duration: 0.4, ease: "power2.out" }, "-=0.2")
      .to(subtitleRef.current, { opacity: 1, y: 0, duration: 0.4, ease: "power2.out" }, "-=0.2")
      .to(loaderRef.current, { opacity: 1, y: 0, duration: 0.3, ease: "power2.out" }, "-=0.1")
      // 로딩 바 채우기
      .to(barRef.current, { width: "100%", duration: 1.8, ease: "power1.inOut" }, "-=0.1")
      // 잠깐 대기
      .to({}, { duration: 0.2 });

    return () => {
      tl.kill();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      ref={containerRef}
      className={cn(
        "fixed inset-0 z-[9999] flex flex-col items-center justify-center",
        isDark
          ? "bg-gradient-to-br from-blue-950 via-gray-950 to-purple-950"
          : "bg-gradient-to-br from-blue-100 via-slate-50 to-purple-100"
      )}
    >
      {/* 배경 장식 */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className={cn(
            "absolute -left-32 -top-32 h-96 w-96 rounded-full blur-3xl",
            isDark ? "bg-blue-800/20" : "bg-blue-300/30"
          )}
        />
        <div
          className={cn(
            "absolute -bottom-32 -right-32 h-96 w-96 rounded-full blur-3xl",
            isDark ? "bg-purple-800/20" : "bg-purple-300/30"
          )}
        />
      </div>

      {/* 콘텐츠 */}
      <div className="relative flex flex-col items-center gap-6">
        {/* 로고 아이콘 */}
        <div
          ref={logoRef}
          className={cn(
            "flex h-20 w-20 items-center justify-center rounded-2xl shadow-2xl",
            "glass border border-white/20"
          )}
        >
          <svg
            viewBox="0 0 48 48"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="h-12 w-12"
          >
            {/* 차트 라인 */}
            <polyline
              points="4,36 14,24 22,30 32,12 44,20"
              stroke={isDark ? "#60a5fa" : "#2563eb"}
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
            {/* 상승 화살표 */}
            <polyline
              points="38,8 44,8 44,14"
              stroke={isDark ? "#34d399" : "#16a34a"}
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        {/* 타이틀 */}
        <div className="flex flex-col items-center gap-2">
          <h1
            ref={titleRef}
            className={cn(
              "text-4xl font-bold tracking-tight",
              isDark ? "text-white" : "text-gray-900"
            )}
          >
            Stock Desk
          </h1>
          <p
            ref={subtitleRef}
            className={cn("text-sm", isDark ? "text-gray-400" : "text-gray-500")}
          >
            해외주식 대시보드
          </p>
        </div>

        {/* 로딩 인디케이터 */}
        <div ref={loaderRef} className="mt-4 flex flex-col items-center gap-2">
          <div
            className={cn(
              "h-1 w-48 overflow-hidden rounded-full",
              isDark ? "bg-white/10" : "bg-gray-200"
            )}
          >
            <div
              ref={barRef}
              className={cn(
                "h-full w-0 rounded-full",
                isDark
                  ? "bg-gradient-to-r from-blue-400 to-purple-400"
                  : "bg-gradient-to-r from-blue-500 to-purple-500"
              )}
            />
          </div>
          <span className={cn("text-xs", isDark ? "text-gray-500" : "text-gray-400")}>
            불러오는 중...
          </span>
        </div>
      </div>
    </div>
  );
};
