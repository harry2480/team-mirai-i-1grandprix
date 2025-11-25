# 船荷証券データ分析スクリプト（文字化け対策済み）
# 使用例:
#   .\analyze.ps1 bill-of-lading --limit=10
#   .\analyze.ps1 bill-of-lading --limit=10 --model=claude-3.7-sonnet
#   .\analyze.ps1 bill-of-lading

# UTF-8エンコーディングを設定
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8

# 引数をそのまま渡して実行
npx ts-node src/batch-analyze.ts @args
