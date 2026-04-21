export const PlaneSVG = ({ width = 280 }) => (
  <svg width={width} viewBox="0 0 420 160" fill="none">
    <path d="M40 80 Q100 68 240 76 Q310 80 380 76 Q408 78 380 82 Q310 86 240 84 Q100 92 40 82 Z" fill="#DBEAFE"/>
    <path d="M375 76 Q418 79 375 82 Z" fill="#BFDBFE"/>
    <ellipse cx="360" cy="79" rx="10" ry="5.5" fill="#60A5FA" opacity=".85"/>
    <ellipse cx="346" cy="79" rx="7" ry="4.5" fill="#93C5FD" opacity=".65"/>
    <path d="M200 78 L175 22 L275 70 Z" fill="#BFDBFE"/>
    <path d="M200 82 L175 138 L275 90 Z" fill="#93C5FD"/>
    <path d="M68 77 L45 32 L95 72 Z" fill="#BFDBFE"/>
    <path d="M68 83 L45 128 L95 88 Z" fill="#93C5FD"/>
    {[140, 158, 176, 194, 212, 230, 248, 266, 284].map((x, i) => (
      <rect key={i} x={x} y="73" width="10" height="8" rx="2.5" fill="#3B82F6" opacity={0.6 - i * 0.04}/>
    ))}
    <ellipse cx="238" cy="108" rx="22" ry="11" fill="#93C5FD"/>
    <ellipse cx="238" cy="108" rx="17" ry="7.5" fill="#60A5FA"/>
    <ellipse cx="218" cy="108" rx="5" ry="5" fill="#2563EB" opacity=".6"/>
    <ellipse cx="195" cy="52" rx="18" ry="9" fill="#93C5FD"/>
    <ellipse cx="195" cy="52" rx="13" ry="6" fill="#60A5FA"/>
    <ellipse cx="179" cy="52" rx="4" ry="4" fill="#2563EB" opacity=".5"/>
    <path d="M95 78.5 Q240 75 378 79 L378 80.5 Q240 77 95 80 Z" fill="#2563EB" opacity=".6"/>
    {[68, 73, 79, 84, 89].map((y, i) => (
      <line key={i} x1="0" y1={y} x2="40" y2={y} stroke="#2563EB" strokeWidth={2.5 - i * 0.4} opacity={0.15 - i * 0.02}/>
    ))}
  </svg>
);

export const PlaneIcon = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/>
  </svg>
);

export const SmallPlane = ({ size = 40 }) => (
  <svg width={size} viewBox="0 0 200 80" fill="none">
    <path d="M20 40 Q50 34 115 38 Q145 40 175 38 Q192 40 175 42 Q145 44 115 42 Q50 46 20 42 Z" fill="#DBEAFE"/>
    <path d="M95 39 L80 12 L130 35 Z" fill="#BFDBFE"/>
    <path d="M95 41 L80 68 L130 45 Z" fill="#93C5FD"/>
    <path d="M35 39 L22 16 L48 36 Z" fill="#BFDBFE"/>
    {[65, 76, 87, 98, 109].map((x, j) => (
      <rect key={j} x={x} y="37" width="6" height="5" rx="1.5" fill="#3B82F6" opacity={0.7 - j * 0.08}/>
    ))}
    <path d="M88 39.5 Q140 38 172 40 L172 40.5 Q140 38.5 88 40 Z" fill="#2563EB" opacity=".7"/>
  </svg>
);
