import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ParameterSlider, ParameterPanel, InfoCallout } from '../../components/interactive/ParameterPanel';
import { EquationCard } from '../../components/math/Equation';
import { PI } from '../../utils/constants';
import { Play, Pause, Plus, Trash2, RotateCcw } from 'lucide-react';

/** A single phasor: { amplitude, phaseDeg, dopplerHz, id } */
function makePhasor(id, amplitude = 1, phaseDeg = 0, dopplerHz = 0) {
  return { id, amplitude, phaseDeg, dopplerHz };
}

const DEFAULT_PHASORS = [
  makePhasor(1, 1.0, 0, 0),
  makePhasor(2, 0.7, 90, 5),
  makePhasor(3, 0.5, 200, -3),
];

/** Rotating phasors + resultant diagram */
function PhasorDiagram({ phasors, time, size = 320 }) {
  const cx = size / 2;
  const cy = size / 2;
  const R = size * 0.38;

  // Current angles accounting for Doppler rotation
  const currentPhasors = phasors.map((p) => ({
    ...p,
    angle: ((p.phaseDeg + p.dopplerHz * time * 360) * PI) / 180,
  }));

  // Resultant
  let rx = 0, ry = 0;
  currentPhasors.forEach((p) => {
    rx += p.amplitude * Math.cos(p.angle);
    ry += p.amplitude * Math.sin(p.angle);
  });
  const resultantMag = Math.sqrt(rx * rx + ry * ry);
  const resultantAngle = Math.atan2(ry, rx);

  const scale = R / (phasors.reduce((s, p) => s + p.amplitude, 0) || 1);

  const COLORS = ['#14b8a6', '#8b5cf6', '#f59e0b', '#3b82f6', '#ec4899', '#22c55e'];

  // Draw phasors head-to-tail from origin → tip
  let accX = cx, accY = cy;
  const phasorPaths = currentPhasors.map((p, i) => {
    const dx = p.amplitude * scale * Math.cos(p.angle);
    const dy = p.amplitude * scale * Math.sin(p.angle);
    const x2 = accX + dx;
    const y2 = accY + dy;
    const path = { x1: accX, y1: accY, x2, y2, color: COLORS[i % COLORS.length], p };
    accX = x2;
    accY = y2;
    return path;
  });

  // Resultant from origin to final tip
  const resultantEndX = cx + resultantMag * scale * Math.cos(resultantAngle);
  const resultantEndY = cy + resultantMag * scale * Math.sin(resultantAngle);

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {/* Background */}
      <circle cx={cx} cy={cy} r={R + 4} fill="oklch(0 0 0 / 0.2)" />

      {/* Rings */}
      {[0.25, 0.5, 0.75, 1.0].map((r) => (
        <circle key={r} cx={cx} cy={cy} r={R * r} fill="none"
          stroke="oklch(1 0 0 / 0.06)" strokeWidth={1} strokeDasharray={r < 1 ? '3,4' : undefined} />
      ))}

      {/* Axes */}
      <line x1={cx - R - 8} y1={cy} x2={cx + R + 8} y2={cy} stroke="oklch(1 0 0 / 0.08)" />
      <line x1={cx} y1={cy - R - 8} x2={cx} y2={cy + R + 8} stroke="oklch(1 0 0 / 0.08)" />

      {/* Individual phasors (head-to-tail) */}
      {phasorPaths.map(({ x1, y1, x2, y2, color, p }, i) => (
        <g key={p.id}>
          <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth={2.5}
                markerEnd={`url(#ph-arrow-${i})`} />
          <defs>
            <marker id={`ph-arrow-${i}`} markerWidth={8} markerHeight={8} refX={5} refY={2} orient="auto">
              <polygon points="0 0, 8 2, 0 4" fill={color} />
            </marker>
          </defs>
        </g>
      ))}

      {/* Resultant phasor from origin */}
      <line x1={cx} y1={cy} x2={resultantEndX} y2={resultantEndY}
            stroke="white" strokeWidth={3} markerEnd="url(#ph-arrow-result)" opacity={0.9} />
      <defs>
        <marker id="ph-arrow-result" markerWidth={10} markerHeight={10} refX={6} refY={3} orient="auto">
          <polygon points="0 0, 10 3, 0 6" fill="white" />
        </marker>
      </defs>

      {/* Resultant magnitude label */}
      <text x={cx + resultantMag * scale * Math.cos(resultantAngle) + 8}
            y={cy + resultantMag * scale * Math.sin(resultantAngle)}
            fill="white" fontSize={11} fontWeight="600">
        |A|={resultantMag.toFixed(2)}
      </text>

      {/* Center dot */}
      <circle cx={cx} cy={cy} r={4} fill="oklch(1 0 0 / 0.3)" />
    </svg>
  );
}

