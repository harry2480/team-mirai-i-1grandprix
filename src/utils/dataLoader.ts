import * as fs from 'fs';
import * as path from 'path';
import { parse } from 'csv-parse/sync';
import type { InterviewSession, Message, DeepResearchData } from '../types';

const DATA_DIR = path.join(__dirname, '../../');

/**
 * CSVファイルからインタビューセッションを読み込む
 */
export function loadSessions(slug?: string): InterviewSession[] {
  const csvPath = path.join(DATA_DIR, 'public_interview_sessions.csv');
  const content = fs.readFileSync(csvPath, 'utf-8');
  
  const records = parse(content, {
    columns: true,
    skip_empty_lines: true,
  });

  let sessions = records.map((row: any) => ({
    id: row.id,
    configSlug: row.slug || '',
    userId: row.user_id || '',
    status: row.status || '',
    createdAt: row.created_at || '',
    updatedAt: row.updated_at || '',
    sessionNumber: row.session_number ? parseInt(row.session_number) : undefined,
  }));

  // slug指定があればフィルタリング
  if (slug) {
    sessions = sessions.filter((s: InterviewSession) => s.configSlug === slug);
  }

  return sessions;
}

/**
 * CSVファイルからメッセージを読み込む
 */
export function loadMessages(sessionIds?: string[]): Message[] {
  const csvPath = path.join(DATA_DIR, 'public_messages.csv');
  const content = fs.readFileSync(csvPath, 'utf-8');
  
  const records = parse(content, {
    columns: true,
    skip_empty_lines: true,
  });

  let messages = records.map((row: any) => ({
    id: row.id,
    sessionId: row.session_id || '',
    role: row.role as 'user' | 'assistant',
    content: row.content || '',
    timestamp: row.timestamp || '',
    tokenCount: undefined, // CSVにtoken_count列がない
  }));

  // sessionId指定があればフィルタリング
  if (sessionIds && sessionIds.length > 0) {
    messages = messages.filter((m: Message) => sessionIds.includes(m.sessionId));
  }

  return messages;
}

/**
 * セッションデータをプロンプト用のテキスト形式に変換
 */
export function formatSessionsForPrompt(
  sessions: InterviewSession[],
  messages: Message[]
): string {
  const sessionTexts = sessions.map((session) => {
    const sessionMessages = messages.filter((m) => m.sessionId === session.id);
    
    const dialogue = sessionMessages
      .map((msg) => `**${msg.role === 'user' ? 'User' : 'Assistant'}**: ${msg.content}`)
      .join('\n\n');

    return `## Session ID: ${session.id}
Status: ${session.status}
Created: ${session.createdAt}

${dialogue}

---
`;
  });

  return sessionTexts.join('\n\n');
}

/**
 * トークン数上位のセッションをサンプリング（Phase 2用）
 */
export function sampleTopSessionsByTokens(
  slug: string,
  topN: number = 5
): { sessions: InterviewSession[]; messages: Message[] } {
  const sessions = loadSessions(slug);
  const allMessages = loadMessages(sessions.map((s) => s.id));

  // セッションごとのトークン数を計算
  const sessionTokenCounts = sessions.map((session) => {
    const sessionMessages = allMessages.filter((m) => m.sessionId === session.id);
    const totalTokens = sessionMessages.reduce((sum, m) => sum + (m.tokenCount || 0), 0);
    return { session, totalTokens };
  });

  // トークン数でソートして上位N件を取得
  const topSessions = sessionTokenCounts
    .sort((a, b) => b.totalTokens - a.totalTokens)
    .slice(0, topN)
    .map((item) => item.session);

  const topMessages = allMessages.filter((m) =>
    topSessions.some((s) => s.id === m.sessionId)
  );

  return { sessions: topSessions, messages: topMessages };
}

/**
 * Deep Research結果をファイルから読み込む
 * JSON形式またはMarkdown形式のDeep Research結果をサポート
 */
export function loadDeepResearch(filePath: string): DeepResearchData | null {
  try {
    if (!fs.existsSync(filePath)) {
      console.warn(`⚠️ Deep Research file not found: ${filePath}`);
      return null;
    }

    const content = fs.readFileSync(filePath, 'utf-8');
    const ext = path.extname(filePath).toLowerCase();

    if (ext === '.json') {
      // JSON形式
      const data = JSON.parse(content);
      return {
        title: data.title || 'Deep Research Result',
        summary: data.summary || '',
        keyFindings: data.keyFindings || data.key_findings || [],
        sources: data.sources || [],
        timestamp: data.timestamp || new Date().toISOString(),
        fullContent: JSON.stringify(data, null, 2),
      };
    } else if (ext === '.md' || ext === '.markdown') {
      // Markdown形式
      return {
        title: 'Deep Research Result',
        summary: content.substring(0, 500) + '...',
        keyFindings: [],
        fullContent: content,
        timestamp: new Date().toISOString(),
      };
    } else {
      console.warn(`⚠️ Unsupported Deep Research file format: ${ext}`);
      return null;
    }
  } catch (error) {
    console.error(`❌ Error loading Deep Research file: ${error}`);
    return null;
  }
}
