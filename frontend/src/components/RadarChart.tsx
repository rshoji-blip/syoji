import React, { useEffect, useRef } from 'react';
import { ALL_CATEGORIES, CATEGORY_ICONS } from '../types';

interface Props { counts: Record<string, number>; }

const CAT_COLORS_FILL: Record<string, string> = {
  "探索":"#85C1E9","創造":"#F4A0B5","会話":"#7DCFB6",
  "運動":"#C39BD3","感覚":"#F9E784","協力":"#F4846F","挑戦":"#85D3A5",
};

export default function RadarChart({ counts }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    const W = 260, H = 240;
    canvas.width = W * dpr; canvas.height = H * dpr;
    canvas.style.width = W + 'px'; canvas.style.height = H + 'px';
    const ctx = canvas.getContext('2d')!;
    ctx.scale(dpr, dpr);

    const cx = 130, cy = 116, maxR = 76, n = ALL_CATEGORIES.length;
    function getXY(i: number, r: number): [number, number] {
      const angle = (i * 2 * Math.PI / n) - Math.PI / 2;
      return [cx + r * Math.cos(angle), cy + r * Math.sin(angle)];
    }

    // bg
    ctx.fillStyle = '#FFFCF7';
    ctx.beginPath(); ctx.arc(cx, cy, maxR + 10, 0, Math.PI * 2); ctx.fill();

    // rings (dashed)
    ctx.setLineDash([4, 5]);
    [0.33, 0.67, 1.0].forEach(frac => {
      ctx.beginPath();
      ALL_CATEGORIES.forEach((_, i) => {
        const [x, y] = getXY(i, maxR * frac);
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      });
      ctx.closePath();
      ctx.strokeStyle = '#F0E6D8'; ctx.lineWidth = 1.5; ctx.stroke();
    });
    ctx.setLineDash([]);

    // axes
    ALL_CATEGORIES.forEach((_, i) => {
      const [ax, ay] = getXY(i, maxR);
      ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(ax, ay);
      ctx.strokeStyle = '#F0E6D8'; ctx.lineWidth = 1.5; ctx.stroke();
    });

    const maxVal = Math.max(...ALL_CATEGORIES.map(c => counts[c] || 0), 1);

    // gradient fill
    ctx.beginPath();
    ALL_CATEGORIES.forEach((cat, i) => {
      const r = ((counts[cat] || 0) / maxVal) * maxR;
      const [x, y] = getXY(i, Math.max(r, 4));
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
    ctx.closePath();
    ctx.fillStyle = 'rgba(244,132,111,0.15)'; ctx.fill();
    ctx.strokeStyle = '#F4846F'; ctx.lineWidth = 2.5;
    ctx.setLineDash([]); ctx.stroke();

    // stamp dots
    ALL_CATEGORIES.forEach((cat, i) => {
      const val = counts[cat] || 0;
      if (val > 0) {
        const r = (val / maxVal) * maxR;
        const [x, y] = getXY(i, r);
        ctx.beginPath(); ctx.arc(x, y, 7, 0, Math.PI * 2);
        ctx.fillStyle = CAT_COLORS_FILL[cat] || '#F4846F'; ctx.fill();
        ctx.strokeStyle = 'white'; ctx.lineWidth = 2; ctx.stroke();
      }

      const [lx, ly] = getXY(i, maxR + 27);
      ctx.font = `bold 11px -apple-system, "Hiragino Maru Gothic ProN", sans-serif`;
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillStyle = (counts[cat] || 0) > 0 ? '#4A3728' : '#B8A090';
      ctx.fillText(CATEGORY_ICONS[cat] + cat, lx, ly);
    });
  }, [counts]);

  return <canvas ref={canvasRef} />;
}
