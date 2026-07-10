/**
 * QueryWise AI — Hackathon Cover Banner
 *
 * Renders a 1280×720 hero banner on a <canvas> with:
 *   • Dark navy background + blue/cyan neon accents
 *   • Database icon ↔ AI brain data-flow visualisation
 *   • Dashboard panels, charts, code snippets
 *   • DuckDB / FastAPI-inspired backend badges
 *   • "QueryWise AI" title + subtitle + footer
 *
 * User can click "Download PNG" to save the image.
 */

import { useEffect, useRef, useCallback } from "react";

const W = 1280;
const H = 720;

// ── Colour palette ──────────────────────────────────────────
const C = {
  navy900: "#060b1e",
  navy800: "#0a1128",
  navy700: "#0f1a3e",
  navy600: "#142255",
  blue: "#2563eb",
  blueGlow: "#3b82f6",
  cyan: "#06b6d4",
  cyanGlow: "#22d3ee",
  cyanDim: "#0891b2",
  accent: "#818cf8",
  white: "#ffffff",
  offWhite: "#e2e8f0",
  muted: "#64748b",
  dim: "#334155",
  code: "#facc15",
  green: "#22c55e",
};

// ── Utility: rounded rect ───────────────────────────────────
function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

// ── Utility: shadow helper ──────────────────────────────────
function shadow(
  ctx: CanvasRenderingContext2D,
  color: string,
  blur: number,
  ox = 0,
  oy = 0,
) {
  ctx.shadowColor = color;
  ctx.shadowBlur = blur;
  ctx.shadowOffsetX = ox;
  ctx.shadowOffsetY = oy;
}

function noShadow(ctx: CanvasRenderingContext2D) {
  ctx.shadowColor = "transparent";
  ctx.shadowBlur = 0;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;
}

// ── Background ──────────────────────────────────────────────
function drawBackground(ctx: CanvasRenderingContext2D) {
  const grad = ctx.createRadialGradient(640, 360, 100, 640, 360, 700);
  grad.addColorStop(0, C.navy700);
  grad.addColorStop(0.5, C.navy800);
  grad.addColorStop(1, C.navy900);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  // Subtle grid
  ctx.strokeStyle = "rgba(37, 99, 235, 0.07)";
  ctx.lineWidth = 1;
  for (let x = 0; x <= W; x += 40) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, H);
    ctx.stroke();
  }
  for (let y = 0; y <= H; y += 40) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(W, y);
    ctx.stroke();
  }

  // Glow orbs
  const orbs = [
    { x: 200, y: 150, r: 200, c: "rgba(6, 182, 212, 0.06)" },
    { x: 1050, y: 520, r: 250, c: "rgba(59, 130, 246, 0.05)" },
  ];
  for (const o of orbs) {
    const g = ctx.createRadialGradient(o.x, o.y, 0, o.x, o.y, o.r);
    g.addColorStop(0, o.c);
    g.addColorStop(1, "transparent");
    ctx.fillStyle = g;
    ctx.fillRect(o.x - o.r, o.y - o.r, o.r * 2, o.r * 2);
  }
}

// ── Glowing line between two points ─────────────────────────
function drawGlowLine(
  ctx: CanvasRenderingContext2D,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  color: string,
  glowColor: string,
  width = 2,
) {
  // glow pass
  ctx.save();
  shadow(ctx, glowColor, 16);
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.globalAlpha = 0.5;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
  ctx.restore();

  // core pass
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.globalAlpha = 0.9;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
  ctx.globalAlpha = 1;
}

