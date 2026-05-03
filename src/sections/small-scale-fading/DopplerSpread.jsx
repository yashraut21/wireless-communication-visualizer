import { useState, useMemo, useEffect } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { ParameterSlider, InfoCallout } from '../../components/interactive/ParameterPanel';
import { Equation, EquationCard } from '../../components/math/Equation';
import { LineChart } from '../../components/charts/LineChart';
import { dopplerShift, coherenceTime } from '../../utils/wireless-math';

export default function DopplerSpread() {
  const [velocityKmh, setVelocityKmh] = useState(60);
  const [freqMHz, setFreqMHz] = useState(900);
  const [symbolTimeMs, setSymbolTimeMs] = useState(1); // ms

  const velocityMs = velocityKmh / 3.6;
  const freqHz = freqMHz * 1e6;
  
  const maxDopplerHz = dopplerShift(velocityMs, freqHz, 0); // max when angle is 0
  const tcSeconds = coherenceTime(maxDopplerHz);
  const tsSeconds = symbolTimeMs * 1e-3;

  const isFastFading = tsSeconds > tcSeconds;

  const chartData = useMemo(() => {
    const jakesSpectrum = [];
    
    // Jakes spectrum S(f) = 1 / (pi * fm * sqrt(1 - (f/fm)^2)) for |f| <= fm
    // To avoid infinity at boundaries, we cap it or step slightly inside.
    const steps = 100;
    
    // If fm is 0 (stationary), spectrum is an impulse. We'll simulate a very narrow peak.
    if (maxDopplerHz < 0.1) {
      return [{
        label: 'Doppler Spectrum',
        color: '#8b5cf6',
        data: [
          { x: -1, y: 0 },
          { x: 0, y: 10 },
          { x: 1, y: 0 }
        ]
      }];
    }

    for (let i = -steps + 1; i < steps; i++) {
      const f = (i / steps) * maxDopplerHz;
      const val = 1 / (Math.PI * maxDopplerHz * Math.sqrt(1 - Math.pow(f / maxDopplerHz, 2)));
      // Normalize slightly for display purposes
      jakesSpectrum.push({ x: f, y: val * maxDopplerHz }); 
    }

    return [{
      label: 'Jakes Spectrum (Theoretical)',
      color: '#8b5cf6',
      data: jakesSpectrum
    }];
  }, [maxDopplerHz]);

  const carControls = useAnimation();
  
  useEffect(() => {
    if (velocityKmh === 0) {
      carControls.stop();
      return;
    }
    
    // Duration inversely proportional to velocity
    const duration = 200 / velocityKmh;
    
    carControls.start({
      x: ["-10%", "110%"],
      transition: {
        duration: duration,
        ease: "linear",
        repeat: Infinity,
      }
    });
  }, [velocityKmh, carControls]);

  return (
    <div className="section-container py-10">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-2 mb-2">
          <div className="w-2 h-2 rounded-full" style={{ background: '#8b5cf6' }} />
          <span className="text-sm font-medium" style={{ color: '#8b5cf6' }}>5.3 · Small-Scale Fading</span>
        </div>
        <h1 className="mb-3">Doppler Spread & Coherence Time</h1>
        <p className="text-lg mb-8 max-w-2xl" style={{ color: 'var(--color-text-secondary)' }}>
          When the receiver or transmitter is moving, the received signal experiences a Doppler shift. 
          In a multipath environment, rays arriving from different angles have different Doppler shifts, causing the spectrum to spread.
        </p>

        <div className="grid lg:grid-cols-12 gap-6 mb-8">
          {/* Controls */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            <div className="glass-card p-6">
              <h3 className="text-base font-semibold mb-4">Parameters</h3>
              
              <ParameterSlider 
                label="Velocity (km/h)" 
                value={velocityKmh} min={0} max={300} step={5}
                onChange={setVelocityKmh} 
                color="var(--color-accent-blue)"
                description="The speed of the receiver. Higher speeds cause faster phase changes in the arriving waves, leading to more rapid fading (smaller Coherence Time)."
              />
              
              <div className="mt-4">
                <ParameterSlider 
                  label="Carrier Frequency (MHz)" 
                  value={freqMHz} min={100} max={5000} step={100}
                  onChange={setFreqMHz} 
                  description="Higher frequencies have smaller wavelengths, so even a tiny movement causes a massive phase shift. This is why 5G mmWave is highly sensitive to motion."
                />
              </div>
              
              <div className="mt-4">
                <ParameterSlider 
                  label="Symbol Duration (ms)" 
                  value={symbolTimeMs} min={0.1} max={10} step={0.1}
                  onChange={setSymbolTimeMs} 
                  color="var(--color-accent-amber)"
                  description="The time it takes to transmit one piece of data. If the channel changes during this time (Fast Fading), the data gets completely scrambled!"
                />
              </div>

              <div className="mt-6 pt-4 border-t border-white/10 flex flex-col gap-4">
                <div className="flex justify-between items-center">
                  <div className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>Max Doppler Shift ($f_m$)</div>
                  <div className="font-mono text-lg font-bold" style={{ color: 'var(--color-accent-violet)' }}>
                    {maxDopplerHz.toFixed(1)} Hz
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <div className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>Coherence Time ($T_c$)</div>
                  <div className="font-mono text-lg font-bold" style={{ color: 'var(--color-accent-teal)' }}>
                    {tcSeconds === Infinity ? '∞' : `${(tcSeconds * 1000).toFixed(1)} ms`}
                  </div>
                </div>
                
                <div className={`p-3 rounded-lg text-center border ${!isFastFading ? 'border-[#10b981] bg-[#10b981]/10' : 'border-[#ef4444] bg-[#ef4444]/10'}`}>
                  <div className="text-sm font-bold" style={{ color: !isFastFading ? '#10b981' : '#ef4444' }}>
                    {!isFastFading ? 'SLOW FADING' : 'FAST FADING'}
                  </div>
                  <div className="text-xs mt-1 text-gray-300">
                    {!isFastFading 
                      ? 'Channel is constant over one symbol period.'
                      : 'Channel changes rapidly during a single symbol. Severe distortion!'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Visualization */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            {/* Car Animation */}
            <div className="glass-card p-6 relative overflow-hidden h-32 flex flex-col justify-end border-b-4 border-[var(--color-bg-tertiary)]">
              <div className="absolute top-4 left-6 text-sm font-semibold" style={{ color: 'var(--color-text-secondary)' }}>
                Speed: {velocityKmh} km/h
              </div>
              <motion.div animate={carControls} className="absolute bottom-2 text-4xl">
                🚗
              </motion.div>
              {/* Waves coming from right */}
              <div className="absolute right-0 bottom-4 opacity-30 text-xl">
                📡 (((
              </div>
            </div>

            {/* Graph */}
            <div className="glass-card p-6 flex flex-col flex-1">
              <h3 className="text-base font-semibold mb-4">U-shaped Jakes Doppler Spectrum</h3>
              <div className="flex-1 min-h-[250px]">
                <LineChart 
                  data={chartData}
                  multiLine={true}
                  xLabel="Frequency Shift (Hz)"
                  yLabel="Spectral Density"
                  xDomain={[-Math.max(10, maxDopplerHz * 1.2), Math.max(10, maxDopplerHz * 1.2)]}
                  height={300}
                />
              </div>
              <div className="mt-2 text-xs text-center" style={{ color: 'var(--color-text-tertiary)' }}>
                Signals arriving from straight ahead (+fm) or directly behind (-fm) have the maximum shift,
                while signals arriving from the sides have near-zero shift.
              </div>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4 mb-8">
          <EquationCard 
            title="Max Doppler Shift" 
            math="f_m = \frac{v}{\lambda} = \frac{v \cdot f_c}{c}" 
            description="The maximum frequency shift happens when a ray arrives directly facing the direction of motion (angle 0°)." 
          />
          <EquationCard 
            title="Coherence Time" 
            math="T_c \approx \frac{0.423}{f_m}" 
            description="The time duration over which the channel response is considered highly correlated (constant)." 
          />
        </div>
      </motion.div>
    </div>
  );
}
