/*
 * The cryon mark: a faceted ice crystal.
 *
 * Drawn as six facets over a dimmed silhouette so the shape stays legible at
 * 16px and still reads as a cut gem at 64px. Everything is `currentColor`, so
 * the mark inherits whatever text colour the surrounding theme sets.
 */

export function Cryon({ className = '' }) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* silhouette */}
      <path
        d="M12 1.2 L18.8 8.6 L16.8 16.4 L12 22.8 L7.2 16.4 L5.2 8.6 Z"
        fill="currentColor"
        opacity="0.22"
      />
      {/* crown */}
      <path d="M12 1.2 L18.8 8.6 L12 8.6 Z" fill="currentColor" opacity="1" />
      <path d="M12 1.2 L5.2 8.6 L12 8.6 Z" fill="currentColor" opacity="0.5" />
      {/* pavilion */}
      <path
        d="M12 8.6 L18.8 8.6 L16.8 16.4 L12 16.4 Z"
        fill="currentColor"
        opacity="0.75"
      />
      <path
        d="M12 8.6 L5.2 8.6 L7.2 16.4 L12 16.4 Z"
        fill="currentColor"
        opacity="0.34"
      />
      {/* point */}
      <path
        d="M12 16.4 L16.8 16.4 L12 22.8 Z"
        fill="currentColor"
        opacity="0.62"
      />
      <path
        d="M12 16.4 L7.2 16.4 L12 22.8 Z"
        fill="currentColor"
        opacity="0.3"
      />
    </svg>
  );
}

/*
 * Frost: angular shards drifting across the mark. Replaces the upstream wind
 * strokes — same `wind` keyframe, so the hover animation in CryonLogo is
 * unchanged. Each shard is a tiny copy of the crystal so the motion reads as
 * ice rather than rain.
 */

const SHARD = 'M6 0.6 L9.4 4.3 L8.4 8.2 L6 11.4 L3.6 8.2 L2.6 4.3 Z';
const SHARD_SM = 'M3 0.3 L4.7 2.15 L4.2 4.1 L3 5.7 L1.8 4.1 L1.3 2.15 Z';

const SHARDS = [
  { x: 4, y: 8, s: 1.0, d: '0s', o: 0.5 },
  { x: 30, y: 0, s: 0.7, d: '-0.45s', o: 0.35 },
  { x: 54, y: 14, s: 1.2, d: '-0.9s', o: 0.6 },
  { x: 22, y: 30, s: 0.85, d: '-1.3s', o: 0.4 },
  { x: 68, y: 34, s: 0.6, d: '-0.2s', o: 0.3 },
  { x: 44, y: 52, s: 1.05, d: '-1.05s', o: 0.55 },
  { x: 80, y: 16, s: 0.75, d: '-1.5s', o: 0.45 },
  { x: 12, y: 58, s: 0.9, d: '-0.7s', o: 0.5 },
  { x: 62, y: 70, s: 0.65, d: '-1.2s', o: 0.35 },
  { x: 34, y: 80, s: 1.0, d: '-0.55s', o: 0.45 },
];

export function Rain({ className = '' }) {
  return (
    <svg
      width="103"
      height="103"
      viewBox="0 0 103 103"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <g id="frost">
        {SHARDS.map((sh, i) => (
          <g
            key={i}
            className="animate-[wind_2s_linear_infinite]"
            style={{ animationDelay: sh.d }}
          >
            <g transform={`translate(${sh.x} ${sh.y}) scale(${sh.s})`} opacity={sh.o}>
              <path d={sh.s < 0.8 ? SHARD_SM : SHARD} fill="currentColor" />
            </g>
          </g>
        ))}
      </g>
    </svg>
  );
}
