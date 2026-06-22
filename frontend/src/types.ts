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

export const ALL_CATEGORIES = ["探索","創造","会話","運動","感覚","協力","挑戦"] as const;
export type Category = typeof ALL_CATEGORIES[number];

export const CATEGORY_ICONS: Record<string, string> = {
  "探索":"🔍","創造":"🎨","会話":"💬","運動":"🏃","感覚":"✨","協力":"🤝","挑戦":"🌟",
};

export const CAT_COLORS: Record<string, string> = {
  "探索":"#85C1E9","創造":"#F4A0B5","会話":"#7DCFB6",
  "運動":"#C39BD3","感覚":"#F9E784","協力":"#F4846F","挑戦":"#52BE80",
};
