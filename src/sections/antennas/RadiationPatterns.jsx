import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { PolarPlot } from '../../components/charts/PolarPlot';
import { ParameterSlider, ParameterPanel, ToggleGroup, InfoCallout } from '../../components/interactive/ParameterPanel';
import { EquationCard, Equation } from '../../components/math/Equation';
import {
  shortDipolePattern, halfWaveDipolePattern, directionalPattern,
  generatePolarData, gainDbi, hpbwDeg
} from '../../utils/antenna-math';
import { PI } from '../../utils/constants';

export default function RadiationPatterns() {
  const [directivity, setDirectivity] = useState(3);
  const [showBack, setShowBack] = useState(true);
  const [view, setView] = useState('linear'); // 'linear' | 'db'

  const cosN = directivity;
  const gainDbiVal = gainDbi(cosN);
  const hpbwVal = hpbwDeg(cosN);

  const mainLobeData = useMemo(() => generatePolarData(
    (theta) => directionalPattern(theta, cosN), 360
  ), [cosN]);

  const backLobeData = useMemo(() => {
    if (!showBack) return [];
    return generatePolarData(
      (theta) => directionalPattern(PI - theta, cosN) * 0.05, 360
    );
  }, [cosN, showBack]);

  // dB conversion for display
  const toDbData = (pts) => pts.map(p => ({
    ...p,
    r: p.r > 0 ? Math.max(0, (20 * Math.log10(p.r) + 30) / 30) : 0
  }));

  const displayMain = view === 'db' ? toDbData(mainLobeData) : mainLobeData;

  const series = [
    { data: displayMain, color: '#8b5cf6', label: `cos^${cosN}(θ) — ${gainDbiVal.toFixed(1)} dBi` },
    { data: view === 'db' ? toDbData(generatePolarData(halfWaveDipolePattern, 360)) : generatePolarData(halfWaveDipolePattern, 360), color: '#3b82f6', label: 'Half-wave dipole — 2.15 dBi' },
  ];

  return (
    <div className="section-container py-10">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-2 mb-2">
          <div className="w-2 h-2 rounded-full" style={{ background: '#06b6d4' }} />
          <span className="text-sm font-medium" style={{ color: '#06b6d4' }}>2.2 · Antennas</span>
        </div>
        <h1 className="mb-3">Radiation Patterns</h1>
        <p className="text-lg mb-8 max-w-2xl" style={{ color: 'var(--color-text-secondary)' }}>
          A radiation pattern shows how antenna power is distributed in space.
          Increase directivity to concentrate energy into a narrower beam — and watch gain increase.
        </p>

        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          {/* Polar plot */}
          <div className="lg:col-span-2 glass-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold" style={{ color: 'var(--color-text-secondary)' }}>
                E-Plane Radiation Pattern
              </h3>
              <ToggleGroup
                options={[{ value: 'linear', label: 'Linear' }, { value: 'db', label: 'dB' }]}
                value={view}
                onChange={setView}
              />
            </div>
            <div className="flex justify-center">
              <PolarPlot multiSeries={series} size={380} dBScale={view === 'db'} />
            </div>
          </div>

          {/* Controls & readouts */}
          <div className="space-y-4">
            <ParameterPanel title="Pattern Controls">
              <ParameterSlider
                label="Directivity Power (n)"
                value={cosN}
                min={1}
                max={15}
                step={0.5}
                onChange={setDirectivity}
                color="#8b5cf6"
                formatValue={(v) => `cos^${v.toFixed(1)}(θ)`}
                description="Increasing directivity narrows the radiation beam, concentrating the transmitted energy in one specific direction (higher gain). It's like focusing a flashlight beam."
              />
              <div className="flex items-center justify-between mt-2">
                <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Show back lobe</span>
                <button
                  onClick={() => setShowBack(!showBack)}
                  className="w-12 h-6 rounded-full transition-colors cursor-pointer border-none"
                  style={{ background: showBack ? 'var(--color-accent-teal)' : 'var(--color-bg-tertiary)' }}>
                  <div className={`w-4 h-4 rounded-full bg-white transition-transform mx-1 ${showBack ? 'translate-x-6' : 'translate-x-0'}`} />
                </button>
              </div>
            </ParameterPanel>

            <div className="glass-card p-5">
              <h4 className="text-sm font-semibold mb-3" style={{ color: '#8b5cf6' }}>Calculated Values</h4>
              <div className="space-y-3">
                {[
                  { label: 'Max Gain', value: `${gainDbiVal.toFixed(1)} dBi`, color: 'var(--color-accent-violet)' },
                  { label: 'HPBW', value: `${hpbwVal.toFixed(1)}°`, color: 'var(--color-accent-amber)' },
                  { label: 'vs. Dipole', value: `+${(gainDbiVal - 2.15).toFixed(1)} dB`, color: 'var(--color-accent-teal)' },
                ].map((item) => (
                  <div key={item.label} className="flex justify-between text-sm">
                    <span style={{ color: 'var(--color-text-secondary)' }}>{item.label}</span>
                    <span className="font-mono font-bold" style={{ color: item.color }}>{item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* HPBW visual */}
            <div className="glass-card p-5">
              <h4 className="text-sm font-semibold mb-3" style={{ color: 'var(--color-text-secondary)' }}>
                Beamwidth vs Gain Trade-off
              </h4>
              <div className="space-y-2">
                {[1, 3, 7, 15].map((n) => {
                  const g = gainDbi(n);
                  const bw = hpbwDeg(n);
                  const active = Math.round(cosN) === n;
                  return (
                    <div key={n} className={`flex items-center gap-2 text-xs p-2 rounded-lg transition-colors ${active ? 'ring-1' : ''}`}
                         style={{
                           background: active ? `color-mix(in oklch, #8b5cf6 10%, var(--color-bg-tertiary))` : 'transparent',
                           ringColor: '#8b5cf6'
                         }}>
                      <span className="w-10 font-mono" style={{ color: 'var(--color-text-tertiary)' }}>n={n}</span>
                      <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: 'var(--color-bg-primary)' }}>
                        <div className="h-full rounded-full" style={{ width: `${(g / 15) * 100}%`, background: '#8b5cf6' }} />
                      </div>
                      <span className="w-14 text-right" style={{ color: '#8b5cf6' }}>{g.toFixed(1)} dBi</span>
                      <span className="w-10 text-right" style={{ color: 'var(--color-accent-amber)' }}>{bw.toFixed(0)}°</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <EquationCard title="Half-Power Beamwidth" math="\text{HPBW} = 2\arccos\!\left(0.5^{1/(2n)}\right)" description="Angle between -3 dB points of the main lobe. Narrower = more directive." />
          <EquationCard title="Front-to-Back Ratio" math="\text{FBR} = \frac{U_{\max}}{U_{180°}}" description="Ratio of power in main lobe vs. back direction. Critical for interference rejection." />
        </div>

        <InfoCallout type="aha" title="The Gain–Beamwidth Inverse Relationship">
          Gain × HPBW² ≈ constant (≈ 41,253 deg²). Doubling the gain roughly halves the beamwidth area.
          This is the fundamental constraint of antenna design — you can't increase gain without narrowing the beam.
        </InfoCallout>
      </motion.div>
    </div>
  );
}
