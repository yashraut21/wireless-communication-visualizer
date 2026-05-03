import { useMemo, useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';

export function LineChart({
  data,
  width: propWidth,
  height = 300,
  xLabel = '',
  yLabel = '',
  xDomain,
  yDomain,
  xScale: xScaleType = 'linear',
  yScale: yScaleType = 'linear',
  color = 'var(--color-accent-teal)',
  strokeWidth = 2,
  showGrid = true,
  showDots = false,
  markers = [],
  className = '',
  annotations = [],
  multiLine = false,
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

  const { xScaleFn, yScaleFn, pathD, lines } = useMemo(() => {
    if (innerWidth <= 0 || innerHeight <= 0) return { pathD: '', lines: [] };

    const allData = multiLine ? data.flatMap((d) => d.data) : data;

    const xScaleFn = (xScaleType === 'log' ? d3.scaleLog() : d3.scaleLinear())
      .domain(xDomain || d3.extent(allData, (d) => d.x))
      .range([0, innerWidth])
      .nice();

    const yScaleFn = (yScaleType === 'log' ? d3.scaleLog() : d3.scaleLinear())
      .domain(yDomain || d3.extent(allData, (d) => d.y))
      .range([innerHeight, 0])
      .nice();

    const lineGen = d3.line()
      .x((d) => xScaleFn(d.x))
      .y((d) => yScaleFn(d.y))
      .curve(d3.curveMonotoneX);

    if (multiLine) {
      return {
        xScaleFn,
        yScaleFn,
        pathD: '',
        lines: data.map((series) => ({
          ...series,
          path: lineGen(series.data.filter((d) => d.x > 0 && d.y > 0 || xScaleType !== 'log')),
        })),
      };
    }

    const filtered = xScaleType === 'log'
      ? data.filter((d) => d.x > 0 && d.y > 0)
      : data;

    return {
      xScaleFn,
      yScaleFn,
      pathD: lineGen(filtered),
      lines: [],
    };
  }, [data, innerWidth, innerHeight, xDomain, yDomain, xScaleType, yScaleType, multiLine]);

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
          {showGrid && (
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
              {xTicks.map((tick, i) => (
                <line
                  key={`xg-${i}`}
                  x1={xScaleFn(tick)} x2={xScaleFn(tick)}
                  y1={0} y2={innerHeight}
                  stroke="oklch(1 0 0 / 0.06)"
                  strokeDasharray="4,4"
                />
              ))}
            </g>
          )}

          {/* Lines */}
          {multiLine ? (
            lines.map((series, i) => (
              <path
                key={i}
                d={series.path}
                fill="none"
                stroke={series.color || color}
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            ))
          ) : (
            <path
              d={pathD}
              fill="none"
              stroke={color}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Dots */}
          {showDots && !multiLine && data.map((d, i) => (
            <circle
              key={i}
              cx={xScaleFn(d.x)}
              cy={yScaleFn(d.y)}
              r={3}
              fill={color}
            />
          ))}

          {/* Markers */}
          {markers.map((m, i) => (
            <g key={`marker-${i}`}>
              <line
                x1={xScaleFn(m.x)} x2={xScaleFn(m.x)}
                y1={0} y2={innerHeight}
                stroke={m.color || 'var(--color-accent-amber)'}
                strokeWidth={1.5}
                strokeDasharray="6,4"
              />
              <text
                x={xScaleFn(m.x) + 4}
                y={12}
                fill={m.color || 'var(--color-accent-amber)'}
                fontSize={11}
                fontFamily="var(--font-sans)"
              >
                {m.label}
              </text>
            </g>
          ))}

          {/* Annotations */}
          {annotations.map((a, i) => (
            <text
              key={`ann-${i}`}
              x={xScaleFn(a.x)}
              y={yScaleFn(a.y) - 10}
              fill={a.color || 'var(--color-text-secondary)'}
              fontSize={11}
              textAnchor="middle"
              fontFamily="var(--font-sans)"
            >
              {a.label}
            </text>
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
                  {xScaleType === 'log' ? d3.format('.0e')(tick) : d3.format('.4~g')(tick)}
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
                  {yScaleType === 'log' ? d3.format('.0e')(tick) : d3.format('.4~g')(tick)}
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

          {/* Legend for multi-line */}
          {multiLine && lines.length > 0 && (
            <g transform={`translate(${innerWidth - 120}, 10)`}>
              {lines.map((series, i) => (
                <g key={i} transform={`translate(0, ${i * 20})`}>
                  <line x1={0} x2={20} y1={0} y2={0}
                        stroke={series.color || color} strokeWidth={2} />
                  <text x={26} y={4} fill="var(--color-text-secondary)"
                        fontSize={11} fontFamily="var(--font-sans)">
                    {series.label}
                  </text>
                </g>
              ))}
            </g>
          )}
        </g>
      </svg>
    </div>
  );
}
