import React, { useEffect, useRef } from 'react';
import { ALL_CATEGORIES, CATEGORY_ICONS, type Category } from '../types';

interface Props {
  counts: Record<string, number>;
}

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

    const cx = 130, cy = 118, maxR = 78, n = ALL_CATEGORIES.length;

    function getXY(i: number, r: number): [number, number] {
      const angle = (i * 2 * Math.PI / n) - Math.PI / 2;
      return [cx + r * Math.cos(angle), cy + r * Math.sin(angle)];
    }

    // bg rings
    ctx.setLineDash([3, 4]);
    [0.33, 0.67, 1.0].forEach(frac => {
      ctx.beginPath();
      ALL_CATEGORIES.forEach((_, i) => {
        const [x, y] = getXY(i, maxR * frac);
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      });
      ctx.closePath();
      ctx.strokeStyle = '#E8E4DF'; ctx.lineWidth = 1.5; ctx.stroke();
    });
    ctx.setLineDash([]);

    // axes
    ALL_CATEGORIES.forEach((_, i) => {
      const [ax, ay] = getXY(i, maxR);
      ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(ax, ay);
      ctx.strokeStyle = '#E8E4DF'; ctx.lineWidth = 1; ctx.stroke();
    });

    const maxVal = Math.max(...ALL_CATEGORIES.map(c => counts[c] || 0), 1);

    // data polygon with gradient fill
    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, maxR);
    grad.addColorStop(0, 'rgba(91,142,240,0.35)');
    grad.addColorStop(1, 'rgba(91,142,240,0.08)');

    ctx.beginPath();
    ALL_CATEGORIES.forEach((cat, i) => {
      const r = ((counts[cat] || 0) / maxVal) * maxR;
      const [x, y] = getXY(i, Math.max(r, 3));
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
    ctx.closePath();
    ctx.fillStyle = grad; ctx.fill();
    ctx.strokeStyle = '#5B8EF0'; ctx.lineWidth = 2.5; ctx.stroke();

    // dots & labels
    ALL_CATEGORIES.forEach((cat, i) => {
      const val = counts[cat] || 0;
      const r = val > 0 ? (val / maxVal) * maxR : 0;
      if (val > 0) {
        const [x, y] = getXY(i, r);
        ctx.beginPath(); ctx.arc(x, y, 5.5, 0, Math.PI * 2);
        ctx.fillStyle = '#5B8EF0'; ctx.fill();
        ctx.beginPath(); ctx.arc(x, y, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = 'white'; ctx.fill();
      }

      // label
      const [lx, ly] = getXY(i, maxR + 26);
      ctx.fillStyle = val > 0 ? '#5B8EF0' : '#9CA3AF';
      ctx.font = `bold 11px -apple-system, "Hiragino Sans", sans-serif`;
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(CATEGORY_ICONS[cat] + cat, lx, ly);

      if (val > 0) {
        const [vx, vy] = getXY(i, maxR + 38);
        ctx.fillStyle = '#5B8EF0';
        ctx.font = `bold 10px -apple-system, sans-serif`;
        ctx.fillText(`${val}回`, vx, vy);
      }
    });
  }, [counts]);

  return <canvas ref={canvasRef} />;
}
