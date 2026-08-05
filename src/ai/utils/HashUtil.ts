/**
 * Hash generation utilities for cache keys, chunk IDs, and document fingerprints.
 * High performance, deterministic, zero external dependencies.
 */
export class HashUtil {
  /**
   * Fast 32-bit FNV-1a hash algorithm returning hexadecimal string representation.
   */
  public static fnv1a(text: string): string {
    let hash = 0x811c9dc5;
    for (let i = 0; i < text.length; i++) {
      hash ^= text.charCodeAt(i);
      hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
    }
    return (hash >>> 0).toString(16).padStart(8, '0');
  }

  /**
   * Generates a deterministic hash digest for string content.
   */
  public static hashString(content: string): string {
    return `h_${HashUtil.fnv1a(content)}`;
  }

  /**
   * Generates a deterministic hash for any JavaScript object or primitive.
   */
  public static hashObject(obj: unknown): string {
    const jsonString = JSON.stringify(obj, Object.keys(obj as object || {}).sort());
    return HashUtil.hashString(jsonString || '');
  }

  /**
   * Async SHA-256 digest using Web Crypto API if available, falling back to FNV-1a.
   */
  public static async sha256(content: string): Promise<string> {
    if (typeof globalThis !== 'undefined' && globalThis.crypto?.subtle) {
      try {
        const encoder = new TextEncoder();
        const data = encoder.encode(content);
        const hashBuffer = await globalThis.crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
      } catch {
        // Fallback on error
      }
    }
    return `${HashUtil.fnv1a(content)}_${HashUtil.fnv1a(content.split('').reverse().join(''))}`;
  }
}
