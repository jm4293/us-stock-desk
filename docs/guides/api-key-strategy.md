# API 키 관리 전략

## 📋 개요

Stock Desk는 두 가지 사용 방식을 제공합니다:

1. **무료 사용** - 공용 API 키 (제한 있음)
2. **프리미엄 사용** - 개인 API 키 (제한 없음)

---

## 🔒 제한 모드 (공용 API 키)

### 제약사항

- **업데이트 주기**: 최소 10초
- **동시 사용자**: 모든 사용자가 API 제한 공유
- **종목 수**: 제한 없음 (하지만 업데이트가 느릴 수 있음)

### 작동 방식

```
사용자 → Vercel Serverless Function (캐싱 10초) → Finnhub API
```

---

## ⚡ 실시간 모드 (개인 API 키)

### 장점

- ✅ **실시간 업데이트** - 최소 1초 간격
- ✅ **제한 없음** - 개인 API 제한 (60 calls/분)
- ✅ **빠른 응답** - 서버 거치지 않고 직접 호출

---

## 🎯 API 키 검증 및 UX 피드백

### 1. API 키 입력 및 검증 플로우

```
사용자 API 키 입력
    ↓
"확인" 버튼 클릭
    ↓
테스트 API 호출 (AAPL 종목으로 테스트)
    ↓
성공 ✅                     실패 ❌
    ↓                           ↓
성공 메시지 표시          에러 메시지 표시
LocalStorage 저장         재입력 요청
실시간 모드 활성화
```

### 2. 설정 모달 구현 (검증 포함)

