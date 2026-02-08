import { AuthCredentials, User } from '../types';
import {
  AuthSession,
  clearAuthSession,
  restoreAuthSession,
  saveAuthSession,
} from './authStorage';
import { apiClient, HttpClientError } from './httpClient';

export interface LoginCredentials {
  usernameOrEmail: string;
  password: string;
}

export interface RegisterCredentials {
  username: string;
  email: string;
  password: string;
}

export interface UpdateMePayload {
  username?: string;
  email?: string;
}

interface LoginResponseData {
  access_token: string;
  refresh_token: string;
  user?: unknown;
}

interface RegisterResponseData {
  id?: number | string;
  user_id?: number | string;
  username?: string;
  email?: string;
  avatar?: string;
  created_at?: string;
  user?: unknown;
}

interface MeResponseData {
  id?: number | string;
  user_id?: number | string;
  username?: string;
  email?: string;
  avatar?: string;
  created_at?: string;
  user?: unknown;
}

const USER_ME_PATH_CANDIDATES = ['/users/me', '/api/v1/users/me'];

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

const pickName = (value: string | undefined, fallback: string): string => {
  if (value && value.trim()) {
    return value.trim();
  }
  return fallback;
};

const buildFallbackAvatar = (name: string): string => {
  return `https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(name)}&backgroundColor=FFD54F,FFB74D,FF8A65`;
};

const pickUserRecord = (raw: unknown): Record<string, unknown> => {
  if (!isRecord(raw)) {
    throw new Error('用户信息格式不正确，请联系后端排查');
  }

  if (isRecord(raw.user)) {
    return raw.user;
  }

  return raw;
};

const normalizeUser = (raw: unknown, fallbackUsername: string): User => {
  const source = pickUserRecord(raw);
  const userId = pickText(source, ['user_id', 'id', 'userId', '_id']);

  if (!userId) {
    throw new Error('登录响应缺少 user_id，请联系后端排查');
  }

  const name = pickName(
    pickText(source, ['username', 'name', 'nickname', 'nickName']),
    fallbackUsername,
  );

  return {
    id: userId,
    name,
    email: pickText(source, ['email']) || `${name}@mintal.ai`,
    avatar: pickText(source, ['avatar', 'avatarUrl', 'profilePhoto']) || buildFallbackAvatar(name),
  };
};

const withUserMeFallback = async <T>(requester: (path: string) => Promise<T>): Promise<T> => {
  let fallbackError: HttpClientError | null = null;

  for (const path of USER_ME_PATH_CANDIDATES) {
    try {
      return await requester(path);
    } catch (error) {
      if (error instanceof HttpClientError && error.status === 404) {
        fallbackError = error;
        continue;
      }
      throw error;
    }
  }

  if (fallbackError) {
    throw fallbackError;
  }

  throw new Error('获取用户信息失败');
};

export const loginWithPassword = async ({
  usernameOrEmail,
  password,
}: LoginCredentials): Promise<AuthSession> => {
  const data = await apiClient.post<LoginResponseData>(
    '/auth/login',
    {
      username_or_email: usernameOrEmail,
      password,
    },
    {
      skipAuth: true,
    },
  );

  if (!data.access_token || !data.refresh_token) {
    throw new Error('登录响应缺少必要字段，请联系后端排查');
  }

  const session: AuthSession = {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    user: normalizeUser(data.user || data, usernameOrEmail),
  };

  saveAuthSession(session);
  return session;
};

export const registerUser = async ({
  username,
  email,
  password,
}: RegisterCredentials): Promise<User> => {
  const data = await apiClient.post<RegisterResponseData>(
    '/auth/register',
    {
      username,
      email,
      password,
    },
    {
      skipAuth: true,
    },
  );

  return normalizeUser(data, username);
};

export const registerAndLogin = async (credentials: RegisterCredentials): Promise<AuthSession> => {
  await registerUser(credentials);

  try {
    return await loginWithPassword({
      usernameOrEmail: credentials.username,
      password: credentials.password,
    });
  } catch (error) {
    const fallbackMessage = '注册成功，但自动登录失败，请使用新账号登录';
    const message = error instanceof Error ? error.message : fallbackMessage;
    throw new Error(message || fallbackMessage);
  }
};

export const authenticate = async (credentials: AuthCredentials): Promise<AuthSession> => {
  if (credentials.mode === 'register') {
    const username = credentials.username?.trim();
    const email = credentials.email?.trim();

    if (!username || !email) {
      throw new Error('注册需要填写用户名和邮箱');
    }

    return registerAndLogin({
      username,
      email,
      password: credentials.password,
    });
  }

  return loginWithPassword({
    usernameOrEmail: credentials.usernameOrEmail,
    password: credentials.password,
  });
};

export const fetchCurrentUser = async (): Promise<User> => {
  const data = await withUserMeFallback(path => apiClient.get<MeResponseData>(path));
  const fallbackName = restoreAuthSession()?.user.name || 'Mintal 用户';

  return normalizeUser(data, fallbackName);
};

export const updateCurrentUserProfile = async (payload: UpdateMePayload): Promise<User> => {
  const requestBody: UpdateMePayload = {};

  if (payload.username?.trim()) {
    requestBody.username = payload.username.trim();
  }

  if (payload.email?.trim()) {
    requestBody.email = payload.email.trim();
  }

  if (!requestBody.username && !requestBody.email) {
    throw new Error('请至少填写一个需要更新的字段');
  }

  const data = await withUserMeFallback(path => apiClient.put<MeResponseData, UpdateMePayload>(path, requestBody));
  const fallbackName = requestBody.username || restoreAuthSession()?.user.name || 'Mintal 用户';
  const nextUser = normalizeUser(data, fallbackName);

  const currentSession = restoreAuthSession();
  if (currentSession) {
    saveAuthSession({
      ...currentSession,
      user: nextUser,
    });
  }

  return nextUser;
};

export const restoreSessionAndFetchUser = async (): Promise<AuthSession | null> => {
  const session = restoreAuthSession();
  if (!session) {
    return null;
  }

  try {
    const user = await fetchCurrentUser();
    const refreshedSession: AuthSession = {
      ...session,
      user,
    };

    saveAuthSession(refreshedSession);
    return refreshedSession;
  } catch {
    clearAuthSession();
    return null;
  }
};

export const logoutWithServer = async (): Promise<void> => {
  try {
    await apiClient.post<Record<string, never>>('/auth/logout', undefined, {
      skipRefreshRetry: true,
    });
  } catch (error) {
    if (error instanceof HttpClientError) {
      const ignorableStatuses = [401, 404, 405];
      if (ignorableStatuses.includes(error.status)) {
        clearAuthSession();
        return;
      }
    }

    clearAuthSession();
    throw error;
  }

  clearAuthSession();
};
