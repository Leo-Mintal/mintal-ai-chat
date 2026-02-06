
export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface Attachment {
  id: string;
  name: string;
  type: string;
  size: number;
  data: string; // Base64
}

export interface Message {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: number;
  attachments?: Attachment[];
  isError?: boolean;
}

export interface Conversation {
  id: string;
  title: string;
  updatedAt: number;
  preview: string;
}

export interface ModelOption {
  id: string;
  name: string;
  description: string;
  group: 'Basic' | 'Advanced' | 'Creative';
}

export enum AppState {
  AUTH = 'AUTH',
  CHAT = 'CHAT',
}

export type View = 'CHAT' | 'SETTINGS' | 'PROFILE';
export type Theme = 'light' | 'dark' | 'system';
