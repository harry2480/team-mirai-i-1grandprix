import { ThemeConfig, Hypothesis } from '../types';

/**
 * Phase 2: 仮説自動生成用のプロンプトテンプレート
 * 
 * サンプルデータから主要な論点・仮説を自動抽出します。
 */
export function generateHypothesisExtractionPrompt(
  themeTitle: string,
  themeDescription: string,
  sampleSessions: string
): string {
  return `あなたは政策分析の専門家です。以下のインタビューデータから、検証すべき主要な仮説を抽出してください。

# テーマ
${themeTitle}

# 説明
${themeDescription}

# サンプルインタビューデータ
${sampleSessions}

# タスク
上記のサンプルから、以下の基準で**5〜8個の検証可能な仮説**を抽出してください：

1. **具体性**: 曖昧な表現ではなく、検証可能な形式で記述
2. **多様性**: 賛成・反対、期待・懸念など、多角的な視点を含む
3. **重要度**: インタビュー参加者が繰り返し言及している論点を優先
4. **証拠性**: セッション内の具体的な発言で裏付けられる内容

# 出力形式（JSON）
\`\`\`json
[
  {
    "id": "H1",
    "category": "カテゴリ名（例: セキュリティへの懸念）",
    "description": "仮説の詳細説明（1〜2文）",
    "priority": "high" | "medium" | "low"
  }
]
\`\`\`

**必ず有効なJSON配列で出力してください。説明文は含めないでください。**`;
}

/**
 * 党首プロンプト互換：仮説リストを党首形式にフォーマット
 */
export function formatHypothesesForPrompt(hypotheses: Hypothesis[]): string {
  return hypotheses
    .map((h, idx) => 
      `仮説${idx + 1}: ${h.category}\n${h.description}`
    )
    .join('\n\n');
}

/**
 * Phase 3: 党首プロンプト互換の本分析用テンプレート
 * 
 * 党首の優れたプロンプト設計を保持しつつ、仮説部分を外部注入可能にした版
 */
