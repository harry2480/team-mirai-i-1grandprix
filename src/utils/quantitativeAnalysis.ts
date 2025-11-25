/**
 * 定量分析ユーティリティ
 * log_analyzer.pyの機能をTypeScriptで実装
 * ハルシネーション防止のための数値根拠の確立
 */

import { InterviewSession, Message } from '../types';

export interface QuantitativeStats {
  // 基本統計
  totalSessions: number;
  totalMessages: number;
  totalUserMessages: number;
  totalAssistantMessages: number;
  
  // セッション統計
  avgMessagesPerSession: number;
  medianMessagesPerSession: number;
  
  // 引用統計（レポート分析用）
  citationDistribution: Map<string, number>; // セッションID -> 引用回数
  topCitedSessions: Array<{ sessionId: string; sessionNumber?: number; citationCount: number }>;
  
  // 時系列統計
  sessionsPerDay?: Map<string, number>;
  
  // タイムスタンプ
  analysisDate: string;
}

export interface SessionAnalytics {
  sessionId: string;
  sessionNumber?: number;
  messageCount: number;
  userMessageCount: number;
  assistantMessageCount: number;
  avgMessageLength: number;
  createdAt: string;
}

/**
 * セッションとメッセージの定量分析を実行
 */
export function analyzeQuantitativeData(
  sessions: InterviewSession[],
  messages: Message[]
): QuantitativeStats {
  const totalSessions = sessions.length;
  const totalMessages = messages.length;
  
  // メッセージロール別カウント
  const userMessages = messages.filter(m => m.role === 'user');
  const assistantMessages = messages.filter(m => m.role === 'assistant');
  
  // セッションごとのメッセージ数を計算
  const messagesPerSession = sessions.map(session => {
    return messages.filter(m => m.sessionId === session.id).length;
  });
  
  const avgMessagesPerSession = messagesPerSession.reduce((a, b) => a + b, 0) / totalSessions;
  const sortedCounts = [...messagesPerSession].sort((a, b) => a - b);
  const medianMessagesPerSession = sortedCounts[Math.floor(sortedCounts.length / 2)];
  
  // 日別セッション数（オプション）
  const sessionsPerDay = new Map<string, number>();
  sessions.forEach(session => {
    const date = session.createdAt.split('T')[0]; // YYYY-MM-DD部分を抽出
    sessionsPerDay.set(date, (sessionsPerDay.get(date) || 0) + 1);
  });
  
  return {
    totalSessions,
    totalMessages,
    totalUserMessages: userMessages.length,
    totalAssistantMessages: assistantMessages.length,
    avgMessagesPerSession: Math.round(avgMessagesPerSession * 10) / 10,
    medianMessagesPerSession,
    citationDistribution: new Map(),
    topCitedSessions: [],
    sessionsPerDay,
    analysisDate: new Date().toISOString().split('T')[0],
  };
}

/**
 * 各セッションの詳細分析を実行
 */
export function analyzeSessionDetails(
  sessions: InterviewSession[],
  messages: Message[]
): SessionAnalytics[] {
  return sessions.map(session => {
    const sessionMessages = messages.filter(m => m.sessionId === session.id);
    const userMsgs = sessionMessages.filter(m => m.role === 'user');
    const assistantMsgs = sessionMessages.filter(m => m.role === 'assistant');
    
    const totalLength = sessionMessages.reduce((sum, m) => sum + m.content.length, 0);
    const avgLength = sessionMessages.length > 0 ? totalLength / sessionMessages.length : 0;
    
    return {
      sessionId: session.id,
      sessionNumber: session.sessionNumber,
      messageCount: sessionMessages.length,
      userMessageCount: userMsgs.length,
      assistantMessageCount: assistantMsgs.length,
      avgMessageLength: Math.round(avgLength),
      createdAt: session.createdAt,
    };
  });
}

/**
 * レポートから引用を抽出し、統計を更新
 */
export function analyzeCitationsInReport(
  reportContent: string,
  sessions: InterviewSession[]
): QuantitativeStats['citationDistribution'] {
  const citationDistribution = new Map<string, number>();
  
  // #数字 パターンでセッション番号を抽出
  const citationPattern = /#(\d+)/g;
  let match;
  
  while ((match = citationPattern.exec(reportContent)) !== null) {
    const sessionNumber = match[1];
    
    // セッション番号からセッションIDを検索
    const session = sessions.find(s => s.sessionNumber?.toString() === sessionNumber);
    if (session) {
      const currentCount = citationDistribution.get(session.id) || 0;
      citationDistribution.set(session.id, currentCount + 1);
    }
  }
  
  return citationDistribution;
}

