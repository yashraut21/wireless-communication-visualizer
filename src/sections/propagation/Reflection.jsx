import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ParameterSlider, ParameterPanel, InfoCallout } from '../../components/interactive/ParameterPanel';
import { EquationCard } from '../../components/math/Equation';
import {
  reflectionCoeffPerp, reflectionCoeffParallel, brewsterAngle
} from '../../utils/antenna-math';
import { PI } from '../../utils/constants';

/* Material presets */
const MATERIALS = [
  { name: 'Vacuum/Air', epsilon: 1.0, color: '#6b7280' },
  { name: 'Dry Ground', epsilon: 4.0, color: '#92400e' },
  { name: 'Wet Ground', epsilon: 25.0, color: '#065f46' },
  { name: 'Concrete', epsilon: 7.0, color: '#4b5563' },
  { name: 'Water', epsilon: 80.0, color: '#0369a1' },
  { name: 'Glass', epsilon: 6.0, color: '#7dd3fc' },
];

/* 2D reflection scene SVG */
function ReflectionScene({ thetaDeg, epsilonR, polarization, material }) {
  const theta = (thetaDeg * PI) / 180;
  const refCoeff = polarization === 'perp'
    ? reflectionCoeffPerp(theta, epsilonR)
    : reflectionCoeffParallel(theta, epsilonR);

  const mag = refCoeff.mag;
  const W = 540;
  const H = 320;
  const SURFACE_Y = 200;
  const SURFACE_X = 270;

  const incAngle = theta;
  const refAngle = theta; // law of reflection
  const transAngle = Math.asin(Math.min(1, Math.sin(theta) / Math.sqrt(epsilonR)));

  const incLen = 140;
  const incX1 = SURFACE_X - Math.sin(incAngle) * incLen;
  const incY1 = SURFACE_Y - Math.cos(incAngle) * incLen;

  const refLen = incLen * mag;
  const refX2 = SURFACE_X + Math.sin(refAngle) * refLen;
  const refY2 = SURFACE_Y - Math.cos(refAngle) * refLen;

  const transLen = 100 * (1 - mag);
  const transX2 = SURFACE_X + Math.sin(transAngle) * transLen;
  const transY2 = SURFACE_Y + Math.cos(transAngle) * transLen;

  const matColor = MATERIALS.find(m => m.epsilon === epsilonR)?.color || material.color;

  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} className="w-full max-w-xl">
      {/* Surface fill */}
      <rect x={0} y={SURFACE_Y} width={W} height={H - SURFACE_Y} fill={`${matColor}22`} />
      <line x1={0} y1={SURFACE_Y} x2={W} y2={SURFACE_Y} stroke={matColor} strokeWidth={2} />

      {/* Normal (dashed) */}
      <line x1={SURFACE_X} y1={SURFACE_Y - 100} x2={SURFACE_X} y2={SURFACE_Y + 80}
            stroke="oklch(1 0 0 / 0.15)" strokeDasharray="6,4" strokeWidth={1} />

      {/* Incident ray */}
      <line x1={incX1} y1={incY1} x2={SURFACE_X} y2={SURFACE_Y}
            stroke="#6366f1" strokeWidth={2.5} markerEnd="url(#arrow-inc)" />

      {/* Reflected ray */}
      {mag > 0.01 && (
        <line x1={SURFACE_X} y1={SURFACE_Y} x2={refX2} y2={refY2}
              stroke="#14b8a6" strokeWidth={Math.max(0.5, 2.5 * mag)}
              markerEnd="url(#arrow-ref)" />
      )}

      {/* Transmitted ray */}
      {transLen > 5 && (
        <line x1={SURFACE_X} y1={SURFACE_Y} x2={transX2} y2={transY2}
              stroke="#f59e0b" strokeWidth={Math.max(0.5, 2 * (1 - mag))}
              strokeDasharray="6,3" markerEnd="url(#arrow-trans)" />
      )}

      {/* Angle arcs */}
      <path d={`M ${SURFACE_X} ${SURFACE_Y - 40} A 40 40 0 0 0 ${SURFACE_X - Math.sin(incAngle) * 40} ${SURFACE_Y - Math.cos(incAngle) * 40}`}
            fill="none" stroke="#6366f1" strokeWidth={1} opacity={0.5} />
      <text x={SURFACE_X - 30} y={SURFACE_Y - 50} fill="#6366f1" fontSize={11}>θᵢ={thetaDeg}°</text>

      {/* Labels */}
      <text x={incX1 - 10} y={incY1 - 10} fill="#6366f1" fontSize={12} fontWeight="600">Incident</text>
      <text x={refX2 + 5} y={refY2 - 10} fill="#14b8a6" fontSize={12} fontWeight="600">
        Reflected ({(mag * 100).toFixed(0)}%)
      </text>
      {transLen > 10 && (
        <text x={transX2 + 5} y={transY2 + 5} fill="#f59e0b" fontSize={12}>
          Transmitted ({((1 - mag) * 100).toFixed(0)}%)
        </text>
      )}

      {/* Material label */}
      <text x={8} y={SURFACE_Y + 18} fill={matColor} fontSize={11}>
        ε_r = {epsilonR}
      </text>

      <defs>
        {['inc', 'ref', 'trans'].map((id) => (
          <marker key={id} id={`arrow-${id}`} markerWidth={8} markerHeight={8} refX={6} refY={2} orient="auto">
            <polygon points="0 0, 8 2, 0 4" fill={id === 'inc' ? '#6366f1' : id === 'ref' ? '#14b8a6' : '#f59e0b'} />
          </marker>
        ))}
      </defs>
    </svg>
  );
}

