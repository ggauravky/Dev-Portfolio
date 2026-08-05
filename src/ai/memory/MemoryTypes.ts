import { Role } from '../types';

export interface MemoryConfig {
  maxTurns?: number; // max conversation turns to keep
  maxTokens?: number; // max estimated tokens to keep
  ttlMs?: number; // session expiration time
}

export interface MemoryTurn {
  id: string;
  role: Role;
  content: string;
  timestamp: Date;
  tokens?: number;
}

export interface MemorySummary {
  sessionId: string;
  summaryText: string;
  turnCount: number;
  totalTokens: number;
  lastUpdated: Date;
}
