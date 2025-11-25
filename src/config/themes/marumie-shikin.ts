import { ThemeConfig } from '../../types';

/**
 * 「みらいまる見え政治資金」ユーザーフィードバックに関する仮説定義
 * 
 * プロダクトのUX、情報の透明性、政治資金への市民の関心度を測る。
 */
export const marumieShikinThemeConfig: ThemeConfig = {
  slug: 'marumie-shikin-user',
  title: 'みらいまる見え政治資金',
  description: '政治資金可視化ツールのユーザビリティと透明性評価',
  analysisDepth: 'detailed',
  contextKeywords: [
    'サンキー図',
    '使いやすさ',
    '透明性',
    'UX/UI',
    '改善提案',
    '可視化',
    '政治資金',
    'リアルタイム公開',
    '比較機能',
    '信頼性'
  ],
  hypotheses: [
    {
      id: 'M1',
      category: 'UI/UXの評価',
      description:
        'サンキー図による可視化は直感的で分かりやすいと評価されているが、スマホでの閲覧性に課題がある',
      priority: 'high',
    },
    {
      id: 'M2',
      category: '情報の理解度',
      description:
        '政治資金の流れは理解しやすくなったものの、専門用語の説明不足や会計項目の詳細が不明確との声がある',
      priority: 'high',
    },
    {
      id: 'M3',
      category: '透明性への期待',
      description:
        'リアルタイム公開により政治資金の透明性が向上したと感じるユーザーが多く、他政党への導入拡大が望まれている',
      priority: 'high',
    },
    {
      id: 'M4',
      category: '機能追加の要望',
      description:
        '他の政党との比較機能、時系列での推移グラフ、支出の詳細フィルタ機能が強く求められている',
      priority: 'medium',
    },
    {
      id: 'M5',
      category: '信頼性の検証',
      description:
        'データの出所や更新頻度が明示されていないことへの不安があり、公的監査や第三者検証の必要性が指摘されている',
      priority: 'medium',
    },
    {
      id: 'M6',
      category: '推薦意向',
      description:
        '政治に関心のある層には高く評価されているが、一般への普及には「面白さ」や「インセンティブ」が不足している',
      priority: 'low',
    },
  ],
};
