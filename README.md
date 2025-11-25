# 🚀 汎用インタビュー分析エンジン - AI基本計画コンペ用

**船荷証券の高精度インタビュー分析システム**

## 📋 プロジェクト概要

このプロジェクトは、**「船荷証券の電子化法案」コンペティション向け**に開発された、戦略的に設計された汎用インタビュー分析エンジンです。

### 🎯 設計思想

従来の問題点:
- ❌ テーマ固有の仮説がハードコード
- ❌ 新しいテーマへの対応に手動作業が必要
- ❌ プロンプトの品質がテーマに依存

本エンジンの解決策:
- ✅ **Phase 1**: 仮説を外部設定ファイルで管理（テーマごとに切り替え可能）
- ✅ **Phase 2**: サンプルデータから仮説を自動生成（Two-Pass Approach）
- ✅ **Phase 3**: Chain of Thought + 引用強制でハルシネーション防止
- ✅ **Phase 4**: Gemini 2.0 Flash Exp の長文脈能力を最大限活用

---

## 🏗️ アーキテクチャ

```
src/
├── config/
│   ├── themes/
│   │   ├── ai-plan.ts          # 人工知能基本計画の仮説定義
│   │   ├── bill-of-lading.ts   # 船荷証券電子化の仮説定義
│   │   └── marumie-shikin.ts   # 政治資金ツールの仮説定義
│   └── index.ts                # テーマ設定の統合管理
├── prompts/
│   └── templates.ts            # プロンプトテンプレート（CoT対応）
├── utils/
│   ├── dataLoader.ts           # CSVデータ読み込み
│   └── llm.ts                  # Gemini API連携
├── types.ts                    # 型定義
├── analyzer.ts                 # 分析エンジン本体
└── analyze.ts                  # CLIエントリーポイント
```

---

## 🚀 セットアップ

### 1. 依存関係のインストール

```powershell
npm install
```

### 2. 環境変数の設定

`.env.local`ファイルを作成：

```env
POSTGRES_URL=your_postgres_url_here
AI_GATEWAY_API_KEY=your_openrouter_key_here
DEFAULT_MODEL=google/gemini-2.0-flash-exp
MAX_OUTPUT_TOKENS=64000
```

配布されたOpenRouterのAPIキーを.env.localに入れると動作する

---

## 📊 使い方

### 船荷証券電子化法案の分析

```powershell
# 事前定義された7つの仮説を使用
npm run analyze -- bill-of-lading
```

### 自動仮説生成モード（Two-Pass Approach）

```powershell
# サンプルデータから仮説を自動生成して分析
npm run analyze -- bill-of-lading --auto-hypotheses
```

このモードでは:

1. トークン数上位5件のセッションをサンプリング
2. LLMに「検証すべき仮説」を抽出させる
3. その仮説を使って本分析を実行

### 仮説生成のみ（テスト用）

```powershell
# 仮説生成結果のみを確認
npm run analyze -- bill-of-lading --generate-only
```

---

## 🎓 コンペで評価されるポイント

### 1. **インサイトの質**（最重要）

- ✅ **差別化**: 自動仮説生成により、テンプレート通りではない深い論点を抽出
- ✅ **エビデンス**: Session ID付き引用で全ての主張を裏付け
- ✅ **多角性**: 賛否両論をバランスよく反映

### 2. **読みやすさ**

- ✅ エグゼクティブサマリーを冒頭に配置
- ✅ Markdown形式で構造化
- ✅ 仮説ごとに判定（supported/rejected/partial/insufficient_data）を明示

### 3. **正確性**

- ✅ Chain of Thought（思考プロセス）で段階的分析
- ✅ 引用強制プロンプトでハルシネーション防止
- ✅ 信頼度スコア付き

### 4. **技術的優位性**

- ✅ 党首の実績あるプロンプト設計を継承
- ✅ TypeScriptによる型安全な実装
- ✅ バッチ処理による大量データ対応

---

## 📝 新しいテーマの追加方法

### ステップ1: 仮説定義ファイルを作成

`src/config/themes/new-theme.ts`:

```typescript
import { ThemeConfig } from '../../types';

export const newThemeConfig: ThemeConfig = {
  slug: 'new-theme',
  title: '新しいテーマのタイトル',
  description: 'テーマの説明',
  analysisDepth: 'detailed',
  contextKeywords: ['キーワード1', 'キーワード2'],
  hypotheses: [
    {
      id: 'H1',
      category: 'カテゴリ',
      description: '検証したい仮説',
      priority: 'high',
    },
    // 追加の仮説...
  ],
};
```

### ステップ2: 設定を登録

`src/config/index.ts`に追加:

```typescript
import { newThemeConfig } from './themes/new-theme';

export const THEME_CONFIGS: Map<string, ThemeConfig> = new Map([
  // 既存のテーマ...
  [newThemeConfig.slug, newThemeConfig],
]);
```

### ステップ3: 実行

```powershell
npm run analyze -- new-theme
```

---

## 🧪 開発モード

```powershell
# TypeScriptをウォッチモードでコンパイル
npm run build -- --watch

# 開発実行（ts-node）
npm run dev
```

---

## 📦 出力

分析結果は `reports/` ディレクトリに保存されます:

```
reports/
└── ai-plan-test_2025-11-25T12-34-56.md
```

レポート構成:

- エグゼクティブサマリー
- 仮説検証結果（各仮説ごと）
- 新たなインサイト
- 提言・推奨事項

---

## 🔧 技術スタック

- **言語**: TypeScript 5.7
- **LLM**: OpenRouterに対応するLLM
- **データ**: CSV（csv-parse）
- **環境変数**: dotenv

---

## 🏆 コンペ戦略まとめ

| Phase | 実装内容 | 狙い |
|-------|---------|------|
| **Phase 1** | 仮説の外部設定化 | テーマ切り替えの自動化 |
| **Phase 2** | 自動仮説生成 | テーマ固有の深い論点発掘 |
| **Phase 3** | CoT + 引用強制 | 精度向上とハルシネーション防止 |
| **Phase 4** | パラメータ最適化 | Gemini 2.0の能力を最大活用 |

---

## 📄 ライセンス

MIT
