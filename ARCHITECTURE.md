# プロジェクト構成

```
team-mirai-i-1-grand-prix/
│
├── src/                                 # ソースコード
│   ├── config/                          # テーマ別設定
│   │   ├── themes/                      # 各テーマの仮説定義
│   │   │   ├── ai-plan.ts              # 人工知能基本計画
│   │   │   ├── bill-of-lading.ts       # 船荷証券の電子化
│   │   │   └── marumie-shikin.ts       # 政治資金可視化ツール
│   │   └── index.ts                     # テーマ設定の統合管理
│   │
│   ├── prompts/                         # プロンプトテンプレート
│   │   └── templates.ts                 # Phase 2 & 3 のプロンプト
│   │
│   ├── utils/                           # ユーティリティ
│   │   ├── dataLoader.ts               # CSV読み込み・フォーマット
│   │   └── llm.ts                       # Gemini API連携
│   │
│   ├── types.ts                         # 型定義
│   ├── analyzer.ts                      # 分析エンジン本体
│   ├── analyze.ts                       # CLIエントリーポイント
│   └── index.ts                         # ライブラリエクスポート
│
├── reports/                             # 生成されたレポート（出力先）
│   └── .gitkeep
│
├── public_interview_sessions.csv        # セッションデータ
├── public_messages.csv                  # メッセージデータ
├── public_interview_configs.csv         # インタビュー設定
├── public_aggregate_reports.csv         # 集計レポート
├── public_aggregate_report_sessions.csv # 集計セッション
│
├── package.json                         # プロジェクト設定
├── tsconfig.json                        # TypeScript設定
├── .env.example                         # 環境変数のテンプレート
├── .env                                 # 環境変数（ローカル、Git管理外）
├── .gitignore                           # Git除外設定
│
├── README.md                            # プロジェクト概要
├── GETTING_STARTED.md                   # 実行ガイド
└── ARCHITECTURE.md                      # このファイル
```

## 主要コンポーネントの役割

### 1. **設定管理** (`src/config/`)
- **Phase 1の成果物**: テーマごとに仮説を外部ファイル化
- 新テーマ追加時は `themes/` に設定ファイルを1つ追加するだけ

### 2. **プロンプトエンジニアリング** (`src/prompts/`)
- **Phase 2**: 仮説自動生成プロンプト
- **Phase 3**: Chain of Thought + 引用強制プロンプト

### 3. **データ処理** (`src/utils/dataLoader.ts`)
- CSV読み込み
- セッションフィルタリング
- トークン数でのサンプリング（Phase 2用）

### 4. **LLM連携** (`src/utils/llm.ts`)
- Gemini API呼び出し
- JSON/Markdownレスポンスのパース
- **Phase 4**: パラメータ最適化

### 5. **分析エンジン** (`src/analyzer.ts`)
- Phase 2 & 3 のロジック統合
- セッションデータ → プロンプト生成 → LLM実行 → レポート保存

### 6. **CLI** (`src/analyze.ts`)
- コマンドライン引数の解析
- ヘルプ表示
- エラーハンドリング

## データフロー

```
CSV Data (Sessions + Messages)
    ↓
[Data Loader]
    ↓
Filter by Theme Slug
    ↓
[Option 1: Use Predefined Hypotheses]   [Option 2: Auto-Generate Hypotheses]
         ↓                                            ↓
    Theme Config                            Sample Top N Sessions
         ↓                                            ↓
         ↓                                   LLM (Hypothesis Extraction)
         ↓                                            ↓
         └──────────────→ Merge ←─────────────────────┘
                           ↓
                  Generate Analysis Prompt
                  (with Chain of Thought)
                           ↓
                    LLM (Main Analysis)
                           ↓
                  Markdown Report Output
                           ↓
                  reports/{slug}_{timestamp}.md
```

## Phase別実装マップ

| Phase | ファイル | 実装内容 |
|-------|---------|---------|
| **Phase 1** | `src/config/themes/*.ts` | 仮説の外部設定化 |
| **Phase 2** | `src/analyzer.ts::generateHypothesesFromSamples()` | 自動仮説生成 |
| **Phase 3** | `src/prompts/templates.ts::generateAnalysisPrompt()` | CoT + 引用強制 |
| **Phase 4** | `src/utils/llm.ts::generateText()` | パラメータ調整 |

## 拡張ポイント

### 新しいテーマを追加する場合

1. `src/config/themes/new-theme.ts` を作成
2. `src/config/index.ts` に登録
3. `npm run analyze -- new-theme` で実行

### プロンプトをカスタマイズする場合

- `src/prompts/templates.ts` を編集
- システム指示、分析プロセス、出力フォーマットを調整可能

### LLMパラメータを変更する場合

- `.env` で `MAX_OUTPUT_TOKENS` 等を変更
- `src/utils/llm.ts` で `temperature`, `topP`, `topK` を調整

## セキュリティとベストプラクティス

- ✅ API Keyは `.env` で管理（Git管理外）
- ✅ 型安全性（TypeScript）
- ✅ エラーハンドリング
- ✅ トークン数の概算チェック
- ✅ レポートのタイムスタンプ付き保存
