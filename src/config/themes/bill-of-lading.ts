import { ThemeConfig } from '../../types';

/**
 * 船荷証券電子化法案に関する仮説定義
 * 
 * 国際貿易におけるデジタル化推進という視点から、
 * 関係者（貿易従事者、中小企業、消費者等）の意見を構造化します。
 */
export const billOfLadingThemeConfig: ThemeConfig = {
  slug: 'bill-of-lading',
  title: '船荷証券の電子化法案',
  description: '国際貿易のDX推進と実務への影響',
  analysisDepth: 'detailed',
  contextKeywords: [
    '電子化',
    'ペーパーレス',
    '貿易実務',
    'セキュリティ',
    'システム導入',
    '中小企業負担',
    '国際標準',
    'コスト削減',
    'サイバーリスク',
    '移行期間'
  ],
  hypotheses: [
    {
      id: 'B1',
      category: '効率化への期待',
      description:
        '電子化により貿易手続きの時間とコストが大幅に削減され、特に輸出入業務の効率化が期待されている',
      priority: 'high',
    },
    {
      id: 'B2',
      category: 'セキュリティとサイバーリスク',
      description:
        'サイバー攻撃や電子データの改ざん、なりすましへの懸念が根強く、技術的保護措置の整備が最優先課題である',
      priority: 'high',
    },
    {
      id: 'B3',
      category: '中小企業への負担',
      description:
        'システム導入費用やIT人材不足により、中小の貿易事業者にとっては負担が大きく、段階的移行と公的支援が必要とされている',
      priority: 'high',
    },
    {
      id: 'B4',
      category: '国際標準との整合性',
      description:
        '他国が進める電子化システム（MLETR準拠等）との互換性確保が重要であり、日本が孤立するリスクへの警戒感がある',
      priority: 'high',
    },
    {
      id: 'B5',
      category: '紙文化との共存',
      description:
        '従来の紙ベースの取引慣行が根強く残る業界もあり、完全電子化までの移行期間における二重運用の煩雑さが懸念される',
      priority: 'medium',
    },
    {
      id: 'B6',
      category: '法的有効性と紛争解決',
      description:
        '電子船荷証券の法的効力や、国際紛争が発生した際の準拠法・管轄裁判所の明確化が不十分であるとの指摘がある',
      priority: 'medium',
    },
    {
      id: 'B7',
      category: 'BCP（事業継続計画）への影響',
      description:
        'システム障害や通信断絶時のバックアップ手段の確保が不可欠であり、完全電子化はBCPリスクを高める可能性がある',
      priority: 'medium',
    },
  ],
};
