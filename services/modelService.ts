import { ModelOption } from '../types';
import { apiClient } from './httpClient';

interface ModelItem {
  name: string;
  provider: string;
  model_id: string;
  enabled: boolean;
}

interface ModelsResponseData {
  default_provider?: string;
  models?: ModelItem[];
}

const toGroup = (provider: string): ModelOption['group'] => {
  const normalized = provider.toLowerCase();

  if (normalized.includes('openai') || normalized.includes('anthropic')) {
    return 'Advanced';
  }

  if (normalized.includes('huggingface') || normalized.includes('local')) {
    return 'Basic';
  }

  return 'Creative';
};

const normalizeProviderName = (provider: string): string => {
  if (!provider) {
    return 'unknown';
  }

  if (provider.toLowerCase() === 'huggingface') {
    return 'HuggingFace';
  }

  return provider;
};

export const fetchRemoteModelOptions = async (): Promise<ModelOption[]> => {
  const data = await apiClient.get<ModelsResponseData>('/models', {
    skipAuth: true,
  });

  const models = Array.isArray(data.models) ? data.models : [];

  return models
    .filter(item => item.enabled)
    .map(item => ({
      id: item.name,
      name: item.name,
      description: `${normalizeProviderName(item.provider)} · ${item.model_id}`,
      group: toGroup(item.provider),
    }));
};
