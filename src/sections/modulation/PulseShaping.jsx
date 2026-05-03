import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ParameterSlider, InfoCallout } from '../../components/interactive/ParameterPanel';
import { EquationCard } from '../../components/math/Equation';
import { LineChart } from '../../components/charts/LineChart';

export default function PulseShaping() {
  const [alpha, setAlpha] = useState(0.5);

  const chartData = useMemo(() => {
    const timeData = [];
    const freqData = [];
    
    const T = 1; // Symbol period
    
    // Sinc function: sin(pi*x)/(pi*x)
    const sinc = (x) => {
      if (Math.abs(x) < 1e-6) return 1;
      return Math.sin(Math.PI * x) / (Math.PI * x);
    };

    // Time domain calculation: Raised Cosine Pulse
    for (let t = -4; t <= 4; t += 0.05) {
      // Handle the singularity at t = T / (2*alpha)
      let denominator = 1 - Math.pow(2 * alpha * t / T, 2);
      let p_t = 0;
      
      if (Math.abs(denominator) < 1e-5) {
        // L'Hopital's rule at singularity
        p_t = sinc(t/T) * (Math.PI / 4) * Math.sin(Math.PI / (2 * alpha));
      } else {
        p_t = sinc(t/T) * Math.cos(Math.PI * alpha * t / T) / denominator;
      }
      
      timeData.push({ x: t, y: p_t });
    }
    
    // Frequency domain calculation
    for (let f = 0; f <= 1; f += 0.01) {
      const fNorm = f * T; // Normalized frequency |f|T
      let H_f = 0;
      
      const f1 = (1 - alpha) / 2;
      const f2 = (1 + alpha) / 2;
      
      if (fNorm <= f1) {
        H_f = 1;
      } else if (fNorm > f1 && fNorm <= f2) {
        H_f = 0.5 * (1 + Math.cos((Math.PI / alpha) * (fNorm - f1)));
      } else {
        H_f = 0;
      }
      
      freqData.push({ x: f, y: H_f });
    }

    return {
      time: [{ label: `α = ${alpha}`, color: '#3b82f6', data: timeData }],
      freq: [{ label: `Spectrum (α = ${alpha})`, color: '#8b5cf6', data: freqData }]
    };
  }, [alpha]);

  return (
    <div className="section-container py-10">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-2 mb-2">
          <div className="w-2 h-2 rounded-full" style={{ background: '#3b82f6' }} />
          <span className="text-sm font-medium" style={{ color: '#3b82f6' }}>7.2 · Modulation</span>
        </div>
        <h1 className="mb-3">Pulse Shaping (Raised Cosine)</h1>
        <p className="text-lg mb-8 max-w-2xl" style={{ color: 'var(--color-text-secondary)' }}>
          Digital bits are conceptually square waves, which require infinite bandwidth to transmit perfectly. 
          To restrict bandwidth without causing Inter-Symbol Interference (ISI), we shape the pulses using a Raised Cosine filter.
        </p>

        <div className="grid lg:grid-cols-12 gap-6 mb-8">
          {/* Controls */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            <div className="glass-card p-6">
              <h3 className="text-base font-semibold mb-4">Parameters</h3>
              
              <ParameterSlider 
                label="Roll-off Factor (α)" 
                value={alpha} min={0} max={1} step={0.1}
                onChange={setAlpha} 
                color="var(--color-accent-blue)"
                description="Controls excess bandwidth. α=0 is a theoretical 'brick-wall' filter. α=1 requires 100% extra bandwidth but has very short time-domain ringing."
              />

              <div className="mt-6 pt-4 border-t border-white/10 flex flex-col gap-4">
                <div className="flex justify-between items-center">
                  <div className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>Bandwidth Required</div>
                  <div className="font-mono text-lg font-bold" style={{ color: 'var(--color-accent-violet)' }}>
                    B = W(1 + {alpha})
                  </div>
                </div>
              </div>
            </div>
            
            <EquationCard 
              title="Nyquist ISI Criterion" 
              math="p(nT_s) = \begin{cases} 1, & n = 0 \\ 0, & n \neq 0 \end{cases}" 
              description="Notice how in the time-domain plot, the pulse crosses zero at every integer multiple of T (except 0). This guarantees that adjacent symbols won't interfere with the current symbol at the sampling instant." 
            />
          </div>

          {/* Graphs */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            <div className="glass-card p-6 flex flex-col">
              <h3 className="text-base font-semibold mb-2">Time Domain Response</h3>
              <div className="min-h-[250px]">
                <LineChart 
                  data={chartData.time}
                  xLabel="Time (multiples of Symbol Period T)"
                  yLabel="Amplitude"
                  yDomain={[-0.3, 1.1]}
                  height={280}
                />
              </div>
            </div>

            <div className="glass-card p-6 flex flex-col">
              <h3 className="text-base font-semibold mb-2">Frequency Spectrum</h3>
              <div className="min-h-[250px]">
                <LineChart 
                  data={chartData.freq}
                  xLabel="Frequency (Normalized f*T)"
                  yLabel="Magnitude |H(f)|"
                  xDomain={[0, 1.2]}
                  yDomain={[0, 1.1]}
                  height={280}
                />
              </div>
            </div>
          </div>
        </div>

        <InfoCallout type="tip" title="The Engineering Trade-off">
          When you decrease <strong>α</strong> towards 0, you save bandwidth (great for spectral efficiency!). 
          However, the time-domain pulse "rings" for a much longer time. If your receiver has even a tiny timing synchronization error (jitter), 
          it will sample the signal when the ringing is NOT zero, causing massive ISI. An <strong>α</strong> of 0.22 or 0.35 is commonly used in 3G/4G to balance bandwidth and timing robustness.
        </InfoCallout>
      </motion.div>
    </div>
  );
}
