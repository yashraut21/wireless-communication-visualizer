import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ParameterSlider, ParameterPanel, InfoCallout } from '../../components/interactive/ParameterPanel';
import { EquationCard } from '../../components/math/Equation';
import { fresnelRadius, knifedgeNu, knifeedgeLossDb } from '../../utils/antenna-math';
import { wavelength } from '../../utils/wireless-math';
import { PI } from '../../utils/constants';

const FREQ_PRESETS = [
  { label: '900 MHz', hz: 900e6 },
  { label: '1.8 GHz', hz: 1.8e9 },
  { label: '2.4 GHz', hz: 2.4e9 },
  { label: '5 GHz', hz: 5e9 },
];

/** Knife-edge diffraction scene */
function DiffractionScene({ d1, d2, heightM, lambdaM, lossDb, nu }) {
  const W = 580;
  const H = 300;
  const PAD = { l: 50, r: 30, t: 40, b: 30 };
  const pW = W - PAD.l - PAD.r;
  const pH = H - PAD.t - PAD.b;

  const totalD = d1 + d2;
  const txX = PAD.l;
  const rxX = W - PAD.r;
  const groundY = H - PAD.b;

  // LOS line height at knife-edge position
  const edgeX = PAD.l + (d1 / totalD) * pW;
  const losTxH = 40; // TX antenna height pixels
  const losRxH = 40; // RX height pixels
  const edgeLosY = groundY - losTxH - (losTxH - losRxH) * (d1 / totalD); // linear interpolation

  // Obstacle height in pixels
  const maxObsH = pH * 0.75;
  const obsPixelH = Math.min(maxObsH, (heightM / 50) * maxObsH); // normalize to 50m max
  const obsTop = groundY - obsPixelH;

  // Clearance (difference between LOS and obstacle top, in pixels)
  const clearance = edgeLosY - obsTop;

  // Fresnel zones (first 3)
  const lambda = lambdaM;
  const fresnelZones = [1, 2, 3].map((n) => {
    const r = fresnelRadius(n, lambda, d1, d2);
    return (r / 50) * maxObsH; // scale
  });

  const color = lossDb < 6 ? '#22c55e' : lossDb < 15 ? '#f59e0b' : '#ef4444';

  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} className="w-full">
      {/* Ground */}
      <rect x={0} y={groundY} width={W} height={PAD.b} fill="oklch(0.3 0.02 250 / 0.3)" />
      <line x1={0} y1={groundY} x2={W} y2={groundY} stroke="oklch(1 0 0 / 0.1)" />

      {/* Fresnel zones at edge */}
      {fresnelZones.map((r, i) => (
        <ellipse key={i} cx={edgeX} cy={edgeLosY} rx={6} ry={r}
          fill={`oklch(0.6 0.15 250 / ${0.04 - i * 0.01})`}
          stroke={i === 0 ? '#3b82f6' : 'oklch(1 0 0 / 0.1)'}
          strokeWidth={i === 0 ? 1.5 : 0.5} strokeDasharray={i > 0 ? '3,3' : undefined} />
      ))}

      {/* LOS path */}
      <line x1={txX} y1={groundY - losTxH}
            x2={rxX} y2={groundY - losRxH}
            stroke="#3b82f6" strokeDasharray="6,4" strokeWidth={1.5} opacity={0.5} />

      {/* Diffracted path */}
      <polyline
        points={`${txX},${groundY - losTxH} ${edgeX},${obsTop} ${rxX},${groundY - losRxH}`}
        fill="none" stroke={color} strokeWidth={2} />

      {/* Obstacle */}
      <rect x={edgeX - 6} y={obsTop} width={12} height={obsPixelH}
            fill="#4b5563" rx={2} />
      <rect x={edgeX - 10} y={obsTop - 4} width={20} height={6}
            fill="#6b7280" rx={1} />

      {/* TX/RX */}
      <line x1={txX} y1={groundY - losTxH} x2={txX} y2={groundY} stroke="#6366f1" strokeWidth={2} />
      <circle cx={txX} cy={groundY - losTxH} r={5} fill="#6366f1" />
      <text x={txX} y={groundY - losTxH - 12} textAnchor="middle" fill="#6366f1" fontSize={11} fontWeight="600">TX</text>

      <line x1={rxX} y1={groundY - losRxH} x2={rxX} y2={groundY} stroke="#14b8a6" strokeWidth={2} />
      <circle cx={rxX} cy={groundY - losRxH} r={5} fill="#14b8a6" />
      <text x={rxX} y={groundY - losRxH - 12} textAnchor="middle" fill="#14b8a6" fontSize={11} fontWeight="600">RX</text>

      {/* Distance labels */}
      <text x={txX + (edgeX - txX) / 2} y={groundY + 18} textAnchor="middle"
            fill="oklch(1 0 0 / 0.4)" fontSize={10}>d₁={d1}m</text>
      <text x={edgeX + (rxX - edgeX) / 2} y={groundY + 18} textAnchor="middle"
            fill="oklch(1 0 0 / 0.4)" fontSize={10}>d₂={d2}m</text>

      {/* Height label */}
      <line x1={edgeX + 14} y1={obsTop} x2={edgeX + 14} y2={groundY}
            stroke="oklch(1 0 0 / 0.2)" strokeDasharray="2,2" />
      <text x={edgeX + 20} y={(obsTop + groundY) / 2} fill="oklch(1 0 0 / 0.4)" fontSize={10}>
        h={heightM}m
      </text>

      {/* ν label */}
      <text x={edgeX} y={PAD.t - 8} textAnchor="middle" fill={color} fontSize={11} fontWeight="600">
        ν={nu.toFixed(2)} → {lossDb.toFixed(1)} dB loss
      </text>

      {/* 1st Fresnel label */}
      <text x={edgeX + 8} y={edgeLosY - fresnelZones[0] - 4} fill="#3b82f6" fontSize={9}>F₁</text>
    </svg>
  );
}

