import { useState, useRef, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import SceneWrapper from '../../components/three/SceneWrapper';
import { ParameterSlider, InfoCallout } from '../../components/interactive/ParameterPanel';

// 3D Buildings
function Buildings() {
  const buildings = useMemo(() => {
    return [
      { pos: [-4, 1.5, -4], size: [2, 3, 2] },
      { pos: [4, 2, -3], size: [2, 4, 3] },
      { pos: [-3, 1, 4], size: [3, 2, 2] },
      { pos: [5, 1.5, 5], size: [2, 3, 2] },
      { pos: [0, 2.5, -6], size: [4, 5, 2] },
    ];
  }, []);

  return (
    <group>
      {buildings.map((b, i) => (
        <mesh key={i} position={b.pos} castShadow receiveShadow>
          <boxGeometry args={b.size} />
          <meshStandardMaterial color="#1e293b" metalness={0.5} roughness={0.2} />
          {/* Wireframe outline */}
          <lineSegments>
            <edgesGeometry attach="geometry" args={[new THREE.BoxGeometry(...b.size)]} />
            <lineBasicMaterial attach="material" color="#334155" linewidth={1} />
          </lineSegments>
        </mesh>
      ))}
    </group>
  );
}

// Ray from Tx to Rx (or via reflection)
function Ray({ start, end, color, dashScale = 2, opacity = 1 }) {
  const ref = useRef();
  
  const geometry = useMemo(() => {
    const points = [new THREE.Vector3(...start), new THREE.Vector3(...end)];
    return new THREE.BufferGeometry().setFromPoints(points);
  }, [start, end]);

  useFrame(({ clock }) => {
    if (ref.current && ref.current.material) {
      ref.current.material.dashOffset -= clock.getDelta() * 5;
    }
  });

  return (
    <line ref={ref} geometry={geometry}>
      <lineDashedMaterial 
        color={color} 
        linewidth={2} 
        scale={1} 
        dashSize={0.5 * dashScale} 
        gapSize={0.3 * dashScale} 
        transparent 
        opacity={opacity}
      />
    </line>
  );
}

// The Moving Car and Ray Tracing Logic
function RayTracingScene({ rxAngle, speed, showRays }) {
  const carRef = useRef();
  const txPos = [0, 6, 0]; // Cell tower height
  
  // Reflection points based on the buildings
  const reflectors = useMemo(() => [
    [-3, 1.5, -3], // Reflection off building 1
    [3, 2, -1.5],  // Reflection off building 2
    [-1.5, 1, 5],  // Reflection off building 3
  ], []);

  useFrame(({ clock }) => {
    if (!carRef.current) return;
    // Move the car in a circle or back and forth based on speed
    const t = clock.getElapsedTime() * (speed / 50);
    // Base position
    const radius = 6;
    const currentAngle = rxAngle * (Math.PI / 180) + t;
    
    carRef.current.position.x = Math.cos(currentAngle) * radius;
    carRef.current.position.z = Math.sin(currentAngle) * radius;
    carRef.current.rotation.y = -currentAngle + Math.PI; // point tangential
  });

  return (
    <group>
      {/* Transmitter (Cell Tower) */}
      <group position={[txPos[0], 0, txPos[2]]}>
        <mesh position={[0, txPos[1]/2, 0]}>
          <cylinderGeometry args={[0.1, 0.3, txPos[1]]} />
          <meshStandardMaterial color="#475569" />
        </mesh>
        <mesh position={[0, txPos[1], 0]}>
          <sphereGeometry args={[0.4]} />
          <meshBasicMaterial color="#ef4444" />
        </mesh>
        {/* Radiating rings */}
        <mesh position={[0, txPos[1], 0]} rotation={[Math.PI/2, 0, 0]}>
          <ringGeometry args={[0.5, 0.6, 32]} />
          <meshBasicMaterial color="#ef4444" transparent opacity={0.5} side={THREE.DoubleSide} />
        </mesh>
      </group>

      {/* Ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[30, 30]} />
        <meshStandardMaterial color="#0f172a" />
      </mesh>
      <gridHelper args={[30, 30, '#1e293b', '#1e293b']} position={[0, 0.01, 0]} />

      <Buildings />

      {/* Receiver (Car) */}
      <group ref={carRef} position={[6, 0.5, 0]}>
        <mesh castShadow>
          <boxGeometry args={[1, 0.6, 2]} />
          <meshStandardMaterial color="#3b82f6" />
        </mesh>
        
        {/* Rays converging at the car (updated dynamically via the useFrame hook? 
            Since lines need to update their vertices every frame if the car moves, 
            it's better to use a custom Line component that updates vertices.
            For simplicity in React, if the car moves slowly, we can just let React 
            re-render, but useFrame is better. Let's make a smart Ray component. */}
      </group>

      {/* We need a specialized component to draw rays to a moving target */}
      {showRays && <DynamicRays txPos={txPos} rxRef={carRef} reflectors={reflectors} />}
    </group>
  );
}

function DynamicRays({ txPos, rxRef, reflectors }) {
  const lineLosRef = useRef();
  const lineReflRefs = useRef(reflectors.map(() => React.createRef()));

  useFrame(({ clock }) => {
    if (!rxRef.current) return;
    const rxPos = rxRef.current.position;

    // Update LOS Ray
    if (lineLosRef.current) {
      const positions = lineLosRef.current.geometry.attributes.position;
      positions.setXYZ(0, txPos[0], txPos[1], txPos[2]);
      positions.setXYZ(1, rxPos.x, rxPos.y, rxPos.z);
      positions.needsUpdate = true;
      lineLosRef.current.material.dashOffset -= 0.05;
      lineLosRef.current.computeLineDistances();
    }

    // Update Reflected Rays
    reflectors.forEach((refl, i) => {
      const ref = lineReflRefs.current[i];
      if (ref && ref.current) {
        const positions = ref.current.geometry.attributes.position;
        positions.setXYZ(0, txPos[0], txPos[1], txPos[2]);
        positions.setXYZ(1, refl[0], refl[1], refl[2]);
        positions.setXYZ(2, rxPos.x, rxPos.y, rxPos.z);
        positions.needsUpdate = true;
        ref.current.material.dashOffset -= 0.05;
        ref.current.computeLineDistances();
      }
    });
  });

  // Create initial geometries with 2 points for LOS and 3 points for reflections
  const losGeometry = useMemo(() => new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3()]), []);
  const reflGeometries = useMemo(() => reflectors.map(() => new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3()])), [reflectors]);

  return (
    <group>
      <line ref={lineLosRef} geometry={losGeometry}>
        <lineDashedMaterial color="#ef4444" linewidth={2} dashSize={0.4} gapSize={0.2} />
      </line>
      
      {reflectors.map((refl, i) => (
        <line key={i} ref={lineReflRefs.current[i]} geometry={reflGeometries[i]}>
          <lineDashedMaterial color="#10b981" linewidth={1.5} dashSize={0.3} gapSize={0.15} opacity={0.6} transparent />
        </line>
      ))}
    </group>
  );
}
import React from 'react';

