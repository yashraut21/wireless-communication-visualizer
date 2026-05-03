import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ParameterSlider, ParameterPanel, InfoCallout } from '../../components/interactive/ParameterPanel';
import { EquationCard } from '../../components/math/Equation';
import { wavelength } from '../../utils/wireless-math';
import { PI } from '../../utils/constants';

/* Rayleigh roughness criterion: h_rms < λ/(8·cos θ_i) → smooth */
function isSmooth(hrmsM, lambdaM, thetaDeg) {
  const thetaRad = (thetaDeg * PI) / 180;
  const threshold = lambdaM / (8 * Math.cos(thetaRad));
  return hrmsM < threshold;
}

function roughnessCriterionM(lambdaM, thetaDeg) {
  const thetaRad = (thetaDeg * PI) / 180;
  return lambdaM / (8 * Math.cos(thetaRad));
}

/* Scattering coefficient (rough surface directional scattering) */
function scatterLoss(hrmsM, lambdaM, thetaDeg) {
  const thetaRad = (thetaDeg * PI) / 180;
  const sigma = (4 * PI * hrmsM * Math.cos(thetaRad)) / lambdaM;
  return Math.exp(-(sigma * sigma));
}

/** Roughness scene */
function RoughnessScene({ hrms, lambda, thetaDeg, smooth }) {
  const W = 520;
  const H = 280;
  const SURFACE_Y = 190;

  // Generate rough surface
  const N_POINTS = 80;
  const surfacePoints = useMemo(() => {
    const pts = [];
    for (let i = 0; i <= N_POINTS; i++) {
      const x = (i / N_POINTS) * W;
      // Simple noise approximation
      const noise = hrms * 3 * (
        Math.sin((i / N_POINTS) * 11 * PI) * 0.4 +
        Math.sin((i / N_POINTS) * 23 * PI) * 0.3 +
        Math.sin((i / N_POINTS) * 7 * PI) * 0.3
      );
      const scale = Math.min(40, hrms * 60);
      pts.push([x, SURFACE_Y + noise * scale]);
    }
    return pts;
  }, [hrms]);

  const pathStr = surfacePoints.map(([x, y], i) => `${i === 0 ? 'M' : 'L'} ${x} ${y}`).join(' ');

  const theta = (thetaDeg * PI) / 180;
  const incLen = 120;
  const refLen = 100;
  const incX = W / 2 - Math.sin(theta) * incLen;
  const incY = SURFACE_Y - Math.cos(theta) * incLen;

  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} className="w-full">
      {/* Rough surface fill */}
      <path d={`${pathStr} L ${W} ${H} L 0 ${H} Z`} fill="oklch(0.25 0.02 40 / 0.4)" />
      <path d={pathStr} fill="none" stroke="oklch(0.6 0.05 40)" strokeWidth={2} />

      {/* Incident ray */}
      <line x1={incX} y1={incY} x2={W / 2} y2={SURFACE_Y}
            stroke="#6366f1" strokeWidth={2} markerEnd="url(#sc-arrow-inc)" />
      <text x={incX - 5} y={incY - 10} fill="#6366f1" fontSize={11}>Incident</text>

      {/* Specular reflection (only if smooth) */}
      <line x1={W / 2} y1={SURFACE_Y} x2={W / 2 + Math.sin(theta) * refLen} y2={SURFACE_Y - Math.cos(theta) * refLen}
            stroke="#14b8a6" strokeWidth={smooth ? 2.5 : 1} opacity={smooth ? 0.9 : 0.3}
            markerEnd="url(#sc-arrow-ref)" />

      {/* Scattered rays (if rough) */}
      {!smooth && [15, 35, 55, 70, 90, 110, 130, 150].map((angle, i) => {
        const a = (angle * PI) / 180;
        const len = 60 * (0.3 + Math.random() * 0.3);
        const ex = W / 2 + Math.cos(a - PI / 2) * len;
        const ey = SURFACE_Y - Math.sin(a - PI / 2) * len;
        return (
          <line key={angle} x1={W / 2} y1={SURFACE_Y} x2={ex} y2={Math.max(0, ey)}
                stroke="#f59e0b" strokeWidth={1} opacity={0.5} />
        );
      })}

      {/* Labels */}
      <text x={W / 2 + Math.sin(theta) * refLen + 8} y={SURFACE_Y - Math.cos(theta) * refLen}
            fill="#14b8a6" fontSize={11}>Specular {smooth ? '✓' : '(weak)'}</text>

      {!smooth && (
        <text x={W / 2 + 10} y={SURFACE_Y - 90} fill="#f59e0b" fontSize={11}>Scattered (diffuse)</text>
      )}

      {/* Status badge */}
      <rect x={8} y={8} width={smooth ? 60 : 60} height={22} rx={6}
            fill={smooth ? '#22c55e22' : '#f59e0b22'} />
      <text x={38} y={22} textAnchor="middle" fill={smooth ? '#22c55e' : '#f59e0b'} fontSize={10} fontWeight="600">
        {smooth ? 'SMOOTH' : 'ROUGH'}
      </text>

      <defs>
        {['inc', 'ref'].map((id) => (
          <marker key={id} id={`sc-arrow-${id}`} markerWidth={8} markerHeight={8} refX={6} refY={2} orient="auto">
            <polygon points="0 0, 8 2, 0 4" fill={id === 'inc' ? '#6366f1' : '#14b8a6'} />
          </marker>
        ))}
      </defs>
    </svg>
  );
}

