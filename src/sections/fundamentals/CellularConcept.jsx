import { useState, useMemo, useRef } from 'react';
import { motion } from 'framer-motion';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import SceneWrapper from '../../components/three/SceneWrapper';
import { ParameterSlider, ParameterPanel, ToggleGroup, InfoCallout } from '../../components/interactive/ParameterPanel';
import { Equation, EquationCard } from '../../components/math/Equation';
import { reuseDistance, cellsTocover } from '../../utils/wireless-math';
import { CLUSTER_SIZES } from '../../utils/constants';

const CLUSTER_COLORS = [
  '#14b8a6', '#6366f1', '#f59e0b', '#ef4444',
  '#22c55e', '#ec4899', '#06b6d4', '#8b5cf6',
  '#f97316', '#84cc16', '#a855f7', '#0ea5e9', '#e11d48',
  '#10b981', '#7c3aed', '#d97706', '#dc2626',
  '#059669', '#4f46e5'
];

function hexCorners(cx, cy, r) {
  const corners = [];
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i + Math.PI / 6;
    corners.push([cx + r * Math.cos(angle), cy + r * Math.sin(angle)]);
  }
  return corners;
}

function generateHexGrid(rings, clusterSize) {
  const cells = [];
  const dirs = [
    [1, 0], [0.5, Math.sqrt(3) / 2], [-0.5, Math.sqrt(3) / 2],
    [-1, 0], [-0.5, -Math.sqrt(3) / 2], [0.5, -Math.sqrt(3) / 2]
  ];
  const visited = new Set();
  const queue = [[0, 0]];
  visited.add('0,0');
  let idx = 0;

  while (queue.length > 0 && cells.length < (1 + 3 * rings * (rings + 1))) {
    const [q, r] = queue.shift();
    const x = q * 1.5;
    const y = r * Math.sqrt(3) + (q % 2 !== 0 ? Math.sqrt(3) / 2 : 0);
    cells.push({ q, r, x, y, clusterIdx: idx % clusterSize, id: idx });
    idx++;

    for (const [dq, dr] of [[1, 0], [-1, 0], [0, 1], [0, -1], [1, -1], [-1, 1]]) {
      const nq = q + dq, nr = r + dr;
      const key = `${nq},${nr}`;
      if (!visited.has(key)) {
        visited.add(key);
        queue.push([nq, nr]);
      }
    }
  }
  return cells;
}

function HexCell3D({ x, z, color, isCoChannel, radius = 0.9 }) {
  const meshRef = useRef();
  const height = isCoChannel ? 0.4 : 0.15;

  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, height / 2, 0]} ref={meshRef}>
        <cylinderGeometry args={[radius, radius, height, 6]} />
        <meshStandardMaterial
          color={color}
          transparent
          opacity={isCoChannel ? 0.9 : 0.5}
          metalness={0.1}
          roughness={0.7}
        />
      </mesh>
      <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[radius - 0.02, radius, 6]} />
        <meshBasicMaterial color={color} transparent opacity={0.3} />
      </mesh>
    </group>
  );
}

function CellGrid3D({ clusterSize, cellRadius, highlightCluster }) {
  const cells = useMemo(() => generateHexGrid(3, clusterSize), [clusterSize]);

  return (
    <group>
      {cells.map((cell) => {
        const isCoChannel = highlightCluster !== null && cell.clusterIdx === highlightCluster;
        return (
          <HexCell3D
            key={cell.id}
            x={cell.x * 1.05}
            z={cell.y * 1.05}
            color={CLUSTER_COLORS[cell.clusterIdx % CLUSTER_COLORS.length]}
            isCoChannel={isCoChannel}
            radius={0.85}
          />
        );
      })}
      <gridHelper args={[30, 30, '#1a1a2e', '#1a1a2e']} position={[0, -0.01, 0]} />
    </group>
  );
}

