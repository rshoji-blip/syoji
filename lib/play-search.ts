import { Play } from '@/types';

export const DOMAINS = ['すべて', '健康', '人間関係', '環境', '言葉', '表現', '総合'] as const;

export function filterPlays(
  plays: Play[],
  params: {
    ageMonths?: number;
    domain?: string;
    location?: string;
    keyword?: string;
  }
): Play[] {
  return plays.filter((play) => {
    if (params.ageMonths !== undefined) {
      if (play.age_min_months > params.ageMonths) return false;
      if (play.age_max_months < params.ageMonths) return false;
    }
    if (params.domain && params.domain !== 'すべて' && play.domain !== params.domain) return false;
    if (params.location && params.location !== 'すべて' && !play.location.includes(params.location)) return false;
    if (params.keyword) {
      const kw = params.keyword;
      const hit =
        play.name.includes(kw) ||
        play.overview.includes(kw) ||
        play.domain_sub.includes(kw) ||
        play.effects.some((e) => e.includes(kw)) ||
        play.materials.some((m) => m.includes(kw));
      if (!hit) return false;
    }
    return true;
  });
}

export function ageLabel(months: number): string {
  if (months < 12) return `${months}ヶ月`;
  const y = Math.floor(months / 12);
  const m = months % 12;
  return m === 0 ? `${y}歳` : `${y}歳${m}ヶ月`;
}
