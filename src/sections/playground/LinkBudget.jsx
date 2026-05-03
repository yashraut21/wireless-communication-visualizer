import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ParameterSlider, InfoCallout } from '../../components/interactive/ParameterPanel';

export default function LinkBudget() {
  const [txPowerDb, setTxPowerDb] = useState(43); // 43 dBm = 20W
  const [txGain, setTxGain] = useState(15); // dBi
  const [txLoss, setTxLoss] = useState(2); // dB
  const [freqMhz, setFreqMhz] = useState(900); // MHz
  const [distanceKm, setDistanceKm] = useState(10); // km
  const [rxGain, setRxGain] = useState(0); // dBi (e.g. mobile phone)
  const [fadeMargin, setFadeMargin] = useState(10); // dB
  const [rxSens, setRxSens] = useState(-100); // dBm

  const budget = useMemo(() => {
    // Free Space Path Loss: 32.44 + 20log10(d_km) + 20log10(f_MHz)
    const fspl = 32.44 + 20 * Math.log10(distanceKm) + 20 * Math.log10(freqMhz);
    
    // EIRP = Tx Power - Tx Loss + Tx Gain
    const eirp = txPowerDb - txLoss + txGain;
    
    // RSL (Received Signal Level) = EIRP - FSPL + Rx Gain - Fade Margin
    const rsl = eirp - fspl + rxGain - fadeMargin;
    
    const margin = rsl - rxSens;
    const isClosed = margin >= 0;

    // Data for waterfall chart
    const steps = [
      { label: 'Tx Power', value: txPowerDb, isGain: true, color: '#3b82f6' },
      { label: 'Tx Loss', value: -txLoss, isGain: false, color: '#ef4444' },
      { label: 'Tx Ant Gain', value: txGain, isGain: true, color: '#10b981' },
      { label: 'FSPL', value: -fspl, isGain: false, color: '#f59e0b' },
      { label: 'Rx Ant Gain', value: rxGain, isGain: true, color: '#10b981' },
      { label: 'Fade Margin', value: -fadeMargin, isGain: false, color: '#8b5cf6' },
    ];

    let currentLvl = 0;
    const waterfall = steps.map((step, i) => {
      const prevLvl = currentLvl;
      currentLvl += step.value;
      return {
        ...step,
        start: prevLvl,
        end: currentLvl,
        absVal: Math.abs(step.value).toFixed(1)
      };
    });

    return { fspl, eirp, rsl, margin, isClosed, waterfall };
  }, [txPowerDb, txGain, txLoss, freqMhz, distanceKm, rxGain, fadeMargin, rxSens]);

  return (
    <div className="section-container py-10">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-2 mb-2">
          <div className="w-2 h-2 rounded-full" style={{ background: '#06b6d4' }} />
          <span className="text-sm font-medium" style={{ color: '#06b6d4' }}>10.1 · Playground</span>
        </div>
        <h1 className="mb-3">Link Budget Calculator</h1>
        <p className="text-lg mb-8 max-w-2xl" style={{ color: 'var(--color-text-secondary)' }}>
          A link budget accounts for all the gains and losses from the transmitter, through the medium, to the receiver. 
          If the final Received Signal Level (RSL) is higher than the receiver sensitivity, the link "closes"!
        </p>

        <div className="grid lg:grid-cols-12 gap-6 mb-8">
          {/* Controls */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            <div className="glass-card p-6">
              <h3 className="text-base font-semibold mb-4 text-white">Transmitter System</h3>
              <ParameterSlider label="Tx Power (dBm)" value={txPowerDb} min={0} max={60} step={1} onChange={setTxPowerDb} color="#3b82f6" />
              <ParameterSlider label="Cable/Feeder Loss (dB)" value={txLoss} min={0} max={10} step={0.5} onChange={setTxLoss} color="#ef4444" />
              <ParameterSlider label="Tx Antenna Gain (dBi)" value={txGain} min={0} max={30} step={1} onChange={setTxGain} color="#10b981" />
              
              <h3 className="text-base font-semibold mb-4 mt-8 text-white">Channel</h3>
              <ParameterSlider label="Frequency (MHz)" value={freqMhz} min={100} max={5000} step={100} onChange={setFreqMhz} color="#f59e0b" />
              <ParameterSlider label="Distance (km)" value={distanceKm} min={1} max={50} step={1} onChange={setDistanceKm} color="#f59e0b" />
              <ParameterSlider label="Fade Margin (dB)" value={fadeMargin} min={0} max={30} step={1} onChange={setFadeMargin} color="#8b5cf6" />
              
              <h3 className="text-base font-semibold mb-4 mt-8 text-white">Receiver System</h3>
              <ParameterSlider label="Rx Antenna Gain (dBi)" value={rxGain} min={0} max={30} step={1} onChange={setRxGain} color="#10b981" />
              <ParameterSlider label="Rx Sensitivity (dBm)" value={rxSens} min={-120} max={-70} step={1} onChange={setRxSens} color="#ec4899" />
            </div>
          </div>

          {/* Visualization */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            <div className="glass-card p-6 flex flex-col min-h-[400px]">
              <h3 className="text-base font-semibold mb-4">Link Budget Waterfall</h3>
              
              <div className="flex-1 relative border-l-2 border-b-2 border-white/20 ml-8 mb-8">
                {/* Y-Axis Labels */}
                {[-140, -100, -60, -20, 20, 60].map(y => {
                  const percent = 100 - ((y + 140) / 200) * 100;
                  return (
                    <div key={y} className="absolute w-full border-t border-white/5" style={{ top: `${percent}%` }}>
                      <span className="absolute -left-10 -top-3 text-xs text-gray-500">{y}</span>
                    </div>
                  );
                })}
                
                {/* Rx Sensitivity Line */}
                <div className="absolute w-full border-t-2 border-dashed border-[#ec4899] z-0" 
                     style={{ top: `${100 - ((rxSens + 140) / 200) * 100}%` }}>
                  <span className="absolute -left-12 -top-5 text-xs font-bold text-[#ec4899] bg-black/50 px-1 rounded">Sens</span>
                </div>

                {/* Waterfall Bars */}
                <div className="absolute inset-0 flex items-end justify-around px-2 z-10">
                  {budget.waterfall.map((step, i) => {
                    const topVal = Math.max(step.start, step.end);
                    const bottomVal = Math.min(step.start, step.end);
                    const topPercent = 100 - ((topVal + 140) / 200) * 100;
                    const heightPercent = ((topVal - bottomVal) / 200) * 100;
                    
                    return (
                      <div key={i} className="relative w-[12%] flex flex-col items-center">
                        <div 
                          className="absolute w-full rounded-sm opacity-90 transition-all duration-300 flex items-center justify-center text-[10px] font-bold text-white overflow-hidden shadow-[0_0_10px_rgba(0,0,0,0.5)]"
                          style={{ 
                            top: `${topPercent}%`, 
                            height: `${Math.max(1, heightPercent)}%`,
                            background: step.color
                          }}
                        >
                          {step.absVal}
                        </div>
                        <div className="absolute -bottom-8 text-[10px] text-gray-400 text-center leading-tight">
                          {step.label}
                        </div>
                      </div>
                    );
                  })}
                  
                  {/* Final RSL Bar */}
                  <div className="relative w-[12%] flex flex-col items-center">
                    <div 
                      className={`absolute w-full rounded-sm transition-all duration-300 flex items-center justify-center text-xs font-bold shadow-[0_0_15px_rgba(0,0,0,0.8)] border-2 ${budget.isClosed ? 'bg-emerald-500 border-emerald-400 text-white' : 'bg-red-500 border-red-400 text-white'}`}
                      style={{ 
                        top: `${100 - ((budget.rsl + 140) / 200) * 100}%`, 
                        height: '4px',
                      }}
                    />
                    <div 
                      className="absolute w-full opacity-30"
                      style={{ 
                        top: `${100 - ((budget.rsl + 140) / 200) * 100}%`, 
                        height: `${((budget.rsl + 140) / 200) * 100}%`,
                        background: budget.isClosed ? '#10b981' : '#ef4444'
                      }}
                    />
                    <div className="absolute -bottom-8 text-xs font-bold text-white text-center leading-tight">
                      RSL
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="glass-card p-4">
                <div className="text-sm text-gray-400 mb-1">Effective Isotropic Radiated Power (EIRP)</div>
                <div className="text-2xl font-mono font-bold text-blue-400">{budget.eirp.toFixed(1)} dBm</div>
              </div>
              <div className="glass-card p-4">
                <div className="text-sm text-gray-400 mb-1">Free Space Path Loss</div>
                <div className="text-2xl font-mono font-bold text-amber-500">{budget.fspl.toFixed(1)} dB</div>
              </div>
              <div className="glass-card p-4">
                <div className="text-sm text-gray-400 mb-1">Received Signal Level (RSL)</div>
                <div className={`text-2xl font-mono font-bold ${budget.isClosed ? 'text-emerald-400' : 'text-red-400'}`}>
                  {budget.rsl.toFixed(1)} dBm
                </div>
              </div>
              <div className="glass-card p-4">
                <div className="text-sm text-gray-400 mb-1">System Margin</div>
                <div className={`text-2xl font-mono font-bold ${budget.isClosed ? 'text-emerald-400' : 'text-red-400'}`}>
                  {budget.margin > 0 ? '+' : ''}{budget.margin.toFixed(1)} dB
                </div>
              </div>
            </div>
          </div>
        </div>

        <InfoCallout type="guide" title="How to use this visualizer">
          <strong>Goal:</strong> Determine if a wireless connection is feasible (Margin &gt; 0).<br/>
          <strong>Action:</strong> Adjust transmitter power, antenna gains, distance, and frequency.<br/>
          <strong>Practical Conclusion:</strong> Notice that increasing Frequency or Distance causes a massive drop in RSL due to Path Loss. To fix a failing link (negative Margin), you must either increase Tx Power, use higher Gain Antennas (directional), or get a better receiver (lower sensitivity). The Fade Margin is an engineering safety buffer added to account for unpredictable weather or multipath fading.
        </InfoCallout>
      </motion.div>
    </div>
  );
}
