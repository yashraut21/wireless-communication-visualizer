import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { PolarPlot } from '../../components/charts/PolarPlot';
import { ParameterSlider, ParameterPanel, InfoCallout } from '../../components/interactive/ParameterPanel';
import { EquationCard, Equation } from '../../components/math/Equation';
import { linearArrayFactor, generatePolarData, gainDbi } from '../../utils/antenna-math';
import { PI } from '../../utils/constants';

/** Combined element × array pattern */
function arrayPattern(theta, N, dOverLambda, steeringDeg) {
  const betaRad = -2 * PI * dOverLambda * Math.cos((steeringDeg * PI) / 180);
  const AF = linearArrayFactor(theta, N, dOverLambda, betaRad);
  // Element pattern = half-wave dipole-like (sin^1.5 approximation)
  const elem = Math.pow(Math.abs(Math.sin(theta)), 1.5);
  return AF * elem;
}

/** Visual antenna element diagram */
function ArrayDiagram({ N, steeringDeg, color = '#8b5cf6' }) {
  const width = 320;
  const height = 120;
  const spacing = width / (N + 1);
  const arrowAngle = (steeringDeg * PI) / 180;

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="w-full max-w-sm">
      {/* Ground plane */}
      <rect x={0} y={height - 20} width={width} height={3}
            fill="oklch(1 0 0 / 0.15)" rx={2} />

      {Array.from({ length: N }, (_, i) => {
        const x = (i + 1) * spacing;
        const phaseDelay = (i * (steeringDeg / 90)) / N;
        const pulseOffset = (i * 20) % 60;

        return (
          <g key={i}>
            {/* Antenna element */}
            <line x1={x} y1={height - 20} x2={x} y2={20}
                  stroke={color} strokeWidth={2.5} strokeLinecap="round" />
            {/* Phase shift indicator */}
            <circle cx={x} cy={height - 28} r={5}
                    fill={`color-mix(in oklch, ${color} ${30 + i * 10}%, transparent)`}
                    stroke={color} strokeWidth={1} />
            <text x={x} y={height - 4} textAnchor="middle"
                  fill="oklch(1 0 0 / 0.4)" fontSize={8} fontFamily="var(--font-mono)">
              {i + 1}
            </text>
          </g>
        );
      })}

      {/* Beam direction arrow */}
      <g transform={`translate(${width / 2}, 15)`}>
        <line
          x1={0} y1={0}
          x2={Math.sin(arrowAngle) * 50}
          y2={-Math.cos(arrowAngle) * 50}
          stroke="var(--color-accent-amber)" strokeWidth={2}
          markerEnd="url(#arrow)" />
        <text x={Math.sin(arrowAngle) * 58} y={-Math.cos(arrowAngle) * 58}
              textAnchor="middle" fill="var(--color-accent-amber)" fontSize={10}>
          {steeringDeg}°
        </text>
      </g>
      <defs>
        <marker id="arrow" markerWidth={8} markerHeight={8} refX={4} refY={2} orient="auto">
          <polygon points="0 0, 8 2, 0 4" fill="var(--color-accent-amber)" />
        </marker>
      </defs>
    </svg>
  );
}