/**
 * 引用統計のトップNを取得
 */
export function getTopCitedSessions(
  citationDistribution: Map<string, number>,
  sessions: InterviewSession[],
  topN: number = 10
): Array<{ sessionId: string; sessionNumber?: number; citationCount: number }> {
  const entries = Array.from(citationDistribution.entries());
  
  return entries
    .map(([sessionId, count]) => {
      const session = sessions.find(s => s.id === sessionId);
      return {
        sessionId,
        sessionNumber: session?.sessionNumber,
        citationCount: count,
      };
    })
    .sort((a, b) => b.citationCount - a.citationCount)
    .slice(0, topN);
}

/**
 * 定量統計をMarkdownレポートとして出力
 */
export function generateQuantitativeReport(stats: QuantitativeStats): string {
  const lines: string[] = [
    '# 定量分析レポート',
    '',
    `**分析日**: ${stats.analysisDate}`,
    '',
    '## 基本統計',
    '',
    `- **総セッション数**: ${stats.totalSessions.toLocaleString()}件`,
    `- **総メッセージ数**: ${stats.totalMessages.toLocaleString()}件`,
    `  - ユーザーメッセージ: ${stats.totalUserMessages.toLocaleString()}件`,
    `  - アシスタントメッセージ: ${stats.totalAssistantMessages.toLocaleString()}件`,
    '',
    '## セッション統計',
    '',
    `- **平均メッセージ数/セッション**: ${stats.avgMessagesPerSession.toFixed(1)}件`,
    `- **中央値メッセージ数/セッション**: ${stats.medianMessagesPerSession}件`,
    '',
  ];
  
  if (stats.topCitedSessions.length > 0) {
    lines.push('## 引用頻度上位セッション', '');
    lines.push('| 順位 | セッション番号 | 引用回数 |');
    lines.push('|------|---------------|----------|');
    
    stats.topCitedSessions.forEach((item, index) => {
      lines.push(`| ${index + 1} | #${item.sessionNumber || item.sessionId} | ${item.citationCount}回 |`);
    });
    lines.push('');
  }
  
  if (stats.sessionsPerDay && stats.sessionsPerDay.size > 0) {
    lines.push('## 時系列分析', '');
    lines.push('| 日付 | セッション数 |');
    lines.push('|------|-------------|');
    
    const sortedDates = Array.from(stats.sessionsPerDay.entries())
      .sort((a, b) => a[0].localeCompare(b[0]));
    
    sortedDates.forEach(([date, count]) => {
      lines.push(`| ${date} | ${count}件 |`);
    });
    lines.push('');
  }
  
  return lines.join('\n');
}

/**
 * 統計データをJSON形式で保存用に整形
 */
export function serializeStats(stats: QuantitativeStats): any {
  return {
    totalSessions: stats.totalSessions,
    totalMessages: stats.totalMessages,
    totalUserMessages: stats.totalUserMessages,
    totalAssistantMessages: stats.totalAssistantMessages,
    avgMessagesPerSession: stats.avgMessagesPerSession,
    medianMessagesPerSession: stats.medianMessagesPerSession,
    topCitedSessions: stats.topCitedSessions,
    analysisDate: stats.analysisDate,
    sessionsPerDay: stats.sessionsPerDay ? Object.fromEntries(stats.sessionsPerDay) : undefined,
  };
}

/**
 * 定量統計を表示
 */
export function printQuantitativeStats(stats: QuantitativeStats): void {
  console.log('\n📈 定量分析統計\n');
  console.log(`   総セッション数: ${stats.totalSessions.toLocaleString()}件`);
  console.log(`   総メッセージ数: ${stats.totalMessages.toLocaleString()}件`);
  console.log(`   平均メッセージ数: ${stats.avgMessagesPerSession.toFixed(1)}件/セッション`);
  
  if (stats.topCitedSessions.length > 0) {
    console.log(`\n   📊 引用頻度トップ5:`);
    stats.topCitedSessions.slice(0, 5).forEach((item, idx) => {
      console.log(`      ${idx + 1}. #${item.sessionNumber || item.sessionId}: ${item.citationCount}回`);
    });
  }
  console.log();
}
