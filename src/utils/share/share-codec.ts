// URL 해시 공유용 바이너리 코덱
// JSON → (gzip) → base64url. gzip은 브라우저 내장 CompressionStream을 사용하며,
// 미지원 환경에서는 무압축 base64url로 자동 폴백한다(별도 라이브러리 의존성 없음).

// 페이로드 첫 글자로 압축 여부를 표시해 decode가 방식을 판별할 수 있게 한다.
const GZIP_PREFIX = "1";
const RAW_PREFIX = "0";

const hasCompressionStream =
  typeof CompressionStream !== "undefined" && typeof DecompressionStream !== "undefined";

// TextEncoder/DecompressionStream 결과는 lib 버전에 따라 ArrayBufferLike로 추론되므로
// 스트림 write가 요구하는 ArrayBuffer 기반 뷰로 명시 복사해 사용한다.
function toBytes(input: string): Uint8Array<ArrayBuffer> {
  const encoded = new TextEncoder().encode(input);
  const bytes = new Uint8Array(encoded.length);
  bytes.set(encoded);
  return bytes;
}

function toBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(input: string): Uint8Array<ArrayBuffer> {
  const base64 = input.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

async function pump(
  transform: CompressionStream | DecompressionStream,
  input: Uint8Array<ArrayBuffer>
): Promise<Uint8Array> {
  const writer = transform.writable.getWriter();
  // 손상된 입력은 readable 쪽에서 reject되어 여기서 잡힌다. writer 프라미스는
  // 별도로 reject될 수 있어 unhandledrejection을 막도록 catch를 붙인다.
  writer.write(input).catch(() => {});
  writer.close().catch(() => {});
  const buffer = await new Response(transform.readable).arrayBuffer();
  return new Uint8Array(buffer);
}

function gzip(input: Uint8Array<ArrayBuffer>): Promise<Uint8Array> {
  return pump(new CompressionStream("gzip"), input);
}

function gunzip(input: Uint8Array<ArrayBuffer>): Promise<Uint8Array> {
  return pump(new DecompressionStream("gzip"), input);
}

/** 임의의 직렬화 가능한 데이터를 URL-safe 문자열로 인코딩한다. */
export async function encodePayload(data: unknown): Promise<string> {
  const bytes = toBytes(JSON.stringify(data));
  if (hasCompressionStream) {
    try {
      return GZIP_PREFIX + toBase64Url(await gzip(bytes));
    } catch {
      // gzip 실패 시 무압축 폴백
    }
  }
  return RAW_PREFIX + toBase64Url(bytes);
}

/** encodePayload로 만든 문자열을 원본 데이터로 복원한다. 실패 시 null. */
export async function decodePayload<T>(encoded: string): Promise<T | null> {
  try {
    const prefix = encoded[0];
    const bytes = fromBase64Url(encoded.slice(1));
    let jsonBytes: Uint8Array;
    if (prefix === GZIP_PREFIX) {
      jsonBytes = await gunzip(bytes);
    } else if (prefix === RAW_PREFIX) {
      jsonBytes = bytes;
    } else {
      return null;
    }
    return JSON.parse(new TextDecoder().decode(jsonBytes)) as T;
  } catch {
    return null;
  }
}
