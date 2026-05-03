import { useState, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import SceneWrapper from '../../components/three/SceneWrapper';
import { ParameterSlider, ToggleGroup, InfoCallout } from '../../components/interactive/ParameterPanel';
import { EquationCard } from '../../components/math/Equation';
import { PI } from '../../utils/constants';

/* Animated polarization wave in 3D */
function PolarizationWave({ type, tiltDeg = 0 }) {
  const groupRef = useRef();
  const POINTS = 200;
  const LENGTH = 10;

  // Lines for E-field trace
  const eLineRef = useRef();
  const hLineRef = useRef();
  const traceRef = useRef();

  const baseGeo = useMemo(() => {
    const pts = [];
    for (let i = 0; i <= POINTS; i++) pts.push(new THREE.Vector3((i / POINTS) * LENGTH - 5, 0, 0));
    return new THREE.BufferGeometry().setFromPoints(pts);
  }, []);

  const traceGeo = useMemo(() => {
    const pts = [];
    for (let i = 0; i <= 120; i++) {
      pts.push(new THREE.Vector3(0, 0, 0));
    }
    return new THREE.BufferGeometry().setFromPoints(pts);
  }, []);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const tilt = (tiltDeg * PI) / 180;

    // Update E-field wave
    if (eLineRef.current) {
      const pos = eLineRef.current.geometry.attributes.position;
      for (let i = 0; i <= POINTS; i++) {
        const x = (i / POINTS) * LENGTH - 5;
        const phase = x * 2 - t * 3;
        let ey = 0, ez = 0;

        if (type === 'linear') {
          ey = Math.cos(tilt) * Math.sin(phase);
          ez = Math.sin(tilt) * Math.sin(phase);
        } else if (type === 'circular') {
          ey = Math.sin(phase);
          ez = Math.cos(phase);
        } else if (type === 'elliptical') {
          ey = Math.sin(phase);
          ez = 0.5 * Math.cos(phase);
        }
        pos.setY(i, ey);
        pos.setZ(i, ez);
      }
      pos.needsUpdate = true;
    }

    // Update polarization trace (at x=4.5)
    if (traceRef.current) {
      const pos = traceRef.current.geometry.attributes.position;
      const TRACE = 120;
      for (let i = 0; i < TRACE; i++) {
        const phase = (i / TRACE) * 2 * PI;
        let ey = 0, ez = 0;

        if (type === 'linear') {
          ey = Math.cos(tilt) * Math.sin(phase);
          ez = Math.sin(tilt) * Math.sin(phase);
        } else if (type === 'circular') {
          ey = Math.sin(phase);
          ez = Math.cos(phase);
        } else if (type === 'elliptical') {
          ey = Math.sin(phase);
          ez = 0.5 * Math.cos(phase);
        }
        pos.setXYZ(i, 4.5, ey, ez);
      }
      pos.needsUpdate = true;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Propagation axis */}
      <line>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" count={2}
            array={new Float32Array([-5.5, 0, 0, 5.5, 0, 0])} itemSize={3} />
        </bufferGeometry>
        <lineBasicMaterial color="#334155" />
      </line>

      {/* E-field wave */}
      <line ref={eLineRef}>
        <bufferGeometry {...{ attributes: { position: new THREE.BufferAttribute(new Float32Array((POINTS + 1) * 3), 3) } }} />
        <lineBasicMaterial color="#14b8a6" />
      </line>

      {/* Polarization trace circle/ellipse at end */}
      <line ref={traceRef}>
        <bufferGeometry {...{ attributes: { position: new THREE.BufferAttribute(new Float32Array(121 * 3), 3) } }} />
        <lineBasicMaterial color="#f59e0b" transparent opacity={0.6} />
      </line>

      {/* Axis labels (small spheres) */}
      <mesh position={[0, 1.4, 0]}>
        <sphereGeometry args={[0.05, 8, 8]} />
        <meshBasicMaterial color="#94a3b8" />
      </mesh>
      <mesh position={[0, 0, 1.4]}>
        <sphereGeometry args={[0.05, 8, 8]} />
        <meshBasicMaterial color="#94a3b8" />
      </mesh>
    </group>
  );
}

const POLAR_TYPES = [
  { value: 'linear', label: 'Linear' },
  { value: 'circular', label: 'Circular' },
  { value: 'elliptical', label: 'Elliptical' },
];

const POL_INFO = {
  linear: {
    color: '#14b8a6',
    title: 'Linear Polarization',
    desc: 'The E-field oscillates in a single plane. Can be horizontal, vertical, or at any tilt angle. Most common in practice.',
    mismatchNote: 'A perfectly cross-polarized receive antenna (90° misaligned) receives 0 power — theoretically infinite loss.',
    examples: ['TV antennas (horizontal)', 'Mobile base stations (vertical)', 'Satellite TV (linear)'],
  },
  circular: {
    color: '#8b5cf6',
    title: 'Circular Polarization',
    desc: 'The E-field rotates at a constant rate. Can be RHCP or LHCP. Immune to Faraday rotation in ionospheric paths.',
    mismatchNote: 'A linear antenna receives half the power (−3 dB) from a circularly polarized wave.',
    examples: ['GPS signals (RHCP)', 'Satellite uplinks', 'Some WiFi systems'],
  },
  elliptical: {
    color: '#f59e0b',
    title: 'Elliptical Polarization',
    desc: 'The most general form — E-field traces an ellipse. Linear and circular are special cases.',
    mismatchNote: 'Loss depends on axial ratio. When axial ratio → 1, it becomes circular; → ∞ it becomes linear.',
    examples: ['Practical antennas (imperfect)', 'Reflected waves in multipath', 'Cross-polarized links'],
  },
};