// ── Animated data dots along a line ─────────────────────────
function drawDataDot(
  ctx: CanvasRenderingContext2D,
  t: number,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  color: string,
) {
  const frac = (t % 1.2) / 1.2; // 0..1
  const x = x1 + (x2 - x1) * frac;
  const y = y1 + (y2 - y1) * frac;
  ctx.save();
  shadow(ctx, color, 12);
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

// ── Database icon ───────────────────────────────────────────
function drawDatabase(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  scale = 1,
) {
  const s = scale;
  ctx.save();

  // Cylinder body
  const w = 40 * s;
  const h = 60 * s;
  const topOval = 12 * s;
  const botOval = 12 * s;

  // Bottom ellipse
  ctx.beginPath();
  ctx.ellipse(cx, cy + h, w, botOval, 0, 0, Math.PI * 2);
  ctx.fillStyle = C.navy600;
  ctx.fill();
  ctx.strokeStyle = C.cyan;
  ctx.lineWidth = 2;
  ctx.stroke();

  // Body
  ctx.beginPath();
  ctx.moveTo(cx - w, cy + topOval);
  ctx.lineTo(cx - w, cy + h);
  ctx.ellipse(cx, cy + h, w, botOval, 0, Math.PI, 0, true);
  ctx.lineTo(cx + w, cy + topOval);
  ctx.closePath();
  ctx.fillStyle = C.navy700;
  ctx.fill();
  ctx.strokeStyle = C.cyan;
  ctx.lineWidth = 2;
  ctx.stroke();

  // Top ellipse (filled)
  ctx.beginPath();
  ctx.ellipse(cx, cy + topOval, w, topOval, 0, 0, Math.PI * 2);
  ctx.fillStyle = C.navy600;
  ctx.fill();
  ctx.strokeStyle = C.cyan;
  ctx.lineWidth = 2;
  ctx.stroke();

  // Inner glow rings
  ctx.beginPath();
  ctx.ellipse(cx, cy + topOval, w * 0.5, topOval * 0.5, 0, 0, Math.PI * 2);
  ctx.strokeStyle = C.cyanDim;
  ctx.lineWidth = 1;
  ctx.globalAlpha = 0.5;
  ctx.stroke();

  // Data rows (3 horizontal lines)
  ctx.globalAlpha = 0.7;
  for (let i = 0; i < 3; i++) {
    const yy = cy + topOval + 12 * s + i * 12 * s;
    ctx.beginPath();
    ctx.moveTo(cx - w * 0.6, yy);
    ctx.lineTo(cx + w * 0.6, yy);
    ctx.strokeStyle = C.cyanDim;
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }

  ctx.restore();
}

// ── AI Brain icon ───────────────────────────────────────────
function drawBrain(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  scale = 1,
) {
  const s = scale;
  ctx.save();
  ctx.translate(cx, cy);

  const glow = (blur = 20) => {
    shadow(ctx, C.blueGlow, blur);
  };

  // Brain lobes — two overlapping ellipses
  const w = 50 * s;
  const h = 60 * s;

  // Left lobe
  ctx.beginPath();
  ctx.ellipse(-10 * s, 0, w * 0.6, h * 0.8, -0.3, 0, Math.PI * 2);
  glow(18);
  ctx.fillStyle = C.navy700;
  ctx.fill();
  ctx.strokeStyle = C.blue;
  ctx.lineWidth = 2.5;
  ctx.stroke();

  // Right lobe
  ctx.beginPath();
  ctx.ellipse(10 * s, 0, w * 0.6, h * 0.8, 0.3, 0, Math.PI * 2);
  glow(18);
  ctx.fillStyle = C.navy700;
  ctx.fill();
  ctx.strokeStyle = C.blue;
  ctx.lineWidth = 2.5;
  ctx.stroke();

  noShadow(ctx);

  // Center glow node
  ctx.beginPath();
  ctx.arc(0, 2 * s, 8 * s, 0, Math.PI * 2);
  glow(24);
  ctx.fillStyle = C.blueGlow;
  ctx.fill();

  // Neural dots
  const dots = [
    [-20, -20],
    [20, -20],
    [-25, 8],
    [25, 8],
    [-12, 22],
    [12, 22],
    [0, -30],
  ];
  ctx.fillStyle = C.cyanGlow;
  for (const [dx, dy] of dots) {
    ctx.beginPath();
    ctx.arc(dx * s, dy * s, 2.5 * s, 0, Math.PI * 2);
    glow(10);
    ctx.fill();
  }

  // Lightning bolt
  noShadow(ctx);
  ctx.strokeStyle = C.cyanGlow;
  ctx.lineWidth = 2;
  ctx.globalAlpha = 0.8;
  ctx.beginPath();
  ctx.moveTo(-6 * s, -18 * s);
  ctx.lineTo(3 * s, -6 * s);
  ctx.lineTo(-4 * s, -2 * s);
  ctx.lineTo(6 * s, 12 * s);
  ctx.stroke();

  ctx.restore();
}

// ── Bar chart panel ─────────────────────────────────────────
function drawBarChart(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
) {
  ctx.save();

  // Panel
  roundRect(ctx, x, y, w, h, 8);
  ctx.fillStyle = "rgba(15, 26, 62, 0.85)";
  ctx.fill();
  ctx.strokeStyle = "rgba(6, 182, 212, 0.25)";
  ctx.lineWidth = 1;
  ctx.stroke();

  // Title bar
  ctx.fillStyle = C.dim;
  ctx.fillRect(x + 10, y + 8, 60, 4);
  ctx.fillStyle = C.muted;
  ctx.font = "10px 'Inter', 'Segoe UI', sans-serif";
  ctx.fillText("Revenue by Region", x + 10, y + 30);

  // Bars
  const bars = [
    { label: "N", val: 0.85, color: C.cyan },
    { label: "S", val: 0.55, color: C.blue },
    { label: "E", val: 0.4, color: C.accent },
    { label: "W", val: 0.7, color: C.cyan },
  ];
  const barW = (w - 40) / bars.length;
  const maxH = h - 60;
  const baseY = y + h - 30;

  // Grid lines
  ctx.strokeStyle = "rgba(100, 116, 139, 0.15)";
  ctx.lineWidth = 1;
  for (let i = 0; i < 3; i++) {
    const gy = y + h - 30 - (maxH * (i + 1)) / 3;
    ctx.beginPath();
    ctx.moveTo(x + 8, gy);
    ctx.lineTo(x + w - 8, gy);
    ctx.stroke();
  }

  bars.forEach((b, i) => {
    const bx = x + 16 + i * barW;
    const bh = maxH * b.val;
    const bw = barW * 0.55;

    // Glow
    shadow(ctx, b.color, 10);
    ctx.fillStyle = b.color;
    ctx.globalAlpha = 0.8;
    roundRect(ctx, bx, baseY - bh, bw, bh, 3);
    ctx.fill();
    noShadow(ctx);
    ctx.globalAlpha = 1;

    // Label
    ctx.fillStyle = C.muted;
    ctx.font = "9px 'Inter', 'Segoe UI', sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(b.label, bx + bw / 2, baseY + 14);
  });

  ctx.restore();
}

// ── Small pie chart panel ───────────────────────────────────
function drawPieChart(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
) {
  ctx.save();

  roundRect(ctx, x, y, w, h, 8);
  ctx.fillStyle = "rgba(15, 26, 62, 0.85)";
  ctx.fill();
  ctx.strokeStyle = "rgba(59, 130, 246, 0.25)";
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.fillStyle = C.muted;
  ctx.font = "10px 'Inter', 'Segoe UI', sans-serif";
  ctx.fillText("Sales Distribution", x + 10, y + 22);

  const cx = x + w / 2;
  const cy = y + h / 2 + 6;
  const r = Math.min(w, h) * 0.25;
  const slices = [
    { pct: 0.35, color: C.cyan },
    { pct: 0.25, color: C.blue },
    { pct: 0.2, color: C.accent },
    { pct: 0.2, color: C.cyanDim },
  ];

  let startAngle = -Math.PI / 2;
  for (const slice of slices) {
    const endAngle = startAngle + slice.pct * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, r, startAngle, endAngle);
    ctx.closePath();
    shadow(ctx, slice.color, 8);
    ctx.fillStyle = slice.color;
    ctx.fill();
    noShadow(ctx);
    startAngle = endAngle;
  }

  // Center hole (donut)
  ctx.beginPath();
  ctx.arc(cx, cy, r * 0.45, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(10, 17, 40, 0.9)";
  ctx.fill();

  ctx.restore();
}

// ── Query result card ───────────────────────────────────────
function drawQueryCard(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
) {
  ctx.save();

  roundRect(ctx, x, y, w, h, 8);
  ctx.fillStyle = "rgba(15, 26, 62, 0.9)";
  ctx.fill();
  ctx.strokeStyle = "rgba(129, 140, 248, 0.3)";
  ctx.lineWidth = 1;
  ctx.stroke();

  // SQL label
  ctx.fillStyle = C.code;
  ctx.font = "bold 10px 'JetBrains Mono', 'Fira Code', monospace";
  ctx.fillText("⟫  SELECT region,", x + 10, y + 20);
  ctx.fillText("    SUM(total) AS rev", x + 10, y + 34);
  ctx.fillText("    FROM orders", x + 10, y + 48);
  ctx.fillText("    GROUP BY region;", x + 10, y + 62);

  ctx.restore();
}

// ── Code snippet floating ───────────────────────────────────
function drawCodeSnippet(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  lines: string[],
  color = C.code,
) {
  ctx.save();
  ctx.globalAlpha = 0.6;
  ctx.font = "9px 'JetBrains Mono', 'Fira Code', monospace";
  ctx.fillStyle = color;
  lines.forEach((l, i) => ctx.fillText(l, x, y + i * 13));
  ctx.restore();
}

// ── Tech badge (DuckDB / FastAPI) ───────────────────────────
function drawTechBadge(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  label: string,
  color: string,
) {
  ctx.save();
  roundRect(ctx, x, y, 85, 24, 6);
  ctx.fillStyle = "rgba(6, 182, 212, 0.08)";
  ctx.fill();
  ctx.strokeStyle = color;
  ctx.lineWidth = 1;
  ctx.globalAlpha = 0.4;
  ctx.stroke();
  ctx.globalAlpha = 1;

  // Small icon dot
  ctx.beginPath();
  ctx.arc(x + 14, y + 12, 3, 0, Math.PI * 2);
  ctx.fillStyle = color;
  shadow(ctx, color, 8);
  ctx.fill();
  noShadow(ctx);

  ctx.font = "bold 9px 'Inter', 'Segoe UI', sans-serif";
  ctx.fillStyle = color;
  ctx.textAlign = "left";
  ctx.fillText(label, x + 22, y + 15);
  ctx.restore();
}

// ── Main render ─────────────────────────────────────────────
function render(ctx: CanvasRenderingContext2D, t: number) {
  ctx.clearRect(0, 0, W, H);

  // ── Background ───────────────────────────────────────
  drawBackground(ctx);

  // ── Data-flow lines: Database → Brain → Dashboard ───
  const dbX = 220,
    dbY = 400;
  const brainX = 500,
    brainY = 380;
  const dashX = 820,
    dashY = 380;

  // DB → Brain
  drawGlowLine(ctx, dbX + 60, dbY, brainX - 50, brainY, C.cyan, C.cyanGlow, 2.5);
  drawDataDot(ctx, t, dbX + 60, dbY, brainX - 50, brainY, C.cyanGlow);

  // Brain → Dashboard (two branches)
  drawGlowLine(ctx, brainX + 50, brainY - 10, dashX - 80, dashY - 30, C.blue, C.blueGlow, 2);
  drawGlowLine(ctx, brainX + 50, brainY + 20, dashX - 80, dashY + 50, C.accent, C.accent, 2);
  drawDataDot(ctx, t + 0.4, brainX + 50, brainY - 10, dashX - 80, dashY - 30, C.blueGlow);
  drawDataDot(ctx, t + 0.8, brainX + 50, brainY + 20, dashX - 80, dashY + 50, C.accent);

  // ── Database icon ────────────────────────────────────
  drawDatabase(ctx, dbX, dbY, 1.4);

  // Label under DB
  ctx.font = "10px 'Inter', 'Segoe UI', sans-serif";
  ctx.fillStyle = C.cyanDim;
  ctx.textAlign = "center";
  ctx.fillText("DuckDB Engine", dbX, dbY + 90);

  // ── AI Brain icon ────────────────────────────────────
  drawBrain(ctx, brainX, brainY, 1.3);
  ctx.fillStyle = C.blueGlow;
  ctx.fillText("AI Cortex", brainX, brainY + 85);

  // ── Dashboard panels ─────────────────────────────────
  drawBarChart(ctx, dashX - 40, dashY - 40, 140, 90);
  drawPieChart(ctx, dashX - 40, dashY + 60, 140, 90);
  drawQueryCard(ctx, dashX + 110, dashY - 20, 150, 80);

  // ── Floating code snippets ───────────────────────────
  drawCodeSnippet(ctx, 70, 100, [
    "FROM orders_sample",
    "WHERE region = 'West'",
    "  AND total > 100",
    "ORDER BY total DESC;",
  ]);

  drawCodeSnippet(ctx, 1030, 200, [
    "SELECT product,",
    "  SUM(quantity) AS qty",
    "FROM orders_sample",
    "GROUP BY product;",
  ]);

  // ── Tech badges ──────────────────────────────────────
  drawTechBadge(ctx, 120, 540, "DuckDB ⚡", C.cyan);
  drawTechBadge(ctx, 230, 540, "FastAPI ⚡", C.blueGlow);

  // ── TITLE AREA ───────────────────────────────────────

  // "QueryWise AI" — large hero text
  ctx.save();
  ctx.textAlign = "center";
  const titleX = W / 2;
  const titleY = 160;

  // Glow behind title
  const titleGrad = ctx.createRadialGradient(titleX, titleY, 10, titleX, titleY, 200);
  titleGrad.addColorStop(0, "rgba(59, 130, 246, 0.12)");
  titleGrad.addColorStop(1, "transparent");
  ctx.fillStyle = titleGrad;
  ctx.fillRect(titleX - 200, titleY - 60, 400, 120);

  // Title stroke
  shadow(ctx, C.blueGlow, 40);
  ctx.font = `bold 58px 'Inter', 'Segoe UI', system-ui, sans-serif`;
  ctx.fillStyle = C.white;
  ctx.fillText("QueryWise", titleX, titleY);
  noShadow(ctx);

  // "AI" in cyan with glow
  shadow(ctx, C.cyanGlow, 30);
  ctx.font = `bold 58px 'Inter', 'Segoe UI', system-ui, sans-serif`;
  ctx.fillStyle = C.cyan;
  ctx.fillText("AI", titleX + 240, titleY);
  noShadow(ctx);

  // Subtitle
  shadow(ctx, C.blueGlow, 10);
  ctx.font = `18px 'Inter', 'Segoe UI', system-ui, sans-serif`;
  ctx.fillStyle = C.offWhite;
  ctx.globalAlpha = 0.9;
  ctx.fillText("Ask Questions. Generate SQL. Analyze Instantly.", titleX, titleY + 48);
  ctx.globalAlpha = 1;
  noShadow(ctx);

  // ── Tagline under subtitle ───────────────────────────
  ctx.font = `13px 'Inter', 'Segoe UI', system-ui, sans-serif`;
  ctx.fillStyle = C.muted;
  ctx.fillText(
    "Natural Language to SQL Copilot — powered by DuckDB",
    titleX,
    titleY + 78,
  );

  // ── Footer ───────────────────────────────────────────
  ctx.save();
  ctx.textAlign = "center";
  ctx.font = "11px 'Inter', 'Segoe UI', sans-serif";
  ctx.fillStyle = C.muted;
  ctx.globalAlpha = 0.6;
  ctx.fillText("Built for the AMD Developer Hackathon", W / 2, H - 18);
  ctx.restore();

  // ── Horizontal accent line near top ──────────────────
  const lineGrad = ctx.createLinearGradient(0, 4, W, 4);
  lineGrad.addColorStop(0, "transparent");
  lineGrad.addColorStop(0.2, C.cyan);
  lineGrad.addColorStop(0.5, C.blueGlow);
  lineGrad.addColorStop(0.8, C.cyan);
  lineGrad.addColorStop(1, "transparent");
  ctx.fillStyle = lineGrad;
  ctx.fillRect(0, 0, W, 3);

  // ── Bottom accent ────────────────────────────────────
  const botGrad = ctx.createLinearGradient(0, H - 3, W, H - 3);
  botGrad.addColorStop(0, "transparent");
  botGrad.addColorStop(0.3, C.blueGlow);
  botGrad.addColorStop(0.7, C.cyan);
  botGrad.addColorStop(1, "transparent");
  ctx.fillStyle = botGrad;
  ctx.fillRect(0, H - 3, W, 3);

  // ── Corner accents (decorative) ──────────────────────
  const corner = (x: number, y: number, dir: 1 | -1) => {
    ctx.strokeStyle = C.cyan;
    ctx.globalAlpha = 0.3;
    ctx.lineWidth = 2;
    const len = 30;
    // horizontal
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + dir * len, y);
    ctx.stroke();
    // vertical
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x, y + dir * len);
    ctx.stroke();
    ctx.globalAlpha = 1;
  };
  corner(20, 20, 1);
  corner(W - 20, 20, -1);
  corner(20, H - 20, 1);
  corner(W - 20, H - 20, -1);
}

// ── React component ─────────────────────────────────────────
export default function HackathonBanner() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const start = performance.now();
    const t = (start % 3000) / 3000;
    render(ctx, t);
    rafRef.current = requestAnimationFrame(draw);
  }, []);

  useEffect(() => {
    rafRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafRef.current);
  }, [draw]);

  const handleDownload = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    // Render a static frame without animation for clean download
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    render(ctx, 0.5);
    const link = document.createElement("a");
    link.download = "querywise-ai-hackathon-cover.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  }, []);

  return (
    <div className="flex flex-col items-center gap-4 p-6">
      <canvas
        ref={canvasRef}
        width={W}
        height={H}
        className="rounded-xl border border-white/10 shadow-2xl max-w-full h-auto"
        style={{ aspectRatio: "1280 / 720" }}
      />
      <button
        onClick={handleDownload}
        className="px-6 py-3 bg-blue-600 hover:bg-blue-500 active:scale-[0.97] text-white font-semibold rounded-lg transition-all duration-150 shadow-lg cursor-pointer"
      >
        Download PNG (1280×720)
      </button>
    </div>
  );
}