/** Reflection coefficient vs angle plot */
function ReflCoeffPlot({ epsilonR, polarization }) {
  const W = 400, H = 220;
  const PAD = { t: 20, r: 20, b: 40, l: 50 };
  const pW = W - PAD.l - PAD.r;
  const pH = H - PAD.t - PAD.b;

  const pointsPerp = [];
  const pointsPar = [];
  const brewsterDeg = (brewsterAngle(epsilonR) * 180) / PI;

  for (let i = 0; i <= 90; i++) {
    const theta = (i * PI) / 180;
    const rp = reflectionCoeffPerp(theta, epsilonR);
    const rpar = reflectionCoeffParallel(theta, epsilonR);
    const x = PAD.l + (i / 90) * pW;
    pointsPerp.push(`${x},${PAD.t + pH - rp.mag * pH}`);
    pointsPar.push(`${x},${PAD.t + pH - rpar.mag * pH}`);
  }

  // Y-axis ticks
  const yTicks = [0, 0.25, 0.5, 0.75, 1.0];

  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} className="w-full max-w-md">
      {/* Axes */}
      <line x1={PAD.l} y1={PAD.t} x2={PAD.l} y2={PAD.t + pH} stroke="oklch(1 0 0 / 0.2)" />
      <line x1={PAD.l} y1={PAD.t + pH} x2={PAD.l + pW} y2={PAD.t + pH} stroke="oklch(1 0 0 / 0.2)" />

      {/* Grid + Y ticks */}
      {yTicks.map((v) => {
        const y = PAD.t + pH - v * pH;
        return (
          <g key={v}>
            <line x1={PAD.l} y1={y} x2={PAD.l + pW} y2={y} stroke="oklch(1 0 0 / 0.05)" />
            <text x={PAD.l - 6} y={y + 4} textAnchor="end" fill="oklch(1 0 0 / 0.3)" fontSize={9}>{v.toFixed(2)}</text>
          </g>
        );
      })}

      {/* X ticks */}
      {[0, 30, 45, 60, 90].map((angle) => {
        const x = PAD.l + (angle / 90) * pW;
        return (
          <g key={angle}>
            <text x={x} y={PAD.t + pH + 14} textAnchor="middle" fill="oklch(1 0 0 / 0.3)" fontSize={9}>{angle}°</text>
          </g>
        );
      })}

      {/* Brewster angle */}
      {polarization === 'parallel' && (
        <>
          <line x1={PAD.l + (brewsterDeg / 90) * pW} y1={PAD.t}
                x2={PAD.l + (brewsterDeg / 90) * pW} y2={PAD.t + pH}
                stroke="#f59e0b" strokeDasharray="4,3" strokeWidth={1} />
          <text x={PAD.l + (brewsterDeg / 90) * pW} y={PAD.t - 4} textAnchor="middle"
                fill="#f59e0b" fontSize={9}>θ_B={brewsterDeg.toFixed(1)}°</text>
        </>
      )}

      {/* Curves */}
      <polyline points={pointsPerp.join(' ')} fill="none" stroke="#6366f1" strokeWidth={2}
                opacity={polarization === 'perp' ? 1 : 0.3} />
      <polyline points={pointsPar.join(' ')} fill="none" stroke="#14b8a6" strokeWidth={2}
                opacity={polarization === 'parallel' ? 1 : 0.3} />

      {/* Legend */}
      <line x1={PAD.l + 10} y1={PAD.t + 8} x2={PAD.l + 30} y2={PAD.t + 8} stroke="#6366f1" strokeWidth={2} />
      <text x={PAD.l + 34} y={PAD.t + 12} fill="oklch(1 0 0 / 0.5)" fontSize={9}>Perpendicular (⊥)</text>
      <line x1={PAD.l + 10} y1={PAD.t + 22} x2={PAD.l + 30} y2={PAD.t + 22} stroke="#14b8a6" strokeWidth={2} />
      <text x={PAD.l + 34} y={PAD.t + 26} fill="oklch(1 0 0 / 0.5)" fontSize={9}>Parallel (∥)</text>

      {/* Axis labels */}
      <text x={PAD.l + pW / 2} y={H - 2} textAnchor="middle" fill="oklch(1 0 0 / 0.35)" fontSize={10}>
        Angle of Incidence (°)
      </text>
      <text x={10} y={PAD.t + pH / 2} textAnchor="middle" fill="oklch(1 0 0 / 0.35)" fontSize={10}
            transform={`rotate(-90, 10, ${PAD.t + pH / 2})`}>|Γ|</text>
    </svg>
  );
}

