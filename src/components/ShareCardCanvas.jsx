import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { getMasteryOverview } from "../lib/mastery";

const CARD_WIDTH = 1080;
const CARD_HEIGHT = 1080;
const SCALE = 2;

const PALETTE = {
  bg: "#0f172a",
  bgSecondary: "#1e293b",
  textPrimary: "#f8fafc",
  textSecondary: "#94a3b8",
  sky: "#38bdf8",
  emerald: "#34d399",
  amber: "#fbbf24",
  violet: "#a78bfa",
  rose: "#fb7185",
};

function drawRoundedRect(ctx, x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

export default function ShareCardCanvas({ template, progress }) {
  const { t } = useTranslation();
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1;

    canvas.width = CARD_WIDTH * dpr;
    canvas.height = CARD_HEIGHT * dpr;
    canvas.style.width = `${CARD_WIDTH}px`;
    canvas.style.height = `${CARD_HEIGHT}px`;
    ctx.scale(SCALE, SCALE);

    ctx.fillStyle = PALETTE.bg;
    ctx.fillRect(0, 0, CARD_WIDTH, CARD_HEIGHT);

    const gradient = ctx.createRadialGradient(CARD_WIDTH / 2, CARD_HEIGHT / 2, 100, CARD_WIDTH / 2, CARD_HEIGHT / 2, 700);
    gradient.addColorStop(0, "rgba(56, 189, 248, 0.15)");
    gradient.addColorStop(1, "rgba(15, 23, 42, 0)");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, CARD_WIDTH, CARD_HEIGHT);

    ctx.fillStyle = PALETTE.textPrimary;
    ctx.font = "bold 56px Inter, ui-sans-serif, system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(t("share.appName"), CARD_WIDTH / 2, 120);

    ctx.fillStyle = PALETTE.textSecondary;
    ctx.font = "28px Inter, ui-sans-serif, system-ui, sans-serif";
    ctx.fillText(t("share.tagline"), CARD_WIDTH / 2, 170);

    let statValue = "";
    let statLabel = "";
    let accentColor = PALETTE.sky;

    if (template === "wordCount") {
      const studiedUnique = Object.values(progress.words).filter((word) => word.knownCount > 0 || word.wrongCount > 0).length;
      statValue = String(studiedUnique);
      statLabel = t("share.wordsLearned");
      accentColor = PALETTE.emerald;
    } else if (template === "streak") {
      statValue = String(progress.stats.streak);
      statLabel = t("share.dayStreak");
      accentColor = PALETTE.amber;
    } else if (template === "mastery") {
      const { overallPercent } = getMasteryOverview(progress.words);
      statValue = `${overallPercent}%`;
      statLabel = t("share.overallMastery");
      accentColor = PALETTE.violet;
    }

    const boxY = CARD_HEIGHT / 2 - 80;
    const boxHeight = 220;
    drawRoundedRect(ctx, 120, boxY, CARD_WIDTH - 240, boxHeight, 40);
    ctx.fillStyle = PALETTE.bgSecondary;
    ctx.fill();
    ctx.strokeStyle = accentColor;
    ctx.lineWidth = 4;
    ctx.stroke();

    ctx.fillStyle = accentColor;
    ctx.font = "bold 140px Inter, ui-sans-serif, system-ui, sans-serif";
    ctx.fillText(statValue, CARD_WIDTH / 2, boxY + 150);

    ctx.fillStyle = PALETTE.textSecondary;
    ctx.font = "bold 36px Inter, ui-sans-serif, system-ui, sans-serif";
    ctx.fillText(statLabel, CARD_WIDTH / 2, boxY + 200);

    ctx.fillStyle = PALETTE.textSecondary;
    ctx.font = "24px Inter, ui-sans-serif, system-ui, sans-serif";
    ctx.fillText(t("share.footer"), CARD_WIDTH / 2, CARD_HEIGHT - 80);

    const iconSize = 80;
    const iconX = CARD_WIDTH / 2 - iconSize / 2;
    const iconY = CARD_HEIGHT - 180;
    drawRoundedRect(ctx, iconX - 10, iconY - 10, iconSize + 20, iconSize + 20, 20);
    ctx.fillStyle = PALETTE.bgSecondary;
    ctx.fill();
    ctx.strokeStyle = PALETTE.textSecondary;
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = PALETTE.textPrimary;
    ctx.font = "bold 40px Inter, ui-sans-serif, system-ui, sans-serif";
    ctx.fillText("K", iconX + iconSize / 2, iconY + iconSize / 2 + 14);

  }, [template, progress, t]);

  return <canvas ref={canvasRef} className="w-full rounded-2xl shadow-2xl" style={{ maxWidth: CARD_WIDTH, aspectRatio: "1/1" }} />;
}
