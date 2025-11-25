/**
 * テーマ別仮説定義の型
 */
export interface Hypothesis {
  id: string;
  category: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
}

/**
 * テーマ別設定
 */
export interface ThemeConfig {
  slug: string;
  title: string;
  description: string;
  hypotheses: Hypothesis[];
  contextKeywords: string[];
  analysisDepth: 'basic' | 'detailed' | 'comprehensive';
}

/**
 * プロンプトテンプレート設定
 */
export interface PromptConfig {
  systemInstruction: string;
  useChainOfThought: boolean;
  requireCitations: boolean;
  outputFormat: 'markdown' | 'json' | 'structured';
}

/**
 * LLMパラメータ
 */
export interface LLMConfig {
  model: string;
  maxOutputTokens: number;
  temperature: number;
  topP: number;
  topK: number;
}

/**
 * セッションデータ（CSV由来）
 */
export interface InterviewSession {
  id: string;
  configSlug: string;
  userId?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  sessionNumber?: number;
}

/**
 * メッセージデータ
 */
export interface Message {
  id: string;
  sessionId: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  tokenCount?: number;
}

/**
 * 分析レポート結果
 */
export interface AnalysisReport {
  themeSlug: string;
  themeTitle: string;
  generatedAt: string;
  executiveSummary: string;
  hypothesesAnalysis: HypothesisAnalysis[];
  insights: Insight[];
  recommendations: string[];
  metadata: {
    totalSessions: number;
    totalMessages: number;
    modelUsed: string;
    tokensUsed: number;
  };
}

export interface HypothesisAnalysis {
  hypothesisId: string;
  hypothesis: string;
  verdict: 'supported' | 'rejected' | 'partial' | 'insufficient_data';
  evidence: Evidence[];
  confidence: number;
  summary: string;
}

export interface Evidence {
  sessionId: string;
  messageId: string;
  quote: string;
  speaker: 'user' | 'assistant';
  relevance: number;
}

export interface Insight {
  category: string;
  title: string;
  description: string;
  supportingEvidence: string[];
  impact: 'high' | 'medium' | 'low';
}

export interface DeepResearchData {
  title: string;
  summary: string;
  keyFindings: string[];
  sources?: string[];
  timestamp?: string;
  fullContent?: string;
}
