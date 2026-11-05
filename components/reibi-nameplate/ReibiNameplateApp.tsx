'use client';

import { useEffect, useMemo, useState } from 'react';
import PlatePreview from './PlatePreview';
import {
  PlateSize,
  PlateGeometry,
  PLATE_PRESETS,
  deriveMargins,
} from './types';

const STORAGE_KEY = 'reibi-nameplate-state-v1';
const PX_PER_MM = 3.7795275591; // 96dpi

interface PersistedState {
  plateSize: PlateSize;
  geometryOverrides: Partial<Record<PlateSize, PlateGeometry>>;
  name: string;
  fontScale: number;
}

type GeometrySizeField = 'totalH' | 'totalW' | 'whiteH' | 'whiteW';

export default function ReibiNameplateApp() {
  const [plateSize, setPlateSize] = useState<PlateSize>('small');
  const [geometryOverrides, setGeometryOverrides] = useState<
    Partial<Record<PlateSize, PlateGeometry>>
  >({});
  const [name, setName] = useState('');
  const [fontScale, setFontScale] = useState(1);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [loaded, setLoaded] = useState(false);

  // このページを表示している間だけ、全体の遊び心のある背景を落ち着いた配色に切り替える。
  useEffect(() => {
    document.body.classList.add('reibi-active');
    return () => document.body.classList.remove('reibi-active');
  }, []);

  // 前回の入力内容を復元する。
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed: PersistedState = JSON.parse(raw);
        if (parsed.plateSize === 'small' || parsed.plateSize === 'large') {
          setPlateSize(parsed.plateSize);
        }
        if (parsed.geometryOverrides) setGeometryOverrides(parsed.geometryOverrides);
        if (typeof parsed.name === 'string') setName(parsed.name);
        if (typeof parsed.fontScale === 'number') setFontScale(parsed.fontScale);
      }
    } catch {
      // 保存データが壊れていた場合は初期値のまま
    }
    setLoaded(true);
  }, []);

  // 入力内容が変わるたびに保存する（初回の復元が終わってから）。
  useEffect(() => {
    if (!loaded) return;
    try {
      const state: PersistedState = { plateSize, geometryOverrides, name, fontScale };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // 保存に失敗しても致命的ではないため無視する
    }
  }, [loaded, plateSize, geometryOverrides, name, fontScale]);

  const preset = PLATE_PRESETS[plateSize];
  const geometry = geometryOverrides[plateSize] ?? preset.geometry;

  const isEstimated =
    plateSize === 'large' &&
    geometry.whiteH === PLATE_PRESETS.large.geometry.whiteH &&
    geometry.whiteW === PLATE_PRESETS.large.geometry.whiteW;

  function updateGeometry(patch: Partial<PlateGeometry>) {
    setGeometryOverrides((prev) => ({
      ...prev,
      [plateSize]: { ...geometry, ...patch },
    }));
  }

  function updateSize(field: GeometrySizeField, value: number) {
    const next = { ...geometry, [field]: value };
    updateGeometry({ [field]: value, ...deriveMargins(next) });
  }

  function resetGeometry() {
    setGeometryOverrides((prev) => {
      const copy = { ...prev };
      delete copy[plateSize];
      return copy;
    });
  }

  const zoom = useMemo(() => {
    const widthPx = geometry.totalW * PX_PER_MM;
    const heightPx = geometry.totalH * PX_PER_MM;
    return Math.min(1, 340 / widthPx, 620 / heightPx);
  }, [geometry.totalW, geometry.totalH]);

  return (
    <div className="reibi-page min-h-screen w-full">
      {/* 選択中の台紙サイズに合わせて印刷ページサイズを指定する */}
      <style>{`@page { size: ${geometry.totalW}mm ${geometry.totalH}mm; }`}</style>

      {/* ── 画面表示用の操作パネル＋プレビュー（印刷時は非表示） ── */}
      <div className="mx-auto max-w-5xl px-4 py-8 print:hidden">
        <header className="mb-6">
          <h1 className="text-xl font-bold text-gray-800">御霊前名札作成</h1>
          <p className="mt-1 text-sm text-gray-500">
            供花に付ける「御霊前」名札を作成・印刷するツールです。台紙の柄（御霊前・菊柄・金枠など）は
            既製の専用紙を使用する前提で、ここでは氏名だけを台紙の白紙部分に正しい位置で印刷します。
          </p>
        </header>

        <div className="grid gap-6 md:grid-cols-2">
          {/* 左: 操作パネル */}
          <div className="space-y-5">
            <section>
              <h2 className="mb-2 text-sm font-semibold text-gray-700">① 台紙を選ぶ</h2>
              <div className="flex flex-wrap gap-2">
                {(Object.keys(PLATE_PRESETS) as PlateSize[]).map((key) => (
                  <button
                    key={key}
                    onClick={() => setPlateSize(key)}
                    className={`rounded-lg border px-4 py-2 text-sm font-medium transition ${
                      plateSize === key
                        ? 'border-orange-400 bg-orange-100 text-orange-800'
                        : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    {PLATE_PRESETS[key].label}
                    <span className="ml-1 text-xs text-gray-400">
                      (縦{PLATE_PRESETS[key].geometry.totalH}×横{PLATE_PRESETS[key].geometry.totalW}mm)
                    </span>
                  </button>
                ))}
              </div>
              {isEstimated && (
                <p className="mt-2 rounded-md bg-red-50 px-3 py-2 text-xs leading-relaxed text-red-700">
                  ★大きい名札の白紙部分サイズ（縦{geometry.whiteH}×横{geometry.whiteW}mm）は、小さい名札と
                  同じ比率で仮計算した推定値です。実際の台紙で実測し、下の「詳細設定」で正しい値に書き換えて
                  ください。実測値を入力するまでは試し印刷での位置確認にとどめてください。
                </p>
              )}
            </section>

            <section>
              <h2 className="mb-2 text-sm font-semibold text-gray-700">② 氏名を入力する</h2>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="例: 山田 太郎（姓と名の間にスペースを入れると少し間が空きます）"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-300"
              />
              <p className="mt-1 text-xs text-gray-400">
                縦書きのイメージで1文字ずつ上から並びます。姓と名の間に空白を1つ入れると少し間隔が空きます。
              </p>
            </section>

            <section>
              <h2 className="mb-2 text-sm font-semibold text-gray-700">③ 文字の大きさを調整する</h2>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min={0.6}
                  max={1.6}
                  step={0.05}
                  value={fontScale}
                  onChange={(e) => setFontScale(parseFloat(e.target.value))}
                  className="w-full"
                />
                <span className="w-12 text-right text-xs text-gray-500">
                  {Math.round(fontScale * 100)}%
                </span>
              </div>
              <p className="mt-1 text-xs text-gray-400">
                文字数に応じて自動調整されますが、見た目に合わせて手動でも調整できます。
              </p>
            </section>

            <section>
              <button
                onClick={() => setShowAdvanced((v) => !v)}
                className="text-xs font-medium text-gray-500 underline underline-offset-2"
              >
                {showAdvanced ? '詳細設定を閉じる' : '詳細設定（台紙の寸法を編集する）'}
              </button>
              {showAdvanced && (
                <div className="mt-3 space-y-3 rounded-lg border border-gray-200 bg-white p-4">
                  <div className="grid grid-cols-2 gap-3">
                    <LabeledNumber
                      label="台紙 縦 (mm)"
                      value={geometry.totalH}
                      onChange={(v) => updateSize('totalH', v)}
                    />
                    <LabeledNumber
                      label="台紙 横 (mm)"
                      value={geometry.totalW}
                      onChange={(v) => updateSize('totalW', v)}
                    />
                    <LabeledNumber
                      label="白紙部分 縦 (mm)"
                      value={geometry.whiteH}
                      onChange={(v) => updateSize('whiteH', v)}
                    />
                    <LabeledNumber
                      label="白紙部分 横 (mm)"
                      value={geometry.whiteW}
                      onChange={(v) => updateSize('whiteW', v)}
                    />
                    <LabeledNumber
                      label="上余白 (mm)"
                      value={geometry.topMargin}
                      onChange={(v) => updateGeometry({ topMargin: v })}
                    />
                    <LabeledNumber
                      label="左右余白 (mm)"
                      value={geometry.sideMargin}
                      onChange={(v) => updateGeometry({ sideMargin: v })}
                    />
                  </div>
                  <p className="text-xs text-gray-400">
                    台紙全体・白紙部分のサイズを変更すると、上余白・左右余白は自動で再計算されます
                    （白紙部分は下揃え・左右中央が前提）。位置だけがずれる場合は上余白・左右余白を個別に
                    微調整してください。
                  </p>
                  <button
                    onClick={resetGeometry}
                    className="text-xs font-medium text-orange-600 underline underline-offset-2"
                  >
                    初期値（{preset.label}）に戻す
                  </button>
                </div>
              )}
            </section>

            <section>
              <button
                onClick={() => window.print()}
                className="w-full rounded-lg bg-orange-500 px-4 py-3 text-sm font-bold text-white shadow hover:bg-orange-600"
              >
                この内容で印刷する
              </button>
              <p className="mt-2 text-xs text-gray-400">
                印刷ダイアログで用紙サイズを縦{geometry.totalH}mm×横{geometry.totalW}mm
                （またはそれに近いユーザー定義サイズ）に設定し、余白を「なし」にしてください。まずは普通紙で
                試し印刷し、実際の台紙に重ねて位置を確認してからご使用ください。
              </p>
            </section>
          </div>

          {/* 右: プレビュー */}
          <div className="flex items-start justify-center overflow-auto rounded-xl border border-gray-200 bg-gray-50 p-4">
            <PlatePreview geometry={geometry} name={name} fontScale={fontScale} zoom={zoom} />
          </div>
        </div>
      </div>

      {/* ── 印刷専用の実寸プレート（画面には出さず、印刷時のみ表示） ── */}
      <div className="hidden print:block">
        <PlatePreview geometry={geometry} name={name} fontScale={fontScale} forPrint />
      </div>
    </div>
  );
}

function LabeledNumber({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <label className="block text-xs text-gray-500">
      {label}
      <input
        type="number"
        value={value}
        onChange={(e) => {
          const v = parseFloat(e.target.value);
          if (!Number.isNaN(v)) onChange(v);
        }}
        className="mt-1 w-full rounded-md border border-gray-300 px-2 py-1 text-sm focus:border-orange-400 focus:outline-none"
      />
    </label>
  );
}