export default function Polarization() {
  const [polType, setPolType] = useState('linear');
  const [tiltDeg, setTiltDeg] = useState(0);
  const info = POL_INFO[polType];

  return (
    <div className="section-container py-10">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-2 mb-2">
          <div className="w-2 h-2 rounded-full" style={{ background: '#14b8a6' }} />
          <span className="text-sm font-medium" style={{ color: '#14b8a6' }}>2.4 · Antennas</span>
        </div>
        <h1 className="mb-3">Polarization</h1>
        <p className="text-lg mb-8 max-w-2xl" style={{ color: 'var(--color-text-secondary)' }}>
          Polarization describes the orientation of the E-field as the wave propagates.
          Mismatched polarization between TX and RX antennas causes signal loss.
        </p>

        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          {/* Controls */}
          <div className="space-y-4">
            <div className="glass-card p-5">
              <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--color-text-secondary)' }}>Polarization Type</h3>
              <div className="space-y-2">
                {POLAR_TYPES.map((pt) => (
                  <button key={pt.value} onClick={() => setPolType(pt.value)}
                    className="w-full p-3 rounded-lg text-left cursor-pointer border transition-all"
                    style={{
                      background: polType === pt.value ? `color-mix(in oklch, ${POL_INFO[pt.value].color} 10%, var(--color-bg-secondary))` : 'var(--color-bg-secondary)',
                      borderColor: polType === pt.value ? POL_INFO[pt.value].color : 'var(--color-border-subtle)',
                    }}>
                    <span className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>{pt.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {polType === 'linear' && (
              <div className="glass-card p-5">
                <ParameterSlider
                  label="Tilt angle"
                  value={tiltDeg} min={0} max={90} step={5}
                  onChange={setTiltDeg} unit="°" color="#14b8a6"
                  description="Changes the physical orientation of the antenna. Mismatching the angle between transmitter and receiver causes significant signal loss."
                />
                <div className="flex justify-between text-xs mt-1" style={{ color: 'var(--color-text-tertiary)' }}>
                  <span>Horizontal</span><span>45°</span><span>Vertical</span>
                </div>
              </div>
            )}

            {/* Polarization mismatch loss table */}
            <div className="glass-card p-5">
              <h4 className="text-sm font-semibold mb-3" style={{ color: 'var(--color-text-secondary)' }}>
                Mismatch Loss
              </h4>
              <div className="space-y-2 text-xs">
                {[0, 30, 45, 60, 90].map((angle) => {
                  const loss = -20 * Math.log10(Math.abs(Math.cos((angle * PI) / 180)));
                  return (
                    <div key={angle} className="flex items-center gap-2">
                      <span className="w-10 text-right font-mono" style={{ color: 'var(--color-text-tertiary)' }}>{angle}°</span>
                      <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: 'var(--color-bg-tertiary)' }}>
                        <div className="h-full rounded-full transition-all" style={{
                          width: `${100 - Math.min(100, loss / 0.3)}%`,
                          background: angle === 90 ? 'var(--color-accent-red)' : '#14b8a6'
                        }} />
                      </div>
                      <span className="w-14 text-right font-mono" style={{ color: angle > 45 ? 'var(--color-accent-amber)' : 'var(--color-accent-teal)' }}>
                        {angle === 90 ? '−∞ dB' : `−${loss.toFixed(1)} dB`}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 3D Visualization */}
          <div className="lg:col-span-2 space-y-4">
            <SceneWrapper height="360px" cameraPosition={[3, 2, 6]} cameraFov={45} enablePan={false}>
              <PolarizationWave type={polType} tiltDeg={tiltDeg} />
            </SceneWrapper>

            <AnimatePresence mode="wait">
              <motion.div key={polType} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className="glass-card p-5"
                style={{ borderLeft: `3px solid ${info.color}` }}>
                <h3 className="font-semibold mb-2" style={{ color: info.color }}>{info.title}</h3>
                <p className="text-sm mb-3" style={{ color: 'var(--color-text-secondary)' }}>{info.desc}</p>
                <p className="text-sm mb-3" style={{ color: 'var(--color-text-tertiary)' }}>
                  <strong>Mismatch:</strong> {info.mismatchNote}
                </p>
                <div className="flex flex-wrap gap-2">
                  {info.examples.map((ex) => (
                    <span key={ex} className="text-xs px-2 py-1 rounded-md"
                          style={{ background: `color-mix(in oklch, ${info.color} 10%, transparent)`, color: info.color }}>
                      {ex}
                    </span>
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        <EquationCard title="Polarization Mismatch Loss" math="\text{PLF} = |\hat{e}_{TX} \cdot \hat{e}_{RX}|^2 = \cos^2(\psi)" description="PLF = Polarization Loss Factor. ψ = angle between TX and RX polarization directions. PLF = 1 (perfect match), PLF = 0 (cross-polarized)." className="mb-6" />

        <InfoCallout type="tip" title="Dual-Polarization in Modern Systems">
          Modern cellular base stations use dual-polarized antennas (±45°) to serve two polarizations
          simultaneously — doubling capacity without extra spectrum. This is called polarization diversity
          and is standard in 4G/5G systems.
        </InfoCallout>
      </motion.div>
    </div>
  );
}
