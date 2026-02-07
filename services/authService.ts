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

interface LoginResponseData {
  access_token: string;
  refresh_token: string;
  user: {
    id: number | string;
    username?: string;
    email?: string;
    avatar?: string;
    created_at?: string;
  };
}

interface RegisterResponseData {
  id: number | string;
  username?: string;
  email?: string;
  avatar?: string;
  created_at?: string;
}

interface MeResponseData {
  id: number | string;
  username?: string;
  email?: string;
  avatar?: string;
  created_at?: string;
}

const pickName = (value: string | undefined, fallback: string): string => {
  if (value && value.trim()) {
    return value.trim();
  }
  return fallback;
};

const buildFallbackAvatar = (name: string): string => {
  return `https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(name)}&backgroundColor=FFD54F,FFB74D,FF8A65`;
};

const normalizeUser = (
  raw: LoginResponseData['user'] | RegisterResponseData | MeResponseData,
  fallbackUsername: string,
): User => {
  const name = pickName(raw.username, fallbackUsername);

  return {
    id: String(raw.id),
    name,
    email: raw.email?.trim() || `${name}@mintal.ai`,
    avatar: raw.avatar?.trim() || buildFallbackAvatar(name),
  };
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

  if (!data.access_token || !data.refresh_token || !data.user) {
    throw new Error('登录响应缺少必要字段，请联系后端排查');
  }

  const session: AuthSession = {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    user: normalizeUser(data.user, usernameOrEmail),
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
  const data = await apiClient.get<MeResponseData>('/users/me');

  const fallbackName = restoreAuthSession()?.user.name || 'Mintal 用户';
  return normalizeUser(data, fallbackName);
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
