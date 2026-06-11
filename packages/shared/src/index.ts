export const PROJECT_NAME = 'AI Company Assistant';

export type ThemeMode = 'light' | 'dark';

export type UserRole = 'ADMIN' | 'MEMBER' | 'admin' | 'member';

export interface Company {
  id: string;
  name: string;
  status?: string;
  plan?: string;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  companyId: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  accessToken: string;
  user: User;
  company?: Company;
}

export type DocumentStatus = 'uploaded' | 'parsing' | 'completed' | 'failed';

export interface DocumentRecord {
  id: string;
  companyId: string;
  uploadedBy: string;
  originalName: string;
  fileKey: string;
  fileSize: number;
  mimeType: string;
  status: DocumentStatus;
  errorMessage: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DocumentsResponse {
  documents: DocumentRecord[];
}

export interface DocumentResponse {
  document: DocumentRecord;
}

export interface DeleteDocumentResponse {
  deleted: true;
  id: string;
}

export interface ChatSource {
  documentId: string;
  documentName: string;
  chunkId: string;
  contentSnippet: string;
  similarityScore: number;
}

export interface ChatUsage {
  model: string;
  promptTokens: number;
  completionTokens: number;
}

export interface AskChatResponse {
  answer: string;
  sources: ChatSource[];
  usage: ChatUsage;
}

export type ChatLogSource = 'web' | 'wecom' | 'WEB' | 'WECOM';

export interface ChatLog {
  id: string;
  companyId: string;
  userId: string | null;
  source: ChatLogSource;
  question: string;
  answer: string;
  sourceChunks: ChatSource[];
  model: string | null;
  promptTokens: number | null;
  completionTokens: number | null;
  createdAt: string;
}

export interface ChatLogsResponse {
  logs: ChatLog[];
}

export type WecomBotStatus = 'active' | 'disabled';

export interface WecomBot {
  id: string;
  companyId: string;
  name: string;
  webhookUrl: string;
  secret: string | null;
  status: WecomBotStatus;
  createdAt: string;
  updatedAt: string;
}

export interface WecomBotsResponse {
  bots: WecomBot[];
}

export interface WecomBotResponse {
  bot: WecomBot;
}

export interface DeleteWecomBotResponse {
  deleted: true;
  id: string;
}

export type WecomMessageType = 'text' | 'markdown';

export interface TestSendWecomBotInput {
  id: string;
  msgtype: WecomMessageType;
  content: string;
}

export interface TestSendWecomBotResponse {
  sent: true;
  id: string;
}