/** Time-domain resultant signal */
function ResultantTimePlot({ phasors, timeRange = 4, currentTime }) {
  const W = 500, H = 160;
  const PAD = { t: 15, r: 15, b: 30, l: 40 };
  const pW = W - PAD.l - PAD.r;
  const pH = H - PAD.t - PAD.b;
  const N = 300;
  const maxAmp = phasors.reduce((s, p) => s + p.amplitude, 0) || 1;

  const toX = (t) => PAD.l + (t / timeRange) * pW;
  const toY = (v) => PAD.t + pH / 2 - (v / maxAmp) * (pH / 2);

  const points = [];
  for (let i = 0; i <= N; i++) {
    const t = (i / N) * timeRange;
    let rx = 0;
    phasors.forEach((p) => {
      rx += p.amplitude * Math.cos(((p.phaseDeg + p.dopplerHz * t * 360) * PI) / 180);
    });
    points.push(`${toX(t)},${toY(rx)}`);
  }

  const curX = toX(currentTime);

  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} className="w-full">
      {/* Axes */}
      <line x1={PAD.l} y1={PAD.t + pH / 2} x2={PAD.l + pW} y2={PAD.t + pH / 2}
            stroke="oklch(1 0 0 / 0.1)" />
      <line x1={PAD.l} y1={PAD.t} x2={PAD.l} y2={PAD.t + pH} stroke="oklch(1 0 0 / 0.15)" />

      {/* Signal */}
      <polyline points={points.join(' ')} fill="none" stroke="#14b8a6" strokeWidth={2} />

      {/* Current time marker */}
      <line x1={curX} y1={PAD.t} x2={curX} y2={PAD.t + pH}
            stroke="white" strokeWidth={1.5} opacity={0.5} />

      {/* Y ticks */}
      {[-1, 0, 1].map((v) => (
        <g key={v}>
          <line x1={PAD.l - 3} y1={toY(v * maxAmp)} x2={PAD.l} y2={toY(v * maxAmp)} stroke="oklch(1 0 0 / 0.2)" />
          <text x={PAD.l - 6} y={toY(v * maxAmp) + 4} textAnchor="end" fill="oklch(1 0 0 / 0.3)" fontSize={9}>
            {v > 0 ? `+${maxAmp.toFixed(1)}` : v < 0 ? `-${maxAmp.toFixed(1)}` : '0'}
          </text>
        </g>
      ))}

      <text x={PAD.l + pW / 2} y={H - 4} textAnchor="middle" fill="oklch(1 0 0 / 0.35)" fontSize={10}>
        Time (s)
      </text>
    </svg>
  );
}

let nextId = 4;

