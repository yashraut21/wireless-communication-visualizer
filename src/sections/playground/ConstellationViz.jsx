import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ParameterSlider, ToggleGroup, InfoCallout } from '../../components/interactive/ParameterPanel';

// Box-Muller transform for normal distribution
function randomGaussian() {
  let u = 0, v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}

export default function ConstellationViz() {
  const [scheme, setScheme] = useState('16QAM');
  const [snrDb, setSnrDb] = useState(30); // High SNR by default to see other impairments
  const [phaseNoiseDeg, setPhaseNoiseDeg] = useState(0); // standard deviation in degrees
  const [iqGainImbal, setIqGainImbal] = useState(0); // dB difference (e.g., Q is X dB lower than I)
  const [iqPhaseImbal, setIqPhaseImbal] = useState(0); // degrees off orthogonality

  const schemeDetails = {
    QPSK: { points: [[-1, -1], [-1, 1], [1, -1], [1, 1]] },
    '16QAM': { points: [-3, -1, 1, 3].flatMap(x => [-3, -1, 1, 3].map(y => [x, y])) },
    '64QAM': { points: [-7, -5, -3, -1, 1, 3, 5, 7].flatMap(x => [-7, -5, -3, -1, 1, 3, 5, 7].map(y => [x, y])) }
  };

  const points = useMemo(() => {
    const data = [];
    const currentScheme = schemeDetails[scheme];
    const idealPoints = currentScheme.points;
    const numSymbols = 1000;
    
    // Normalize constellation to average power of 1
    const avgPower = idealPoints.reduce((acc, val) => acc + (val[0]*val[0] + val[1]*val[1]), 0) / idealPoints.length;
    const scale = 1 / Math.sqrt(avgPower);
    
    // Noise variance
    const noiseVar = Math.pow(10, -snrDb / 10) / 2;
    const noiseStd = Math.sqrt(noiseVar);

    // I/Q Imbalance params
    const gainQ = Math.pow(10, iqGainImbal / 20); // linear voltage gain
    const thetaImbalRad = (iqPhaseImbal * Math.PI) / 180;

    for (let i = 0; i < numSymbols; i++) {
      const ideal = idealPoints[Math.floor(Math.random() * idealPoints.length)];
      
      let I = ideal[0] * scale;
      let Q = ideal[1] * scale;

      // 1. I/Q Imbalance (Receiver Hardware Defect)
      // Standard model: I branch is perfect, Q branch has gain g and phase error theta
      const I_imbal = I;
      const Q_imbal = gainQ * (-I * Math.sin(thetaImbalRad) + Q * Math.cos(thetaImbalRad));

      // 2. Phase Noise (Oscillator Defect)
      const phiNoiseRad = randomGaussian() * ((phaseNoiseDeg * Math.PI) / 180);
      const I_pn = I_imbal * Math.cos(phiNoiseRad) - Q_imbal * Math.sin(phiNoiseRad);
      const Q_pn = I_imbal * Math.sin(phiNoiseRad) + Q_imbal * Math.cos(phiNoiseRad);

      // 3. AWGN (Thermal Noise)
      const I_final = I_pn + randomGaussian() * noiseStd;
      const Q_final = Q_pn + randomGaussian() * noiseStd;
      
      data.push({ x: I_final, y: Q_final });
    }
    
    return data;
  }, [scheme, snrDb, phaseNoiseDeg, iqGainImbal, iqPhaseImbal]);

  const currentScheme = schemeDetails[scheme];

  return (
    <div className="section-container py-10">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-2 mb-2">
          <div className="w-2 h-2 rounded-full" style={{ background: '#f59e0b' }} />
          <span className="text-sm font-medium" style={{ color: '#f59e0b' }}>10.5 · Playground</span>
        </div>
        <h1 className="mb-3">Advanced Constellation Analyzer</h1>
        <p className="text-lg mb-8 max-w-2xl" style={{ color: 'var(--color-text-secondary)' }}>
          Real-world transmitters and receivers are built from imperfect analog components. Inject Phase Noise and I/Q Imbalance to see how hardware defects warp the signal constellation.
        </p>

        <div className="grid lg:grid-cols-12 gap-6 mb-8">
          {/* Controls */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            <div className="glass-card p-6">
              <h3 className="text-base font-semibold mb-4 text-white">Modulation</h3>
              <ToggleGroup 
                options={[
                  { label: 'QPSK', value: 'QPSK' },
                  { label: '16-QAM', value: '16QAM' },
                  { label: '64-QAM', value: '64QAM' }
                ]}
                value={scheme}
                onChange={setScheme}
              />
              
              <h3 className="text-base font-semibold mb-4 mt-8 text-white">Channel Impairment</h3>
              <ParameterSlider label="SNR (Thermal Noise)" value={snrDb} min={5} max={40} step={1} onChange={setSnrDb} color="#3b82f6" unit="dB" />
              
              <h3 className="text-base font-semibold mb-4 mt-8 text-white">Hardware Impairments</h3>
              <ParameterSlider label="Phase Noise (Std Dev)" value={phaseNoiseDeg} min={0} max={15} step={0.5} onChange={setPhaseNoiseDeg} color="#ec4899" unit="°" description="Jitter in the Local Oscillator." />
              <ParameterSlider label="I/Q Gain Imbalance" value={iqGainImbal} min={-3} max={3} step={0.1} onChange={setIqGainImbal} color="#10b981" unit="dB" description="Amplitude mismatch between the I and Q mixers." />
              <ParameterSlider label="I/Q Phase Imbalance" value={iqPhaseImbal} min={-20} max={20} step={1} onChange={setIqPhaseImbal} color="#8b5cf6" unit="°" description="Mixer branches are not exactly 90° apart." />
            </div>
          </div>

          {/* Visualization */}
          <div className="lg:col-span-8 glass-card p-6 flex flex-col items-center justify-center">
            <h3 className="text-base font-semibold mb-4 w-full text-left">Impaired I/Q Scatter Plot</h3>
            
            <div className="relative aspect-square w-full max-w-[450px] border border-white/10 rounded-lg overflow-hidden" style={{ background: 'var(--color-bg-secondary)' }}>
              <svg width="100%" height="100%" viewBox="-2 -2 4 4">
                {/* Axes */}
                <line x1="-2" y1="0" x2="2" y2="0" stroke="oklch(1 0 0 / 0.15)" strokeWidth={0.02} />
                <line x1="0" y1="-2" x2="0" y2="2" stroke="oklch(1 0 0 / 0.15)" strokeWidth={0.02} />

                {/* Received noisy points */}
                <g opacity={0.6}>
                  {points.map((pt, i) => (
                    <circle key={i} cx={pt.x} cy={-pt.y} r={0.015} fill="#f59e0b" />
                  ))}
                </g>

                {/* Ideal Constellation Points (Red Crosses) */}
                <g>
                  {currentScheme.points.map((ideal, i) => {
                    const avgPower = currentScheme.points.reduce((acc, val) => acc + (val[0]*val[0] + val[1]*val[1]), 0) / currentScheme.points.length;
                    const scale = 1 / Math.sqrt(avgPower);
                    const cx = ideal[0] * scale;
                    const cy = -(ideal[1] * scale);
                    return (
                      <g key={`ideal-${i}`}>
                        <line x1={cx - 0.05} y1={cy} x2={cx + 0.05} y2={cy} stroke="#ef4444" strokeWidth={0.02} />
                        <line x1={cx} y1={cy - 0.05} x2={cx} y2={cy + 0.05} stroke="#ef4444" strokeWidth={0.02} />
                      </g>
                    );
                  })}
                </g>
              </svg>
            </div>
          </div>
        </div>

        <InfoCallout type="guide" title="How to use this visualizer">
          <strong>Goal:</strong> Diagnose hardware problems by looking at the scatter plot shape.<br/>
          <strong>Action:</strong> Set SNR to 40dB. Then, individually tweak Phase Noise, Gain Imbalance, and Phase Imbalance to see their unique geometric signatures.<br/>
          <strong>Practical Conclusion:</strong> 
          - <strong>Phase Noise</strong> causes points to smear into circular arcs (rotation). The outer points suffer the most displacement!
          - <strong>Gain Imbalance</strong> stretches the constellation into a tall rectangle or wide rectangle.
          - <strong>Phase Imbalance</strong> skews the constellation into a slanted parallelogram/diamond. 
          Hardware engineers use these exact visual signatures on lab oscilloscopes to debug faulty transceiver chips!
        </InfoCallout>
      </motion.div>
    </div>
  );
}