/** Loss vs ν plot */
function LossVsNuPlot({ currentNu, currentLoss }) {
  const W = 400, H = 200;
  const PAD = { t: 20, r: 20, b: 40, l: 55 };
  const pW = W - PAD.l - PAD.r;
  const pH = H - PAD.t - PAD.b;

  const nuRange = [-2, 4];
  const lossRange = [0, 25];

  const toX = (nu) => PAD.l + ((nu - nuRange[0]) / (nuRange[1] - nuRange[0])) * pW;
  const toY = (loss) => PAD.t + pH - ((loss - lossRange[0]) / (lossRange[1] - lossRange[0])) * pH;

  const points = [];
  for (let i = 0; i <= 120; i++) {
    const nu = nuRange[0] + (i / 120) * (nuRange[1] - nuRange[0]);
    const loss = Math.max(0, knifeedgeLossDb(nu));
    points.push(`${toX(nu)},${toY(loss)}`);
  }

  const curX = toX(currentNu);
  const curY = toY(currentLoss);
  const color = currentLoss < 6 ? '#22c55e' : currentLoss < 15 ? '#f59e0b' : '#ef4444';

  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} className="w-full max-w-md">
      {/* Axes */}
      <line x1={PAD.l} y1={PAD.t} x2={PAD.l} y2={PAD.t + pH} stroke="oklch(1 0 0 / 0.2)" />
      <line x1={PAD.l} y1={PAD.t + pH} x2={PAD.l + pW} y2={PAD.t + pH} stroke="oklch(1 0 0 / 0.2)" />

      {/* Grid */}
      {[0, 6, 12, 18, 24].map((loss) => {
        const y = toY(loss);
        return (
          <g key={loss}>
            <line x1={PAD.l} y1={y} x2={PAD.l + pW} y2={y} stroke="oklch(1 0 0 / 0.05)" />
            <text x={PAD.l - 6} y={y + 4} textAnchor="end" fill="oklch(1 0 0 / 0.3)" fontSize={9}>{loss}</text>
          </g>
        );
      })}
      {[-2, -1, 0, 1, 2, 3, 4].map((nu) => (
        <text key={nu} x={toX(nu)} y={PAD.t + pH + 14} textAnchor="middle"
              fill="oklch(1 0 0 / 0.3)" fontSize={9}>{nu}</text>
      ))}

      {/* LOS region */}
      <rect x={PAD.l} y={PAD.t} width={toX(0) - PAD.l} height={pH}
            fill="oklch(0.6 0.15 155 / 0.05)" />
      <text x={(PAD.l + toX(0)) / 2} y={PAD.t + 14} textAnchor="middle" fill="#22c55e" fontSize={9}>
        LOS
      </text>

      {/* Curve */}
      <polyline points={points.join(' ')} fill="none" stroke="#14b8a6" strokeWidth={2} />

      {/* Current point */}
      {currentNu >= nuRange[0] && currentNu <= nuRange[1] && (
        <>
          <line x1={curX} y1={PAD.t} x2={curX} y2={curY} stroke={color} strokeDasharray="3,3" strokeWidth={1} />
          <circle cx={curX} cy={curY} r={5} fill={color} />
          <text x={curX + 8} y={curY - 5} fill={color} fontSize={10} fontWeight="600">
            {currentLoss.toFixed(1)} dB
          </text>
        </>
      )}

      <text x={PAD.l + pW / 2} y={H - 4} textAnchor="middle" fill="oklch(1 0 0 / 0.35)" fontSize={10}>ν (Fresnel-Kirchhoff parameter)</text>
      <text x={14} y={PAD.t + pH / 2} textAnchor="middle" fill="oklch(1 0 0 / 0.35)" fontSize={10}
            transform={`rotate(-90, 14, ${PAD.t + pH / 2})`}>Loss (dB)</text>
    </svg>
  );
}

