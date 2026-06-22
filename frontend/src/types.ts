export interface Child {
  name: string;
  birthdate: string;
  age_str: string;
  age_months?: number;
}

export interface Play {
  id: string;
  name: string;
  age_min_months: number;
  age_max_months: number;
  style: string;
  dev_categories: string[];
  materials: string[];
  steps: string[];
  effects: string[];
  reference_url?: string;
}

export interface LogEntry {
  play_id: string;
  play_name: string;
  date: string;
  favorite?: boolean;
}

export const ALL_CATEGORIES = ["探索","創造","会話","運動","感覚","協力","挑戦"] as const;
export type Category = typeof ALL_CATEGORIES[number];

export const CATEGORY_ICONS: Record<string, string> = {
  "探索":"🔍","創造":"🎨","会話":"💬","運動":"🏃","感覚":"✨","協力":"🤝","挑戦":"🌟",
};

export const CAT_COLORS: Record<string, string> = {
  "探索":"#5B8EF0","創造":"#F4A261","会話":"#6FCF97",
  "運動":"#BB6BD9","感覚":"#F2C94C","協力":"#56CCF2","挑戦":"#EB5757",
};
