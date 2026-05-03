import { useState, useMemo, useRef } from 'react';
import { motion } from 'framer-motion';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import SceneWrapper from '../../components/three/SceneWrapper';
import { PolarPlot } from '../../components/charts/PolarPlot';
import { ParameterPanel, ParameterSlider, ToggleGroup, InfoCallout } from '../../components/interactive/ParameterPanel';
import { EquationCard, Equation } from '../../components/math/Equation';
import {
  shortDipolePattern, halfWaveDipolePattern, directionalPattern,
  yagiPattern, generatePolarData, gainDbi, hpbwDeg
} from '../../utils/antenna-math';
import { PI } from '../../utils/constants';

/* ---- 3D Radiation Pattern Mesh ---- */
function RadiationPattern3D({ patternFn, color = '#14b8a6', args = [] }) {
  const meshRef = useRef();
  const THETA_STEPS = 60;
  const PHI_STEPS = 60;

  const { positions, indices, colors: vertColors } = useMemo(() => {
    const pos = [];
    const idx = [];
    const col = [];
    const maxR = 2.0;

    for (let ti = 0; ti <= THETA_STEPS; ti++) {
      const theta = (ti / THETA_STEPS) * PI;
      for (let pi2 = 0; pi2 <= PHI_STEPS; pi2++) {
        const phi = (pi2 / PHI_STEPS) * 2 * PI;
        const r = Math.max(0, patternFn(theta, ...args)) * maxR;
        pos.push(
          r * Math.sin(theta) * Math.cos(phi),
          r * Math.cos(theta),
          r * Math.sin(theta) * Math.sin(phi)
        );
        // Color by intensity
        const intensity = patternFn(theta, ...args);
        const c = new THREE.Color(color);
        c.lerp(new THREE.Color('#1e293b'), 1 - intensity);
        col.push(c.r, c.g, c.b);
      }
    }

    for (let ti = 0; ti < THETA_STEPS; ti++) {
      for (let pi2 = 0; pi2 < PHI_STEPS; pi2++) {
        const a = ti * (PHI_STEPS + 1) + pi2;
        const b = a + 1;
        const c2 = (ti + 1) * (PHI_STEPS + 1) + pi2;
        const d = c2 + 1;
        idx.push(a, b, c2, b, d, c2);
      }
    }

    return { positions: new Float32Array(pos), indices: new Uint32Array(idx), colors: new Float32Array(col) };
  }, [patternFn, color, args]);

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(vertColors, 3));
    geo.setIndex(new THREE.BufferAttribute(indices, 1));
    geo.computeVertexNormals();
    return geo;
  }, [positions, vertColors, indices]);

  useFrame(({ clock }) => {
    if (meshRef.current) meshRef.current.rotation.y = clock.getElapsedTime() * 0.2;
  });

  return (
    <mesh ref={meshRef} geometry={geometry}>
      <meshPhongMaterial vertexColors transparent opacity={0.85} side={THREE.DoubleSide} />
    </mesh>
  );
}

/* ---- Antenna type definitions ---- */
const ANTENNA_TYPES = {
  isotropic: {
    label: 'Isotropic',
    color: '#6b7280',
    patternFn: () => 1,
    description: 'Radiates equally in all directions. Theoretical reference (0 dBi). Does not physically exist.',
    gainDbi: 0,
    hpbw: 360,
    uses: ['Reference standard', 'Theoretical analysis'],
  },
  dipole: {
    label: 'Half-Wave Dipole',
    color: '#3b82f6',
    patternFn: halfWaveDipolePattern,
    description: 'The most common practical antenna. Figure-8 pattern in the E-plane, omnidirectional in H-plane.',
    gainDbi: 2.15,
    hpbw: 78,
    uses: ['FM radio', 'TV broadcast', 'Base reference'],
  },
  directional: {
    label: 'Patch / Directional',
    color: '#8b5cf6',
    patternFn: (theta, n) => directionalPattern(theta, n),
    args: [3],
    description: 'Concentrates energy in one hemisphere. Higher directivity, narrower beam.',
    gainDbi: gainDbi(3),
    hpbw: hpbwDeg(3),
    uses: ['WiFi access points', 'Point-to-point links', 'Mobile base stations'],
  },
  yagi: {
    label: 'Yagi-Uda',
    color: '#f59e0b',
    patternFn: (theta, el) => yagiPattern(theta, el),
    args: [5],
    description: 'Highly directive with driven + reflector + director elements. Classic TV antenna.',
    gainDbi: 10,
    hpbw: 50,
    uses: ['TV reception', 'Amateur radio', 'Point-to-point links'],
  },
};

