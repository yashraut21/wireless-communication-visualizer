import { useMemo, useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';

/**
 * Reusable polar plot for radiation patterns.
 * data: Array of {angle, r} where angle is in radians [0, 2π] and r ∈ [0, 1]
 * multiSeries: Array of {data, color, label} for overlaid patterns
 */
export function PolarPlot({
  data = [],
  multiSeries = [],
  size: propSize,
  title = '',
  labels = [],
  dBScale = false,
  className = '',
}) {
  const containerRef = useRef(null);
  const [containerWidth, setContainerWidth] = useState(propSize || 320);

  useEffect(() => {
    if (!propSize && containerRef.current) {
      const obs = new ResizeObserver((entries) => {
        setContainerWidth(Math.min(entries[0].contentRect.width, 480));
      });
      obs.observe(containerRef.current);
      return () => obs.disconnect();
    }
  }, [propSize]);

  const size = propSize || containerWidth;
  const cx = size / 2;
  const cy = size / 2;
  const R = size * 0.38; // plot radius

  // Rings at 25%, 50%, 75%, 100%
  const rings = [0.25, 0.5, 0.75, 1.0];

  // Convert polar {angle, r} → SVG {x, y}
  const polarToXY = (angle, r) => ({
    x: cx + R * r * Math.cos(angle - Math.PI / 2),
    y: cy + R * r * Math.sin(angle - Math.PI / 2),
  });

  const makePath = (points) => {
    if (points.length === 0) return '';
    const first = polarToXY(points[0].angle, points[0].r);
    const parts = [`M ${first.x} ${first.y}`];
    for (let i = 1; i < points.length; i++) {
      const p = polarToXY(points[i].angle, points[i].r);
      parts.push(`L ${p.x} ${p.y}`);
    }
    parts.push('Z');
    return parts.join(' ');
  };

  const seriesList = multiSeries.length > 0 ? multiSeries : data.length > 0 ? [{ data, color: '#14b8a6' }] : [];

  // Cardinal direction labels
  const cardinals = [
    { angle: 0, label: '0°' },
    { angle: Math.PI / 2, label: '90°' },
    { angle: Math.PI, label: '180°' },
    { angle: (3 * Math.PI) / 2, label: '270°' },
  ];

  return (
    <div ref={containerRef} className={`relative ${className}`} style={{ width: propSize || '100%' }}>
      {title && (
        <div className="text-sm font-semibold text-center mb-2" style={{ color: 'var(--color-text-secondary)' }}>
          {title}
        </div>
      )}
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Background */}
        <circle cx={cx} cy={cy} r={R + 4} fill="oklch(0 0 0 / 0.15)" />

        {/* Concentric rings */}
        {rings.map((r) => (
          <circle key={r} cx={cx} cy={cy} r={R * r} fill="none"
            stroke="oklch(1 0 0 / 0.08)" strokeWidth={1} strokeDasharray={r < 1 ? '3,4' : undefined} />
        ))}

        {/* Ring labels (dB or linear) */}
        {[0.25, 0.5, 0.75].map((r) => (
          <text key={r} x={cx + 4} y={cy - R * r - 2} fill="oklch(1 0 0 / 0.35)"
            fontSize={9} fontFamily="var(--font-mono)">
            {dBScale ? `${Math.round(20 * Math.log10(r))} dB` : `${Math.round(r * 100)}%`}
          </text>
        ))}

        {/* Angle spokes (every 30°) */}
        {Array.from({ length: 12 }, (_, i) => {
          const angle = (i / 12) * 2 * Math.PI;
          const inner = polarToXY(angle, 0.08);
          const outer = polarToXY(angle, 1);
          return (
            <line key={i} x1={inner.x} y1={inner.y} x2={outer.x} y2={outer.y}
              stroke="oklch(1 0 0 / 0.06)" strokeWidth={1} />
          );
        })}

        {/* Cardinal labels */}
        {cardinals.map(({ angle, label }) => {
          const pos = polarToXY(angle, 1.15);
          return (
            <text key={label} x={pos.x} y={pos.y} textAnchor="middle" dominantBaseline="middle"
              fill="oklch(1 0 0 / 0.4)" fontSize={10} fontFamily="var(--font-sans)">
              {label}
            </text>
          );
        })}

        {/* Custom labels */}
        {labels.map(({ angle, label, color }, i) => {
          const pos = polarToXY(angle, 1.25);
          return (
            <text key={i} x={pos.x} y={pos.y} textAnchor="middle" dominantBaseline="middle"
              fill={color || 'var(--color-accent-amber)'} fontSize={10} fontFamily="var(--font-sans)">
              {label}
            </text>
          );
        })}

        {/* Pattern fills (translucent) */}
        {seriesList.map((series, i) => (
          <path key={`fill-${i}`} d={makePath(series.data)}
            fill={series.color || '#14b8a6'} fillOpacity={0.08} />
        ))}

        {/* Pattern strokes */}
        {seriesList.map((series, i) => (
          <path key={`stroke-${i}`} d={makePath(series.data)}
            fill="none" stroke={series.color || '#14b8a6'} strokeWidth={2}
            strokeLinecap="round" strokeLinejoin="round" />
        ))}

        {/* Origin dot */}
        <circle cx={cx} cy={cy} r={3} fill="oklch(1 0 0 / 0.3)" />

        {/* Legend */}
        {seriesList.length > 1 && (
          <g transform={`translate(8, ${size - 8 - seriesList.length * 18})`}>
            {seriesList.map((series, i) => (
              <g key={i} transform={`translate(0, ${i * 18})`}>
                <line x1={0} x2={16} y1={0} y2={0} stroke={series.color} strokeWidth={2} />
                <text x={20} y={4} fill="oklch(1 0 0 / 0.6)" fontSize={10} fontFamily="var(--font-sans)">
                  {series.label}
                </text>
              </g>
            ))}
          </g>
        )}
      </svg>
    </div>
  );
}
