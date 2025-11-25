/**
 * レポート品質検証ユーティリティ
 */

export interface QualityCheckResult {
  passed: boolean;
  errors: string[];
  warnings: string[];
  stats: {
    charCount: number;
    citationCount: number;
    forbiddenPhrases: string[];
  };
}

// 禁止表現のリスト
const FORBIDDEN_QUANTITY_PHRASES = [
  '多くの参加者',
  '一部の人',
  'ほとんどの人',
  '大半が',
  '少数だが',
  '複数の参加者',
  '何人かの',
  '大多数',
  '少数の',
];

const FORBIDDEN_VALUE_JUDGMENTS = [
  'さらに踏み込み',
  'より高度な',
  '深い洞察',
  '優れた提案',
  '重要度が高い',
  '素晴らしい',
  '非常に重要',
  '画期的な',
];

/**
 * レポートの品質を検証
 */
export function validateReportQuality(reportContent: string): QualityCheckResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const charCount = reportContent.length;

  // 1. 文字数チェック（10,000-20,000字）
  if (charCount < 10000) {
    warnings.push(`文字数が少なすぎます（${charCount}字 < 10,000字）`);
  } else if (charCount > 20000) {
    warnings.push(`文字数が多すぎます（${charCount}字 > 20,000字）`);
  }

  // 2. 引用の存在確認（#数字 または #英数字）
  const citationPattern = /#\d+|#[a-f0-9]{8}/g;
  const citations = reportContent.match(citationPattern) || [];
  const citationCount = citations.length;

  if (citationCount === 0) {
    errors.push('引用が1つも含まれていません（#セッション番号 が必要）');
  } else if (citationCount < 30) {
    warnings.push(`引用が少なすぎます（${citationCount}件）。より多くの具体例を引用してください`);
  }

  // 引用文を除去してチェック（"..."(#番号) や **role**: ... の部分を除く）
  const contentWithoutQuotes = reportContent
    .replace(/"[^"]*"\(#\d+\)/g, '') // "発言"(#123) を除去
    .replace(/\*\*[a-z]+\*\*: [^\n]*/g, ''); // **user**: ... や **assistant**: ... を除去

  // 3. 禁止表現チェック（数量表現）
  const foundQuantityPhrases: string[] = [];
  for (const phrase of FORBIDDEN_QUANTITY_PHRASES) {
    if (contentWithoutQuotes.includes(phrase)) {
      foundQuantityPhrases.push(phrase);
      errors.push(`禁止された数量表現が含まれています: 「${phrase}」`);
    }
  }

  // 4. 禁止表現チェック（価値判断）
  const foundValueJudgments: string[] = [];
  for (const phrase of FORBIDDEN_VALUE_JUDGMENTS) {
    if (contentWithoutQuotes.includes(phrase)) {
      foundValueJudgments.push(phrase);
      errors.push(`禁止された価値判断が含まれています: 「${phrase}」`);
    }
  }

  // 5. HTMLタグチェック
  if (/<[^>]+>/.test(reportContent)) {
    errors.push('HTMLタグが含まれています。Markdownのみを使用してください');
  }

  // 6. 太字マークダウンチェック（**text**）
  if (/\*\*[^*]+\*\*/.test(reportContent)) {
    warnings.push('太字マークダウン（**）が使用されています。日本語では推奨されません');
  }

  const passed = errors.length === 0;

  return {
    passed,
    errors,
    warnings,
    stats: {
      charCount,
      citationCount,
      forbiddenPhrases: [...foundQuantityPhrases, ...foundValueJudgments],
    },
  };
}

/**
 * 検証結果を表示
 */
export function printQualityCheckResult(result: QualityCheckResult): void {
  console.log('\n📊 品質検証結果\n');
  console.log(`   文字数: ${result.stats.charCount.toLocaleString()}字`);
  console.log(`   引用数: ${result.stats.citationCount}件`);
  console.log();

  if (result.errors.length > 0) {
    console.log('❌ エラー:');
    result.errors.forEach(err => console.log(`   - ${err}`));
    console.log();
  }

  if (result.warnings.length > 0) {
    console.log('⚠️  警告:');
    result.warnings.forEach(warn => console.log(`   - ${warn}`));
    console.log();
  }

  if (result.passed && result.warnings.length === 0) {
    console.log('✅ 全ての品質チェックに合格しました！\n');
  } else if (result.passed) {
    console.log('✅ 必須チェックに合格（警告あり）\n');
  } else {
    console.log('❌ 品質基準を満たしていません。修正が必要です。\n');
  }
}
