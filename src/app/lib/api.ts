const configuredBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim();

export const API_BASE_URL = (configuredBaseUrl || "http://localhost:8080").replace(/\/+$/, "");
// The Docker gateway proxies this same-origin prefix to the backend.
if (import.meta.env.PROD && API_BASE_URL !== "/backend" && !API_BASE_URL.startsWith("https://")) {
  throw new Error("Production requires an HTTPS VITE_API_BASE_URL");
}
export const AUTH_EXPIRED_EVENT = "auth:expired";

const DEFAULT_TIMEOUT_MS = 15_000;

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

interface ApiOptions extends Omit<RequestInit, "signal"> {
  authenticated?: boolean;
  timeoutMs?: number;
}

export async function apiFetch<T>(path: string, options: ApiOptions = {}): Promise<T> {
  const {
    authenticated = true,
    timeoutMs = DEFAULT_TIMEOUT_MS,
    headers: suppliedHeaders,
    ...requestOptions
  } = options;
  const headers = new Headers(suppliedHeaders);
  const token = authenticated ? sessionStorage.getItem("token") : null;

  if (authenticated) {
    if (!token) {
      expireSession(token);
      throw new ApiError("Phiên đăng nhập không hợp lệ", 401);
    }
    headers.set("Authorization", `Bearer ${token}`);
  }

  if (requestOptions.body && !(requestOptions.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  const signal = AbortSignal.timeout(timeoutMs);
  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      ...requestOptions,
      headers,
      signal,
    });

    if (authenticated && (response.status === 401 || response.status === 403)) {
      expireSession(token);
      throw new ApiError("Phiên đăng nhập đã hết hạn", response.status);
    }
    if (response.status === 204) return undefined as T;
    const contentType = response.headers.get("content-type") || "";
    let body: unknown = null;
    if (contentType.includes("application/json")) {
      body = await response.json();
    } else if (response.ok) {
      throw new ApiError("Máy chủ trả về phản hồi không phải JSON", 502);
    }
    if (!response.ok) {
      const message = body && typeof body === "object" && "message" in body
        && typeof body.message === "string" ? body.message : `Yêu cầu thất bại (${response.status})`;
      throw new ApiError(message, response.status);
    }
    if (body === null || typeof body !== "object") {
      throw new ApiError("Máy chủ trả về dữ liệu JSON không hợp lệ", 502);
    }
    return body as T;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    if (signal.aborted || (error instanceof DOMException && error.name === "TimeoutError")) {
      throw new ApiError("Yêu cầu hết thời gian chờ. Kết quả lưu chưa xác định; hãy kiểm tra dữ liệu trước khi gửi lại.", 408);
    }
    if (error instanceof SyntaxError) throw new ApiError("Máy chủ trả về JSON không hợp lệ", 502);
    throw new ApiError("Không thể đọc phản hồi máy chủ. Hãy kiểm tra dữ liệu trước khi gửi lại.", 0);
  }
}

export function expireSession(expectedToken?: string | null) {
  // A delayed response must not invalidate a newer login.
  if (expectedToken !== undefined && sessionStorage.getItem("token") !== expectedToken) return;
  sessionStorage.removeItem("token");
  sessionStorage.removeItem("user");
  window.dispatchEvent(new Event(AUTH_EXPIRED_EVENT));
}

export function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof ApiError ? error.message : fallback;
}
