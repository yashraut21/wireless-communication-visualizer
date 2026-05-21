import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ParameterSlider, InfoCallout } from '../../components/interactive/ParameterPanel';
import { Equation, EquationCard } from '../../components/math/Equation';
import { InlineMath } from 'react-katex';
import { LineChart } from '../../components/charts/LineChart';
import { twoRayReceivedPower, twoRayBreakpoint, wavelength, fsplDb } from '../../utils/wireless-math';

export default function TwoRayModel() {
  const [freqMHz, setFreqMHz] = useState(900);
  const [ht, setHt] = useState(50); // Tx height
  const [hr, setHr] = useState(1.5); // Rx height

  const freqHz = freqMHz * 1e6;
  const breakPointDist = twoRayBreakpoint(ht, hr, freqHz);

  const chartData = useMemo(() => {
    const dataFspl = [];
    const dataTwoRay = [];
    const lambda = wavelength(freqHz);
    
    for (let d = 10; d <= 10000; d *= 1.1) { // 10m to 10km
      // FSPL power assuming Pt=1W, Gt=1, Gr=1
      const prFspl = Math.pow(lambda / (4 * Math.PI * d), 2);
      const fsplDbVal = 10 * Math.log10(prFspl);
      
      dataFspl.push({ x: d, y: fsplDbVal });

      // Two-ray full phase model (approximate envelope or exact)
      // exact: Pr = Pt * Gt * Gr * (lambda / (4*pi))^2 * |1/d_los * exp(-j*k*d_los) + R/d_ref * exp(-j*k*d_ref)|^2
      // For visual simplicity, we'll use the precise formula for constructive/destructive interference before breakpoint
      // and 1/d^4 after breakpoint. Let's just calculate the path differences.
      const d_los = Math.sqrt(Math.pow(ht - hr, 2) + Math.pow(d, 2));
      const d_ref = Math.sqrt(Math.pow(ht + hr, 2) + Math.pow(d, 2));
      const phaseDiff = (2 * Math.PI / lambda) * (d_ref - d_los);
      // R approx -1 for grazing incidence
      const prTwoRay = Math.pow(lambda / (4 * Math.PI), 2) * Math.pow(
        Math.sqrt(
          Math.pow(Math.cos(0) / d_los - Math.cos(phaseDiff) / d_ref, 2) +
          Math.pow(Math.sin(0) / d_los - Math.sin(phaseDiff) / d_ref, 2)
        )
      , 2);
      
      const twoRayDbVal = 10 * Math.log10(prTwoRay);
      
      dataTwoRay.push({ x: d, y: twoRayDbVal });
    }

    return [
      { label: 'Two-Ray Model', color: '#06b6d4', data: dataTwoRay },
      { label: 'FSPL', color: '#3b82f6', data: dataFspl }
    ];
  }, [freqHz, ht, hr]);

  const annotations = [
    { x: breakPointDist, y: -40, label: 'Breakpoint Distance', color: 'var(--color-accent-amber)' }
  ];
  
  const markers = [
    { x: breakPointDist, label: `d_break ≈ ${(breakPointDist/1000).toFixed(2)} km` }
  ];

  return (
    <div className="section-container py-10">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-2 mb-2">
          <div className="w-2 h-2 rounded-full" style={{ background: '#06b6d4' }} />
          <span className="text-sm font-medium" style={{ color: '#06b6d4' }}>4.2 · Large-Scale Fading</span>
        </div>
        <h1 className="mb-3">Two-Ray Ground Reflection Model</h1>
        <p className="text-lg mb-8 max-w-2xl" style={{ color: 'var(--color-text-secondary)' }}>
          In reality, a receiver captures both the direct line-of-sight (LOS) wave and a wave reflected from the ground.
          These two waves interfere with each other, causing fluctuations in signal power.
        </p>

        <div className="grid lg:grid-cols-12 gap-6 mb-8">
          {/* Controls */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            <div className="glass-card p-6">
              <h3 className="text-base font-semibold mb-4">Parameters</h3>
              
              <ParameterSlider 
                label="Carrier Frequency (MHz)" 
                value={freqMHz} min={100} max={3000} step={100}
                onChange={setFreqMHz} 
                description="Higher frequencies have a smaller breakpoint distance. After the breakpoint, frequency no longer affects path loss!"
              />
              
              <div className="mt-4">
                <ParameterSlider 
                  label="Transmitter Height, ht (m)" 
                  value={ht} min={10} max={200} step={5}
                  onChange={setHt} 
                  color="var(--color-accent-blue)"
                  description="Raising the base station antenna pushes the breakpoint distance further out, extending the range where signal only decays at 20 dB/decade."
                />
              </div>

              <div className="mt-4">
                <ParameterSlider 
                  label="Receiver Height, hr (m)" 
                  value={hr} min={1} max={10} step={0.5}
                  onChange={setHr} 
                  color="var(--color-accent-violet)"
                  description="Higher receiver antennas (like on a roof vs. street level) also push the breakpoint further, improving overall signal strength."
                />
              </div>

              <div className="mt-6 pt-4 border-t border-white/10">
                <div className="text-sm mb-1" style={{ color: 'var(--color-text-tertiary)' }}>Breakpoint Distance</div>
                <div className="font-mono text-lg font-bold" style={{ color: 'var(--color-accent-amber)' }}>
                  {breakPointDist >= 1000 ? `${(breakPointDist/1000).toFixed(2)} km` : `${breakPointDist.toFixed(0)} m`}
                </div>
              </div>
            </div>
            
            <EquationCard 
              title="Breakpoint Distance" 
              math="d_f = \frac{4 h_t h_r}{\lambda}" 
              description="Distance where the first Fresnel zone clears the ground. Beyond this point, path loss drops to 40 dB/decade." 
            />
          </div>

          {/* Graph */}
          <div className="lg:col-span-8 glass-card p-6 flex flex-col">
            <h3 className="text-base font-semibold mb-4">Path Loss vs Distance (Log-Log Scale)</h3>
            <div className="flex-1 min-h-[400px]">
              <LineChart 
                data={chartData}
                multiLine={true}
                xLabel="Distance (m)"
                yLabel="Received Power (dB)"
                xScale="log"
                yScale="linear"
                markers={markers}
                height={450}
              />
            </div>
            <div className="mt-4 text-sm text-center" style={{ color: 'var(--color-text-tertiary)' }}>
              Note the destructive interference (deep fades) before the breakpoint distance.
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4 mb-8">
          <InfoCallout type="aha" title="The 40 dB / Decade Rule">
            Beyond the breakpoint distance, the direct and reflected waves become out of phase in a way that causes
            signal power to decay as <InlineMath math="d^4" /> instead of <InlineMath math="d^2" />. This means every 10× increase
            in distance causes a <strong>40 dB</strong> drop in power, rather than 20 dB!
          </InfoCallout>
          
          <div className="glass-card p-6">
            <h3 className="text-base font-semibold mb-3">Approximate Far-Field Formula</h3>
            <Equation math="P_r \approx P_t G_t G_r \frac{h_t^2 h_r^2}{d^4}" />
            <p className="text-sm mt-3" style={{ color: 'var(--color-text-secondary)' }}>
              Notice that for <InlineMath math="d \gg d_f" />, the received power is entirely independent of frequency
              (<InlineMath math="\lambda" />)! It depends only on antenna heights and distance.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
