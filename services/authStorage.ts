import { User } from '../types';

const AUTH_STORAGE_KEY = 'mintal_auth_session';

export interface AuthSession {
  accessToken: string;
  refreshToken: string;
  user: User;
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

const normalizeUser = (raw: unknown): User | null => {
  if (!isRecord(raw)) {
    return null;
  }

  const id = pickText(raw, ['id', 'user_id', 'userId', '_id']) || `${Date.now()}`;
  const name = pickText(raw, ['username', 'name', 'nickname', 'nickName']) || 'Mintal 用户';
  const email = pickText(raw, ['email']) || `${name}@mintal.ai`;
  const avatar = pickText(raw, ['avatar', 'avatarUrl', 'profilePhoto']) || '';

  return {
    id,
    name,
    email,
    avatar,
  };
};

export const saveAuthSession = (session: AuthSession): void => {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
};

export const clearAuthSession = (): void => {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.removeItem(AUTH_STORAGE_KEY);
};

export const restoreAuthSession = (): AuthSession | null => {
  if (typeof window === 'undefined') {
    return null;
  }

  const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw);
    if (!isRecord(parsed)) {
      clearAuthSession();
      return null;
    }

    const user = normalizeUser(parsed.user);
    const accessToken = pickText(parsed, ['accessToken']);
    const refreshToken = pickText(parsed, ['refreshToken']);

    if (!user || !accessToken || !refreshToken) {
      clearAuthSession();
      return null;
    }

    return {
      user,
      accessToken,
      refreshToken,
    };
  } catch {
    clearAuthSession();
    return null;
  }
};

export const getAccessToken = (): string | null => {
  return restoreAuthSession()?.accessToken || null;
};

export const getRefreshToken = (): string | null => {
  return restoreAuthSession()?.refreshToken || null;
};

export const updateAuthTokens = (
  accessToken: string,
  refreshToken: string,
): AuthSession | null => {
  const current = restoreAuthSession();
  if (!current) {
    return null;
  }

  const next = {
    ...current,
    accessToken,
    refreshToken,
  };

  saveAuthSession(next);
  return next;
};

export const updateAuthUser = (user: User): AuthSession | null => {
  const current = restoreAuthSession();
  if (!current) {
    return null;
  }

  const next = {
    ...current,
    user,
  };

  saveAuthSession(next);
  return next;
};