export default function CellularConcept() {
  const [clusterSize, setClusterSize] = useState(7);
  const [cellRadius, setCellRadius] = useState(2);
  const [highlightCluster, setHighlightCluster] = useState(0);
  const [areaKm2, setAreaKm2] = useState(100);

  const D = reuseDistance(cellRadius, clusterSize);
  const numCells = cellsTocover(areaKm2, cellRadius);
  const numBS = Math.ceil(numCells / clusterSize) * clusterSize;

  return (
    <div className="section-container py-10">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-2 mb-2">
          <div className="w-2 h-2 rounded-full" style={{ background: 'var(--color-accent-teal)' }} />
          <span className="text-sm font-medium" style={{ color: 'var(--color-accent-teal)' }}>1.4 · Fundamentals</span>
        </div>
        <h1 className="mb-3">The Cellular Concept</h1>
        <p className="text-lg mb-8 max-w-2xl" style={{ color: 'var(--color-text-secondary)' }}>
          Divide a coverage area into cells, each served by a base station. Reuse frequencies in non-adjacent
          cells to serve more users with limited spectrum.
        </p>

        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2">
            <SceneWrapper height="450px" cameraPosition={[0, 12, 8]} cameraFov={50} enablePan>
              <CellGrid3D clusterSize={clusterSize} cellRadius={cellRadius} highlightCluster={highlightCluster} />
            </SceneWrapper>
          </div>

          <div className="space-y-4">
            <ParameterPanel title="Cell Parameters">
              <div className="mb-4">
                <label className="text-sm font-medium mb-2 block" style={{ color: 'var(--color-text-secondary)' }}>
                  Cluster Size (K)
                </label>
                <div className="flex flex-wrap gap-2">
                  {CLUSTER_SIZES.map((k) => (
                    <button key={k} onClick={() => setClusterSize(k)}
                      className="px-3 py-1.5 rounded-lg text-sm font-mono font-medium cursor-pointer border transition-all"
                      style={{
                        background: clusterSize === k ? 'var(--color-accent-teal)' : 'var(--color-bg-tertiary)',
                        color: clusterSize === k ? 'var(--color-text-inverse)' : 'var(--color-text-secondary)',
                        borderColor: clusterSize === k ? 'var(--color-accent-teal)' : 'var(--color-border-subtle)',
                      }}>
                      K={k}
                    </button>
                  ))}
                </div>
                <div className="text-xs mt-2 italic" style={{ color: 'var(--color-text-tertiary)', borderLeft: '2px solid var(--color-accent-teal)', paddingLeft: '8px' }}>
                  Cluster Size (K) is the number of cells that share the total frequency spectrum. A smaller K means each cell gets more frequencies (higher capacity), but suffers more interference. Only specific values (i² + ij + j²) are possible.
                </div>
              </div>
              <ParameterSlider label="Cell Radius (R)" value={cellRadius} min={0.5} max={10} step={0.5}
                onChange={setCellRadius} unit="km" 
                description="A smaller cell radius increases system capacity because frequencies are reused more often in a given area, but it requires building more cell towers." />
              <ParameterSlider label="Highlight Cluster #" value={highlightCluster} min={0}
                max={clusterSize - 1} step={1} onChange={setHighlightCluster}
                color={CLUSTER_COLORS[highlightCluster % CLUSTER_COLORS.length]}
                formatValue={(v) => `Cell ${v} (co-channel)`} 
                description="This highlights all the cells in the grid that are using the exact same frequency band (co-channel cells)." />
            </ParameterPanel>

            <div className="glass-card p-5">
              <h4 className="text-sm font-semibold mb-3" style={{ color: 'var(--color-accent-teal)' }}>Calculated Values</h4>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Reuse Distance (D)</span>
                  <span className="font-mono font-semibold text-sm" style={{ color: 'var(--color-accent-amber)' }}>{D.toFixed(1)} km</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>D/R Ratio</span>
                  <span className="font-mono font-semibold text-sm" style={{ color: 'var(--color-accent-blue)' }}>{(D / cellRadius).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Co-channel SIR ↑</span>
                  <span className="font-mono font-semibold text-sm" style={{ color: clusterSize >= 7 ? 'var(--color-accent-green)' : 'var(--color-accent-red)' }}>
                    {clusterSize >= 7 ? 'Good' : 'Low'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <EquationCard title="Co-channel Reuse Distance" math="D = R\sqrt{3K}" description="D is the distance between co-channel cells, R is cell radius, K is the cluster size. Larger K → more separation → less interference, but fewer channels per cell." className="mb-6" />

        {/* Coverage planning */}
        <div className="glass-card p-6 mb-8">
          <h3 className="text-base font-semibold mb-4">🏙️ Coverage Planning Exercise</h3>
          <p className="text-sm mb-4" style={{ color: 'var(--color-text-secondary)' }}>How many base stations do you need?</p>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <ParameterSlider label="Area to cover" value={areaKm2} min={10} max={500} step={10} onChange={setAreaKm2} unit="km²" 
                description="The total geographical area of the city or region you want to provide cellular service to." />
              <div className="mt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span style={{ color: 'var(--color-text-secondary)' }}>With K={clusterSize}, R={cellRadius} km:</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span style={{ color: 'var(--color-text-secondary)' }}>Cells needed:</span>
                  <span className="font-mono font-bold" style={{ color: 'var(--color-accent-teal)' }}>{numCells}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span style={{ color: 'var(--color-text-secondary)' }}>Base stations (rounded to clusters):</span>
                  <span className="font-mono font-bold" style={{ color: 'var(--color-accent-amber)' }}>{numBS}</span>
                </div>
              </div>
            </div>
            <div className="p-4 rounded-lg" style={{ background: 'var(--color-bg-tertiary)' }}>
              <h4 className="text-sm font-semibold mb-2">Compare K=4 vs K=7 vs K=12</h4>
              {[4, 7, 12].map((k) => {
                const n = cellsTocover(areaKm2, cellRadius);
                const bs = Math.ceil(n / k) * k;
                return (
                  <div key={k} className="flex items-center gap-2 mb-2">
                    <div className="w-8 text-xs font-mono" style={{ color: 'var(--color-text-tertiary)' }}>K={k}</div>
                    <div className="flex-1 h-4 rounded-full overflow-hidden" style={{ background: 'var(--color-bg-primary)' }}>
                      <div className="h-full rounded-full" style={{ width: `${(bs / 200) * 100}%`, background: CLUSTER_COLORS[k % CLUSTER_COLORS.length] }} />
                    </div>
                    <span className="text-xs font-mono w-12 text-right" style={{ color: 'var(--color-text-secondary)' }}>{bs} BS</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <InfoCallout type="engineer" title="Engineer's Trade-off">
          Smaller cluster size (K) = more channels per cell = more capacity, but also more co-channel
          interference. In practice, K=7 is the classic cellular reuse pattern for analog systems,
          while modern digital systems can use K=1 or K=3 with advanced interference management (like CDMA or OFDMA).
        </InfoCallout>
      </motion.div>
    </div>
  );
}