export default function Beamforming() {
  const [N, setN] = useState(8);
  const [dOverLambda, setDOverLambda] = useState(0.5);
  const [steeringDeg, setSteeringDeg] = useState(0);

  const patternData = useMemo(() => [{
    data: generatePolarData((theta) => arrayPattern(theta, N, dOverLambda, steeringDeg), 720),
    color: '#8b5cf6',
    label: `N=${N}, d=${dOverLambda}λ, steer=${steeringDeg}°`,
  }], [N, dOverLambda, steeringDeg]);

  const noSteerData = useMemo(() => [{
    data: generatePolarData((theta) => arrayPattern(theta, N, dOverLambda, 0), 720),
    color: '#3b82f600',
    label: '',
  }], [N, dOverLambda]);

  const arrayGainDbi = (10 * Math.log10(N) + 2.15).toFixed(1);
  const gslDiff = (10 * Math.log10(N)).toFixed(1);

  return (
    <div className="section-container py-10">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-2 mb-2">
          <div className="w-2 h-2 rounded-full" style={{ background: '#8b5cf6' }} />
          <span className="text-sm font-medium" style={{ color: '#8b5cf6' }}>2.3 · Antennas</span>
        </div>
        <h1 className="mb-3">Beamforming & Array Factor</h1>
        <p className="text-lg mb-8 max-w-2xl" style={{ color: 'var(--color-text-secondary)' }}>
          Combine multiple antenna elements and control their phase to steer a high-gain beam
          without moving any hardware. This is the basis of 5G massive MIMO.
        </p>

        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          {/* Controls */}
          <div className="space-y-4">
            <ParameterPanel title="Array Parameters">
              <ParameterSlider label="Elements (N)" value={N} min={2} max={16} step={1}
                onChange={setN} color="#8b5cf6" formatValue={(v) => `${v} elements`} 
                description="More elements create a narrower, sharper beam with much higher gain." />
              <ParameterSlider label="Spacing (d/λ)" value={dOverLambda} min={0.25} max={1.0} step={0.05}
                onChange={setDOverLambda} color="#06b6d4" formatValue={(v) => `${v.toFixed(2)}λ`} 
                description="The physical distance between antennas. Increasing spacing past 0.5λ creates unwanted 'grating lobes' that waste energy in the wrong directions." />
              <ParameterSlider label="Steering Angle" value={steeringDeg} min={-60} max={60} step={5}
                onChange={setSteeringDeg} unit="°" color="var(--color-accent-amber)" 
                description="By applying specific phase shifts to each antenna element, we can electronically 'steer' the beam without moving any physical parts!" />
            </ParameterPanel>

            <div className="glass-card p-5">
              <h4 className="text-sm font-semibold mb-3" style={{ color: '#8b5cf6' }}>Array Performance</h4>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span style={{ color: 'var(--color-text-secondary)' }}>Array Gain</span>
                  <span className="font-mono font-bold" style={{ color: '#8b5cf6' }}>{arrayGainDbi} dBi</span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: 'var(--color-text-secondary)' }}>Gain over single</span>
                  <span className="font-mono font-bold" style={{ color: 'var(--color-accent-teal)' }}>+{gslDiff} dB</span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: 'var(--color-text-secondary)' }}>Steering</span>
                  <span className="font-mono font-bold" style={{ color: 'var(--color-accent-amber)' }}>{steeringDeg}°</span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: 'var(--color-text-secondary)' }}>Phase shift/elem</span>
                  <span className="font-mono font-bold" style={{ color: 'var(--color-text-primary)' }}>
                    {(360 * dOverLambda * Math.cos((steeringDeg * PI) / 180)).toFixed(1)}°
                  </span>
                </div>
              </div>
            </div>

            {/* Array diagram */}
            <div className="glass-card p-4">
              <div className="text-sm font-semibold mb-3" style={{ color: 'var(--color-text-secondary)' }}>
                Array Configuration
              </div>
              <div className="flex justify-center overflow-hidden">
                <ArrayDiagram N={Math.min(N, 8)} steeringDeg={steeringDeg} />
              </div>
            </div>
          </div>

          {/* Polar plot */}
          <div className="lg:col-span-2 glass-card p-6">
            <div className="text-sm font-semibold mb-4" style={{ color: 'var(--color-text-secondary)' }}>
              Array Radiation Pattern — Drag slider to steer beam
            </div>
            <div className="flex justify-center">
              <PolarPlot multiSeries={patternData} size={420} />
            </div>
          </div>
        </div>

        {/* Grating lobes warning */}
        {dOverLambda > 0.5 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <InfoCallout type="warning" title="Grating Lobes Appearing!">
              When d/λ {'>'} 0.5, grating lobes appear — unwanted high-gain lobes in other directions.
              The standard half-wavelength spacing (d = λ/2) prevents this.
            </InfoCallout>
          </motion.div>
        )}

        <div className="grid md:grid-cols-2 gap-4 mb-6 mt-6">
          <EquationCard title="Array Factor (N elements)" math="AF(\theta) = \frac{\sin(N\psi/2)}{N\sin(\psi/2)}" description="ψ = (2π/λ)·d·cos θ + β, where β is the inter-element phase shift for steering." />
          <EquationCard title="Beam Steering Phase" math="\beta = -\frac{2\pi}{\lambda} d \cos\theta_0" description="Apply this phase shift between each element to steer the main beam to angle θ₀." />
        </div>

        <InfoCallout type="tip" title="Massive MIMO in 5G">
          5G base stations use 64, 128, or even 256 antenna elements. With N=64, the array gain is
          10·log₁₀(64) ≈ 18 dB over a single antenna — equivalent to 64× more transmit power —
          while electronically steering beams to individual users.
        </InfoCallout>
      </motion.div>
    </div>
  );
}