const FREQ_PRESETS = [
  { label: '900 MHz', hz: 900e6 },
  { label: '2.4 GHz', hz: 2.4e9 },
  { label: '28 GHz', hz: 28e9 },
  { label: '60 GHz', hz: 60e9 },
];

export default function Scattering() {
  const [freqIdx, setFreqIdx] = useState(0);
  const [hrms, setHrms] = useState(0.1); // m
  const [thetaDeg, setThetaDeg] = useState(30);

  const freq = FREQ_PRESETS[freqIdx].hz;
  const lambda = wavelength(freq);
  const smooth = isSmooth(hrms, lambda, thetaDeg);
  const criterion = roughnessCriterionM(lambda, thetaDeg);
  const specCoeff = scatterLoss(hrms, lambda, thetaDeg);
  const specLossDb = -10 * Math.log10(Math.max(1e-10, specCoeff));

  return (
    <div className="section-container py-10">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-2 mb-2">
          <div className="w-2 h-2 rounded-full" style={{ background: '#f59e0b' }} />
          <span className="text-sm font-medium" style={{ color: '#f59e0b' }}>3.3 · Propagation</span>
        </div>
        <h1 className="mb-3">Scattering</h1>
        <p className="text-lg mb-8 max-w-2xl" style={{ color: 'var(--color-text-secondary)' }}>
          When a wave hits a surface whose roughness is comparable to the wavelength,
          energy scatters in all directions rather than reflecting specularly.
          The Rayleigh criterion determines whether a surface appears smooth or rough.
        </p>

        {/* Freq selector */}
        <div className="flex gap-2 mb-6">
          {FREQ_PRESETS.map((p, i) => (
            <button key={p.label} onClick={() => setFreqIdx(i)}
              className="px-3 py-1.5 rounded-lg text-sm cursor-pointer border transition-all"
              style={{
                background: freqIdx === i ? 'color-mix(in oklch, #f59e0b 15%, var(--color-bg-secondary))' : 'var(--color-bg-secondary)',
                borderColor: freqIdx === i ? '#f59e0b' : 'var(--color-border-subtle)',
                color: freqIdx === i ? '#f59e0b' : 'var(--color-text-secondary)',
              }}>
              {p.label}
            </button>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          <div className="space-y-4">
            <ParameterPanel title="Surface Properties">
              <ParameterSlider label="RMS roughness h_rms" value={hrms} min={0.001} max={2} step={0.005}
                onChange={setHrms} color="#f59e0b" formatValue={(v) => `${(v * 100).toFixed(1)} cm`} 
                description="The standard deviation of the surface height. A larger value means a rougher surface with deeper bumps." />
              <ParameterSlider label="Grazing angle θ" value={thetaDeg} min={5} max={85} step={5}
                onChange={setThetaDeg} unit="°" color="#6366f1" 
                description="The angle at which the wave hits the surface. Glancing angles (near 90°) make rough surfaces appear much smoother!" />
            </ParameterPanel>

            <div className="glass-card p-5">
              <h4 className="text-sm font-semibold mb-3" style={{ color: '#f59e0b' }}>Results</h4>
              <div className="space-y-3 text-sm">
                {[
                  { label: 'Wavelength λ', value: `${(lambda * 100).toFixed(2)} cm`, color: '#6366f1' },
                  { label: 'Smooth threshold', value: `${(criterion * 100).toFixed(1)} cm`, color: '#22c55e' },
                  { label: 'Surface', value: smooth ? 'SMOOTH ✓' : 'ROUGH ✗', color: smooth ? '#22c55e' : '#f59e0b' },
                  { label: 'Specular coeff', value: specCoeff.toFixed(3), color: '#14b8a6' },
                  { label: 'Scattering loss', value: `${specLossDb.toFixed(1)} dB`, color: 'var(--color-accent-amber)' },
                ].map((item) => (
                  <div key={item.label} className="flex justify-between">
                    <span style={{ color: 'var(--color-text-secondary)' }}>{item.label}</span>
                    <span className="font-mono font-bold" style={{ color: item.color }}>{item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Roughness scale */}
            <div className="glass-card p-5">
              <h4 className="text-sm font-semibold mb-3" style={{ color: 'var(--color-text-secondary)' }}>
                Roughness Examples
              </h4>
              <div className="space-y-2 text-xs">
                {[
                  { name: 'Still water', h: 0.001 },
                  { name: 'Asphalt road', h: 0.02 },
                  { name: 'Brick wall', h: 0.05 },
                  { name: 'Grass field', h: 0.2 },
                  { name: 'Rough terrain', h: 1.0 },
                ].map((ex) => {
                  const smooth = isSmooth(ex.h, lambda, thetaDeg);
                  return (
                    <div key={ex.name} className="flex items-center gap-2">
                      <span className="flex-1" style={{ color: 'var(--color-text-secondary)' }}>{ex.name}</span>
                      <span className="font-mono w-14 text-right" style={{ color: 'var(--color-text-tertiary)' }}>{(ex.h * 100).toFixed(1)} cm</span>
                      <span className="w-14 text-right font-semibold" style={{ color: smooth ? '#22c55e' : '#f59e0b' }}>
                        {smooth ? 'smooth' : 'rough'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-4">
            <div className="glass-card p-4">
              <div className="text-sm font-semibold mb-3" style={{ color: 'var(--color-text-secondary)' }}>
                Surface Scattering — {FREQ_PRESETS[freqIdx].label}
              </div>
              <RoughnessScene hrms={hrms} lambda={lambda} thetaDeg={thetaDeg} smooth={smooth} />
            </div>

            <InfoCallout type="aha" title="Why mmWave 5G Struggles with Rain and Foliage">
              At 28 GHz, λ ≈ 1 cm. Even a 2 mm rainfall creates enough surface roughness to cause
              significant scattering. This is why millimeter-wave links are deployed as short-range
              small cells — surface scattering, rain fade, and atmospheric absorption dominate
              at these frequencies.
            </InfoCallout>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <EquationCard title="Rayleigh Roughness Criterion" math="h_{rms} < \frac{\lambda}{8\cos\theta_i}" description="If RMS surface height < this threshold, the surface appears electrically smooth (specular reflection dominates)." />
          <EquationCard title="Scattering Coefficient" math="\rho_s = e^{-\left(\frac{4\pi h_{rms}\cos\theta_i}{\lambda}\right)^2}" description="Fraction of incident power remaining in specular direction after rough-surface scattering. ρs → 1 for smooth, 0 for rough." />
        </div>
      </motion.div>
    </div>
  );
}
