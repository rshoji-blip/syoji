export type PlateSize = 'small' | 'large';

export interface PlateGeometry {
  /** 台紙全体の縦サイズ (mm) */
  totalH: number;
  /** 台紙全体の横サイズ (mm) */
  totalW: number;
  /** 白紙印刷部分の縦サイズ (mm) */
  whiteH: number;
  /** 白紙印刷部分の横サイズ (mm) */
  whiteW: number;
  /** 白紙部分の上端までの余白 (mm) */
  topMargin: number;
  /** 白紙部分の左右それぞれの余白 (mm) */
  sideMargin: number;
}

export interface PlatePreset {
  label: string;
  /** 実測値で確定しているか（false の場合は推定値であることを警告表示する） */
  confirmed: boolean;
  geometry: PlateGeometry;
}

export const PLATE_PRESETS: Record<PlateSize, PlatePreset> = {
  small: {
    label: '小さい名札',
    confirmed: true,
    geometry: {
      totalH: 493,
      totalW: 200,
      whiteH: 345,
      whiteW: 170,
      topMargin: 493 - 345,
      sideMargin: (200 - 170) / 2,
    },
  },
  large: {
    label: '大きい名札',
    confirmed: false,
    geometry: {
      totalH: 540,
      totalW: 192,
      // 小さい名札と同じ比率で仮計算した推定値。実測でき次第、要更新。
      whiteH: Math.round(540 * (345 / 493)),
      whiteW: Math.round(192 * (170 / 200)),
      topMargin: 540 - Math.round(540 * (345 / 493)),
      sideMargin: (192 - Math.round(192 * (170 / 200))) / 2,
    },
  },
};

export function deriveMargins(g: Pick<PlateGeometry, 'totalH' | 'totalW' | 'whiteH' | 'whiteW'>) {
  return {
    topMargin: g.totalH - g.whiteH,
    sideMargin: (g.totalW - g.whiteW) / 2,
  };
}
