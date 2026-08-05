import { IRetriever, KnowledgeRetriever } from './Retriever';
import { ContextBuilder } from './ContextBuilder';
import { PromptBuilder } from '../prompts/PromptBuilder';
import { SystemPrompt } from '../prompts/SystemPrompt';
import { IAIProvider } from '../providers/AIProvider';
import { ProviderRegistry } from '../providers/ProviderRegistry';
import { MemoryManager } from '../memory/MemoryManager';
import { KnowledgeLoader } from '../knowledge/KnowledgeLoader';
import { AssistantResponse, RetrievalOptions } from '../types';
import { AIConfigOptions, getAIConfig } from '../config/aiConfig';
import { RetrievalError } from '../errors';

export interface PipelineExecutionOptions {
  sessionId?: string;
  providerName?: string;
  retrievalOptions?: RetrievalOptions;
  configOverrides?: Partial<AIConfigOptions>;
}

/**
 * End-to-end Orchestrator for the AI Retrieval Pipeline.
 * Manages the flow: Query -> Retrieval -> Ranking -> Context Building -> Prompt Assembly -> AI Provider.
 */
export class RetrievalPipeline {
  private static defaultInstance: RetrievalPipeline | null = null;
  private retriever: IRetriever;
  private memoryManager: MemoryManager;
  private providerRegistry: ProviderRegistry;
  private systemPrompt: SystemPrompt;
  private knowledgeLoader?: KnowledgeLoader;

  constructor(
    retriever: IRetriever,
    systemPrompt?: SystemPrompt,
    memoryManager?: MemoryManager,
    providerRegistry?: ProviderRegistry,
    knowledgeLoader?: KnowledgeLoader
  ) {
    this.retriever = retriever;
    this.systemPrompt = systemPrompt || new SystemPrompt();
    this.memoryManager = memoryManager || MemoryManager.getInstance();
    this.providerRegistry = providerRegistry || ProviderRegistry.getInstance();
    this.knowledgeLoader = knowledgeLoader;
  }

  /**
   * Factory returning default pre-configured RetrievalPipeline with portfolio knowledge loaded.
   */
  public static async createDefault(): Promise<RetrievalPipeline> {
    const knowledgeLoader = new KnowledgeLoader();
    await knowledgeLoader.loadAllRegisteredSources();

    const retriever = new KnowledgeRetriever(knowledgeLoader.getIndexer());
    const systemPrompt = new SystemPrompt();
    const memoryManager = MemoryManager.getInstance();
    const providerRegistry = ProviderRegistry.getInstance();

    return new RetrievalPipeline(retriever, systemPrompt, memoryManager, providerRegistry, knowledgeLoader);
  }

  /**
   * Get global default singleton instance.
   */
  public static async getDefaultInstance(): Promise<RetrievalPipeline> {
    if (!RetrievalPipeline.defaultInstance) {
      RetrievalPipeline.defaultInstance = await RetrievalPipeline.createDefault();
    }
    return RetrievalPipeline.defaultInstance;
  }

  /**
   * Execute full retrieval pipeline for user query.
   */
  public async execute(
    query: string,
    options: PipelineExecutionOptions = {}
  ): Promise<AssistantResponse> {
    if (!query || query.trim().length === 0) {
      throw new RetrievalError('Query text cannot be empty', query);
    }

    const config = { ...getAIConfig(), ...options.configOverrides };
    const provider: IAIProvider = options.providerName
      ? this.providerRegistry.getProvider(options.providerName)
      : this.providerRegistry.getDefaultProvider();

    // 1. Retrieval & Ranking
    let searchResults = [];
    try {
      searchResults = await this.retriever.retrieve(query, {
        limit: config.retrievalLimit,
        minScore: config.similarityThreshold,
        ...options.retrievalOptions,
      });
    } catch {
      // Optional retrieval fallback
      searchResults = [];
    }

    // 2. Build Context
    const { contextBlocks, sources } = ContextBuilder.buildContext(
      searchResults,
      config.maxContextTokens
    );

    // 3. Retrieve Memory Turns if sessionId provided
    const memoryTurns = options.sessionId
      ? this.memoryManager.getSessionTurns(options.sessionId)
      : [];

    // 4. Build Prompt
    const promptBuilder = new PromptBuilder()
      .withSystemPrompt(this.systemPrompt)
      .withContextBlocks(contextBlocks)
      .withMemoryTurns(memoryTurns)
      .withUserMessage(query)
      .withTokenBudget(config.maxContextTokens);

    const { fullPrompt } = promptBuilder.build();

    // 5. Generate Response via AI Provider
    const response = await provider.generateResponse(fullPrompt, config);

    // 6. Update Memory if sessionId provided
    if (options.sessionId && response.success) {
      this.memoryManager.addTurn(options.sessionId, 'user', query);
      this.memoryManager.addTurn(options.sessionId, 'assistant', response.reply);
    }

    // Attach retrieved sources to assistant response
    return {
      ...response,
      sources,
    };
  }
}

export const getRetrievalPipeline = async (): Promise<RetrievalPipeline> => RetrievalPipeline.getDefaultInstance();
