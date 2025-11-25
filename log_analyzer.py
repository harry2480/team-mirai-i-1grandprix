"""
定量分析ユーティリティ - TypeScript実装への移行完了

このPythonスクリプトの機能は、TypeScriptに移行されました:
- src/utils/quantitativeAnalysis.ts

主な機能:
1. セッション・メッセージの基本統計
2. 引用分析（レポートからの引用抽出と頻度分析）
3. 定量レポート生成（Markdown形式）
4. メタデータへの統計情報の埋め込み

使用方法（TypeScript版）:
  npx ts-node src/batch-analyze.ts bill-of-lading --auto-model

出力ファイル:
  logs/<theme>-<timestamp>/
    ├── final-report.md              # LLM生成の分析レポート
    ├── quantitative-analysis.md     # 定量統計レポート（新規）
    └── metadata.json                # 統計データを含むメタデータ

実装の意義:
- ハルシネーション防止: 具体的な数値根拠を確立
- 透明性: 引用元の追跡可能性
- 再現性: 定量データによる検証可能性

--- オリジナルのPythonコード（参考） ---
"""

import pandas as pd
import json

def analyze_interview_logs(file_path, template_path, output_path):
    """
    インタビューログを分析し、数値を埋め込んだレポートを生成する
    
    このロジックはTypeScriptに移行済み:
    - analyzeQuantitativeData(): 基本統計
    - analyzeCitationsInReport(): 引用分析
    - generateQuantitativeReport(): レポート生成
    """
    
    # 1. データの読み込み (AIがタグ付けした中間データを想定)
    # 想定カラム: session_id, user_attribute(実務者/一般), sentiment(賛成/反対/条件付き), topics(リスト)
    # 実データがないため、ここではダミーデータでロジックを示します
    try:
        df = pd.read_csv(file_path)
    except Exception:
        # エラーハンドリング:ファイルがない場合はダミーで進行
        data = {
            'session_id': range(1, 101),
            'user_attribute': ['実務経験者']*40 + ['一般・その他']*60,
            'sentiment': ['条件付き賛成']*30 + ['反対']*10 + ['賛成']*60,
            'topic_cost': [True]*50 + [False]*50, # コストへの言及有無
            'topic_security': [True]*30 + [False]*70 # セキュリティへの言及有無
        }
        df = pd.DataFrame(data)

    # 2. 定量データの計算（ハルシネーション防止の核心）
    total_sessions = len(df)
    
    # 属性比率の計算
    attr_counts = df['user_attribute'].value_counts(normalize=True) * 100
    expert_ratio = round(attr_counts.get('実務経験者', 0), 1)
    general_ratio = round(attr_counts.get('一般・その他', 0), 1)

    # センチメント分析
    sent_counts = df['sentiment'].value_counts(normalize=True) * 100
    approval_cond_ratio = round(sent_counts.get('条件付き賛成', 0), 1)
    
    # トピック別言及率（ヒートマップ用）
    cost_mention_ratio = round(df['topic_cost'].sum() / total_sessions * 100, 1)
    
    # 3. テンプレートの読み込みと置換
    with open(template_path, 'r', encoding='utf-8') as f:
        report_content = f.read()

    # プレースホルダーの置換
    replacements = {
        "{{N}}": str(total_sessions),
        "{{STAT_EXPERT_RATIO}}": str(expert_ratio),
        "{{STAT_GENERAL_RATIO}}": str(general_ratio),
        "{{STAT_CONDITIONAL_APPROVAL}}": str(approval_cond_ratio),
        "{{STAT_TOPIC_COST_RATIO}}": str(cost_mention_ratio),
        "{{YYYY/MM/DD}}": pd.Timestamp.now().strftime('%Y/%m/%d')
    }

    for key, value in replacements.items():
        report_content = report_content.replace(key, value)

    # 4. 結果の出力
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(report_content)
    
    print(f"レポート生成完了: {output_path}")
    print(f"分析結果: 総数={total_sessions}, 実務者率={expert_ratio}%")

# 実行ブロック（ファイル名は適宜変更してください）
if __name__ == "__main__":
    print("=" * 60)
    print("注意: このスクリプトはTypeScriptに移行されました")
    print("新しい実装: src/utils/quantitativeAnalysis.ts")
    print("=" * 60)
    print()
    print("TypeScript版の使用方法:")
    print("  npx ts-node src/batch-analyze.ts bill-of-lading --auto-model")
    print()
    print("出力例:")
    print("  logs/bill-of-lading-<timestamp>/")
    print("    ├── final-report.md")
    print("    ├── quantitative-analysis.md  ← 定量統計レポート")
    print("    └── metadata.json             ← 統計データ含む")
    print()
