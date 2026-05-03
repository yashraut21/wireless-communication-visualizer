import { useState, useRef, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import SceneWrapper from '../../components/three/SceneWrapper';
import { ParameterSlider, ParameterPanel, InfoCallout } from '../../components/interactive/ParameterPanel';
import { Equation, EquationCard } from '../../components/math/Equation';
import { wavelength, formatFrequency, formatDistance } from '../../utils/wireless-math';
import { SPEED_OF_LIGHT } from '../../utils/constants';

/* 3D Animated Sine Wave */
function AnimatedWave({ frequency, amplitude, color = '#14b8a6' }) {
  const lineRef = useRef();
  const POINTS = 300;

  const geometry = useMemo(() => {
    const points = [];
    for (let i = 0; i <= POINTS; i++) {
      points.push(new THREE.Vector3((i / POINTS) * 12 - 6, 0, 0));
    }
    return new THREE.BufferGeometry().setFromPoints(points);
  }, []);

  useFrame(({ clock }) => {
    if (!lineRef.current) return;
    const positions = lineRef.current.geometry.attributes.position;
    const t = clock.getElapsedTime();
    const waveNum = (2 * Math.PI * frequency) / 3; // Scaled wave number

    for (let i = 0; i <= POINTS; i++) {
      const x = (i / POINTS) * 12 - 6;
      const y = amplitude * Math.sin(waveNum * x - t * frequency * 2);
      positions.setY(i, y);
    }
    positions.needsUpdate = true;
  });

  return (
    <line ref={lineRef} geometry={geometry}>
      <lineBasicMaterial color={color} linewidth={2} />
    </line>
  );
}

/* Wavelength markers in 3D */
function WavelengthMarker({ frequency, amplitude }) {
  const waveLen = 3 / frequency; // Scaled wavelength
  const y = amplitude + 0.3;

  return (
    <group>
      {/* Arrow for one wavelength */}
      <line>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={2}
            array={new Float32Array([0, y, 0, waveLen, y, 0])}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial color="#f59e0b" />
      </line>
      {/* Vertical ticks */}
      {[0, waveLen].map((x, i) => (
        <line key={i}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={2}
              array={new Float32Array([x, y - 0.15, 0, x, y + 0.15, 0])}
              itemSize={3}
            />
          </bufferGeometry>
          <lineBasicMaterial color="#f59e0b" />
        </line>
      ))}
    </group>
  );
}

/* Grid helper plane */
function GridFloor() {
  return (
    <gridHelper
      args={[14, 28, '#1e293b', '#1e293b']}
      position={[0, -2.5, 0]}
      rotation={[0, 0, 0]}
    />
  );
}

export default function WhatIsAWave() {
  const [frequency, setFrequency] = useState(1);
  const [amplitude, setAmplitude] = useState(1.5);

  const lambda = wavelength(frequency * 1e9); // Treat slider as GHz
  const actualFreqHz = frequency * 1e9;

  return (
    <div className="section-container py-10">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        {/* Header */}
        <div className="flex items-center gap-2 mb-2">
          <div className="w-2 h-2 rounded-full" style={{ background: 'var(--color-accent-teal)' }} />
          <span className="text-sm font-medium" style={{ color: 'var(--color-accent-teal)' }}>
            1.1 · Fundamentals
          </span>
        </div>
        <h1 className="mb-3">What is a Wave?</h1>
        <p className="text-lg mb-8 max-w-2xl" style={{ color: 'var(--color-text-secondary)' }}>
          Everything in wireless communications starts with electromagnetic waves —
          oscillating electric and magnetic fields that propagate through space at the speed of light.
        </p>

        {/* Main interactive area */}
        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          {/* 3D Visualization */}
          <div className="lg:col-span-2">
            <SceneWrapper
              height="420px"
              cameraPosition={[0, 3, 8]}
              cameraFov={45}
              enablePan={false}
            >
              <AnimatedWave frequency={frequency} amplitude={amplitude} />
              <AnimatedWave frequency={frequency * 0.5} amplitude={amplitude * 0.3} color="#6366f1" />
              <WavelengthMarker frequency={frequency} amplitude={amplitude} />
              <GridFloor />
              {/* Axis labels */}
              <mesh position={[7, 0, 0]}>
                <sphereGeometry args={[0.06, 8, 8]} />
                <meshBasicMaterial color="#14b8a6" />
              </mesh>
            </SceneWrapper>
          </div>

          {/* Parameter Controls */}
          <div className="space-y-4">
            <ParameterPanel title="Wave Parameters">
              <ParameterSlider
                label="Frequency"
                value={frequency}
                min={0.1}
                max={5}
                step={0.1}
                onChange={setFrequency}
                formatValue={(v) => `${v.toFixed(1)} GHz`}
                description="Increasing frequency means more oscillations per second, leading to a shorter wavelength. Short waves carry more data but have less range."
              />
              <ParameterSlider
                label="Amplitude"
                value={amplitude}
                min={0.2}
                max={2.5}
                step={0.1}
                onChange={setAmplitude}
                formatValue={(v) => v.toFixed(1)}
                color="var(--color-accent-violet)"
                description="Amplitude represents the transmit power or signal strength. It does not affect the speed or wavelength of the signal."
              />
            </ParameterPanel>

            {/* Real-time calculations */}
            <div className="glass-card p-5">
              <h4 className="text-sm font-semibold mb-3" style={{ color: 'var(--color-accent-teal)' }}>
                Calculated Values
              </h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Wavelength (λ)</span>
                  <span className="font-mono font-semibold text-sm" style={{ color: 'var(--color-accent-amber)' }}>
                    {formatDistance(lambda)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Frequency (f)</span>
                  <span className="font-mono font-semibold text-sm" style={{ color: 'var(--color-accent-teal)' }}>
                    {formatFrequency(actualFreqHz)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Speed (c)</span>
                  <span className="font-mono font-semibold text-sm" style={{ color: 'var(--color-text-primary)' }}>
                    3 × 10⁸ m/s
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Equation Display */}
        <EquationCard
          title="The Fundamental Relationship"
          math="c = f \cdot \lambda"
          description="The speed of light (c ≈ 3 × 10⁸ m/s) equals frequency times wavelength. Higher frequency → shorter wavelength."
          className="mb-8"
        />

        {/* 5G vs 4G Comparison */}
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4">
            Why Do 5G Towers Need to Be <span className="gradient-text">Closer Together?</span>
          </h2>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="glass-card p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-3 h-3 rounded-full" style={{ background: '#3b82f6' }} />
                <h3 className="text-base font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                  4G LTE — 700 MHz
                </h3>
              </div>
              <div className="mb-3">
                <Equation math={`\\lambda = \\frac{c}{f} = \\frac{3 \\times 10^8}{700 \\times 10^6} = ${(SPEED_OF_LIGHT / 700e6).toFixed(2)} \\text{ m}`} />
              </div>
              <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                Wavelength is about <strong style={{ color: 'var(--color-accent-blue)' }}>43 cm</strong> —
                long waves travel far and penetrate buildings well.
              </p>
              <div className="mt-3 h-3 rounded-full overflow-hidden" style={{ background: 'var(--color-bg-tertiary)' }}>
                <div className="h-full rounded-full" style={{ width: '85%', background: '#3b82f6' }} />
              </div>
              <div className="text-xs mt-1" style={{ color: 'var(--color-text-tertiary)' }}>Coverage range: ~10-15 km</div>
            </div>

            <div className="glass-card p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-3 h-3 rounded-full" style={{ background: '#8b5cf6' }} />
                <h3 className="text-base font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                  5G mmWave — 28 GHz
                </h3>
              </div>
              <div className="mb-3">
                <Equation math={`\\lambda = \\frac{c}{f} = \\frac{3 \\times 10^8}{28 \\times 10^9} = ${(SPEED_OF_LIGHT / 28e9 * 100).toFixed(2)} \\text{ cm}`} />
              </div>
              <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                Wavelength is about <strong style={{ color: 'var(--color-accent-violet)' }}>1.07 cm</strong> —
                short waves carry more data but are easily blocked.
              </p>
              <div className="mt-3 h-3 rounded-full overflow-hidden" style={{ background: 'var(--color-bg-tertiary)' }}>
                <div className="h-full rounded-full" style={{ width: '15%', background: '#8b5cf6' }} />
              </div>
              <div className="text-xs mt-1" style={{ color: 'var(--color-text-tertiary)' }}>Coverage range: ~200-500 m</div>
            </div>
          </div>
        </div>

        <InfoCallout type="aha" title="The Key Insight">
          Higher frequency means shorter wavelength. Short waves carry more data (higher bandwidth)
          but are more easily absorbed and blocked by obstacles. That's why 5G mmWave towers must be
          much closer together than 4G towers — you're trading range for speed.
        </InfoCallout>

        <InfoCallout type="tip" title="Memory Aid">
          Think of it like sound: a bass note (low frequency) booms through walls, while a whistle
          (high frequency) gets blocked easily. Radio waves work the same way!
        </InfoCallout>
      </motion.div>
    </div>
  );
}
