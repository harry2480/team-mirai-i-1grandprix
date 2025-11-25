/**
 * 党首プロンプト互換 - バッチ処理分析スクリプト
 * 
 * 元のスクリプトの優れた設計（バッチ処理、詳細ログ）を保持しつつ、
 * 汎用テーマ設定システムと統合
 */

import { getThemeConfig } from './config';
import { generateAnalysisPrompt, formatHypothesesForPrompt } from './prompts/templates';
import { loadSessions, loadMessages, loadDeepResearch } from './utils/dataLoader';
import { generateText } from './utils/llm';
import { validateReportQuality, printQualityCheckResult } from './utils/qualityCheck';
import { 
  analyzeQuantitativeData, 
  analyzeCitationsInReport, 
  getTopCitedSessions,
  generateQuantitativeReport,
  printQuantitativeStats,
  serializeStats
} from './utils/quantitativeAnalysis';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

// .env.local から環境変数を読み込み（OpenRouter API Key用）
dotenv.config({ path: path.join(__dirname, '../.env.local'), override: true });

// モデル設定とトークン制限
interface ModelConfig {
  name: string;
  maxContextTokens: number;
  maxOutputTokens: number;
  description: string;
}

const AVAILABLE_MODELS: Record<string, ModelConfig> = {
  'claude-3.5-sonnet': {
    name: 'anthropic/claude-3.5-sonnet',
    maxContextTokens: 200000,
    maxOutputTokens: 16000,
    description: '高速・高品質（200Kトークン制限）'
  },
  'claude-3.7-sonnet': {
    name: 'anthropic/claude-3.7-sonnet',
    maxContextTokens: 200000,
    maxOutputTokens: 16000,
    description: 'Claude 3.7 Sonnet（200Kトークン制限）'
  },
  'claude-sonnet-4': {
    name: 'anthropic/claude-sonnet-4',
    maxContextTokens: 200000,
    maxOutputTokens: 16000,
    description: 'Claude Sonnet 4最新版（200Kトークン制限）'
  },
  'gemini-2.0-flash': {
    name: 'google/gemini-2.0-flash-exp:free',
    maxContextTokens: 1000000,
    maxOutputTokens: 64000,
    description: 'Gemini 2.0 Flash（1Mトークン・無料）'
  },
  'gemini-2.0-flash-thinking': {
    name: 'google/gemini-2.0-flash-thinking-exp:free',
    maxContextTokens: 1000000,
    maxOutputTokens: 64000,
    description: 'Gemini 2.0 Flash思考モード（1Mトークン・無料）'
  },
  'gemini-exp-1206': {
    name: 'google/gemini-exp-1206:free',
    maxContextTokens: 2000000,
    maxOutputTokens: 64000,
    description: 'Gemini実験版1206（2Mトークン・無料）'
  },
  'gemini-2.5-pro': {
    name: 'google/gemini-2.5-pro-exp-0827:free',
    maxContextTokens: 2000000,
    maxOutputTokens: 64000,
    description: 'Gemini 2.5 Pro実験版（2Mトークン・無料）'
  },
  'grok-2': {
    name: 'x-ai/grok-2-1212',
    maxContextTokens: 131072,
    maxOutputTokens: 32768,
    description: 'Grok 2最新版（131Kトークン制限）'
  },
  'grok-vision': {
    name: 'x-ai/grok-2-vision-1212',
    maxContextTokens: 32768,
    maxOutputTokens: 16384,
    description: 'Grok 2 Vision（32Kトークン制限）'
  },
  'deepseek-chat': {
    name: 'deepseek/deepseek-chat',
    maxContextTokens: 64000,
    maxOutputTokens: 8000,
    description: 'DeepSeek Chat（64Kトークン・高速）'
  }
};

const DEFAULT_MODEL = 'claude-3.5-sonnet';
const TOKENS_PER_BATCH = 700000;
const ESTIMATED_PROMPT_OVERHEAD = 100000;
const PROMPT_VERSION = 'unified-v1';

interface SessionData {
  id: string;
  sessionNumber: number;
  messages: Array<{
    role: 'user' | 'assistant';
    content: string;
    timestamp: string;
  }>;
}

function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

function formatSessionsData(sessions: SessionData[]): string {
  return sessions.map(session => {
    const messagesText = session.messages
      .map(msg => `**${msg.role}**: ${msg.content}`)
      .join('\n\n');

    return `### Session #${session.sessionNumber}\n\n${messagesText}`;
  }).join('\n\n---\n\n');
}