```tsx
// src/components/organisms/SettingsModal/SettingsModal.tsx
export const SettingsModal = () => {
  const [useOwnKey, setUseOwnKey] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [validating, setValidating] = useState(false);
  const [validationStatus, setValidationStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const validateAndSaveApiKey = async () => {
    setValidating(true);
    setValidationStatus("idle");
    setErrorMessage("");

    try {
      // 테스트 API 호출
      const response = await fetch(`https://finnhub.io/api/v1/quote?symbol=AAPL&token=${apiKey}`);

      if (!response.ok) {
        throw new Error("유효하지 않은 API 키입니다");
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      // 성공 - 저장
      setValidationStatus("success");
      useSettingsStore.getState().setApiKey(apiKey);
      useSettingsStore.getState().setUseOwnKey(true);

      // 성공 토스트
      toast.success("🎉 API 키가 등록되었습니다!\n이제 실시간 업데이트를 사용합니다.");
    } catch (error) {
      setValidationStatus("error");
      setErrorMessage(error.message || "API 키 확인에 실패했습니다");
      toast.error(`❌ ${error.message}`);
    } finally {
      setValidating(false);
    }
  };

  return (
    <div className="api-key-section">
      <h3>API 키 설정</h3>

      <label>
        <input
          type="checkbox"
          checked={useOwnKey}
          onChange={(e) => setUseOwnKey(e.target.checked)}
        />
        내 API 키 사용하기
      </label>

      {useOwnKey && (
        <div className="api-key-input">
          <div className="input-group">
            <input
              type="password"
              placeholder="Finnhub API 키 입력"
              value={apiKey}
              onChange={(e) => {
                setApiKey(e.target.value);
                setValidationStatus("idle"); // 입력 시 상태 초기화
              }}
              disabled={validating}
            />
            <button
              onClick={validateAndSaveApiKey}
              disabled={!apiKey || validating}
              className={cn(
                "btn",
                validating && "btn-loading",
                validationStatus === "success" && "btn-success"
              )}
            >
              {validating ? "확인 중..." : validationStatus === "success" ? "✓ 등록됨" : "확인"}
            </button>
          </div>

          {/* 검증 성공 */}
          {validationStatus === "success" && (
            <div className="alert alert-success">
              <span className="icon">✅</span>
              <div>
                <strong>API 키가 정상적으로 등록되었습니다!</strong>
                <p>이제 실시간 업데이트(1초 간격)를 사용할 수 있습니다.</p>
              </div>
            </div>
          )}

          {/* 검증 실패 */}
          {validationStatus === "error" && (
            <div className="alert alert-error">
              <span className="icon">❌</span>
              <div>
                <strong>API 키 등록 실패</strong>
                <p>{errorMessage}</p>
                <p className="hint">API 키를 다시 확인해주세요.</p>
              </div>
            </div>
          )}

          {/* 가이드 */}
          <div className="guide">
            <p>📖 API 키 발급 방법:</p>
            <ol>
              <li>
                <a href="https://finnhub.io/register" target="_blank" rel="noopener">
                  Finnhub 회원가입 (무료) →
                </a>
              </li>
              <li>대시보드에서 API 키 복사</li>
              <li>위 입력란에 붙여넣기</li>
              <li>
                <strong>"확인" 버튼 클릭하여 검증</strong>
              </li>
            </ol>

            <div className="benefit">
              <span className="icon">✨</span>
              <span>실시간 업데이트 + 제한 없음</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
```

### 3. 헤더에 API 키 상태 표시

```tsx
// src/components/organisms/Header/ApiKeyStatus.tsx
export const ApiKeyStatus = () => {
  const { useOwnKey } = useSettingsStore();

  return (
    <div className={cn("api-key-status", useOwnKey && "premium")}>
      {useOwnKey ? (
        <>
          <span className="icon">⚡</span>
          <span className="text">실시간 모드</span>
          <span className="badge">1초</span>
        </>
      ) : (
        <>
          <span className="icon">🔒</span>
          <span className="text">제한 모드</span>
          <span className="badge">10초</span>
        </>
      )}
    </div>
  );
};
```

### 4. 검증 로직 (서비스)

```ts
// src/services/api/validateApiKey.ts
export const validateApiKey = async (
  apiKey: string
): Promise<{
  valid: boolean;
  error?: string;
}> => {
  try {
    const response = await fetch(`https://finnhub.io/api/v1/quote?symbol=AAPL&token=${apiKey}`);

    if (!response.ok) {
      return {
        valid: false,
        error: "API 키가 유효하지 않습니다",
      };
    }

    const data = await response.json();

    if (data.error) {
      return {
        valid: false,
        error: data.error,
      };
    }

    // 정상 응답 확인
    if (typeof data.c === "number") {
      return { valid: true };
    }

    return {
      valid: false,
      error: "예상치 못한 응답 형식입니다",
    };
  } catch (error) {
    return {
      valid: false,
      error: "네트워크 오류가 발생했습니다",
    };
  }
};
```

---

## 📊 사용자 플로우

### API 키 등록 플로우

```
1. 설정 모달 열기
   ↓
2. "내 API 키 사용하기" 체크
   ↓
3. API 키 입력
   ↓
4. "확인" 버튼 클릭
   ↓
5. 검증 중... (로딩 표시)
   ↓
6-A. 성공 ✅                    6-B. 실패 ❌
   ↓                               ↓
   성공 메시지 표시              에러 메시지 표시
   LocalStorage 저장             "API 키를 다시 확인해주세요"
   실시간 모드 활성화            재입력 가능
   토스트 알림
   ↓
7. 모달 닫기
   ↓
8. 헤더에 "⚡ 실시간 모드" 표시
```

---

## 🎨 UI 상태별 디자인

### 1. 초기 상태 (Idle)

```tsx
<input placeholder="Finnhub API 키 입력" />
<button>확인</button>
```

### 2. 검증 중 (Loading)

```tsx
<input disabled />
<button disabled className="loading">
  <Spinner /> 확인 중...
</button>
```

### 3. 성공 (Success)

```tsx
<div className="alert-success">
  ✅ API 키가 정상적으로 등록되었습니다!
  이제 실시간 업데이트를 사용할 수 있습니다.
</div>
<button className="success">✓ 등록됨</button>
```

### 4. 실패 (Error)

```tsx
<div className="alert-error">
  ❌ API 키 등록 실패
  유효하지 않은 API 키입니다
  API 키를 다시 확인해주세요.
</div>
<button>다시 확인</button>
```

---

## 🔔 토스트 알림

```tsx
// 성공
toast.success("🎉 API 키가 등록되었습니다!\n이제 실시간 업데이트를 사용합니다.");

// 실패
toast.error("❌ API 키 등록 실패\n유효하지 않은 API 키입니다");

// 네트워크 오류
toast.error("❌ 네트워크 오류\n인터넷 연결을 확인해주세요");
```

---

## 🔒 보안 고려사항

### API 키 저장

- ✅ LocalStorage에 Base64 인코딩하여 저장
- ✅ HTTPS 통신만 허용
- ✅ 검증 후에만 저장

### 검증 과정

- ✅ 실제 API 호출로 유효성 확인
- ✅ 응답 데이터 형식 검증
- ✅ 에러 메시지 사용자 친화적으로 변환

---

**작성일**: 2026-02-15