export default function Diffraction() {
  const [freqIdx, setFreqIdx] = useState(0);
  const [d1, setD1] = useState(500);
  const [d2, setD2] = useState(500);
  const [heightM, setHeightM] = useState(20);

  const freq = FREQ_PRESETS[freqIdx].hz;
  const lambda = wavelength(freq);
  const nu = knifedgeNu(heightM, lambda, d1, d2);
  const lossDb = Math.max(0, knifeedgeLossDb(nu));
  const f1Radius = fresnelRadius(1, lambda, d1, d2);

  return (
    <div className="section-container py-10">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-2 mb-2">
          <div className="w-2 h-2 rounded-full" style={{ background: '#14b8a6' }} />
          <span className="text-sm font-medium" style={{ color: '#14b8a6' }}>3.2 · Propagation</span>
        </div>
        <h1 className="mb-3">Diffraction</h1>
        <p className="text-lg mb-8 max-w-2xl" style={{ color: 'var(--color-text-secondary)' }}>
          Signals bend around obstacles via diffraction — enabling coverage in NLOS (non-line-of-sight) situations.
          The knife-edge model quantifies the loss using Fresnel zones.
        </p>

        {/* Freq selector */}
        <div className="flex gap-2 mb-6">
          {FREQ_PRESETS.map((p, i) => (
            <button key={p.label} onClick={() => setFreqIdx(i)}
              className="px-3 py-1.5 rounded-lg text-sm cursor-pointer border transition-all"
              style={{
                background: freqIdx === i ? 'color-mix(in oklch, #14b8a6 15%, var(--color-bg-secondary))' : 'var(--color-bg-secondary)',
                borderColor: freqIdx === i ? '#14b8a6' : 'var(--color-border-subtle)',
                color: freqIdx === i ? '#14b8a6' : 'var(--color-text-secondary)',
              }}>
              {p.label}
            </button>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6 mb-6">
          {/* Controls */}
          <div className="space-y-4">
            <ParameterPanel title="Geometry">
              <ParameterSlider label="d₁ (TX → obstacle)" value={d1} min={100} max={2000} step={50}
                onChange={setD1} unit="m" color="#6366f1" 
                description="Distance from the transmitter to the obstacle." />
              <ParameterSlider label="d₂ (obstacle → RX)" value={d2} min={100} max={2000} step={50}
                onChange={setD2} unit="m" color="#14b8a6" 
                description="Distance from the obstacle to the receiver." />
              <ParameterSlider label="Obstacle height (h)" value={heightM} min={-10} max={50} step={1}
                onChange={setHeightM} unit="m" color="#f59e0b"
                formatValue={(v) => v >= 0 ? `+${v} m above LOS` : `${v} m below LOS`} 
                description="Height of the obstacle relative to the direct Line-Of-Sight path. Even if the obstacle is slightly below the LOS, it can still block the Fresnel zone and cause loss!" />
            </ParameterPanel>

            <div className="glass-card p-5">
              <h4 className="text-sm font-semibold mb-3" style={{ color: '#14b8a6' }}>Results</h4>
              <div className="space-y-3 text-sm">
                {[
                  { label: 'Wavelength λ', value: `${(lambda * 100).toFixed(1)} cm`, color: '#6366f1' },
                  { label: 'Fresnel param ν', value: nu.toFixed(2), color: nu < 0 ? '#22c55e' : '#f59e0b' },
                  { label: 'F₁ radius', value: `${f1Radius.toFixed(1)} m`, color: '#3b82f6' },
                  { label: 'Diffraction loss', value: `${lossDb.toFixed(1)} dB`, color: lossDb < 6 ? '#22c55e' : lossDb < 15 ? '#f59e0b' : '#ef4444' },
                ].map((item) => (
                  <div key={item.label} className="flex justify-between">
                    <span style={{ color: 'var(--color-text-secondary)' }}>{item.label}</span>
                    <span className="font-mono font-bold" style={{ color: item.color }}>{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Scene + plots */}
          <div className="lg:col-span-2 space-y-4">
            <div className="glass-card p-4">
              <DiffractionScene d1={d1} d2={d2} heightM={heightM} lambdaM={lambda} lossDb={lossDb} nu={nu} />
            </div>
            <div className="glass-card p-4">
              <div className="text-sm font-semibold mb-2" style={{ color: 'var(--color-text-secondary)' }}>
                Diffraction Loss vs ν
              </div>
              <LossVsNuPlot currentNu={nu} currentLoss={lossDb} />
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <EquationCard title="Fresnel-Kirchhoff Parameter" math="\nu = h\sqrt{\frac{2(d_1+d_2)}{\lambda d_1 d_2}}" description="ν < 0: TX, RX, and top of obstacle form a downward angle (LOS). ν > 0: obstacle blocks direct path." />
          <EquationCard title="1st Fresnel Zone Radius" math="r_1 = \sqrt{\frac{\lambda d_1 d_2}{d_1 + d_2}}" description="Keep 60% of 1st Fresnel zone clear for negligible diffraction loss." />
        </div>

        {nu < -0.7 && (
          <InfoCallout type="tip" title="Fresnel Zone Clearance">
            ν = {nu.toFixed(2)}: The path is in near-free-space — diffraction loss is minimal ({lossDb.toFixed(1)} dB).
            Good rule: ensure h {'<'} −0.577 × r₁ below LOS for &lt;1 dB extra loss.
          </InfoCallout>
        )}
        {nu > 1 && (
          <InfoCallout type="warning" title="Significant Diffraction Loss">
            ν = {nu.toFixed(2)}: {lossDb.toFixed(1)} dB diffraction loss. At 900 MHz, a signal loses 20 dB
            just from diffracting over a rooftop. Lower frequencies diffract more easily (smaller ν for same geometry).
          </InfoCallout>
        )}
      </motion.div>
    </div>
  );
}
