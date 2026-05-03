import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ParameterSlider, InfoCallout } from '../../components/interactive/ParameterPanel';
import { Equation, EquationCard } from '../../components/math/Equation';
import { LineChart } from '../../components/charts/LineChart';
import { coherenceBandwidth, formatFrequency } from '../../utils/wireless-math';

export default function DelaySpread() {
  const [rmsSpreadUs, setRmsSpreadUs] = useState(1); // Microseconds
  const [signalBandwidthKHz, setSignalBandwidthKHz] = useState(200); // kHz

  const rmsSpreadS = rmsSpreadUs * 1e-6;
  const bcHz = coherenceBandwidth(rmsSpreadS);
  const sigBwHz = signalBandwidthKHz * 1e3;

  const isFlatFading = sigBwHz < bcHz;

  const chartData = useMemo(() => {
    const channelResp = [];
    const signalSpec = [];
    
    // Simulate a frequency selective channel response
    // Coherence bandwidth determines the "width" of the fades.
    // If Bc is small, fades are narrow (frequent).
    const centerFreq = 1000; // Arbitrary center for visualization in kHz
    const span = 2000; // Plot span 2 MHz
    
    for (let f = centerFreq - span/2; f <= centerFreq + span/2; f += 5) {
      // Create a pseudo-random looking but deterministic channel frequency response
      // period is roughly proportional to Bc
      const normalizedF = (f - centerFreq) * 1000 / bcHz;
      let gainDb = -10 + 10 * Math.sin(normalizedF * 2 * Math.PI) + 
                   5 * Math.cos(normalizedF * Math.PI * 3.7) +
                   3 * Math.sin(normalizedF * Math.PI * 1.3);
      
      // Bound the gain for better visualization
      gainDb = Math.max(-30, Math.min(0, gainDb));
      channelResp.push({ x: f, y: gainDb });

      // Signal spectrum (simple rect or raised cosine)
      if (Math.abs(f - centerFreq) <= signalBandwidthKHz / 2) {
        signalSpec.push({ x: f, y: 0 }); // Signal sits at 0 dB relative
      } else if (Math.abs(f - centerFreq) <= signalBandwidthKHz / 2 + 50) {
        // Roll-off
        const dist = Math.abs(f - centerFreq) - signalBandwidthKHz / 2;
        signalSpec.push({ x: f, y: - (dist / 50) * 30 });
      } else {
        signalSpec.push({ x: f, y: -30 });
      }
    }

    return [
      { label: 'Channel Response', color: '#06b6d4', data: channelResp },
      { label: 'Transmitted Signal', color: '#8b5cf6', data: signalSpec }
    ];
  }, [bcHz, signalBandwidthKHz]);

  const markers = [
    { x: 1000 - signalBandwidthKHz / 2, label: '', color: 'var(--color-accent-violet)' },
    { x: 1000 + signalBandwidthKHz / 2, label: '', color: 'var(--color-accent-violet)' },
  ];

  return (
    <div className="section-container py-10">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-2 mb-2">
          <div className="w-2 h-2 rounded-full" style={{ background: '#06b6d4' }} />
          <span className="text-sm font-medium" style={{ color: '#06b6d4' }}>5.2 · Small-Scale Fading</span>
        </div>
        <h1 className="mb-3">Delay Spread & Coherence Bandwidth</h1>
        <p className="text-lg mb-8 max-w-2xl" style={{ color: 'var(--color-text-secondary)' }}>
          Time-domain multipath delay spread directly causes frequency-selective fading. 
          The Coherence Bandwidth ($B_c$) is the range of frequencies over which the channel passes all spectral components with approximately equal gain.
        </p>

        <div className="grid lg:grid-cols-12 gap-6 mb-8">
          {/* Controls */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            <div className="glass-card p-6">
              <h3 className="text-base font-semibold mb-4">Parameters</h3>
              
              <ParameterSlider 
                label="RMS Delay Spread (μs)" 
                value={rmsSpreadUs} min={0.1} max={5} step={0.1}
                onChange={setRmsSpreadUs} 
                color="var(--color-accent-blue)"
                description="The standard deviation of the multipath delays. A higher value means echoes arrive over a longer period of time, creating 'faster' ripples in the frequency domain."
              />
              <div className="text-xs mt-1 mb-4" style={{ color: 'var(--color-text-tertiary)' }}>
                Higher delay spread = more severe multipath.
              </div>
              
              <div className="mt-4">
                <ParameterSlider 
                  label="Signal Bandwidth (kHz)" 
                  value={signalBandwidthKHz} min={20} max={2000} step={20}
                  onChange={setSignalBandwidthKHz} 
                  color="var(--color-accent-violet)"
                  description="The frequency width of the signal you are trying to transmit. Notice how a wideband signal gets distorted if it spans across a deep fade!"
                />
              </div>

              <div className="mt-6 pt-4 border-t border-white/10 flex flex-col gap-4">
                <div className="flex justify-between items-center">
                  <div className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>Coherence Bandwidth ($B_c$)</div>
                  <div className="font-mono text-lg font-bold" style={{ color: 'var(--color-accent-teal)' }}>
                    {formatFrequency(bcHz)}
                  </div>
                </div>
                
                <div className={`p-3 rounded-lg text-center border ${isFlatFading ? 'border-[#10b981] bg-[#10b981]/10' : 'border-[#ef4444] bg-[#ef4444]/10'}`}>
                  <div className="text-sm font-bold" style={{ color: isFlatFading ? '#10b981' : '#ef4444' }}>
                    {isFlatFading ? 'FLAT FADING' : 'FREQUENCY SELECTIVE FADING'}
                  </div>
                  <div className="text-xs mt-1 text-gray-300">
                    {isFlatFading 
                      ? 'Signal fits inside the coherence bandwidth. Entire signal fades together.'
                      : 'Signal is wider than coherence bandwidth. Suffers from Inter-Symbol Interference (ISI).'}
                  </div>
                </div>
              </div>
            </div>
            
            <EquationCard 
              title="Coherence Bandwidth" 
              math="B_c \approx \frac{1}{5\sigma_\tau}" 
              description="Approximate bandwidth where the frequency correlation function is above 0.5." 
            />
          </div>

          {/* Graph */}
          <div className="lg:col-span-8 glass-card p-6 flex flex-col">
            <h3 className="text-base font-semibold mb-4">Channel Frequency Response vs Signal</h3>
            <div className="flex-1 min-h-[400px]">
              <LineChart 
                data={chartData}
                multiLine={true}
                xLabel="Frequency (kHz relative)"
                yLabel="Gain / Power (dB)"
                xScale="linear"
                yScale="linear"
                yDomain={[-30, 5]}
                markers={markers}
                height={450}
              />
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4 mb-8">
          <InfoCallout type="aha" title="The Fourier Transform Connection">
            The power delay profile (time domain) and the frequency correlation function (frequency domain) 
            are Fourier Transform pairs! A wide delay spread (long time echoes) results in a narrow 
            coherence bandwidth (fast ripples in the frequency response).
          </InfoCallout>
          
          <div className="glass-card p-6">
            <h3 className="text-base font-semibold mb-3">How do we fix Frequency Selective Fading?</h3>
            <p className="text-sm mb-3" style={{ color: 'var(--color-text-secondary)' }}>
              When $B_s &gt; B_c$, the delayed echoes cause consecutive symbols to overlap in time (ISI). To fix this, engineers use:
            </p>
            <ul className="text-sm space-y-2 list-disc pl-5" style={{ color: 'var(--color-text-secondary)' }}>
              <li><strong>Equalization:</strong> A filter at the receiver that attempts to invert the channel response (used in 2G/3G).</li>
              <li><strong>OFDM:</strong> Splitting the wideband signal into many narrowband subcarriers so each experiences flat fading (used in 4G/5G/Wi-Fi).</li>
            </ul>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
