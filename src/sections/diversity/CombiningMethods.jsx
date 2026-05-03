import { useState, useMemo, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { ParameterSlider, InfoCallout } from '../../components/interactive/ParameterPanel';
import { EquationCard } from '../../components/math/Equation';
import { LineChart } from '../../components/charts/LineChart';
import { Play, Pause } from 'lucide-react';

// Generates a simple sum-of-sinusoids fading envelope
function generateFadingEnvelope(seed, numPoints, maxDoppler) {
  const envelope = new Float32Array(numPoints);
  const N = 8; // Number of sinusoids
  for (let i = 0; i < numPoints; i++) {
    const t = i * 0.005; // Time step
    let x = 0;
    let y = 0;
    for (let n = 1; n <= N; n++) {
      const angle = (2 * Math.PI * n) / N;
      const doppler = maxDoppler * Math.cos(angle);
      const phase = seed * n + n * 1.3;
      x += Math.cos(2 * Math.PI * doppler * t + phase);
      y += Math.sin(2 * Math.PI * doppler * t + phase);
    }
    envelope[i] = Math.sqrt(x*x + y*y) / Math.sqrt(N);
  }
  return envelope;
}

export default function CombiningMethods() {
  const [numBranches, setNumBranches] = useState(2);
  const [method, setMethod] = useState('MRC');
  const [doppler, setDoppler] = useState(5);
  const [playing, setPlaying] = useState(true);
  const [timeOffset, setTimeOffset] = useState(0);
  
  const animRef = useRef();
  
  // Generate the static envelopes for up to 4 branches
  const NUM_POINTS = 500;
  const rawEnvelopes = useMemo(() => {
    return [
      generateFadingEnvelope(1.1, NUM_POINTS, doppler),
      generateFadingEnvelope(2.5, NUM_POINTS, doppler),
      generateFadingEnvelope(4.2, NUM_POINTS, doppler),
      generateFadingEnvelope(7.8, NUM_POINTS, doppler),
    ];
  }, [doppler]);

  useEffect(() => {
    if (!playing) return;
    let lastTime = performance.now();
    const animate = (time) => {
      const dt = (time - lastTime) * 0.001;
      lastTime = time;
      setTimeOffset(prev => (prev + dt * 0.5) % (NUM_POINTS * 0.005));
      animRef.current = requestAnimationFrame(animate);
    };
    animRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animRef.current);
  }, [playing]);

  const chartData = useMemo(() => {
    const dataCombined = [];
    const branchData = [[], [], [], []];
    
    // We will show a sliding window of 2 seconds
    const windowPoints = 100;
    const startIndex = Math.floor(timeOffset / 0.005) % (NUM_POINTS - windowPoints);
    
    for (let i = 0; i < windowPoints; i++) {
      const idx = startIndex + i;
      const t = i * 0.005;
      
      let sumSq = 0;
      let sum = 0;
      let maxR = 0;
      
      for (let b = 0; b < numBranches; b++) {
        const r = rawEnvelopes[b][idx];
        const rDb = 20 * Math.log10(Math.max(0.01, r));
        branchData[b].push({ x: t, y: rDb });
        
        sumSq += r * r;
        sum += r;
        if (r > maxR) maxR = r;
      }
      
      let combinedR = 0;
      if (method === 'SC') combinedR = maxR;
      else if (method === 'MRC') combinedR = Math.sqrt(sumSq);
      else if (method === 'EGC') combinedR = sum / Math.sqrt(numBranches);
      
      const combinedDb = 20 * Math.log10(Math.max(0.01, combinedR));
      dataCombined.push({ x: t, y: combinedDb });
    }
    
    const lines = [
      { label: `Combined (${method})`, color: '#ec4899', data: dataCombined }
    ];
    
    const colors = ['#64748b', '#94a3b8', '#cbd5e1', '#e2e8f0'];
    for (let b = 0; b < numBranches; b++) {
      lines.push({ label: `Branch ${b+1}`, color: colors[b], data: branchData[b], dashed: true });
    }
    
    return lines;
  }, [rawEnvelopes, numBranches, method, timeOffset]);

  const methodDetails = {
    SC: {
      title: "Selection Combining (SC)",
      math: "\\gamma_{SC} = \\max(\\gamma_1, \\gamma_2, \\dots, \\gamma_M)",
      desc: "The receiver simply picks the antenna with the strongest signal at any given moment. Simple to implement, but doesn't use the energy from the other antennas."
    },
    EGC: {
      title: "Equal Gain Combining (EGC)",
      math: "\\gamma_{EGC} = \\frac{1}{M} \\left( \\sum_{k=1}^M \\sqrt{\\gamma_k} \\right)^2",
      desc: "The receiver co-phases all signals and adds them together with equal weight. Better than SC, but a very weak branch can add more noise than signal."
    },
    MRC: {
      title: "Maximal Ratio Combining (MRC)",
      math: "\\gamma_{MRC} = \\sum_{k=1}^M \\gamma_k",
      desc: "The optimal linear combiner. It co-phases the signals and weights each branch proportionally to its own SNR. Deep fades are heavily discounted."
    }
  };

  return (
    <div className="section-container py-10">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-2 mb-2">
          <div className="w-2 h-2 rounded-full" style={{ background: '#3b82f6' }} />
          <span className="text-sm font-medium" style={{ color: '#3b82f6' }}>6.2 · Diversity</span>
        </div>
        <h1 className="mb-3">Combining Methods</h1>
        <p className="text-lg mb-8 max-w-2xl" style={{ color: 'var(--color-text-secondary)' }}>
          Once you have multiple antennas (branches) receiving the signal, what do you do with them? 
          You can pick the best one, or mathematically combine them to get an even stronger signal.
        </p>

        <div className="grid lg:grid-cols-12 gap-6 mb-8">
          {/* Controls */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            <div className="glass-card p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-base font-semibold">Parameters</h3>
                <button onClick={() => setPlaying(!playing)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs border"
                  style={{ borderColor: 'var(--color-border-subtle)', color: 'var(--color-text-secondary)' }}>
                  {playing ? <Pause size={14} /> : <Play size={14} />} {playing ? 'Pause' : 'Play'}
                </button>
              </div>
              
              <ParameterSlider 
                label="Number of Branches (M)" 
                value={numBranches} min={1} max={4} step={1}
                onChange={setNumBranches} 
                color="var(--color-accent-blue)"
                description="Number of receive antennas."
              />
              
              <div className="mt-4">
                <ParameterSlider 
                  label="Fading Rate (Doppler)" 
                  value={doppler} min={1} max={20} step={1}
                  onChange={setDoppler} 
                  color="var(--color-text-tertiary)"
                  description="How fast the channel fluctuates."
                />
              </div>

              <div className="mt-6 pt-4 border-t border-white/10">
                <div className="text-sm mb-2" style={{ color: 'var(--color-text-tertiary)' }}>Combining Strategy</div>
                <div className="flex bg-black/20 p-1 rounded-lg">
                  {['SC', 'EGC', 'MRC'].map(m => (
                    <button key={m} onClick={() => setMethod(m)}
                      className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all ${method === m ? 'bg-[#3b82f6] text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}>
                      {m}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            
            <EquationCard 
              title={methodDetails[method].title} 
              math={methodDetails[method].math} 
              description={methodDetails[method].desc} 
            />
          </div>

          {/* Graph */}
          <div className="lg:col-span-8 glass-card p-6 flex flex-col">
            <h3 className="text-base font-semibold mb-4">Instantaneous SNR (dB) over Time</h3>
            <div className="flex-1 min-h-[400px]">
              <LineChart 
                data={chartData}
                multiLine={true}
                xLabel="Time (relative)"
                yLabel="Signal Envelope (dB)"
                xScale="linear"
                yScale="linear"
                yDomain={[-30, 15]}
                height={450}
              />
            </div>
            <div className="mt-4 text-sm text-center" style={{ color: 'var(--color-text-tertiary)' }}>
              The gray lines are individual antennas. The pink line is the combined signal output.
            </div>
          </div>
        </div>

        <InfoCallout type="aha" title="Why is MRC the best?">
          Maximal Ratio Combining yields an output SNR equal to the <em>sum</em> of the individual branch SNRs ($\gamma = \sum \gamma_k$). 
          This means it not only completely eliminates deep fades, but it also provides an <strong>array gain</strong> (the combined signal is stronger than any single branch could ever be on its own)!
        </InfoCallout>
      </motion.div>
    </div>
  );
}
