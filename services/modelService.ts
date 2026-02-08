import { ModelOption } from '../types';
import { apiClient } from './httpClient';

interface ModelItem {
  name?: string;
  provider?: string;
  model_id?: string;
  enabled?: boolean;
  category?: string;
  category_label?: string;
  purpose?: string;
  is_default?: boolean;
}

interface ModelsCollection {
  default_model?: string;
  items?: ModelItem[];
}

interface ModelsResponseData {
  default_provider?: string;
  models?: ModelItem[] | ModelsCollection;
}

export interface RemoteModelOptionsResult {
  options: ModelOption[];
  defaultModelId?: string;
}

const toGroup = (item: ModelItem): ModelOption['group'] => {
  const category = (item.category || item.category_label || '').toLowerCase();

  if (category.includes('base') || category.includes('basic')) {
    return 'Basic';
  }

  if (category.includes('advanced') || category.includes('pro')) {
    return 'Advanced';
  }

  if (category.includes('creative') || category.includes('vision') || category.includes('multi')) {
    return 'Creative';
  }

  const provider = (item.provider || '').toLowerCase();

  if (provider.includes('openai') || provider.includes('anthropic')) {
    return 'Advanced';
  }

  if (provider.includes('ollama') || provider.includes('huggingface') || provider.includes('local')) {
    return 'Basic';
  }

  return 'Creative';
};

const normalizeProviderName = (provider?: string): string => {
  if (!provider) {
    return 'unknown';
  }

  if (provider.toLowerCase() === 'huggingface') {
    return 'HuggingFace';
  }

  return provider;
};

const normalizeModelItems = (models: ModelsResponseData['models']): ModelItem[] => {
  if (Array.isArray(models)) {
    return models;
  }

  if (models && Array.isArray(models.items)) {
    return models.items;
  }

  return [];
};

const resolveDefaultModelId = (data: ModelsResponseData, enabledModelIds: string[]): string | undefined => {
  if (data.models && !Array.isArray(data.models) && typeof data.models.default_model === 'string' && data.models.default_model.trim()) {
    const defaultId = data.models.default_model.trim();
    if (enabledModelIds.includes(defaultId)) {
      return defaultId;
    }
  }

  return undefined;
};

const resolveItemModelId = (item: ModelItem): string => {
  if (typeof item.model_id === 'string' && item.model_id.trim()) {
    return item.model_id.trim();
  }

  if (typeof item.name === 'string' && item.name.trim()) {
    return item.name.trim();
  }

  return '';
};

export const fetchRemoteModelOptions = async (): Promise<RemoteModelOptionsResult> => {
  const data = await apiClient.get<ModelsResponseData>('/models', {
    skipAuth: true,
  });

  const models = normalizeModelItems(data.models);

  const options = models
    .filter(item => item.enabled !== false)
    .map(item => {
      const modelId = resolveItemModelId(item);
      const displayName = typeof item.name === 'string' && item.name.trim()
        ? item.name.trim()
        : modelId;
      const purpose = typeof item.purpose === 'string' ? item.purpose.trim() : '';
      const fallbackDescription = modelId && modelId !== displayName ? modelId : '可用模型';

      return {
        id: modelId,
        name: displayName,
        description: `${normalizeProviderName(item.provider)} · ${purpose || fallbackDescription}`,
        group: toGroup(item),
      } as ModelOption;
    })
    .filter(option => option.id.length > 0);

  const flaggedDefaultModel = models.find(item => item.is_default === true && item.enabled !== false);
  const defaultModelIdFromFlag = flaggedDefaultModel
    ? resolveItemModelId(flaggedDefaultModel)
    : undefined;

  const defaultModelId = resolveDefaultModelId(data, options.map(item => item.id))
    || (defaultModelIdFromFlag && options.some(item => item.id === defaultModelIdFromFlag) ? defaultModelIdFromFlag : undefined)
    || options[0]?.id;

  return {
    options,
    defaultModelId,
  };
};
