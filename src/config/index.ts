import { ThemeConfig } from '../types';
import { billOfLadingThemeConfig } from './themes/bill-of-lading';

/**
 * 船荷証券電子化コンペ専用設定
 * 
 * このコンペでは船荷証券（bill-of-lading）のみを対象とします。
 */
export const THEME_CONFIGS: Map<string, ThemeConfig> = new Map([
  [billOfLadingThemeConfig.slug, billOfLadingThemeConfig],
]);

/**
 * スラッグからテーマ設定を取得
 */
export function getThemeConfig(slug: string): ThemeConfig | undefined {
  return THEME_CONFIGS.get(slug);
}

/**
 * 全テーマのスラッグリストを取得
 */
export function getAllThemeSlugs(): string[] {
  return Array.from(THEME_CONFIGS.keys());
}