export default function AntennaTypes() {
  const [activeType, setActiveType] = useState('dipole');
  const ant = ANTENNA_TYPES[activeType];

  const polarSeries = useMemo(() => {
    return Object.entries(ANTENNA_TYPES).map(([key, a]) => ({
      data: generatePolarData(a.patternFn, 360, ...(a.args || [])),
      color: a.color,
      label: a.label,
    }));
  }, []);

  const activePolar = useMemo(() => [{
    data: generatePolarData(ant.patternFn, 360, ...(ant.args || [])),
    color: ant.color,
    label: ant.label,
  }], [activeType, ant]);

  return (
    <div className="section-container py-10">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-2 mb-2">
          <div className="w-2 h-2 rounded-full" style={{ background: '#3b82f6' }} />
          <span className="text-sm font-medium" style={{ color: '#3b82f6' }}>2.1 · Antennas</span>
        </div>
        <h1 className="mb-3">Antenna Types</h1>
        <p className="text-lg mb-8 max-w-2xl" style={{ color: 'var(--color-text-secondary)' }}>
          Different antenna designs trade omnidirectional coverage for directional gain.
          Select an antenna below to see its 3D radiation pattern and key parameters.
        </p>

        {/* Antenna Type Selector */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          {Object.entries(ANTENNA_TYPES).map(([key, a]) => (
            <button key={key} onClick={() => setActiveType(key)}
              className="p-4 rounded-xl text-left cursor-pointer border-2 transition-all"
              style={{
                background: activeType === key ? `color-mix(in oklch, ${a.color} 10%, var(--color-bg-secondary))` : 'var(--color-bg-secondary)',
                borderColor: activeType === key ? a.color : 'var(--color-border-subtle)',
                boxShadow: activeType === key ? `0 0 20px ${a.color}22` : 'none',
              }}>
              <div className="w-8 h-8 rounded-lg mb-3 flex items-center justify-center"
                   style={{ background: `color-mix(in oklch, ${a.color} 20%, transparent)` }}>
                <div className="w-3 h-3 rounded-full" style={{ background: a.color }} />
              </div>
              <div className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>{a.label}</div>
              <div className="text-xs mt-1" style={{ color: a.color }}>{a.gainDbi.toFixed(1)} dBi</div>
            </button>
          ))}
        </div>

        {/* Main visualization area */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          {/* 3D Pattern */}
          <div>
            <div className="text-sm font-semibold mb-2 flex items-center gap-2" style={{ color: 'var(--color-text-secondary)' }}>
              <div className="w-2 h-2 rounded-full" style={{ background: ant.color }} />
              3D Radiation Pattern — {ant.label}
            </div>
            <SceneWrapper height="380px" cameraPosition={[0, 2, 5]} cameraFov={45}>
              <RadiationPattern3D patternFn={ant.patternFn} color={ant.color} args={ant.args || []} />
              <gridHelper args={[6, 12, '#1e293b', '#1e293b']} position={[0, -2.2, 0]} />
            </SceneWrapper>
          </div>

          {/* Polar plot + Stats */}
          <div className="space-y-4">
            {/* 2D Polar */}
            <div className="glass-card p-4">
              <div className="text-sm font-semibold mb-3" style={{ color: 'var(--color-text-secondary)' }}>
                E-Plane Polar Pattern
              </div>
              <div className="flex justify-center">
                <PolarPlot multiSeries={activePolar} size={260} />
              </div>
            </div>

            {/* Spec Table */}
            <div className="glass-card p-5">
              <h4 className="text-sm font-semibold mb-3" style={{ color: ant.color }}>
                {ant.label} — Specifications
              </h4>
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span style={{ color: 'var(--color-text-secondary)' }}>Max Gain</span>
                  <span className="font-mono font-bold" style={{ color: 'var(--color-accent-teal)' }}>
                    {ant.gainDbi.toFixed(1)} dBi
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span style={{ color: 'var(--color-text-secondary)' }}>HPBW</span>
                  <span className="font-mono font-bold" style={{ color: 'var(--color-accent-amber)' }}>
                    {ant.hpbw}°
                  </span>
                </div>
              </div>
              <p className="text-sm mb-3" style={{ color: 'var(--color-text-secondary)' }}>{ant.description}</p>
              <div className="flex flex-wrap gap-1">
                {ant.uses.map((u) => (
                  <span key={u} className="text-xs px-2 py-1 rounded-md"
                        style={{ background: `color-mix(in oklch, ${ant.color} 10%, transparent)`, color: ant.color }}>
                    {u}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* All patterns overlay */}
        <div className="glass-card p-6 mb-8">
          <h3 className="text-base font-semibold mb-4">All Patterns Compared</h3>
          <div className="flex flex-col md:flex-row items-center gap-6">
            <PolarPlot multiSeries={polarSeries} size={320} />
            <div className="space-y-3 flex-1">
              {Object.entries(ANTENNA_TYPES).map(([key, a]) => (
                <div key={key} className="flex items-center gap-3">
                  <div className="w-4 h-0.5 rounded" style={{ background: a.color }} />
                  <span className="text-sm flex-1" style={{ color: 'var(--color-text-secondary)' }}>{a.label}</span>
                  <span className="text-xs font-mono" style={{ color: a.color }}>{a.gainDbi.toFixed(1)} dBi</span>
                  <div className="w-20 h-2 rounded-full overflow-hidden" style={{ background: 'var(--color-bg-tertiary)' }}>
                    <div className="h-full rounded-full" style={{ width: `${Math.min(100, (a.gainDbi / 15) * 100)}%`, background: a.color }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Equations */}
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <EquationCard title="Directivity" math="D = \frac{4\pi}{\int_0^{2\pi}\int_0^{\pi} U(\theta,\phi)\sin\theta\,d\theta\,d\phi}" description="Ratio of radiation intensity in max direction to average over all directions" />
          <EquationCard title="Gain–Efficiency Relation" math="G = \eta_A \cdot D" description="Gain = radiation efficiency × directivity. Losses (conductor, dielectric) reduce gain below directivity." />
        </div>

        <InfoCallout type="engineer" title="Engineering Rule of Thumb">
          Every 3 dB of additional antenna gain doubles the effective radiated power (EIRP) — just like
          adding 3 dB of transmit power. And unlike power amplifiers, antenna gain is free — it just
          redirects energy rather than generating it.
        </InfoCallout>
      </motion.div>
    </div>
  );
}