export default function FadingSimulator() {
  const [speed, setSpeed] = useState(20); // Arbitrary speed unit
  const [rxAngle, setRxAngle] = useState(0); // Starting angle
  const [showRays, setShowRays] = useState(true);

  return (
    <div className="section-container py-10">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-2 mb-2">
          <div className="w-2 h-2 rounded-full" style={{ background: '#ef4444' }} />
          <span className="text-sm font-medium" style={{ color: '#ef4444' }}>5.5 · Small-Scale Fading</span>
        </div>
        <h1 className="mb-3">Fading Simulator (3D)</h1>
        <p className="text-lg mb-8 max-w-2xl" style={{ color: 'var(--color-text-secondary)' }}>
          Visualize how a moving receiver travels through a complex multipath environment. 
          The combination of all these rays arriving with different phases causes rapid, deep fades.
        </p>

        <div className="grid lg:grid-cols-12 gap-6 mb-8">
          {/* 3D Visualization */}
          <div className="lg:col-span-8 glass-card overflow-hidden">
            <SceneWrapper
              height="500px"
              cameraPosition={[0, 15, 15]}
              cameraFov={50}
              enablePan={false}
            >
              <RayTracingScene rxAngle={rxAngle} speed={speed} showRays={showRays} />
              
              <ambientLight intensity={0.4} />
              <directionalLight position={[10, 20, 10]} intensity={1} castShadow />
            </SceneWrapper>
          </div>

          {/* Controls */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            <div className="glass-card p-6">
              <h3 className="text-base font-semibold mb-4">Simulation Controls</h3>
              
              <ParameterSlider 
                label="Car Speed" 
                value={speed} min={0} max={100} step={5}
                onChange={setSpeed} 
                color="var(--color-accent-blue)"
                description="Controls how fast the car moves through the spatial interference pattern. Faster speed = faster fading."
              />
              <div className="text-xs mt-1 mb-4" style={{ color: 'var(--color-text-tertiary)' }}>
                Set to 0 to stop the car and manually adjust position.
              </div>
              
              <div className="mt-4">
                <ParameterSlider 
                  label="Manual Position (Angle)" 
                  value={rxAngle} min={0} max={360} step={1}
                  onChange={setRxAngle} 
                  color="var(--color-accent-violet)"
                  description="When speed is 0, use this to manually drag the car through the interference standing wave pattern."
                />
              </div>

              <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between">
                <span className="text-sm text-gray-300">Show Ray Paths</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" checked={showRays} onChange={(e) => setShowRays(e.target.checked)} />
                  <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#ef4444]"></div>
                </label>
              </div>

              <div className="mt-6 p-3 rounded-lg" style={{ background: 'var(--color-bg-tertiary)' }}>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-1 bg-[#ef4444]" />
                  <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>Direct Line-of-Sight (LOS) Path</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-1 bg-[#10b981]" />
                  <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>Reflected / Scattered Paths</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <InfoCallout type="aha" title="The Fading Pattern is Spatial, Not Temporal!">
          Notice that if you stop the car (Speed = 0), the fading stops! The multipath interference pattern 
          exists as a standing wave pattern in space. <em>Fading in time</em> only happens because the receiver 
          is <em>moving through</em> this spatial pattern.
        </InfoCallout>
      </motion.div>
    </div>
  );
}
