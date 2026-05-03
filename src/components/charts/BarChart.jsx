import { useMemo, useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';

export function BarChart({
  data,
  width: propWidth,
  height = 300,
  xLabel = '',
  yLabel = '',
  xDomain,
  yDomain,
  color = 'var(--color-accent-teal)',
  className = '',
  barWidth = 4,
}) {
  const containerRef = useRef(null);
  const [containerWidth, setContainerWidth] = useState(propWidth || 600);

  useEffect(() => {
    if (!propWidth && containerRef.current) {
      const observer = new ResizeObserver((entries) => {
        for (const entry of entries) {
          setContainerWidth(entry.contentRect.width);
        }
      });
      observer.observe(containerRef.current);
      return () => observer.disconnect();
    }
  }, [propWidth]);

  const width = propWidth || containerWidth;
  const margin = { top: 20, right: 30, bottom: 50, left: 60 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  const { xScaleFn, yScaleFn, bars } = useMemo(() => {
    if (innerWidth <= 0 || innerHeight <= 0 || !data || data.length === 0) return { bars: [] };

    // x is usually time or delay
    const xScaleFn = d3.scaleLinear()
      .domain(xDomain || [0, d3.max(data, d => d.x) * 1.1])
      .range([0, innerWidth]);

    // y is usually power
    const yScaleFn = d3.scaleLinear()
      .domain(yDomain || [0, d3.max(data, d => d.y) * 1.1])
      .range([innerHeight, 0])
      .nice();

    const bars = data.map(d => ({
      x: xScaleFn(d.x),
      y: yScaleFn(d.y),
      height: innerHeight - yScaleFn(d.y),
      color: d.color || color,
      label: d.label
    }));

    return { xScaleFn, yScaleFn, bars };
  }, [data, innerWidth, innerHeight, xDomain, yDomain, color]);

  if (innerWidth <= 0 || innerHeight <= 0) {
    return <div ref={containerRef} className={className} style={{ width: '100%', height }} />;
  }

  const xTicks = xScaleFn?.ticks?.(6) || [];
  const yTicks = yScaleFn?.ticks?.(6) || [];

  return (
    <div ref={containerRef} className={`relative ${className}`} style={{ width: propWidth || '100%' }}>
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        <g transform={`translate(${margin.left},${margin.top})`}>
          {/* Grid */}
          <g>
            {yTicks.map((tick, i) => (
              <line
                key={`yg-${i}`}
                x1={0} x2={innerWidth}
                y1={yScaleFn(tick)} y2={yScaleFn(tick)}
                stroke="oklch(1 0 0 / 0.06)"
                strokeDasharray="4,4"
              />
            ))}
          </g>

          {/* Bars */}
          {bars.map((bar, i) => (
            <g key={`bar-${i}`}>
              <rect
                x={bar.x - barWidth / 2}
                y={bar.y}
                width={barWidth}
                height={bar.height}
                fill={bar.color}
                rx={1}
              />
              {bar.label && (
                <text
                  x={bar.x}
                  y={bar.y - 5}
                  textAnchor="middle"
                  fill="var(--color-text-secondary)"
                  fontSize={10}
                  fontFamily="var(--font-sans)"
                >
                  {bar.label}
                </text>
              )}
            </g>
          ))}

          {/* X Axis */}
          <g transform={`translate(0,${innerHeight})`}>
            <line x1={0} x2={innerWidth} y1={0} y2={0} stroke="oklch(1 0 0 / 0.15)" />
            {xTicks.map((tick, i) => (
              <g key={`xt-${i}`} transform={`translate(${xScaleFn(tick)},0)`}>
                <line y1={0} y2={6} stroke="oklch(1 0 0 / 0.15)" />
                <text
                  y={20} textAnchor="middle"
                  fill="var(--color-text-tertiary)"
                  fontSize={11}
                  fontFamily="var(--font-sans)"
                >
                  {d3.format('.4~g')(tick)}
                </text>
              </g>
            ))}
            <text
              x={innerWidth / 2} y={42}
              textAnchor="middle"
              fill="var(--color-text-secondary)"
              fontSize={12}
              fontFamily="var(--font-sans)"
            >
              {xLabel}
            </text>
          </g>

          {/* Y Axis */}
          <g>
            <line x1={0} x2={0} y1={0} y2={innerHeight} stroke="oklch(1 0 0 / 0.15)" />
            {yTicks.map((tick, i) => (
              <g key={`yt-${i}`} transform={`translate(0,${yScaleFn(tick)})`}>
                <line x1={-6} x2={0} stroke="oklch(1 0 0 / 0.15)" />
                <text
                  x={-10} textAnchor="end" dominantBaseline="middle"
                  fill="var(--color-text-tertiary)"
                  fontSize={11}
                  fontFamily="var(--font-sans)"
                >
                  {d3.format('.4~g')(tick)}
                </text>
              </g>
            ))}
            <text
              transform={`translate(-45,${innerHeight / 2}) rotate(-90)`}
              textAnchor="middle"
              fill="var(--color-text-secondary)"
              fontSize={12}
              fontFamily="var(--font-sans)"
            >
              {yLabel}
            </text>
          </g>
        </g>
      </svg>
    </div>
  );
}