export default function Reflection() {
  const [thetaDeg, setThetaDeg] = useState(45);
  const [materialIdx, setMaterialIdx] = useState(1);
  const [polarization, setPolarization] = useState('perp');

  const material = MATERIALS[materialIdx];
  const theta = (thetaDeg * PI) / 180;
  const refCoeff = polarization === 'perp'
    ? reflectionCoeffPerp(theta, material.epsilon)
    : reflectionCoeffParallel(theta, material.epsilon);

  const reflectedPct = (refCoeff.mag * 100).toFixed(1);
  const transmittedPct = ((1 - refCoeff.mag) * 100).toFixed(1);
  const lossDb = (-20 * Math.log10(refCoeff.mag)).toFixed(1);
  const brewsterDeg = (brewsterAngle(material.epsilon) * 180 / PI).toFixed(1);

  return (
    <div className="section-container py-10">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-2 mb-2">
          <div className="w-2 h-2 rounded-full" style={{ background: '#6366f1' }} />
          <span className="text-sm font-medium" style={{ color: '#6366f1' }}>3.1 · Propagation</span>
        </div>
        <h1 className="mb-3">Reflection</h1>
        <p className="text-lg mb-8 max-w-2xl" style={{ color: 'var(--color-text-secondary)' }}>
          When a wave hits a smooth surface much larger than its wavelength, it partially reflects and
          partially transmits. The reflection coefficient depends on the material, angle, and polarization.
        </p>

        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          {/* Controls */}
          <div className="space-y-4">
            <ParameterPanel title="Incident Wave">
              <ParameterSlider label="Angle of Incidence" value={thetaDeg} min={0} max={89} step={1}
                onChange={setThetaDeg} unit="°" color="#6366f1" 
                description="The angle at which the wave hits the surface (0° is straight down). Glancing angles (near 90°) cause almost total reflection, regardless of material!" />

              <div className="mt-2">
                <label className="text-sm font-medium block mb-2" style={{ color: 'var(--color-text-secondary)' }}>Polarization</label>
                <div className="grid grid-cols-2 gap-2">
                  {[{ v: 'perp', label: 'Perpendicular ⊥' }, { v: 'parallel', label: 'Parallel ∥' }].map((p) => (
                    <button key={p.v} onClick={() => setPolarization(p.v)}
                      className="p-2 rounded-lg text-xs cursor-pointer border transition-all"
                      style={{
                        background: polarization === p.v ? 'color-mix(in oklch, #6366f1 15%, var(--color-bg-secondary))' : 'var(--color-bg-secondary)',
                        borderColor: polarization === p.v ? '#6366f1' : 'var(--color-border-subtle)',
                        color: 'var(--color-text-primary)',
                      }}>
                      {p.label}
                    </button>
                  ))}
                </div>
                <div className="text-xs mt-2 italic" style={{ color: 'var(--color-text-tertiary)', borderLeft: '2px solid var(--color-border-subtle)', paddingLeft: '8px' }}>
                  Parallel polarization experiences a 'Brewster Angle' where reflection drops to exactly zero. Perpendicular polarization always reflects some energy.
                </div>
              </div>
            </ParameterPanel>

            <div className="glass-card p-5">
              <h4 className="text-sm font-semibold mb-3" style={{ color: 'var(--color-text-secondary)' }}>Material</h4>
              <div className="space-y-1">
                {MATERIALS.map((m, i) => (
                  <button key={m.name} onClick={() => setMaterialIdx(i)}
                    className="w-full p-2 rounded-lg flex justify-between items-center cursor-pointer border transition-all text-left"
                    style={{
                      background: materialIdx === i ? `color-mix(in oklch, ${m.color} 10%, var(--color-bg-secondary))` : 'transparent',
                      borderColor: materialIdx === i ? m.color : 'transparent',
                      color: 'var(--color-text-primary)',
                    }}>
                    <span className="text-sm">{m.name}</span>
                    <span className="text-xs font-mono" style={{ color: m.color }}>ε_r={m.epsilon}</span>
                  </button>
                ))}
              </div>
              <div className="text-xs mt-2 italic" style={{ color: 'var(--color-text-tertiary)' }}>
                Higher permittivity (like water) causes stronger reflection. Lower permittivity (like dry ground) allows more energy to transmit through.
              </div>
            </div>

            <div className="glass-card p-5">
              <h4 className="text-sm font-semibold mb-3" style={{ color: '#6366f1' }}>Results</h4>
              <div className="space-y-3 text-sm">
                {[
                  { label: '|Γ| magnitude', value: refCoeff.mag.toFixed(3), color: '#6366f1' },
                  { label: 'Reflected power', value: `${reflectedPct}%`, color: '#14b8a6' },
                  { label: 'Transmitted power', value: `${transmittedPct}%`, color: '#f59e0b' },
                  { label: 'Reflection loss', value: `${lossDb} dB`, color: 'var(--color-accent-amber)' },
                  { label: 'Brewster angle (∥)', value: `${brewsterDeg}°`, color: '#f59e0b' },
                ].map((item) => (
                  <div key={item.label} className="flex justify-between">
                    <span style={{ color: 'var(--color-text-secondary)' }}>{item.label}</span>
                    <span className="font-mono font-bold" style={{ color: item.color }}>{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Visual */}
          <div className="lg:col-span-2 space-y-4">
            <div className="glass-card p-4">
              <div className="text-sm font-semibold mb-3" style={{ color: 'var(--color-text-secondary)' }}>
                Reflection Scene — {material.name} (ε_r = {material.epsilon})
              </div>
              <div className="flex justify-center overflow-auto">
                <ReflectionScene thetaDeg={thetaDeg} epsilonR={material.epsilon}
                  polarization={polarization} material={material} />
              </div>
            </div>

            <div className="glass-card p-4">
              <div className="text-sm font-semibold mb-3" style={{ color: 'var(--color-text-secondary)' }}>
                |Γ| vs Angle of Incidence — {material.name}
              </div>
              <div className="flex justify-center">
                <ReflCoeffPlot epsilonR={material.epsilon} polarization={polarization} />
              </div>
            </div>
          </div>
        </div>

        {polarization === 'parallel' && (
          <InfoCallout type="aha" title="Brewster Angle — Zero Reflection">
            At the Brewster angle ({brewsterDeg}° for {material.name}), parallel-polarized light
            is completely transmitted — zero reflection! This is used in polarizing filters,
            non-reflective glass coatings, and optical isolators.
          </InfoCallout>
        )}

        <div className="grid md:grid-cols-2 gap-4 mt-6 mb-6">
          <EquationCard title="Fresnel (Perpendicular)" math="\Gamma_\perp = \frac{\cos\theta_i - \sqrt{\varepsilon_r - \sin^2\theta_i}}{\cos\theta_i + \sqrt{\varepsilon_r - \sin^2\theta_i}}" description="Reflection coefficient for TE (s-polarized) wave." />
          <EquationCard title="Brewster Angle" math="\theta_B = \arctan\!\sqrt{\varepsilon_r}" description="At this angle, parallel-polarized incident wave has zero reflection coefficient." />
        </div>
      </motion.div>
    </div>
  );
}
