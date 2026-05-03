import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ParameterSlider, InfoCallout } from '../../components/interactive/ParameterPanel';
import { EquationCard } from '../../components/math/Equation';

// Box-Muller transform for normal distribution
function randomGaussian() {
  let u = 0, v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}

export default function ConstellationDiagrams() {
  const [scheme, setScheme] = useState('16QAM');
  const [snrDb, setSnrDb] = useState(15);
  const [numSymbols, setNumSymbols] = useState(500);

  const schemeDetails = {
    BPSK: { points: [-1, 1].map(x => [x, 0]), math: "s(t) = A_c \\cos(2\\pi f_c t + \\pi m)", title: "Binary Phase Shift Keying" },
    QPSK: { points: [[-1, -1], [-1, 1], [1, -1], [1, 1]], math: "s(t) = A_c \\cos(2\\pi f_c t + \\theta_m)", title: "Quadrature Phase Shift Keying" },
    '16QAM': { 
      points: [-3, -1, 1, 3].flatMap(x => [-3, -1, 1, 3].map(y => [x, y])),
      math: "s(t) = A_m \\cos(2\\pi f_c t) + B_m \\sin(2\\pi f_c t)", 
      title: "16-ary Quadrature Amplitude Modulation" 
    },
    '64QAM': {
      points: [-7, -5, -3, -1, 1, 3, 5, 7].flatMap(x => [-7, -5, -3, -1, 1, 3, 5, 7].map(y => [x, y])),
      math: "s(t) = A_m \\cos(2\\pi f_c t) + B_m \\sin(2\\pi f_c t)",
      title: "64-ary QAM"
    }
  };

  const currentScheme = schemeDetails[scheme];

  const points = useMemo(() => {
    const data = [];
    const idealPoints = currentScheme.points;
    
    // Normalize constellation to average power of 1
    const avgPower = idealPoints.reduce((acc, val) => acc + (val[0]*val[0] + val[1]*val[1]), 0) / idealPoints.length;
    const scale = 1 / Math.sqrt(avgPower);
    
    // SNR to noise variance. SNR = 10 * log10(1 / N0)
    // N0 = 1 / 10^(SNR/10). Noise per dimension is N0/2.
    const noiseVar = Math.pow(10, -snrDb / 10) / 2;
    const noiseStd = Math.sqrt(noiseVar);

    for (let i = 0; i < numSymbols; i++) {
      const ideal = idealPoints[Math.floor(Math.random() * idealPoints.length)];
      
      const iVal = ideal[0] * scale + randomGaussian() * noiseStd;
      const qVal = ideal[1] * scale + randomGaussian() * noiseStd;
      
      // We'll also return the ideal point for highlighting or color coding
      data.push({ x: iVal, y: qVal, ix: ideal[0] * scale, iy: ideal[1] * scale });
    }
    
    return data;
  }, [scheme, snrDb, numSymbols, currentScheme]);

  return (
    <div className="section-container py-10">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-2 mb-2">
          <div className="w-2 h-2 rounded-full" style={{ background: '#06b6d4' }} />
          <span className="text-sm font-medium" style={{ color: '#06b6d4' }}>7.1 · Modulation</span>
        </div>
        <h1 className="mb-3">Constellation Diagrams & Noise</h1>
        <p className="text-lg mb-8 max-w-2xl" style={{ color: 'var(--color-text-secondary)' }}>
          Digital modulation maps bits into distinct amplitude and phase shifts of a carrier wave. 
          A constellation diagram plots these shifts on the complex plane (In-Phase and Quadrature).
        </p>

        <div className="grid lg:grid-cols-12 gap-6 mb-8">
          {/* Controls */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            <div className="glass-card p-6">
              <h3 className="text-base font-semibold mb-4">Parameters</h3>
              
              <div className="mb-6">
                <div className="text-sm mb-2" style={{ color: 'var(--color-text-tertiary)' }}>Modulation Scheme</div>
                <div className="grid grid-cols-2 gap-2">
                  {Object.keys(schemeDetails).map(m => (
                    <button key={m} onClick={() => setScheme(m)}
                      className={`py-2 text-xs font-semibold rounded-md transition-all border ${scheme === m ? 'bg-[#06b6d4]/20 border-[#06b6d4] text-[#06b6d4]' : 'bg-transparent border-white/10 text-gray-400 hover:border-white/30'}`}>
                      {m}
                    </button>
                  ))}
                </div>
              </div>
              
              <ParameterSlider 
                label="Signal-to-Noise Ratio (SNR dB)" 
                value={snrDb} min={0} max={30} step={1}
                onChange={setSnrDb} 
                color="var(--color-accent-amber)"
                description="Higher SNR means less noise, keeping the symbol points tightly clustered around their ideal locations."
              />
              
              <div className="mt-4">
                <ParameterSlider 
                  label="Number of Symbols" 
                  value={numSymbols} min={100} max={2000} step={100}
                  onChange={setNumSymbols} 
                  color="var(--color-text-tertiary)"
                  description="How many symbols are plotted in the scatter diagram."
                />
              </div>
            </div>
            
            <EquationCard 
              title={currentScheme.title} 
              math={currentScheme.math} 
              description="A combination of orthogonal cosine (I) and sine (Q) waves can represent any phase/amplitude." 
            />
          </div>

          {/* Graph */}
          <div className="lg:col-span-8 glass-card p-6 flex flex-col items-center justify-center">
            <h3 className="text-base font-semibold mb-4 w-full text-left">I/Q Scatter Plot</h3>
            
            {/* Custom SVG Scatter Plot */}
            <div className="relative aspect-square w-full max-w-[450px] border border-white/10 rounded-lg overflow-hidden" style={{ background: 'var(--color-bg-secondary)' }}>
              <svg width="100%" height="100%" viewBox="-2 -2 4 4">
                {/* Axes */}
                <line x1="-2" y1="0" x2="2" y2="0" stroke="oklch(1 0 0 / 0.15)" strokeWidth={0.02} />
                <line x1="0" y1="-2" x2="0" y2="2" stroke="oklch(1 0 0 / 0.15)" strokeWidth={0.02} />
                
                {/* Grid circles for visual reference */}
                {[0.5, 1, 1.5].map(r => (
                  <circle key={r} cx="0" cy="0" r={r} fill="none" stroke="oklch(1 0 0 / 0.05)" strokeWidth={0.01} strokeDasharray="0.05 0.05" />
                ))}

                {/* Received noisy points */}
                <g opacity={0.6}>
                  {points.map((pt, i) => (
                    <circle key={i} cx={pt.x} cy={-pt.y} r={0.02} fill="#06b6d4" />
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
                        <line x1={cx - 0.05} y1={cy} x2={cx + 0.05} y2={cy} stroke="#ef4444" strokeWidth={0.03} />
                        <line x1={cx} y1={cy - 0.05} x2={cx} y2={cy + 0.05} stroke="#ef4444" strokeWidth={0.03} />
                      </g>
                    );
                  })}
                </g>
              </svg>

              {/* Labels */}
              <div className="absolute top-2 right-4 text-xs font-semibold text-gray-500">Q (Quadrature)</div>
              <div className="absolute bottom-4 right-2 text-xs font-semibold text-gray-500">I (In-Phase)</div>
            </div>
            
            <div className="mt-4 text-sm text-center" style={{ color: 'var(--color-text-tertiary)' }}>
              Blue dots: Received symbols with AWGN. Red crosses: Ideal transmission points.<br/>
              When blue dots cross the halfway boundary between red crosses, a bit error occurs!
            </div>
          </div>
        </div>

        <InfoCallout type="aha" title="The Trade-off: Capacity vs. Robustness">
          Why don't we always use 64-QAM to send 6 bits per symbol? Notice what happens when you lower the SNR for 64-QAM compared to QPSK. The points in 64-QAM are packed much closer together, so even a little noise causes the points to overlap, causing errors. High-order modulation requires extremely clean, high-SNR channels!
        </InfoCallout>
      </motion.div>
    </div>
  );
}
