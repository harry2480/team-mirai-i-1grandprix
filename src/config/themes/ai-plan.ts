import { ThemeConfig } from '../../types';

/**
 * 人工知能基本計画に関する仮説定義
 * 
 * この仮説リストは、2025年9月公表の「人工知能基本計画（骨子）」に基づいて設計されており、
 * 国民の意見を多角的に収集・分析することを目的としています。
 */
export const aiPlanThemeConfig: ThemeConfig = {
  slug: 'ai-plan-test',
  title: '人工知能基本計画',
  description: '政府公表のAI基本計画に対する国民の意見と期待',
  analysisDepth: 'comprehensive',
  contextKeywords: [
    'AI利活用',
    'ガバナンス',
    '人材育成',
    'データ基盤',
    '国際競争力',
    'セキュリティ',
    'プライバシー',
    '雇用影響',
    'インフラ',
    '半導体'
  ],
  hypotheses: [
    {
      id: 'H1',
      category: '利活用促進への期待',
      description:
        '国民は、政府・自治体におけるAI利活用（ガバメントAI）により、行政手続きの迅速化やサービス向上を強く期待している',
      priority: 'high',
    },
    {
      id: 'H2',
      category: 'ガバナンスへの懸念',
      description:
        '透明性や説明責任の欠如、AIの誤判断やハルシネーションに対する懸念が根強く、信頼性確保のための第三者評価機関（AISI）への期待が高い',
      priority: 'high',
    },
    {
      id: 'H3',
      category: 'プライバシーとデータ利用',
      description:
        'データ利活用の拡大は生産性向上に寄与する一方で、個人情報保護やオプトアウト権の明確化を求める声が多い',
      priority: 'high',
    },
    {
      id: 'H4',
      category: '雇用への影響',
      description:
        'AIによる雇用代替への不安が存在する一方で、リスキリング支援や新たな職種創出への期待も併存している',
      priority: 'medium',
    },
    {
      id: 'H5',
      category: '中小企業・地方への支援',
      description:
        'AI導入には資金・人材・技術の障壁があり、中小企業や地方自治体に対する政府の具体的支援策が不可欠だと認識されている',
      priority: 'high',
    },
    {
      id: 'H6',
      category: '国際競争力と標準化',
      description:
        '日本独自のルール形成よりも、広島AIプロセス等の国際的枠組みへの整合性を優先すべきとの意見が優勢である',
      priority: 'medium',
    },
    {
      id: 'H7',
      category: 'インフラと環境負荷',
      description:
        'データセンターや半導体の国内整備は重要だが、電力消費や環境負荷への配慮が不十分だとの指摘がある',
      priority: 'medium',
    },
    {
      id: 'H8',
      category: '教育とリテラシー',
      description:
        '初等中等教育からのAIリテラシー教育の必要性は広く支持されているが、教員の研修体制や教材整備が追いついていないとの懸念がある',
      priority: 'medium',
    },
  ],
};
