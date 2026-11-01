import { useState } from "react";
import { useTranslation } from "react-i18next";
import { localized } from "../../data/speakingTopics";

const COLORS = ["#fb923c", "#f472b6", "#a78bfa", "#38bdf8", "#34d399", "#facc15"];
const SIZE = 300;
const RADIUS = SIZE / 2;

function slicePath(index, count) {
  const angle = (2 * Math.PI) / count;
  const start = index * angle - Math.PI / 2;
  const end = start + angle;
  const x1 = RADIUS + RADIUS * Math.cos(start);
  const y1 = RADIUS + RADIUS * Math.sin(start);
  const x2 = RADIUS + RADIUS * Math.cos(end);
  const y2 = RADIUS + RADIUS * Math.sin(end);
  return `M${RADIUS},${RADIUS} L${x1},${y1} A${RADIUS},${RADIUS} 0 0 1 ${x2},${y2} Z`;
}

// Spins to a random topic; the pointer at the top marks the winner.
export default function TopicWheel({ topics, onPick }) {
  const { t, i18n } = useTranslation();
  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const count = topics.length;
  const slice = 360 / count;

  function spin() {
    if (spinning || !count) return;
    const index = Math.floor(Math.random() * count);
    // Bring the middle of the chosen slice under the pointer after 5 turns.
    const target = 360 - (index * slice + slice / 2);
    const current = ((rotation % 360) + 360) % 360;
    setRotation(rotation + 5 * 360 + ((target - current + 360) % 360));
    setSpinning(true);
    setTimeout(() => {
      setSpinning(false);
      onPick(topics[index]);
    }, 3600);
  }

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: SIZE, height: SIZE }}>
        <div className="absolute left-1/2 top-[-10px] z-10 -translate-x-1/2 text-3xl drop-shadow" aria-hidden="true">🔻</div>
        <svg
          viewBox={`0 0 ${SIZE} ${SIZE}`}
          width={SIZE}
          height={SIZE}
          className="rounded-full shadow-2xl shadow-orange-200/60 dark:shadow-black/40"
          style={{ transform: `rotate(${rotation}deg)`, transition: spinning ? "transform 3.5s cubic-bezier(0.17, 0.67, 0.12, 0.99)" : "none" }}
          role="img"
          aria-label={t("speaking.wheelLabel")}
        >
          {topics.map((topic, index) => {
            const middle = ((index + 0.5) * slice - 90) * (Math.PI / 180);
            const x = RADIUS + RADIUS * 0.72 * Math.cos(middle);
            const y = RADIUS + RADIUS * 0.72 * Math.sin(middle);
            return (
              <g key={topic.id}>
                <path d={slicePath(index, count)} fill={COLORS[index % COLORS.length]} stroke="white" strokeWidth="2" />
                <text x={x} y={y} fontSize="22" textAnchor="middle" dominantBaseline="central">
                  <title>{localized(topic, i18n.language)}</title>
                  {topic.emoji}
                </text>
              </g>
            );
          })}
          <circle cx={RADIUS} cy={RADIUS} r="34" fill="white" stroke="#fb923c" strokeWidth="4" />
        </svg>
        <button
          type="button"
          onClick={spin}
          disabled={spinning}
          className="absolute left-1/2 top-1/2 grid h-16 w-16 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-orange-500 text-xs font-black uppercase tracking-wide text-white shadow-lg transition hover:bg-orange-600 disabled:opacity-80"
        >
          {spinning ? "…" : t("speaking.spin")}
        </button>
      </div>
    </div>
  );
}