export function generateAnalysisPrompt(
  themeConfig: ThemeConfig,
  sessionData: string,
  interviewConfig?: {
    description?: string;
    overview?: string;
    themes?: string[];
    questions?: any[];
    knowledgeContext?: string;
  },
  deepResearch?: {
    title: string;
    summary: string;
    keyFindings: string[];
    fullContent?: string;
  } | null
): string {
  // 仮説を党首形式でフォーマット
  const hypothesesText = formatHypothesesForPrompt(themeConfig.hypotheses);

  // インタビュー設定の展開
  const description = interviewConfig?.description || themeConfig.description;
  const overview = interviewConfig?.overview || '';
  const themesText = interviewConfig?.themes?.map((t, i) => `${i + 1}. ${t}`).join('\n') || '';
  const questionsText = interviewConfig?.questions?.map((q: any, i) => 
    `${i + 1}. **${q.topic || ''}**: ${q.mainQuestion || ''}`
  ).join('\n') || '';
  const knowledgeContext = interviewConfig?.knowledgeContext || '';
  
  // Deep Research統合
  let deepResearchContext = '';
  if (deepResearch) {
    deepResearchContext = `
【Deep Research結果】
以下は、${deepResearch.title}に関する詳細な調査結果です。この情報を参考にして、インタビュー分析の文脈を深めてください。

${deepResearch.fullContent || deepResearch.summary}

${deepResearch.keyFindings && deepResearch.keyFindings.length > 0 ? `主要な発見:
${deepResearch.keyFindings.map((f, i) => `${i + 1}. ${f}`).join('\n')}
` : ''}
`;
  }

  return `あなたは複数のインタビューセッションを分析し、横断的な考察を行う専門家です。
下記の情報を元に、インタビューのまとめレポートを作成してください。

## インタビューの背景

以下は「${themeConfig.title}」というテーマで実施されたインタビューの分析依頼です。

【説明】
${description}

${overview ? `【概要】\n${overview}\n` : ''}
${themesText ? `【主なテーマ】\n${themesText}\n` : ''}
${questionsText ? `【インタビューで扱った質問】\n${questionsText}\n` : ''}
${knowledgeContext ? `【参考知識・コンテキスト】\n${knowledgeContext}\n` : ''}
${deepResearchContext}
---

## 検証対象の仮説

以下の「${themeConfig.title}」における主要な仮説・提案について、インタビューデータから支持する意見と反論・異なる視点を抽出し、検証してください：

【検証対象の仮説】

${hypothesesText}

---

## セッションデータ

以下は実際のインタビューセッションのデータです。このデータを横断的に分析してください：

${sessionData}

---

## あなたのタスク

上記のインタビューセッションを横断的に分析し、各仮説ごとに支持する意見と反論・異なる視点を抽出してMarkdownレポートを生成してください。

**必ず以下の出力フォーマットに従ってください：**

# ${themeConfig.title} - 集約レポート

## まとめ

[全体を通じて見えてきた主要なテーマ、パターン、重要な発見を3-4段落で詳細に要約してください。このセクションは最低でも800字以上とし、主要な論点を網羅的に記述してください。]

## 仮説1: [事前に設定した仮説]

### 支持する意見
- [具体的な発言の引用1 with "#セッション番号" 引用] - この発言の背景や文脈についても詳しく説明
- [具体的な発言の引用2 with "#セッション番号" 引用] - この発言の背景や文脈についても詳しく説明
- [具体的な発言の引用3 with "#セッション番号" 引用] - この発言の背景や文脈についても詳しく説明
- [具体的な発言の引用4 with "#セッション番号" 引用] - この発言の背景や文脈についても詳しく説明
- [具体的な発言の引用5 with "#セッション番号" 引用] - この発言の背景や文脈についても詳しく説明
[各仮説について、最低でも5つ以上の異なる視点からの意見を引用してください]

### 反論・異なる視点
- [反論1 with "#セッション番号" 引用] - なぜこの反論が重要なのか詳細に説明
- [反論2 with "#セッション番号" 引用] - なぜこの反論が重要なのか詳細に説明
- [反論3 with "#セッション番号" 引用] - なぜこの反論が重要なのか詳細に説明
- [反論4 with "#セッション番号" 引用] - なぜこの反論が重要なのか詳細に説明
[支持意見と対立する視点も同様に詳細に記述してください]

### 検証結果
[この仮説に対する総合的な評価を3-4段落で詳しく記述してください。賛否両論をバランスよく整理し、今後の政策検討に必要な示唆を提供してください。このセクションは最低でも400字以上としてください。]

## 仮説2: [事前に設定した仮説]

[同様に、事前に設定した各仮説について、上記と同じ詳細度で章立てして検証結果を記述してください。各仮説のセクションは最低でも1,000字以上を目安としてください。]

---

**重要な制約事項:**
1. Markdownフォーマットで出力してください
2. HTMLタグは使用しないでください
3. 太字マークダウン（**）は使用しないでください
4. 前置きや説明は不要で、「# ${themeConfig.title} - 集約レポート」から始めてください
5. 具体的な発言を引用する場合は、必ず「"発言内容"(#セッション番号)」の形式で出典を明記してください
6. 個々のセッションの要約ではなく、横断的な分析に焦点を当ててください
7. 【重要】インタビュー参加者の生の声を積極的に引用してください
8. 【重要】数量的表現を使用禁止：「多くの参加者が」「一部の人が」「ほとんどの人が」「大半が」「少数だが」
9. 【重要】価値判断を使用禁止：「さらに踏み込み」「より高度な」「深い洞察」「優れた提案」「重要度が高い」
10. 【重要】レトリックや主観的な修飾語を排除し、学術論文のように客観的かつ簡潔に記述してください
11. 【最重要】Target output length: 10,000-20,000 characters. 各仮説について最低10個以上の異なるセッションから具体的な引用を含めてください
12. 【最重要】引用は合計で最低50個以上含めることを必須とします

**今すぐ上記フォーマットでレポートの作成を開始してください。前置きは一切不要です。**`;
}

/**
 * システム指示（Gemini用）
 */
export const SYSTEM_INSTRUCTION = `あなたは政策分析とインタビューデータ分析の専門家です。

以下の原則を厳守してください：
1. **正確性**: 存在しない発言を捏造しない（ハルシネーション禁止）
2. **証拠主義**: 全ての主張は具体的な引用で裏付ける
3. **多角性**: 賛否両論をバランスよく反映
4. **構造性**: 読みやすく、再現可能な形式で出力
5. **深掘り**: 表面的な分析ではなく、背景や文脈まで考察

あなたの分析結果は政策決定に影響を与える可能性があるため、高い精度と倫理性が求められます。`;
