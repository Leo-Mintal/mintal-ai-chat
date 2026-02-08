import { HttpClientError, apiClient } from './httpClient';

interface QuotaQueryResponseData {
  user_id?: number;
  api_token_id?: number;
  quota_limit?: number;
  quota_used?: number;
  quota_remaining?: number;
  quota_reset_at?: string;
}

interface QuotaUpdateResponseData {
  user_id?: number;
  api_token_id?: number;
  daily_limit?: number;
}

export interface UserQuotaSummary {
  userId: number;
  apiTokenId?: number;
  quotaLimit: number;
  quotaUsed: number;
  quotaRemaining: number;
  quotaResetAt?: string;
  updatedAt: number;
}

export interface UpdateDailyQuotaPayload {
  userId: number;
  dailyLimit: number;
}

export interface UpdateDailyQuotaResult {
  userId: number;
  apiTokenId?: number;
  dailyLimit: number;
}

const QUOTA_PATH = '/llm/quota';

const isPositiveInteger = (value: number): boolean => {
  return Number.isInteger(value) && value > 0;
};

const normalizeUserId = (userId: number): number => {
  const parsed = Number(userId);
  if (!isPositiveInteger(parsed)) {
    throw new Error('user_id 必须是大于 0 的整数');
  }
  return parsed;
};

const normalizeDailyLimit = (dailyLimit: number): number => {
  const parsed = Number(dailyLimit);
  if (!isPositiveInteger(parsed)) {
    throw new Error('daily_limit 必须是大于 0 的整数');
  }
  return parsed;
};

const normalizeErrorSignal = (message: string): string => {
  return message.trim().toUpperCase();
};

const mapQuotaError = (error: unknown): Error => {
  if (error instanceof HttpClientError) {
    const signal = normalizeErrorSignal(error.message || '');

    if (signal.includes('USER_ID_REQUIRED')) {
      return new Error('缺少 user_id，请重新登录后重试');
    }

    if (signal.includes('DAILY_LIMIT_INVALID')) {
      return new Error('daily_limit 必须大于 0');
    }

    if (signal.includes('TOKEN_NOT_FOUND') || error.status === 404) {
      return new Error('该用户没有可用 token，请先在后台完成绑定');
    }

    if (signal.includes('TOKEN_DISABLED') || error.status === 409) {
      return new Error('该用户 token 已停用，请联系管理员处理');
    }

    if (error.status >= 500) {
      return new Error('服务暂时不可用，请稍后重试');
    }

    return new Error(error.message || `请求失败（HTTP ${error.status}）`);
  }

  if (error instanceof Error) {
    return error;
  }

  return new Error('请求失败，请稍后重试');
};

const toQuotaSummary = (
  data: QuotaQueryResponseData,
  fallbackUserId: number,
): UserQuotaSummary => {
  const userId = isPositiveInteger(Number(data.user_id)) ? Number(data.user_id) : fallbackUserId;

  return {
    userId,
    apiTokenId: isPositiveInteger(Number(data.api_token_id)) ? Number(data.api_token_id) : undefined,
    quotaLimit: typeof data.quota_limit === 'number' ? data.quota_limit : 0,
    quotaUsed: typeof data.quota_used === 'number' ? data.quota_used : 0,
    quotaRemaining: typeof data.quota_remaining === 'number' ? data.quota_remaining : 0,
    quotaResetAt: typeof data.quota_reset_at === 'string' ? data.quota_reset_at : undefined,
    updatedAt: Date.now(),
  };
};

export const fetchUserQuota = async (userId: number): Promise<UserQuotaSummary> => {
  const normalizedUserId = normalizeUserId(userId);

  try {
    const data = await apiClient.get<QuotaQueryResponseData>(
      `${QUOTA_PATH}?user_id=${encodeURIComponent(String(normalizedUserId))}`,
    );

    return toQuotaSummary(data, normalizedUserId);
  } catch (error) {
    throw mapQuotaError(error);
  }
};

export const updateUserDailyQuota = async (
  payload: UpdateDailyQuotaPayload,
): Promise<UpdateDailyQuotaResult> => {
  const userId = normalizeUserId(payload.userId);
  const dailyLimit = normalizeDailyLimit(payload.dailyLimit);

  try {
    const data = await apiClient.put<QuotaUpdateResponseData, { user_id: number; daily_limit: number }>(
      QUOTA_PATH,
      {
        user_id: userId,
        daily_limit: dailyLimit,
      },
    );

    return {
      userId: isPositiveInteger(Number(data.user_id)) ? Number(data.user_id) : userId,
      apiTokenId: isPositiveInteger(Number(data.api_token_id)) ? Number(data.api_token_id) : undefined,
      dailyLimit: typeof data.daily_limit === 'number' ? data.daily_limit : dailyLimit,
    };
  } catch (error) {
    throw mapQuotaError(error);
  }
};
