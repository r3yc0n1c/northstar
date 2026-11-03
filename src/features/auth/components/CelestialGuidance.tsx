export function CelestialGuidance() {
  return (
    <section
      className="hidden lg:flex lg:w-1/2 relative bg-bg border-l border-border overflow-hidden"
      data-purpose="visual-brand-column"
      aria-hidden="true"
    >
      <div className="relative w-full h-full min-h-screen flex flex-col justify-between items-center p-8 lg:p-12 overflow-hidden select-none">
        {/* Ambient radial glow */}
        <div
          className="absolute inset-0 pointer-events-none opacity-80"
          style={{
            background:
              'radial-gradient(circle at 60% 48%, rgba(157, 141, 241, 0.12) 0%, rgba(90, 79, 124, 0.05) 45%, rgba(18, 16, 25, 0.95) 75%), radial-gradient(circle at 20% 80%, rgba(90, 79, 124, 0.08) 0%, transparent 50%)',
          }}
        />

        {/* Top Header */}
        <div className="relative z-10 text-center pt-4">
          <h2 className="text-xl md:text-2xl font-bold tracking-[0.25em] text-text font-sans flex items-center justify-center gap-2">
            <span>NORTHSTAR</span>
            <span className="text-highlight">OS</span>
          </h2>
          <p className="text-[11px] uppercase tracking-[0.35em] text-text-2 font-mono mt-1">
            Celestial Guidance System
          </p>
        </div>

        {/* Center Star Chart SVG */}
        <div className="relative z-10 w-full max-w-[620px] aspect-square flex items-center justify-center my-auto">
          <svg
            viewBox="0 0 700 700"
            className="w-full h-full max-h-[580px] drop-shadow-[0_0_35px_rgba(157,141,241,0.25)]"
            role="img"
            aria-label="Celestial Guidance Star Chart"
          >
            <title>Celestial Guidance Star Chart</title>
            <defs>
              <filter id="glow-star" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              <filter id="glow-strong" x="-80%" y="-80%" width="260%" height="260%">
                <feGaussianBlur in="SourceGraphic" stdDeviation="8" result="blur" />
                <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="sharp" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="sharp" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              <radialGradient id="polaris-radial" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="var(--text)" />
                <stop offset="25%" stopColor="var(--highlight)" />
                <stop offset="60%" stopColor="var(--highlight)" stopOpacity="0.4" />
                <stop offset="100%" stopColor="var(--bg)" stopOpacity="0" />
              </radialGradient>
            </defs>

            {/* Background ambient stars */}
            <g opacity="0.55">
              <circle cx="140" cy="180" r="1" fill="var(--text-2)" opacity="0.6" />
              <circle cx="220" cy="110" r="0.8" fill="var(--text)" opacity="0.4" />
              <circle cx="310" cy="90" r="1.2" fill="var(--text-2)" opacity="0.5" />
              <circle cx="520" cy="130" r="1" fill="var(--text)" opacity="0.7" />
              <circle cx="610" cy="240" r="0.8" fill="var(--highlight)" opacity="0.6" />
              <circle cx="580" cy="520" r="1" fill="var(--text)" opacity="0.4" />
              <circle cx="480" cy="620" r="1.2" fill="var(--text-2)" opacity="0.5" />
              <circle cx="190" cy="590" r="0.9" fill="var(--text)" opacity="0.4" />
              <circle cx="110" cy="430" r="1" fill="var(--highlight)" opacity="0.6" />
              <circle cx="350" cy="640" r="0.8" fill="var(--text)" opacity="0.5" />
            </g>

            {/* Orbital ellipses */}
            <g fill="none" opacity="0.8">
              <ellipse
                cx="365"
                cy="355"
                rx="260"
                ry="185"
                stroke="var(--accent)"
                strokeWidth="1.2"
                transform="rotate(-28 365 355)"
              />
              <ellipse
                cx="365"
                cy="355"
                rx="245"
                ry="220"
                stroke="var(--accent)"
                strokeWidth="1"
                opacity="0.6"
                transform="rotate(18 365 355)"
              />
              <ellipse
                cx="365"
                cy="355"
                rx="270"
                ry="150"
                stroke="var(--highlight)"
                strokeWidth="1.4"
                opacity="0.5"
                transform="rotate(-42 365 355)"
              />
              <ellipse
                cx="395"
                cy="325"
                rx="230"
                ry="130"
                stroke="var(--accent-hover)"
                strokeDasharray="3 5"
                strokeWidth="0.8"
                opacity="0.7"
                transform="rotate(-15 395 325)"
              />
              <ellipse
                cx="350"
                cy="370"
                rx="280"
                ry="190"
                stroke="var(--border)"
                strokeWidth="1"
                transform="rotate(35 350 370)"
              />
            </g>

            {/* Constellation lines */}
            <g stroke="var(--highlight)" strokeWidth="1.6" opacity="0.85" strokeLinecap="round">
              <line x1="415" y1="245" x2="370" y2="285" />
              <line x1="370" y1="285" x2="340" y2="325" />
              <line x1="340" y1="325" x2="360" y2="375" />
              <line x1="370" y1="285" x2="360" y2="375" />
              <line
                x1="360"
                y1="375"
                x2="415"
                y2="245"
                strokeDasharray="2 4"
                strokeWidth="1"
                opacity="0.6"
              />
              <line x1="340" y1="325" x2="300" y2="415" />
              <line x1="360" y1="375" x2="345" y2="415" />
              <line x1="300" y1="415" x2="345" y2="415" />
              <line x1="300" y1="415" x2="235" y2="485" />
              <line x1="345" y1="415" x2="335" y2="455" />
              <line x1="235" y1="485" x2="335" y2="455" />
              <line x1="335" y1="455" x2="410" y2="462" />
              <line x1="415" y1="245" x2="475" y2="365" />
            </g>

            {/* Stars and Polaris Node */}
            <g>
              <circle cx="415" cy="245" r="38" fill="url(#polaris-radial)" />
              <path
                d="M415 227 L415 263 M397 245 L433 245"
                stroke="var(--text)"
                strokeWidth="1.4"
                opacity="0.95"
              />
              <circle cx="415" cy="245" r="4.5" fill="var(--text)" filter="url(#glow-strong)" />
              <circle cx="415" cy="245" r="2" fill="var(--bg)" />
              <circle cx="370" cy="285" r="3" fill="var(--highlight)" filter="url(#glow-star)" />
              <circle cx="340" cy="325" r="2.6" fill="var(--highlight)" filter="url(#glow-star)" />
              <circle cx="360" cy="375" r="2.6" fill="var(--highlight)" filter="url(#glow-star)" />
              <circle cx="300" cy="415" r="3.4" fill="var(--text)" filter="url(#glow-star)" />
              <circle cx="345" cy="415" r="3" fill="var(--highlight)" filter="url(#glow-star)" />
              <circle cx="235" cy="485" r="3.6" fill="var(--text)" filter="url(#glow-strong)" />
              <circle cx="335" cy="455" r="2.5" fill="var(--highlight)" />
              <circle cx="410" cy="462" r="2.4" fill="var(--highlight)" />
              <circle cx="475" cy="365" r="3" fill="var(--highlight)" filter="url(#glow-star)" />
            </g>

            {/* Constellation & Calibration Labels */}
            <g
              fontFamily="'IBM Plex Mono', monospace"
              fontSize="9"
              fill="var(--text)"
              letterSpacing="0.08em"
            >
              <text x="430" y="240" fontWeight="600" fill="var(--text)">
                POLARIS
              </text>
              <text x="430" y="251" fontSize="7.5" fill="var(--highlight)" letterSpacing="0.12em">
                [NORTHSTAR]
              </text>
              <g opacity="0.8">
                <line
                  x1="435"
                  y1="268"
                  x2="445"
                  y2="268"
                  stroke="var(--highlight)"
                  strokeWidth="0.8"
                />
                <circle cx="435" cy="268" r="1.2" fill="var(--highlight)" />
                <text x="450" y="270" fontSize="7" fill="var(--highlight)">
                  DIRECTION OF NORTH
                </text>
                <text x="450" y="281" fontSize="6.5" fill="var(--text-2)" letterSpacing="0.1em">
                  CALIBRATION: 08M.RESEC
                </text>
              </g>
              <text x="392" y="295" fontSize="7.5" fill="var(--text-2)">
                KOCHAB
              </text>
              <text x="306" y="324" fontSize="7.5" fill="var(--text-2)">
                YILDUN
              </text>
              <text x="368" y="360" fontSize="7.5" fill="var(--text-2)">
                YILDUN
              </text>
              <text x="262" y="418" fontSize="8" fill="var(--text-2)">
                KOCHAB
              </text>
              <text x="352" y="418" fontSize="7.5" fill="var(--text-2)">
                PHERKAD
              </text>
              <text x="240" y="500" fontSize="8" fill="var(--highlight)">
                YILDUN
              </text>
              <text x="483" y="368" fontSize="7.5" fill="var(--text-2)">
                YILDUN
              </text>
            </g>
          </svg>
        </div>

        {/* Bottom Coordinates */}
        <div className="relative z-10 text-center pb-2">
          <p className="font-mono text-[11px] text-text-2 tracking-[0.2em] uppercase">
            RA: 14h 51m 11.6s | DEC: +74° 09' 18"
          </p>
        </div>
      </div>
    </section>
  );
}
