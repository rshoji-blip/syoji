import { PlateGeometry } from './types';

interface Row {
  key: number;
  char: string;
  isGap: boolean;
}

function buildRows(name: string): Row[] {
  return Array.from(name).map((char, i) => ({
    key: i,
    char,
    isGap: char.trim().length === 0,
  }));
}

interface PlatePreviewProps {
  geometry: PlateGeometry;
  name: string;
  fontScale: number;
  /** 画面表示用の縮小率。印刷用インスタンスには常に 1 を渡す。 */
  zoom?: number;
  /**
   * true の場合は実際の印刷出力用のレンダリング。
   * 台紙には既に柄が印刷されているため、ガイド枠・塗り・プレースホルダー文言は一切出さず、
   * 氏名の文字だけを正しい位置に配置する。
   */
  forPrint?: boolean;
}

export default function PlatePreview({
  geometry,
  name,
  fontScale,
  zoom = 1,
  forPrint = false,
}: PlatePreviewProps) {
  const { totalH, totalW, whiteH, whiteW, topMargin, sideMargin } = geometry;
  const rows = buildRows(name);
  const hasContent = rows.length > 0;

  const effectiveLines = hasContent
    ? rows.reduce((sum, r) => sum + (r.isGap ? 0.5 : 1), 0)
    : 5; // プレースホルダー表示用の目安行数

  const baseFontMm = (whiteH / Math.max(effectiveLines, 1)) * 0.78;
  const fontSizeMm = Math.min(Math.max(baseFontMm * fontScale, 6), whiteH * 0.9);

  return (
    <div
      className="relative bg-white"
      style={{ width: `${totalW}mm`, height: `${totalH}mm`, zoom }}
    >
      {/* 台紙全体の目安枠（画面確認用。印刷出力には含めない） */}
      {!forPrint && (
        <div className="pointer-events-none absolute inset-0 border border-dashed border-gray-300" />
      )}

      {/* 白紙印刷部分。画面ではオレンジ色で範囲を示すが、印刷出力では塗り・枠線なし（文字だけ）。 */}
      <div
        className={`absolute flex flex-col items-center justify-center ${
          forPrint ? '' : 'bg-orange-50/70 border border-orange-200'
        }`}
        style={{
          top: `${topMargin}mm`,
          left: `${sideMargin}mm`,
          width: `${whiteW}mm`,
          height: `${whiteH}mm`,
        }}
      >
        {hasContent ? (
          rows.map((row) =>
            row.isGap ? (
              <div key={row.key} style={{ height: `${fontSizeMm * 0.4}mm` }} />
            ) : (
              <div
                key={row.key}
                style={{
                  fontSize: `${fontSizeMm}mm`,
                  lineHeight: 1,
                  fontFamily:
                    "'Noto Serif JP', 'Yu Mincho', 'Hiragino Mincho ProN', serif",
                  fontWeight: 700,
                  color: '#111',
                }}
              >
                {row.char}
              </div>
            )
          )
        ) : (
          !forPrint && (
            <div className="px-2 text-center text-xs text-gray-400">
              ここに氏名が
              <br />
              縦書きで表示されます
            </div>
          )
        )}
      </div>
    </div>
  );
}
