import React from 'react';

interface SpribePlaneProps {
  flying?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Authentic Spribe Aviator Red Aerobatic Propeller Plane.
 * Features:
 * - 3-blade spinning propeller with aerodynamic spinner hub and rotation blur
 * - Aerobatic monoplane red fuselage with Spribe racing trim and "X" insignia
 * - Dual landing gear with struts and wheels + rear tail wheel
 * - Glossy cockpit canopy with light reflections
 * - Exhaust / wind wake when in flight
 */
function SpribePlane({
  flying = false,
  className = '',
  style
}: SpribePlaneProps) {
  return (
    <div
      className={`relative inline-block select-none pointer-events-none ${className}`}
      style={style}
    >
      <svg
        viewBox="0 0 160 100"
        className="w-full h-full overflow-visible drop-shadow-[0_4px_12px_rgba(229,25,55,0.4)]"
      >
        <defs>
          {/* Main Bright Spribe Red Gradient */}
          <linearGradient id="spribeRedBody" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#b91c1c" />
            <stop offset="25%" stopColor="#dc2626" />
            <stop offset="60%" stopColor="#ef233c" />
            <stop offset="100%" stopColor="#f43f5e" />
          </linearGradient>

          {/* Darker red for under-wing and shadows */}
          <linearGradient id="spribeDarkRed" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#991b1b" />
            <stop offset="100%" stopColor="#7f1d1d" />
          </linearGradient>

          {/* Propeller Blur Arc Gradient */}
          <radialGradient id="propellerBlurDisc" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#f87171" stopOpacity="0.8" />
            <stop offset="50%" stopColor="#ef4444" stopOpacity="0.4" />
            <stop offset="90%" stopColor="#ffffff" stopOpacity="0.1" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </radialGradient>

          {/* Canopy Tint */}
          <linearGradient id="canopyGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.9" />
            <stop offset="40%" stopColor="#0284c7" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#0369a1" stopOpacity="0.9" />
          </linearGradient>

          {/* Wheel rubber gradient */}
          <radialGradient id="wheelRubber" cx="40%" cy="40%" r="60%">
            <stop offset="0%" stopColor="#3f3f46" />
            <stop offset="70%" stopColor="#18181b" />
            <stop offset="100%" stopColor="#09090b" />
          </radialGradient>
        </defs>

        {/* 1. JET / EXHAUST SMOKE & FLAME (Active when flying) */}
        {flying && (
          <g className="animate-pulse" opacity="0.85">
            {/* Engine exhaust trails behind tail */}
            <path
              d="M 16 52 Q -15 53 -35 55 Q -15 57 16 56 Z"
              fill="rgba(239, 68, 68, 0.4)"
            />
            <path
              d="M 20 53 Q -5 54 -20 54 Q -5 55 20 55 Z"
              fill="#facc15"
            />
          </g>
        )}

        {/* 2. REAR TAIL WHEEL */}
        <g id="rear_tail_wheel">
          <line x1="28" y1="62" x2="22" y2="72" stroke="#18181b" strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="21" cy="74" r="4" fill="url(#wheelRubber)" stroke="#09090b" strokeWidth="1" />
          <circle cx="21" cy="74" r="1.5" fill="#a1a1aa" />
        </g>

        {/* 3. MAIN LANDING GEAR (FRONT DUAL WHEELS & STRUTS) */}
        <g id="main_landing_gear">
          {/* Back wheel & strut (perspective underlay) */}
          <line x1="88" y1="62" x2="82" y2="82" stroke="#7f1d1d" strokeWidth="3" strokeLinecap="round" />
          <ellipse cx="80" cy="84" rx="7" ry="8" fill="url(#wheelRubber)" stroke="#09090b" strokeWidth="1" />
          <circle cx="80" cy="84" r="2.5" fill="#71717a" />

          {/* Front wheel & strut (prominent red strut) */}
          <line x1="102" y1="64" x2="96" y2="86" stroke="#ef4444" strokeWidth="3.5" strokeLinecap="round" />
          <line x1="102" y1="64" x2="96" y2="86" stroke="#7f1d1d" strokeWidth="1.5" strokeLinecap="round" />
          {/* Wheel spat / tire */}
          <ellipse cx="94" cy="88" rx="8" ry="9" fill="url(#wheelRubber)" stroke="#09090b" strokeWidth="1.2" />
          <circle cx="94" cy="88" r="3" fill="#d4d4d8" />
          <circle cx="94" cy="88" r="1" fill="#18181b" />
        </g>

        {/* 4. REAR HORIZONTAL STABILIZER WINGS */}
        <path
          d="M 15 48 L 4 45 C 2 45, 1 47, 3 49 L 24 55 Z"
          fill="url(#spribeDarkRed)"
          stroke="#7f1d1d"
          strokeWidth="0.8"
        />

        {/* 5. MAIN AEROBATIC FUSELAGE (RED BODY) */}
        {/* Curvaceous tapered aerobatic stunt monoplane fuselage */}
        <path
          d="M 22 55 C 38 58, 70 63, 115 62 C 128 61, 136 56, 138 52 C 136 46, 128 41, 115 40 C 72 38, 40 45, 22 51 C 18 53, 18 54, 22 55 Z"
          fill="url(#spribeRedBody)"
          stroke="#991b1b"
          strokeWidth="1"
        />

        {/* White racing stripes & aerodynamic body lines */}
        <path
          d="M 36 53 Q 75 56 120 54"
          stroke="#ffffff"
          strokeWidth="1.5"
          fill="none"
          opacity="0.9"
        />
        <path
          d="M 45 56 Q 80 60 115 58"
          stroke="#ffffff"
          strokeWidth="0.8"
          fill="none"
          opacity="0.6"
        />

        {/* Iconic White "X" decal on fuselage/tail */}
        <g transform="translate(48, 48) rotate(-5)" opacity="0.95">
          <line x1="-5" y1="-5" x2="5" y2="5" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="5" y1="-5" x2="-5" y2="5" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" />
        </g>

        {/* 6. VERTICAL TAIL FIN (RUDDER) */}
        <path
          d="M 32 50 L 14 20 C 12 17, 16 16, 20 18 L 42 48 Z"
          fill="url(#spribeRedBody)"
          stroke="#991b1b"
          strokeWidth="1"
        />
        {/* White stripe on tail fin */}
        <path
          d="M 17 21 L 21 20 L 38 48 L 34 49 Z"
          fill="#ffffff"
          opacity="0.9"
        />

        {/* 7. COCKPIT BUBBLE CANOPY */}
        {/* Aerobatic single-pilot bubble canopy */}
        <path
          d="M 68 44 C 74 33, 94 33, 102 43 C 94 45, 78 45, 68 44 Z"
          fill="url(#canopyGrad)"
          stroke="#0284c7"
          strokeWidth="1"
        />
        {/* Canopy white gloss shine reflection */}
        <path
          d="M 72 40 Q 84 35 96 38"
          stroke="#ffffff"
          strokeWidth="1.8"
          strokeLinecap="round"
          fill="none"
          opacity="0.95"
        />

        {/* 8. MAIN MONOPLANE WINGS */}
        {/* Far wing (top-right underlay) */}
        <path
          d="M 76 43 L 95 18 C 98 14, 106 15, 107 20 L 98 44 Z"
          fill="url(#spribeDarkRed)"
          stroke="#7f1d1d"
          strokeWidth="1"
        />
        {/* Near main aerobatic wing (front overlay) */}
        <path
          d="M 74 48 L 86 78 C 88 84, 98 84, 101 78 L 105 49 Z"
          fill="url(#spribeRedBody)"
          stroke="#991b1b"
          strokeWidth="1.2"
        />
        {/* Wing tip white stripe */}
        <path
          d="M 88 72 L 98 72 L 95 78 L 86 78 Z"
          fill="#ffffff"
        />
        {/* Wing highlight */}
        <line x1="77" y1="50" x2="88" y2="76" stroke="#fecaca" strokeWidth="1" opacity="0.6" />

        {/* 9. NOSE COWL & ENGINE COMPARTMENT */}
        <path
          d="M 125 43 C 132 46, 137 49, 137 52 C 137 55, 132 58, 125 60 Z"
          fill="#991b1b"
        />

        {/* 10. PROPELLER BLUR & RED SPINNER HUB */}
        {/* Spinning Propeller Blur Effect */}
        <g transform="translate(138, 52)">
          {/* Spinning disc blur */}
          <ellipse
            cx="0"
            cy="0"
            rx="4"
            ry="38"
            fill="url(#propellerBlurDisc)"
            className={flying ? 'animate-pulse' : ''}
          />
          {/* Three Propeller Blades (Authentic vintage aerobatic look) */}
          <g className={flying ? 'animate-[spin_0.12s_linear_infinite]' : ''} style={{ transformOrigin: '0px 0px' }}>
            {/* Blade 1 (pointing up) */}
            <path
              d="M -2 0 C -3 -15, -1 -30, 0 -36 C 2 -30, 3 -15, 2 0 Z"
              fill="#ffffff"
              stroke="#ef4444"
              strokeWidth="0.8"
            />
            <rect x="-1.5" y="-36" width="3" height="6" fill="#ef4444" />

            {/* Blade 2 (pointing down-left 120 deg) */}
            <path
              d="M -2 0 C -3 -15, -1 -30, 0 -36 C 2 -30, 3 -15, 2 0 Z"
              fill="#ffffff"
              stroke="#ef4444"
              strokeWidth="0.8"
              transform="rotate(120)"
            />
            <rect x="-1.5" y="-36" width="3" height="6" fill="#ef4444" transform="rotate(120)" />

            {/* Blade 3 (pointing down-right 240 deg) */}
            <path
              d="M -2 0 C -3 -15, -1 -30, 0 -36 C 2 -30, 3 -15, 2 0 Z"
              fill="#ffffff"
              stroke="#ef4444"
              strokeWidth="0.8"
              transform="rotate(240)"
            />
            <rect x="-1.5" y="-36" width="3" height="6" fill="#ef4444" transform="rotate(240)" />
          </g>

          {/* Nose Bullet Spinner Cone */}
          <path
            d="M 0 -6 C 8 -4, 12 0, 12 0 C 12 0, 8 4, 0 6 Z"
            fill="#ef4444"
            stroke="#b91c1c"
            strokeWidth="0.8"
          />
          <circle cx="2" cy="0" r="2.5" fill="#fca5a5" />
        </g>
      </svg>
    </div>
  );
}

export default React.memo(SpribePlane);
