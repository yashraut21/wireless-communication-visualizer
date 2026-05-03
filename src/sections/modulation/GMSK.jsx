import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ParameterSlider, InfoCallout } from '../../components/interactive/ParameterPanel';
import { EquationCard } from '../../components/math/Equation';
import { LineChart } from '../../components/charts/LineChart';

export default function GMSK() {
  const [bt, setBt] = useState(0.3);

  const chartData = useMemo(() => {
    const data = [];
    const stepData = [];
    
    const T = 1; // Symbol period
    const B = bt / T;
    
    const alpha = Math.sqrt(Math.log(2) / 2) / B;
    
    // Gaussian filter impulse response
    // h(t) = (sqrt(pi)/alpha) * exp(-(pi^2/alpha^2) * t^2)
    const h = (t) => {
      const c = Math.sqrt(Math.PI) / alpha;
      const expTerm = Math.exp(-Math.pow(Math.PI * t / alpha, 2));
      return c * expTerm;
    };

    // Calculate step response by numerical integration to show phase smoothing
    let integral = 0;
    const dt = 0.05;

    for (let t = -3; t <= 3; t += dt) {
      const val = h(t);
      data.push({ x: t, y: val });
      
      integral += val * dt;
      stepData.push({ x: t, y: integral });
    }

    return {
      impulse: [{ label: `Impulse h(t), BT = ${bt}`, color: '#8b5cf6', data }],
      step: [{ label: `Phase Transition q(t)`, color: '#10b981', data: stepData }]
    };
  }, [bt]);

  return (
    <div className="section-container py-10">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-2 mb-2">
          <div className="w-2 h-2 rounded-full" style={{ background: '#8b5cf6' }} />
          <span className="text-sm font-medium" style={{ color: '#8b5cf6' }}>7.3 · Modulation</span>
        </div>
        <h1 className="mb-3">Gaussian Minimum Shift Keying (GMSK)</h1>
        <p className="text-lg mb-8 max-w-2xl" style={{ color: 'var(--color-text-secondary)' }}>
          GMSK is a continuous-phase modulation scheme used heavily in 2G GSM. 
          It passes the data through a Gaussian low-pass filter before modulating the phase, ensuring the transmitted signal has a constant envelope and a very compact frequency spectrum.
        </p>

        <div className="grid lg:grid-cols-12 gap-6 mb-8">
          {/* Controls */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            <div className="glass-card p-6">
              <h3 className="text-base font-semibold mb-4">Parameters</h3>
              
              <ParameterSlider 
                label="Time-Bandwidth Product (BT)" 
                value={bt} min={0.1} max={1.0} step={0.1}
                onChange={setBt} 
                color="var(--color-accent-violet)"
                description="Lower BT means a narrower filter bandwidth. This compresses the spectrum but spreads the pulse out in time, causing controlled ISI."
              />
              
              <div className="mt-4 text-sm" style={{ color: 'var(--color-text-tertiary)' }}>
                GSM specifically uses <strong>BT = 0.3</strong>. Bluetooth uses a variant of GMSK (GFSK) with BT = 0.5.
              </div>
            </div>
            
            <EquationCard 
              title="Gaussian Filter Response" 
              math="h(t) = \frac{\sqrt{\pi}}{\alpha} \exp\left(-\frac{\pi^2}{\alpha^2} t^2 \right)" 
              description="Where α relates to the 3-dB bandwidth B of the filter." 
            />
          </div>

          {/* Graphs */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            <div className="glass-card p-6 flex flex-col">
              <h3 className="text-base font-semibold mb-2">Gaussian Impulse Response h(t)</h3>
              <div className="min-h-[200px]">
                <LineChart 
                  data={chartData.impulse}
                  xLabel="Time (multiples of T)"
                  yLabel="Amplitude"
                  height={250}
                />
              </div>
              <div className="text-xs text-center mt-2" style={{ color: 'var(--color-text-tertiary)' }}>
                Notice how lowering BT spreads the pulse wider than 1 symbol period (T), meaning one bit leaks into the next.
              </div>
            </div>

            <div className="glass-card p-6 flex flex-col">
              <h3 className="text-base font-semibold mb-2">Phase Transition Profile q(t)</h3>
              <div className="min-h-[200px]">
                <LineChart 
                  data={chartData.step}
                  xLabel="Time (multiples of T)"
                  yLabel="Phase Angle"
                  height={250}
                />
              </div>
              <div className="text-xs text-center mt-2" style={{ color: 'var(--color-text-tertiary)' }}>
                Instead of jumping instantly (which causes wide frequency splatters), the phase changes smoothly.
              </div>
            </div>
          </div>
        </div>

        <InfoCallout type="aha" title="Why Constant Envelope?">
          Because the amplitude of the GMSK signal never changes (only the phase smoothly rotates), mobile phones can use highly efficient, non-linear Class C power amplifiers without distorting the signal. This is why early cell phones (GSM) could have such great battery life!
        </InfoCallout>
      </motion.div>
    </div>
  );
}
