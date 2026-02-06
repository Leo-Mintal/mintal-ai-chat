import { ModelOption } from "./types";

export const AVAILABLE_MODELS: ModelOption[] = [
  { 
    id: 'gemini-3-flash-preview', 
    name: 'Gemini 3 Flash', 
    description: '响应极快，适合日常任务',
    group: 'Basic'
  },
  { 
    id: 'gemini-3-pro-preview', 
    name: 'Gemini 3 Pro', 
    description: '擅长推理、编程和复杂分析',
    group: 'Advanced'
  },
  {
    id: 'gemini-2.5-flash-preview-tts',
    name: 'Gemini 语音版',
    description: '支持自然流畅的语音交互能力',
    group: 'Creative'
  }
];