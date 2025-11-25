# 🎯 実行ガイド - 初めての方へ

このガイドでは、プロジェクトのセットアップから最初の分析実行までを順を追って説明します。

## ステップ1: 依存関係のインストール

PowerShellまたはコマンドプロンプトで以下を実行：

```powershell
npm install
```

これにより、以下のパッケージがインストールされます：
- `@google/generative-ai` - Gemini API SDK
- `csv-parse` - CSVデータの解析
- `dotenv` - 環境変数管理
- `typescript`, `ts-node` - TypeScript実行環境

## ステップ2: Gemini API Keyの取得

1. [Google AI Studio](https://aistudio.google.com/app/apikey) にアクセス
2. Googleアカウントでログイン
3. 「Create API Key」をクリック
4. 生成されたキーをコピー

## ステップ3: 環境変数の設定

プロジェクトルートに `.env` ファイルを作成：

```env
GEMINI_API_KEY=AIza...（ここにコピーしたキーを貼り付け）
DEFAULT_MODEL=gemini-2.0-flash-exp
MAX_OUTPUT_TOKENS=8000
TOKENS_PER_BATCH=800000
```

> **重要**: `.env` ファイルは `.gitignore` に含まれているため、GitHubにはアップロードされません。

## ステップ4: 最初の分析を実行

### 人工知能基本計画の分析（推奨）

```powershell
npm run analyze -- ai-plan-test
```

実行内容：
- ✅ CSV（`public_interview_sessions.csv`, `public_messages.csv`）を読み込み
- ✅ `ai-plan-test` に該当するセッションをフィルタリング
- ✅ 事前定義された8つの仮説（`src/config/themes/ai-plan.ts`）を使用
- ✅ Gemini APIで分析を実行
- ✅ `reports/ai-plan-test_<timestamp>.md` にレポートを保存

### 実行ログの例

```
🚀 Starting analysis for theme: ai-plan-test
📅 2025-11-25T12:34:56.789Z

📋 Using predefined 8 hypotheses
📊 Loaded 15 sessions, 234 messages
📏 Estimated input tokens: 45,678
🧠 Sending request to LLM...

✅ Analysis complete!

💾 Report saved: reports/ai-plan-test_2025-11-25T12-34-56.md

✨ Analysis complete! Check the reports/ directory.
```

## ステップ5: レポートの確認

生成されたMarkdownファイルを開いてください：

```powershell
# VS Codeで開く場合
code reports/ai-plan-test_2025-11-25T12-34-56.md
```

レポート構成：
1. **エグゼクティブサマリー** - 全体の要約
2. **仮説検証結果** - 各仮説ごとの判定とエビデンス
3. **新たなインサイト** - 仮説外の重要な発見
4. **提言・推奨事項** - 政策提案

## ステップ6: 自動仮説生成を試す（応用編）

事前定義された仮説ではなく、**AIにデータから仮説を作らせる**モード：

```powershell
npm run analyze -- bill-of-lading --auto-hypotheses
```

実行フロー：
1. トークン数上位5件のセッションをサンプリング
2. Geminiに「このテーマで検証すべき仮説は何か？」と質問
3. 生成された仮説を使って本分析を実行

このモードの利点：
- ✅ 新しいテーマでも即座に対応可能
- ✅ 人間が見落とした論点を発見できる
- ✅ データドリブンな仮説設定

## よくあるエラーと対処法

### エラー: `Module not found: @google/generative-ai`

**原因**: `npm install` が実行されていない

**対処**:
```powershell
npm install
```

### エラー: `GEMINI_API_KEY is not defined`

**原因**: `.env` ファイルが作成されていないか、キーが設定されていない

**対処**:
1. `.env.example` をコピーして `.env` を作成
2. `GEMINI_API_KEY=...` に実際のキーを設定

### エラー: `Theme config not found for slug: xxx`

**原因**: 存在しないテーマslugを指定している

**対処**: 利用可能なテーマを確認
```powershell
npm run analyze -- --help
```

利用可能なテーマ:
- `ai-plan-test` - 人工知能基本計画
- `bill-of-lading` - 船荷証券の電子化
- `marumie-shikin-user` - 政治資金可視化ツール

## 次のステップ

1. **カスタム仮説を追加**: `src/config/themes/` 内のファイルを編集
2. **プロンプトを調整**: `src/prompts/templates.ts` を修正して精度向上
3. **新テーマを追加**: 「新しいテーマの追加方法」（README参照）を参照

---

質問や問題があれば、GitHub Issuesまたはチームメンバーに連絡してください！