export default function PhasorSum() {
  const [phasors, setPhasors] = useState(DEFAULT_PHASORS);
  const [playing, setPlaying] = useState(true);
  const [time, setTime] = useState(0);
  const [selectedId, setSelectedId] = useState(null);
  const animRef = useRef();
  const lastTimeRef = useRef();

  useEffect(() => {
    if (!playing) { cancelAnimationFrame(animRef.current); return; }
    const animate = (ts) => {
      if (lastTimeRef.current) setTime((t) => t + (ts - lastTimeRef.current) / 1000);
      lastTimeRef.current = ts;
      animRef.current = requestAnimationFrame(animate);
    };
    animRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animRef.current);
  }, [playing]);

  const resultantMag = useMemo(() => {
    let rx = 0, ry = 0;
    phasors.forEach((p) => {
      const angle = ((p.phaseDeg + p.dopplerHz * time * 360) * PI) / 180;
      rx += p.amplitude * Math.cos(angle);
      ry += p.amplitude * Math.sin(angle);
    });
    return Math.sqrt(rx * rx + ry * ry);
  }, [phasors, time]);

  const maxMag = phasors.reduce((s, p) => s + p.amplitude, 0);
  const fadingDb = maxMag > 0 ? 20 * Math.log10(resultantMag / maxMag) : -40;

  const COLORS = ['#14b8a6', '#8b5cf6', '#f59e0b', '#3b82f6', '#ec4899', '#22c55e'];

  const addPhasor = () => {
    if (phasors.length >= 6) return;
    setPhasors((prev) => [...prev, makePhasor(nextId++, 0.5, Math.random() * 360, (Math.random() - 0.5) * 10)]);
  };

  const removePhasor = (id) => {
    setPhasors((prev) => prev.filter((p) => p.id !== id));
    if (selectedId === id) setSelectedId(null);
  };

  const updatePhasor = (id, field, value) => {
    setPhasors((prev) => prev.map((p) => p.id === id ? { ...p, [field]: value } : p));
  };

  const reset = () => {
    setPhasors(DEFAULT_PHASORS);
    setTime(0);
    setSelectedId(null);
  };

  const selected = phasors.find((p) => p.id === selectedId);

  return (
    <div className="section-container py-10">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-2 mb-2">
          <div className="w-2 h-2 rounded-full" style={{ background: '#ec4899' }} />
          <span className="text-sm font-medium" style={{ color: '#ec4899' }}>3.4 · Propagation</span>
        </div>
        <div className="flex items-center gap-3 mb-3">
          <h1>Phasor Sum</h1>
          <span className="px-3 py-1 rounded-full text-sm font-semibold"
                style={{ background: 'color-mix(in oklch, #ec4899 15%, transparent)', color: '#ec4899' }}>
            ⭐ The "Aha!" Moment
          </span>
        </div>
        <p className="text-lg mb-8 max-w-2xl" style={{ color: 'var(--color-text-secondary)' }}>
          Multiple signal copies arrive at the receiver via different paths. Each has a different
          amplitude and phase. Their vector sum (the phasor) is what the receiver actually sees.
          Add multipath components and watch how <em>fading</em> emerges naturally.
        </p>

        <div className="grid lg:grid-cols-3 gap-6 mb-6">
          {/* Phasor diagram */}
          <div className="lg:col-span-2 space-y-4">
            <div className="glass-card p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold" style={{ color: 'var(--color-text-secondary)' }}>
                  Rotating Phasor Diagram
                </h3>
                <div className="flex items-center gap-2">
                  <button onClick={() => setPlaying(!playing)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg cursor-pointer border text-sm transition-all"
                    style={{
                      background: 'color-mix(in oklch, #ec4899 10%, var(--color-bg-secondary))',
                      borderColor: '#ec4899', color: '#ec4899',
                    }}>
                    {playing ? <Pause size={14} /> : <Play size={14} />}
                    {playing ? 'Pause' : 'Play'}
                  </button>
                  <button onClick={reset}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg cursor-pointer border text-sm transition-all"
                    style={{ background: 'var(--color-bg-secondary)', borderColor: 'var(--color-border-subtle)', color: 'var(--color-text-secondary)' }}>
                    <RotateCcw size={14} />
                  </button>
                </div>
              </div>

              <div className="flex justify-center">
                <PhasorDiagram phasors={phasors} time={time} size={340} />
              </div>

              {/* Resultant magnitude bar */}
              <div className="mt-4 px-4">
                <div className="flex justify-between text-sm mb-1">
                  <span style={{ color: 'var(--color-text-secondary)' }}>Resultant |A|</span>
                  <span className="font-mono font-bold" style={{
                    color: fadingDb < -10 ? '#ef4444' : fadingDb < -3 ? '#f59e0b' : '#22c55e'
                  }}>
                    {resultantMag.toFixed(3)} ({fadingDb.toFixed(1)} dB)
                  </span>
                </div>
                <div className="h-3 rounded-full overflow-hidden" style={{ background: 'var(--color-bg-tertiary)' }}>
                  <motion.div
                    className="h-full rounded-full"
                    animate={{ width: `${(resultantMag / maxMag) * 100}%` }}
                    transition={{ duration: 0.05 }}
                    style={{
                      background: `linear-gradient(90deg, #ef4444, #f59e0b, #22c55e)`,
                    }}
                  />
                </div>
                <div className="flex justify-between text-xs mt-1" style={{ color: 'var(--color-text-tertiary)' }}>
                  <span>Destructive</span>
                  <span>Constructive max ({maxMag.toFixed(1)})</span>
                </div>
              </div>
            </div>

            {/* Time domain signal */}
            <div className="glass-card p-4">
              <div className="text-sm font-semibold mb-2" style={{ color: 'var(--color-text-secondary)' }}>
                Resultant Signal in Time Domain
              </div>
              <ResultantTimePlot phasors={phasors} currentTime={time % 4} />
            </div>
          </div>

          {/* Phasor controls */}
          <div className="space-y-3">
            {/* Phasor list */}
            <div className="glass-card p-4">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-sm font-semibold" style={{ color: 'var(--color-text-secondary)' }}>
                  Multipath Components
                </h3>
                <button onClick={addPhasor} disabled={phasors.length >= 6}
                  className="flex items-center gap-1 text-xs px-2 py-1 rounded-lg cursor-pointer border transition-all disabled:opacity-40"
                  style={{
                    background: 'color-mix(in oklch, #ec4899 10%, transparent)',
                    borderColor: '#ec4899', color: '#ec4899',
                  }}>
                  <Plus size={12} /> Add Ray
                </button>
              </div>

              <div className="space-y-2">
                {phasors.map((p, i) => (
                  <button key={p.id}
                    onClick={() => setSelectedId(selectedId === p.id ? null : p.id)}
                    className="w-full p-3 rounded-lg cursor-pointer border transition-all text-left"
                    style={{
                      background: selectedId === p.id
                        ? `color-mix(in oklch, ${COLORS[i % COLORS.length]} 10%, var(--color-bg-secondary))`
                        : 'var(--color-bg-secondary)',
                      borderColor: selectedId === p.id ? COLORS[i % COLORS.length] : 'var(--color-border-subtle)',
                    }}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                        <span className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
                          Ray {i + 1}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
                        <span>A={p.amplitude.toFixed(1)}</span>
                        <span>φ={p.phaseDeg.toFixed(0)}°</span>
                        <button onClick={(e) => { e.stopPropagation(); removePhasor(p.id); }}
                          className="p-1 rounded hover:text-red-400 transition-colors cursor-pointer border-none bg-transparent"
                          style={{ color: 'var(--color-text-tertiary)' }}>
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Selected phasor editor */}
            {selected && (
              <AnimatePresence>
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  className="glass-card p-4">
                  <h4 className="text-sm font-semibold mb-3"
                      style={{ color: COLORS[phasors.findIndex(p => p.id === selected.id) % COLORS.length] }}>
                    Edit Ray {phasors.findIndex(p => p.id === selected.id) + 1}
                  </h4>
                  <ParameterSlider label="Amplitude" value={selected.amplitude} min={0} max={2} step={0.05}
                    onChange={(v) => updatePhasor(selected.id, 'amplitude', v)} color="#ec4899" 
                    description="The strength of this specific multipath signal." />
                  <ParameterSlider label="Phase (φ)" value={selected.phaseDeg} min={0} max={359} step={1}
                    onChange={(v) => updatePhasor(selected.id, 'phaseDeg', v)} unit="°" color="#8b5cf6" 
                    description="The initial starting angle of the phasor. This depends on the exact distance the wave traveled." />
                  <ParameterSlider label="Doppler shift" value={selected.dopplerHz} min={-20} max={20} step={0.5}
                    onChange={(v) => updatePhasor(selected.id, 'dopplerHz', v)} unit=" Hz" color="#f59e0b" 
                    description="Causes the phasor to spin over time! Positive shift means the receiver is moving towards this signal source." />
                </motion.div>
              </AnimatePresence>
            )}

            {/* Quick presets */}
            <div className="glass-card p-4">
              <h4 className="text-sm font-semibold mb-3" style={{ color: 'var(--color-text-secondary)' }}>
                Quick Presets
              </h4>
              <div className="space-y-2">
                {[
                  { name: 'LOS only', phasors: [makePhasor(100, 1.0, 0, 0)] },
                  { name: 'LOS + Reflection', phasors: [makePhasor(101, 1.0, 0, 0), makePhasor(102, 0.7, 180, 0)] },
                  { name: 'Destructive (deep fade)', phasors: [makePhasor(103, 1.0, 0, 0), makePhasor(104, 0.98, 180, 0)] },
                  { name: '4-Ray multipath', phasors: [makePhasor(105, 1.0, 0, 2), makePhasor(106, 0.7, 90, -3), makePhasor(107, 0.4, 200, 5), makePhasor(108, 0.3, 310, -1)] },
                ].map((preset) => (
                  <button key={preset.name}
                    onClick={() => { setPhasors(preset.phasors); setSelectedId(null); nextId = 200; }}
                    className="w-full px-3 py-2 rounded-lg text-sm cursor-pointer border transition-all text-left"
                    style={{ background: 'var(--color-bg-secondary)', borderColor: 'var(--color-border-subtle)', color: 'var(--color-text-secondary)' }}>
                    {preset.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <EquationCard title="Resultant Phasor" math="\mathbf{A} = \sum_{k=1}^{N} a_k e^{j\phi_k(t)} = \sum_{k} a_k e^{j(\phi_{k,0} + 2\pi f_{d,k} t)}" description="Each multipath component has amplitude aₖ and time-varying phase due to its Doppler shift fₐ,ₖ." />
          <EquationCard title="Received Power (Envelope)" math="P_r(t) = |A(t)|^2 = \left|\sum_{k=1}^{N} a_k e^{j\phi_k(t)}\right|^2" description="Instantaneous received power = squared magnitude of the phasor sum. This is what creates fast fading." />
        </div>

        <InfoCallout type="aha" title="This is Where Fading Comes From!">
          When two paths with similar amplitude arrive 180° out of phase (destructive interference),
          the signal can drop 20–30 dB or more in milliseconds. This is small-scale (fast) fading —
          and it's entirely explained by the phasor sum model you just explored. The Rayleigh and
          Ricean distributions in the next section are just the statistical description of this process.
        </InfoCallout>
      </motion.div>
    </div>
  );
}
