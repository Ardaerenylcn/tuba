// Görselsiz blog yazıları için markaya uygun, sıcak tonlu dekoratif kapak.
// Tohumdan (seed) türetilen renk sayesinde her yazı farklı ama tutarlı görünür.

const PALETTE: [string, string][] = [
  ["#e7d7c1", "#d6bf9f"],
  ["#e0d1bd", "#c9bda4"],
  ["#e5d4bb", "#d2bd9c"],
  ["#dcd3c4", "#c6bca7"],
  ["#e3ddce", "#cec5b1"],
  ["#e8dac6", "#d3c1a4"],
];

function pick(seed: string): [string, string] {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return PALETTE[h % PALETTE.length];
}

export function BlogCoverFallback({
  seed,
  label,
  className = "",
  compact = false,
}: {
  seed: string;
  label?: string | null;
  className?: string;
  compact?: boolean;
}) {
  const [a, b] = pick(seed);
  const initial = (label ?? seed).trim().charAt(0).toUpperCase() || "A";
  return (
    <div
      className={`absolute inset-0 flex items-center justify-center overflow-hidden ${className}`}
      style={{ background: `linear-gradient(135deg, ${a} 0%, ${b} 100%)` }}
      aria-hidden
    >
      {/* Halka motifi (koleksiyonlarla aynı dil) */}
      <svg
        viewBox="0 0 200 200"
        fill="none"
        stroke="#2c1810"
        strokeWidth="0.5"
        className="absolute -right-8 -top-8 h-[140%] w-[70%] opacity-[0.13]"
      >
        <circle cx="100" cy="100" r="92" />
        <circle cx="100" cy="100" r="72" />
        <circle cx="100" cy="100" r="52" />
        <circle cx="100" cy="100" r="32" />
        <circle cx="100" cy="100" r="14" />
      </svg>
      <span
        className={`relative font-light leading-none text-[#2c1810]/25 ${compact ? "text-4xl" : "text-7xl"}`}
        style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}
      >
        {initial}
      </span>
    </div>
  );
}
