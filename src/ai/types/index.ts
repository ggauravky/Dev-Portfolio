/**
 * Core type definitions for the AI Core Architecture.
 * Provides clean contracts for messages, sessions, sources, documents, and responses.
 */

export type Role = 'user' | 'assistant' | 'system';

/**
 * Single chat message representation in the system.
 */
export interface ChatMessage {
  id: string;
  role: Role;
  content: string;
  timestamp: Date;
  sources?: ChatSource[];
  followUpSuggestions?: string[];
  latencyMs?: number | null;
  model?: string;
  provider?: string;
  degraded?: boolean;
  tokens?: number;
  metadata?: Record<string, unknown>;
}

/**
 * Conversation session encapsulating full chat context.
 */
export interface ChatSession {
  sessionId: string;
  messages: ChatMessage[];
  createdAt: Date;
  lastActivityAt: Date;
  metadata?: Record<string, unknown>;
}

/**
 * Attribution source snippet retrieved from knowledge base.
 */
export interface ChatSource {
  section: string;
  title: string;
  chunkId?: string;
  score?: number;
  snippet?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Structured document loaded into knowledge base.
 */
export interface KnowledgeDocument {
  id: string;
  section: string;
  title: string;
  content: string;
  tags?: string[];
  metadata?: Record<string, unknown>;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Text chunk derived from a KnowledgeDocument.
 */
export interface KnowledgeChunk {
  chunkId: string;
  documentId: string;
  section: string;
  title: string;
  content: string;
  chunkIndex: number;
  tokenEstimate: number;
  metadata?: Record<string, unknown>;
}

/**
 * Match result returned by the Retrieval search pipeline.
 */
export interface SearchResult {
  chunkId: string;
  documentId: string;
  section: string;
  title: string;
  content: string;
  score: number;
  metadata?: Record<string, unknown>;
}

/**
 * In-memory conversation state representation.
 */
export interface ConversationMemory {
  sessionId: string;
  turns: Array<{ role: Role; content: string }>;
  summary?: string;
  turnCount: number;
  totalTokens?: number;
}

/**
 * Standardized AI Assistant Response object returned by providers.
 */
export interface AssistantResponse {
  success: boolean;
  reply: string;
  sources: ChatSource[];
  followUpSuggestions: string[];
  provider: string;
  model: string;
  degraded: boolean;
  latencyMs?: number | null;
  usage?: {
    promptTokens?: number;
    completionTokens?: number;
    totalTokens?: number;
  };
}

/**
 * Retrieval pipeline filter parameters.
 */
export interface RetrievalOptions {
  limit?: number;
  minScore?: number;
  sections?: string[];
  tags?: string[];
  metadataFilter?: Record<string, unknown>;
}

/**
 * Prompt assembly options.
 */
export interface PromptOptions {
  systemInstruction?: string;
  contextBlocks?: string[];
  memoryTurns?: Array<{ role: Role; content: string }>;
  userQuery: string;
}
