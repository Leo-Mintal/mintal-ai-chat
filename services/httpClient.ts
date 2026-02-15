<<<<<<< HEAD
=======

>>>>>>> 14dbbca (feat:新增目录逻辑，修复若干bug)
import {
  clearAuthSession,
  getAccessToken,
  getRefreshToken,
  updateAuthTokens,
} from './authStorage';

<<<<<<< HEAD
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:18080/api/v1').replace(/\/$/, '');
=======
const API_BASE_URL = (import.meta.env?.VITE_API_BASE_URL || 'http://127.0.0.1:18080/api/v1').replace(/\/$/, '');
>>>>>>> 14dbbca (feat:新增目录逻辑，修复若干bug)

interface ApiEnvelope<T> {
  code: number;
  message: string;
  data: T;
  error?: string;
}

interface RequestOptions {
  skipAuth?: boolean;
  skipRefreshRetry?: boolean;
  headers?: HeadersInit;
}

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === 'object' && value !== null;
};

const pickText = (source: Record<string, unknown>, keys: string[]): string | undefined => {
  for (const key of keys) {
    const value = source[key];
    if (typeof value === 'string' && value.trim()) {
      return value.trim();
    }
    if (typeof value === 'number') {
      return String(value);
    }
  }
  return undefined;
};

const buildUrl = (path: string): string => {
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }

  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE_URL}${normalizedPath}`;
};

const parsePayload = async (response: Response): Promise<unknown> => {
  const rawText = await response.text();
  if (!rawText) {
    return null;
  }

  try {
    return JSON.parse(rawText);
  } catch {
    return { message: rawText };
  }
};

export class HttpClientError extends Error {
  status: number;
  code?: number;
  details?: unknown;

  constructor(message: string, status: number, code?: number, details?: unknown) {
    super(message);
    this.name = 'HttpClientError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

const resolveApiMessage = (payload: unknown): string | undefined => {
  if (!isRecord(payload)) {
    return undefined;
  }

  const direct = pickText(payload, ['error', 'message', 'msg', 'detail', 'description']);
  if (direct) {
    return direct;
  }

  if (isRecord(payload.data)) {
    return pickText(payload.data, ['error', 'message', 'msg', 'detail', 'description']);
  }

  return undefined;
};

const toHttpClientError = (payload: unknown, status: number): HttpClientError => {
  const message = resolveApiMessage(payload) || `请求失败（HTTP ${status}）`;
  let businessCode: number | undefined;

  if (isRecord(payload) && typeof payload.code === 'number') {
    businessCode = payload.code;
  }

  return new HttpClientError(message, status, businessCode, payload);
};

const unwrapSuccessData = <T>(payload: unknown, status: number): T => {
  if (isRecord(payload) && typeof payload.code === 'number') {
<<<<<<< HEAD
    const envelope = payload as ApiEnvelope<T>;
=======
    const envelope = payload as unknown as ApiEnvelope<T>;
>>>>>>> 14dbbca (feat:新增目录逻辑，修复若干bug)
    const isBusinessSuccess = envelope.code >= 200 && envelope.code < 300;

    if (!isBusinessSuccess) {
      throw new HttpClientError(
        envelope.error || envelope.message || '请求失败',
        status,
        envelope.code,
        payload,
      );
    }

    return envelope.data as T;
  }

  if (payload === null || payload === undefined) {
    return {} as T;
  }

  return payload as T;
};

const requestInterceptor = (init: RequestInit, options: RequestOptions): RequestInit => {
  const headers = new Headers(init.headers || {});

  if (options.headers) {
    const extraHeaders = new Headers(options.headers);
    extraHeaders.forEach((value, key) => headers.set(key, value));
  }

  const hasBody = init.body !== undefined && init.body !== null;
  const isFormData = typeof FormData !== 'undefined' && init.body instanceof FormData;

  if (hasBody && !isFormData && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  if (!options.skipAuth && !headers.has('Authorization')) {
    const accessToken = getAccessToken();
    if (accessToken) {
      headers.set('Authorization', `Bearer ${accessToken}`);
    }
  }

  return {
    ...init,
    headers,
  };
};

let refreshPromise: Promise<string> | null = null;

const refreshAccessToken = async (): Promise<string> => {
  const refreshToken = getRefreshToken();

  if (!refreshToken) {
    clearAuthSession();
    throw new HttpClientError('登录态已过期，请重新登录', 401, 401);
  }

  const refreshInit = requestInterceptor(
    {
      method: 'POST',
      body: JSON.stringify({ refresh_token: refreshToken }),
    },
    {
      skipAuth: true,
      skipRefreshRetry: true,
    },
  );

  const response = await fetch(buildUrl('/auth/refresh'), refreshInit);
  const payload = await parsePayload(response);

  if (!response.ok) {
    clearAuthSession();
    throw toHttpClientError(payload, response.status);
  }

  const data = unwrapSuccessData<Record<string, unknown>>(payload, response.status);
  const nextAccessToken = pickText(data, ['access_token']);
  const nextRefreshToken = pickText(data, ['refresh_token']) || refreshToken;

  if (!nextAccessToken) {
    clearAuthSession();
    throw new HttpClientError('刷新令牌响应缺少 access_token，请重新登录', 401, 401, payload);
  }

  updateAuthTokens(nextAccessToken, nextRefreshToken);
  return nextAccessToken;
};

const ensureFreshToken = async (): Promise<string> => {
  if (!refreshPromise) {
    refreshPromise = refreshAccessToken().finally(() => {
      refreshPromise = null;
    });
  }

  return refreshPromise;
};

const responseInterceptor = async <T>(
  path: string,
  init: RequestInit,
  options: RequestOptions,
  response: Response,
  payload: unknown,
): Promise<T> => {
  if (response.status === 401 && !options.skipAuth && !options.skipRefreshRetry) {
    await ensureFreshToken();
    return request<T>(path, init, {
      ...options,
      skipRefreshRetry: true,
    });
  }

  if (!response.ok) {
    if (response.status === 401) {
      clearAuthSession();
    }
    throw toHttpClientError(payload, response.status);
  }

  return unwrapSuccessData<T>(payload, response.status);
};

const request = async <T>(path: string, init: RequestInit, options: RequestOptions = {}): Promise<T> => {
  const interceptedInit = requestInterceptor(init, options);
  const response = await fetch(buildUrl(path), interceptedInit);
  const payload = await parsePayload(response);

  return responseInterceptor<T>(path, init, options, response, payload);
};

export const apiClient = {
  get: <T>(path: string, options: RequestOptions = {}) => {
    return request<T>(path, { method: 'GET' }, options);
  },

  post: <T, B = unknown>(path: string, body?: B, options: RequestOptions = {}) => {
    const init: RequestInit = { method: 'POST' };

    if (body !== undefined) {
      init.body = body instanceof FormData ? body : JSON.stringify(body);
    }

    return request<T>(path, init, options);
  },

  put: <T, B = unknown>(path: string, body?: B, options: RequestOptions = {}) => {
    const init: RequestInit = { method: 'PUT' };

    if (body !== undefined) {
      init.body = body instanceof FormData ? body : JSON.stringify(body);
    }

    return request<T>(path, init, options);
  },

  patch: <T, B = unknown>(path: string, body?: B, options: RequestOptions = {}) => {
    const init: RequestInit = { method: 'PATCH' };

    if (body !== undefined) {
      init.body = body instanceof FormData ? body : JSON.stringify(body);
    }

    return request<T>(path, init, options);
  },

  delete: <T>(path: string, options: RequestOptions = {}) => {
    return request<T>(path, { method: 'DELETE' }, options);
  },
};
