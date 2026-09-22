const configuredBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim();

export const API_BASE_URL = (configuredBaseUrl || "http://localhost:8080").replace(/\/+$/, "");
if (import.meta.env.PROD && !API_BASE_URL.startsWith("https://")) {
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

  if (authenticated) {
    const token = sessionStorage.getItem("token");
    if (!token) {
      expireSession();
      throw new ApiError("Phiên đăng nhập không hợp lệ", 401);
    }
    headers.set("Authorization", `Bearer ${token}`);
  }

  if (requestOptions.body && !(requestOptions.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...requestOptions,
      headers,
      signal: AbortSignal.timeout(timeoutMs),
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === "TimeoutError") {
      throw new ApiError("Yêu cầu hết thời gian chờ", 408);
    }
    throw new ApiError("Không thể kết nối đến máy chủ", 0);
  }

  const contentType = response.headers.get("content-type") || "";
  const body = contentType.includes("application/json")
    ? await response.json().catch(() => null)
    : null;

  if (response.status === 401 || response.status === 403) {
    if (authenticated) {
      expireSession();
      throw new ApiError("Phiên đăng nhập đã hết hạn", response.status);
    }
    throw new ApiError(body?.message || "Thông tin đăng nhập không hợp lệ", response.status);
  }

  if (!response.ok) {
    throw new ApiError(body?.message || `Yêu cầu thất bại (${response.status})`, response.status);
  }

  return body as T;
}

export function expireSession() {
  sessionStorage.removeItem("token");
  sessionStorage.removeItem("user");
  window.dispatchEvent(new Event(AUTH_EXPIRED_EVENT));
}

export function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof ApiError ? error.message : fallback;
}
