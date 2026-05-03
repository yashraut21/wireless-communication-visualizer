import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment } from '@react-three/drei';

function LoadingFallback() {
  return (
    <div className="w-full h-full flex items-center justify-center"
         style={{ background: 'var(--color-bg-secondary)' }}>
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
             style={{ borderColor: 'var(--color-accent-teal)', borderTopColor: 'transparent' }} />
        <span className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>Loading 3D scene...</span>
      </div>
    </div>
  );
}

export default function SceneWrapper({
  children,
  height = '400px',
  className = '',
  cameraPosition = [5, 3, 5],
  cameraFov = 50,
  enableOrbit = true,
  enableZoom = true,
  enablePan = false,
  ambientIntensity = 0.4,
  style = {},
}) {
  return (
    <div
      className={`relative rounded-xl overflow-hidden ${className}`}
      style={{
        height,
        background: 'var(--color-bg-secondary)',
        border: '1px solid var(--color-border-subtle)',
        ...style,
      }}
    >
      <Suspense fallback={<LoadingFallback />}>
        <Canvas
          gl={{ antialias: true, alpha: true }}
          dpr={[1, 2]}
          style={{ background: 'transparent' }}
        >
          <PerspectiveCamera makeDefault position={cameraPosition} fov={cameraFov} />

          {enableOrbit && (
            <OrbitControls
              enableZoom={enableZoom}
              enablePan={enablePan}
              autoRotate={false}
              dampingFactor={0.05}
              minDistance={2}
              maxDistance={30}
            />
          )}

          <ambientLight intensity={ambientIntensity} />
          <directionalLight position={[10, 10, 5]} intensity={0.8} color="#ffffff" />
          <pointLight position={[-5, 5, -5]} intensity={0.3} color="#14b8a6" />

          {children}
        </Canvas>
      </Suspense>

      {/* Subtle corner label */}
      <div
        className="absolute bottom-2 right-3 text-xs px-2 py-1 rounded"
        style={{
          background: 'oklch(0 0 0 / 0.5)',
          color: 'var(--color-text-tertiary)',
          backdropFilter: 'blur(4px)',
        }}
      >
        Drag to rotate • Scroll to zoom
      </div>
    </div>
  );
}
