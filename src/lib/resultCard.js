// Draws a square result image (lesson round or TOPIK exam) for sharing.

const SIZE = 1080;
const FONT = "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif";
export const SITE_URL = "https://lugat-six.vercel.app";

function roundRect(ctx, x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + width, y, x + width, y + height, radius);
  ctx.arcTo(x + width, y + height, x, y + height, radius);
  ctx.arcTo(x, y + height, x, y, radius);
  ctx.arcTo(x, y, x + width, y, radius);
  ctx.closePath();
}

function glow(ctx, x, y, radius, color) {
  const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
  gradient.addColorStop(0, color);
  gradient.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, SIZE, SIZE);
}

// card: { eyebrow, score, outOf, percent, badge, chips: [label], footer }
export function drawResultCard(card) {
  const canvas = document.createElement("canvas");
  canvas.width = SIZE;
  canvas.height = SIZE;
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = "#0b1222";
  ctx.fillRect(0, 0, SIZE, SIZE);
  glow(ctx, 160, 120, 620, "rgba(56,189,248,0.40)");
  glow(ctx, 980, 160, 560, "rgba(168,85,247,0.40)");
  glow(ctx, 620, 1160, 640, "rgba(34,197,94,0.22)");

  // Brand
  const logo = ctx.createLinearGradient(80, 80, 176, 176);
  logo.addColorStop(0, "#38bdf8");
  logo.addColorStop(0.55, "#6366f1");
  logo.addColorStop(1, "#a855f7");
  ctx.fillStyle = logo;
  roundRect(ctx, 80, 80, 96, 96, 26);
  ctx.fill();
  ctx.fillStyle = "#fff";
  ctx.font = `900 58px ${FONT}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("K", 128, 131);
  ctx.textAlign = "left";
  ctx.font = `900 52px ${FONT}`;
  ctx.fillText("K-TALIM", 202, 128);

  // Eyebrow
  ctx.fillStyle = "#7dd3fc";
  ctx.font = `800 40px ${FONT}`;
  ctx.fillText(card.eyebrow, 80, 290);

  // Score ring
  const cx = 820;
  const cy = 470;
  ctx.lineWidth = 34;
  ctx.strokeStyle = "rgba(255,255,255,0.12)";
  ctx.beginPath();
  ctx.arc(cx, cy, 150, 0, Math.PI * 2);
  ctx.stroke();
  const ring = ctx.createLinearGradient(cx - 150, cy - 150, cx + 150, cy + 150);
  ring.addColorStop(0, card.percent >= 80 ? "#34d399" : "#38bdf8");
  ring.addColorStop(1, card.percent >= 80 ? "#a3e635" : "#a78bfa");
  ctx.strokeStyle = ring;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.arc(cx, cy, 150, -Math.PI / 2, -Math.PI / 2 + (Math.PI * 2 * Math.max(0.01, card.percent)) / 100);
  ctx.stroke();
  ctx.fillStyle = "#fff";
  ctx.textAlign = "center";
  ctx.font = `900 84px ${FONT}`;
  ctx.fillText(`${card.percent}%`, cx, cy + 4);

  // Score
  ctx.textAlign = "left";
  ctx.font = `900 190px ${FONT}`;
  ctx.fillText(String(card.score), 74, 500);
  const scoreWidth = ctx.measureText(String(card.score)).width;
  ctx.fillStyle = "rgba(255,255,255,0.55)";
  ctx.font = `800 72px ${FONT}`;
  ctx.fillText(`/ ${card.outOf}`, 92 + scoreWidth, 520);

  // Badge
  if (card.badge) {
    ctx.font = `800 44px ${FONT}`;
    const width = ctx.measureText(card.badge).width + 64;
    ctx.fillStyle = "rgba(52,211,153,0.18)";
    roundRect(ctx, 80, 600, width, 84, 42);
    ctx.fill();
    ctx.fillStyle = "#6ee7b7";
    ctx.fillText(card.badge, 112, 644);
  }

  // Chips
  let x = 80;
  let y = card.badge ? 740 : 640;
  ctx.font = `800 36px ${FONT}`;
  (card.chips || []).forEach((chip) => {
    const width = ctx.measureText(chip).width + 56;
    if (x + width > SIZE - 80) {
      x = 80;
      y += 96;
    }
    ctx.fillStyle = "rgba(255,255,255,0.10)";
    roundRect(ctx, x, y, width, 76, 38);
    ctx.fill();
    ctx.fillStyle = "#e2e8f0";
    ctx.fillText(chip, x + 28, y + 40);
    x += width + 18;
  });

  // Footer
  ctx.fillStyle = "rgba(255,255,255,0.70)";
  ctx.font = `700 36px ${FONT}`;
  ctx.fillText(card.footer, 80, 950);
  ctx.fillStyle = "#7dd3fc";
  ctx.font = `800 38px ${FONT}`;
  ctx.fillText(SITE_URL.replace("https://", ""), 80, 1005);
  return canvas;
}
