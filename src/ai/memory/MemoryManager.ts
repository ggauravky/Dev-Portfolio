import { SessionMemory } from './SessionMemory';
import { MemoryConfig } from './MemoryTypes';
import { Role } from '../types';

/**
 * In-memory manager storing and coordinating multi-session conversation states.
 */
export class MemoryManager {
  private static instance: MemoryManager;
  private sessions: Map<string, SessionMemory> = new Map();
  private defaultConfig: MemoryConfig;

  private constructor(defaultConfig: MemoryConfig = {}) {
    this.defaultConfig = defaultConfig;
  }

  /**
   * Get singleton instance of MemoryManager.
   */
  public static getInstance(defaultConfig?: MemoryConfig): MemoryManager {
    if (!MemoryManager.instance) {
      MemoryManager.instance = new MemoryManager(defaultConfig);
    }
    return MemoryManager.instance;
  }

  /**
   * Get existing session memory or create a new session if not present.
   */
  public getSession(sessionId: string, config?: MemoryConfig): SessionMemory {
    let session = this.sessions.get(sessionId);

    if (!session || session.isExpired()) {
      session = new SessionMemory(sessionId, { ...this.defaultConfig, ...config });
      this.sessions.set(sessionId, session);
    }

    return session;
  }

  /**
   * Add a turn directly to a session's memory.
   */
  public addTurn(sessionId: string, role: Role, content: string): void {
    const session = this.getSession(sessionId);
    session.addTurn(role, content);
  }

  /**
   * Get formatted turns for a session.
   */
  public getSessionTurns(sessionId: string): Array<{ role: Role; content: string }> {
    return this.getSession(sessionId).getFormattedTurns();
  }

  /**
   * Remove expired sessions from memory.
   */
  public cleanupExpiredSessions(): number {
    let count = 0;
    for (const [id, session] of this.sessions.entries()) {
      if (session.isExpired()) {
        this.sessions.delete(id);
        count++;
      }
    }
    return count;
  }

  /**
   * Clear a specific session.
   */
  public removeSession(sessionId: string): boolean {
    return this.sessions.delete(sessionId);
  }

  /**
   * Clear all active session memories.
   */
  public clearAll(): void {
    this.sessions.clear();
  }

  /**
   * Get active session count.
   */
  public get sessionCount(): number {
    return this.sessions.size;
  }
}

export const getMemoryManager = (): MemoryManager => MemoryManager.getInstance();
