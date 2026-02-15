// Conventional Commits 규칙을 따르는 commitlint 설정
// https://www.conventionalcommits.org/

export default {
  extends: ["@commitlint/config-conventional"],
  rules: {
    // Type은 소문자만 허용
    "type-case": [2, "always", "lower-case"],
    // Type은 비어있으면 안됨
    "type-empty": [2, "never"],
    // Type은 다음 중 하나여야 함
    "type-enum": [
      2,
      "always",
      [
        "feat", // 새로운 기능
        "fix", // 버그 수정
        "docs", // 문서 변경
        "style", // 코드 포맷팅, 세미콜론 누락 등 (기능 변경 없음)
        "refactor", // 코드 리팩토링 (기능 변경 없음)
        "perf", // 성능 개선
        "test", // 테스트 추가/수정
        "chore", // 빌드 프로세스, 라이브러리 업데이트 등
        "ci", // CI 설정 파일 수정
        "build", // 빌드 시스템, 외부 의존성 변경
        "revert", // 이전 커밋 되돌리기
      ],
    ],
    // Subject는 비어있으면 안됨
    "subject-empty": [2, "never"],
    // Subject는 마침표로 끝나선 안됨
    "subject-full-stop": [2, "never", "."],
    // Subject는 대소문자 제한 없음 (한글 지원)
    "subject-case": [0],
    // Header 최대 길이
    "header-max-length": [2, "always", 100],
  },
};
