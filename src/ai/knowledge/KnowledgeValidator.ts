import { KnowledgeDocument } from '../types';

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

/**
 * Validator enforcing structural schema constraints on KnowledgeDocument objects.
 */
export class KnowledgeValidator {
  /**
   * Validate a single candidate KnowledgeDocument object.
   */
  public static validateDocument(doc: unknown): ValidationResult {
    const errors: string[] = [];

    if (!doc || typeof doc !== 'object') {
      return { valid: false, errors: ['Document must be a non-null object'] };
    }

    const candidate = doc as Partial<KnowledgeDocument>;

    if (!candidate.id || typeof candidate.id !== 'string' || candidate.id.trim().length === 0) {
      errors.push('Document requires a non-empty string "id" field');
    }

    if (!candidate.section || typeof candidate.section !== 'string' || candidate.section.trim().length === 0) {
      errors.push('Document requires a non-empty string "section" field');
    }

    if (!candidate.title || typeof candidate.title !== 'string' || candidate.title.trim().length === 0) {
      errors.push('Document requires a non-empty string "title" field');
    }

    if (!candidate.content || typeof candidate.content !== 'string' || candidate.content.trim().length === 0) {
      errors.push('Document requires a non-empty string "content" field');
    }

    if (candidate.tags && !Array.isArray(candidate.tags)) {
      errors.push('Document "tags" field must be an array of strings if provided');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate an array of candidate documents.
   */
  public static validateBatch(docs: unknown[]): { validDocs: KnowledgeDocument[]; invalidCount: number; errors: string[] } {
    const validDocs: KnowledgeDocument[] = [];
    const allErrors: string[] = [];
    let invalidCount = 0;

    for (let i = 0; i < docs.length; i++) {
      const result = KnowledgeValidator.validateDocument(docs[i]);
      if (result.valid) {
        validDocs.push(docs[i] as KnowledgeDocument);
      } else {
        invalidCount++;
        allErrors.push(`Document index [${i}]: ${result.errors.join(', ')}`);
      }
    }

    return { validDocs, invalidCount, errors: allErrors };
  }
}
