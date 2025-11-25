# ⚡ クイックスタート

最速で動作確認するための手順です。

## 1. インストール（1分）

```powershell
npm install
```

## 2. API Key設定（2分）

`.env` ファイルを作成：

```powershell
# Windowsの場合
copy .env.local.example .env.local

# または手動で作成
notepad .env.local
```

以下を記入：
```env
AI_GATEWAY_API_KEY=あなたのOpenRouterキー
DEFAULT_MODEL=google/gemini-2.0-flash-exp
MAX_OUTPUT_TOKENS=64000
```

API Key取得: <https://openrouter.ai/>

## 3. 実行（30秒）

```powershell
npm run batch-analyze -- bill-of-lading
```

## 4. 結果確認

```powershell
# 生成されたレポートを開く
code logs/bill-of-lading-*/final-report.md
```

---

## 🎯 全テーマを一括実行

```powershell
npm run analyze -- ai-plan-test
npm run analyze -- bill-of-lading
npm run analyze -- marumie-shikin-user
```

---

## 🤖 自動仮説生成を試す

```powershell
npm run analyze -- bill-of-lading --auto-hypotheses
```

---

## ⚠️ トラブルシューティング

### エラー: `Cannot find module '@google/generative-ai'`

```powershell
npm install
```

### エラー: API Key関連

`.env` ファイルが正しく設定されているか確認：

```powershell
type .env
```

---

以上！わずか3分で実行できます 🚀
