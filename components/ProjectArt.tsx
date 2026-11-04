/** Small line illustrations for the project cards, one per project. */
const stroke = { fill: "none", stroke: "url(#pa)", strokeWidth: 1.6, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };

function Defs() {
  return (
    <defs>
      <linearGradient id="pa" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor="#8ea6ff" />
        <stop offset="1" stopColor="#b69cff" />
      </linearGradient>
    </defs>
  );
}

function wave(y: number, amp: number, freq: number, phase: number) {
  const pts: string[] = [];
  for (let x = 0; x <= 320; x += 4) pts.push(`${x},${(y + Math.sin(x * freq + phase) * amp * (0.6 + 0.4 * Math.sin(x * 0.013))).toFixed(1)}`);
  return pts.join(" ");
}

export default function ProjectArt({ name }: { name: string }) {
  const n = name.toLowerCase();
  return (
    <svg viewBox="0 0 320 120" preserveAspectRatio="xMidYMid slice" width="100%" height="100%">
      <Defs />
      {n.includes("neuro") && (
        <g>
          <polyline points={wave(34, 10, 0.09, 0)} {...stroke} opacity="0.45" />
          <polyline points={wave(60, 16, 0.06, 1.2)} {...stroke} />
          <polyline points={wave(86, 8, 0.14, 2.4)} {...stroke} opacity="0.45" />
          <circle cx="236" cy="60" r="4" fill="#e9edff" />
        </g>
      )}
      {n.includes("traffic") && (
        <g>
          <path d="M120 120 150 20M200 120 170 20M160 120v-14M160 92v-14M160 64v-14M160 36v-10" {...stroke} opacity="0.4" />
          <rect x="124" y="70" width="30" height="22" rx="3" {...stroke} />
          <rect x="166" y="46" width="22" height="16" rx="3" {...stroke} />
          <rect x="150" y="28" width="16" height="11" rx="2" {...stroke} opacity="0.7" />
          <text x="124" y="66" fontSize="8" fill="#8ea6ff">car 0.94</text>
          <text x="192" y="52" fontSize="8" fill="#b69cff">car 0.88</text>
        </g>
      )}
      {n.includes("nirikshaka") && (
        <g>
          <path d="M118 22h-14v14M202 22h14v14M118 98h-14V84M202 98h14V84" {...stroke} />
          <circle cx="160" cy="56" r="20" {...stroke} opacity="0.85" />
          <path d="M148 52a12 12 0 0 1 12-10" {...stroke} opacity="0.6" />
          <line x1="104" y1="74" x2="216" y2="74" stroke="#8ea6ff" strokeWidth="1" opacity="0.6" />
          <text x="224" y="60" fontSize="8" fill="#8ea6ff">apple 0.91</text>
        </g>
      )}
      {n.includes("learning") && (
        <g>
          <rect x="96" y="34" width="72" height="50" rx="6" {...stroke} opacity="0.45" />
          <rect x="124" y="26" width="72" height="50" rx="6" {...stroke} opacity="0.7" />
          <rect x="152" y="18" width="72" height="50" rx="6" {...stroke} />
          <path d="M182 34v18l15-9-15-9Z" {...stroke} />
          <path d="M96 100h128" {...stroke} opacity="0.3" />
          <path d="M96 100h76" {...stroke} />
        </g>
      )}
      {n.includes("clinic") && (
        <g>
          <polyline points="40,64 120,64 134,64 142,40 152,88 162,30 172,72 180,64 280,64" {...stroke} />
          <path d="M236 30v16M228 38h16" {...stroke} opacity="0.8" />
          <rect x="220" y="22" width="32" height="32" rx="8" {...stroke} opacity="0.45" />
        </g>
      )}
    </svg>
  );
}