/**
 * メイン実行
 * 
 * 使い方:
 * npm run batch-analyze -- bill-of-lading [--auto-hypotheses]
 */
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0 || args.includes('--help')) {
    console.log(`
📊 Batch Analysis Engine

使い方:
  npm run batch-analyze -- <slug> [options]

オプション:
  --limit=N              処理するセッション数を制限（テスト用）
  --model=MODEL_KEY      使用するモデルを指定
  --auto-model           データサイズに応じて最適なモデルを自動選択
  --deep-research=PATH   Deep Research結果ファイルを統合（JSON/MD）
  --help                 このヘルプを表示

利用可能なモデル:`);
    Object.entries(AVAILABLE_MODELS).forEach(([key, config]) => {
      console.log(`  ${key.padEnd(20)} ${config.description}`);
    });
    console.log(`
例:
  npx ts-node src/batch-analyze.ts bill-of-lading
  npx ts-node src/batch-analyze.ts bill-of-lading --limit=100
  npx ts-node src/batch-analyze.ts bill-of-lading --model=gemini-2.0-flash
  npx ts-node src/batch-analyze.ts bill-of-lading --auto-model
    `);
    return;
  }

  const slug = args[0];
  const limitFlag = args.find(arg => arg.startsWith('--limit='));
  const sessionLimit = limitFlag ? parseInt(limitFlag.split('=')[1]) : undefined;
  const modelFlag = args.find(arg => arg.startsWith('--model='));
  const autoModelFlag = args.includes('--auto-model');
  const deepResearchFlag = args.find(arg => arg.startsWith('--deep-research='));
  const deepResearchPath = deepResearchFlag ? deepResearchFlag.split('=')[1] : undefined;
  let selectedModelKey = modelFlag ? modelFlag.split('=')[1] : DEFAULT_MODEL;
  
  if (!AVAILABLE_MODELS[selectedModelKey]) {
    console.error(`❌ Unknown model: ${selectedModelKey}`);
    console.error('Available models:', Object.keys(AVAILABLE_MODELS).join(', '));
    process.exit(1);
  }

  console.log('🚀 Starting batch analysis...\n');
  console.log(`   Slug: ${slug}`);
  console.log(`   Model selection: ${autoModelFlag ? 'Auto' : 'Manual'}`);
  console.log(`   Session limit: ${sessionLimit || 'None'}`);
  console.log(`   Deep Research: ${deepResearchPath || 'None'}\n`);

  // Deep Research結果の読み込み
  let deepResearchData = null;
  if (deepResearchPath) {
    deepResearchData = loadDeepResearch(deepResearchPath);
    if (deepResearchData) {
      console.log(`📚 Deep Research loaded: ${deepResearchData.title}`);
      console.log(`   Summary: ${deepResearchData.summary.substring(0, 100)}...\n`);
    } else {
      console.log(`⚠️  Deep Research file not found or invalid: ${deepResearchPath}\n`);
    }
  }

  // テーマ設定を取得
  let themeConfig = getThemeConfig(slug);
  if (!themeConfig) {
    throw new Error(`Theme config not found for slug: ${slug}`);
  }

  console.log(`📋 Theme: ${themeConfig.title}`);
  console.log(`   Hypotheses: ${themeConfig.hypotheses.length}\n`);

  // 仮説を表示
  console.log('📝 Using hypotheses:\n');
  themeConfig.hypotheses.forEach((h, i) => {
    console.log(`   ${i + 1}. [${h.id}] ${h.category}`);
    console.log(`      ${h.description.substring(0, 60)}...`);
  });
  console.log();

  console.log('✅ Configuration validated!\n');
  
  // データ読み込み
  console.log('📁 Loading data from CSV files...\n');
  let sessions = loadSessions(slug);
  
  if (sessionLimit && sessionLimit > 0) {
    console.log(`   Limiting to first ${sessionLimit} sessions`);
    sessions = sessions.slice(0, sessionLimit);
  }
  
  console.log(`   Found ${sessions.length} sessions with slug: ${slug}`);
  
  if (sessions.length === 0) {
    console.log(`\n⚠️  No sessions found for slug: ${slug}`);
    console.log('   Available slugs in CSV:');
    const allSessions = loadSessions();
    const uniqueSlugs = [...new Set(allSessions.map(s => s.configSlug))];
    uniqueSlugs.forEach(s => console.log(`   - ${s}`));
    return;
  }
  
  const sessionIds = sessions.map(s => s.id);
  const messages = loadMessages(sessionIds);
  console.log(`   Loaded ${messages.length} messages\n`);
  
  // セッションデータを整形（セッション番号付き）
  const sessionsText = sessions.map(session => {
    const sessionMessages = messages.filter(m => m.sessionId === session.id);
    const dialogue = sessionMessages
      .map(msg => `**${msg.role}**: ${msg.content}`)
      .join('\n\n');
    
    const sessionRef = session.sessionNumber ? `#${session.sessionNumber}` : `#${session.id.substring(0, 8)}`;
    return `### Session ${sessionRef}
Status: ${session.status}

${dialogue}`;
  }).join('\n\n---\n\n');
  
  // プロンプト生成
  console.log('🔨 Generating analysis prompt...\n');
  const prompt = generateAnalysisPrompt(
    themeConfig,
    sessionsText,
    undefined,
    deepResearchData
  );
  
  const estimatedTokens = estimateTokens(prompt);
  console.log(`   Estimated input tokens: ${estimatedTokens.toLocaleString()}`);
  
  // モデル自動選択
  if (autoModelFlag) {
    if (estimatedTokens > 150000) {
      selectedModelKey = 'gemini-2.0-flash';
      console.log(`   🤖 Auto-selected: Gemini 2.0 Flash (large dataset)`);
    } else {
      selectedModelKey = 'claude-3.5-sonnet';
      console.log(`   🤖 Auto-selected: Claude 3.5 Sonnet (optimal size)`);
    }
  }
  
  const modelConfig = AVAILABLE_MODELS[selectedModelKey];
  const modelName = modelConfig.name;
  const maxOutputTokens = modelConfig.maxOutputTokens;
  const totalTokens = estimatedTokens + maxOutputTokens;
  
  console.log(`   Selected model: ${selectedModelKey}`);
  console.log(`   Model: ${modelName}`);
  console.log(`   Max output tokens: ${maxOutputTokens.toLocaleString()}`);
  console.log(`   Total tokens: ${totalTokens.toLocaleString()} / ${modelConfig.maxContextTokens.toLocaleString()}`);
  
  // トークン制限チェック
  if (totalTokens > modelConfig.maxContextTokens) {
    console.error(`\n❌ エラー: トークン数が制限を超えています`);
    console.error(`   必要: ${totalTokens.toLocaleString()} トークン`);
    console.error(`   制限: ${modelConfig.maxContextTokens.toLocaleString()} トークン`);
    console.error(`\n解決策:`);
    console.error(`   1. --limit オプションでセッション数を減らす`);
    console.error(`   2. --model=gemini-2.0-flash で大容量モデルを使用`);
    console.error(`   3. --auto-model で自動選択を有効化`);
    process.exit(1);
  }
  
  if (estimatedTokens > 150000 && selectedModelKey !== 'gemini-2.0-flash') {
    console.log(`\n⚠️  推奨: 大規模データには --model=gemini-2.0-flash の使用を推奨します\n`);
  } else {
    console.log();
  }
  
  console.log(`   Prompt preview (first 500 chars):`);
  console.log(`   ${prompt.substring(0, 500)}...\n`);
  
  // LLM分析実行
  console.log('🤖 Starting LLM analysis...\n');
  console.log(`   Model: ${modelName}`);
  console.log(`   This may take several minutes...\n`);
  
  const startTime = Date.now();
  const result = await generateText(prompt, {
    model: modelName,
    maxOutputTokens: maxOutputTokens,
  });
  const duration = ((Date.now() - startTime) / 1000).toFixed(1);
  
  console.log(`✅ Analysis completed in ${duration}s\n`);
  
  // 定量分析
  const quantStats = analyzeQuantitativeData(sessions, messages);
  
  // レポートから引用を分析
  const citationDist = analyzeCitationsInReport(result, sessions);
  quantStats.citationDistribution = citationDist;
  quantStats.topCitedSessions = getTopCitedSessions(citationDist, sessions, 10);
  
  printQuantitativeStats(quantStats);
  
  // 品質検証
  const qualityResult = validateReportQuality(result);
  printQualityCheckResult(qualityResult);
  
  // 結果を保存
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
  const outputDir = path.join(__dirname, '../logs', `${slug}-${timestamp}`);
  fs.mkdirSync(outputDir, { recursive: true });
  
  const reportPath = path.join(outputDir, 'final-report.md');
  fs.writeFileSync(reportPath, result, 'utf-8');
  
  // 定量分析レポートを保存
  const quantReportPath = path.join(outputDir, 'quantitative-analysis.md');
  const quantReport = generateQuantitativeReport(quantStats);
  fs.writeFileSync(quantReportPath, quantReport, 'utf-8');
  
  // メタデータを保存
  const metadata = {
    slug,
    model: {
      key: selectedModelKey,
      name: modelName,
      maxContextTokens: modelConfig.maxContextTokens,
      maxOutputTokens: maxOutputTokens
    },
    sessionCount: sessions.length,
    messageCount: messages.length,
    estimatedTokens,
    totalTokens,
    executionTime: duration,
    timestamp: new Date().toISOString(),
    deepResearch: deepResearchData ? {
      title: deepResearchData.title,
      timestamp: deepResearchData.timestamp,
      includedInAnalysis: true
    } : null,
    quantitativeAnalysis: serializeStats(quantStats),
    qualityCheck: qualityResult,
  };
  const metadataPath = path.join(outputDir, 'metadata.json');
  fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2), 'utf-8');
  
  console.log(`📄 Report saved to: ${reportPath}`);
  console.log(`📊 Quantitative analysis saved to: ${quantReportPath}`);
  console.log(`📊 Metadata saved to: ${metadataPath}\n`);
  console.log(`🎉 Done!\n`);
}

main().catch(error => {
  console.error('❌ Error:', error);
  process.exit(1);
});
