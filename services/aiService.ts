import { Message, Attachment } from '../types';

/**
 * 简化版 AI 回复逻辑：无论输入内容是什么，统一返回指定模板。
 */
export const generateChatResponse = async (
  _modelId: string,
  _history: Message[],
  currentMessage: string,
  _attachments: Attachment[]
): Promise<string> => {
  return '你说的“' + currentMessage + '”是什么意思呢？';
};
