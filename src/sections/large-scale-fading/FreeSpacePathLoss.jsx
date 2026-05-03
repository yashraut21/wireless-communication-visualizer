import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ParameterSlider, InfoCallout } from '../../components/interactive/ParameterPanel';
import { Equation, EquationCard } from '../../components/math/Equation';
import { LineChart } from '../../components/charts/LineChart';
import { fsplDb, formatFrequency } from '../../utils/wireless-math';

export default function FreeSpacePathLoss() {
  const [freqMHz, setFreqMHz] = useState(900);
  const [distanceKm, setDistanceKm] = useState(10);
  
  // Current FSPL value
  const currentFspl = fsplDb(distanceKm * 1000, freqMHz * 1e6);

  // Generate multi-line graph data for different frequencies
  const chartData = useMemo(() => {
    const frequencies = [
      { f: 900, label: '900 MHz (Sub-1GHz)', color: '#14b8a6' },
      { f: 2400, label: '2.4 GHz (Wi-Fi)', color: '#3b82f6' },
      { f: 5000, label: '5 GHz (Wi-Fi/5G)', color: '#8b5cf6' },
      { f: 28000, label: '28 GHz (mmWave)', color: '#ec4899' },
    ];

    return frequencies.map(freq => {
      const dataPoints = [];
      // Log scale for X, so we need points nicely spread
      for (let d = 0.01; d <= 20; d *= 1.2) {
        dataPoints.push({
          x: d,
          y: fsplDb(d * 1000, freq.f * 1e6)
        });
      }
      return {
        label: freq.label,
        color: freq.color,
        data: dataPoints
      };
    });
  }, []);

  const distanceMarker = [{ x: distanceKm, label: 'Current Distance' }];

  return (
    <div className="section-container py-10">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-2 mb-2">
          <div className="w-2 h-2 rounded-full" style={{ background: '#06b6d4' }} />
          <span className="text-sm font-medium" style={{ color: '#06b6d4' }}>4.1 · Large-Scale Fading</span>
        </div>
        <h1 className="mb-3">Free Space Path Loss (FSPL)</h1>
        <p className="text-lg mb-8 max-w-2xl" style={{ color: 'var(--color-text-secondary)' }}>
          Even in a perfect vacuum with no obstacles, an electromagnetic wave spreads out spherically. 
          Its power density decreases proportionally to the square of the distance from the source.
        </p>

        <div className="grid lg:grid-cols-12 gap-6 mb-8">
          {/* Controls & Current Value */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            <div className="glass-card p-6">
              <h3 className="text-base font-semibold mb-4">Parameters</h3>
              
              <ParameterSlider 
                label="Carrier Frequency (MHz)" 
                value={freqMHz} min={100} max={30000} step={100}
                onChange={setFreqMHz} 
                formatValue={(v) => formatFrequency(v * 1e6)} 
                description="Higher frequencies have a smaller wavelength, so a receiving antenna of the same gain captures less energy."
              />
              
              <div className="mt-4">
                <ParameterSlider 
                  label="Distance (km)" 
                  value={distanceKm} min={0.1} max={20} step={0.1}
                  onChange={setDistanceKm} 
                  unit="km" 
                  color="var(--color-accent-blue)"
                  description="As the wave spreads out spherically, the energy density drops with the square of the distance. Doubling the distance adds ~6 dB of loss."
                />
              </div>

              <div className="mt-8 p-4 rounded-xl text-center" style={{ background: 'var(--color-bg-tertiary)' }}>
                <div className="text-sm mb-1" style={{ color: 'var(--color-text-tertiary)' }}>Calculated FSPL</div>
                <div className="text-4xl font-bold font-mono" style={{ color: 'var(--color-accent-teal)' }}>
                  {currentFspl.toFixed(1)} <span className="text-xl">dB</span>
                </div>
              </div>
            </div>
            
            <EquationCard 
              title="Friis Transmission Equation" 
              math="P_r = P_t G_t G_r \left(\frac{\lambda}{4\pi d}\right)^2" 
              description="Where λ is wavelength and d is distance." 
            />
          </div>

          {/* Graph */}
          <div className="lg:col-span-8 glass-card p-6 flex flex-col">
            <h3 className="text-base font-semibold mb-4">FSPL vs Distance (Log Scale)</h3>
            <div className="flex-1 min-h-[350px]">
              <LineChart 
                data={chartData}
                multiLine={true}
                xLabel="Distance (km)"
                yLabel="Path Loss (dB)"
                xScale="log"
                yScale="linear"
                xDomain={[0.01, 20]}
                markers={distanceMarker}
                height={400}
              />
            </div>
            <div className="mt-4 text-sm text-center" style={{ color: 'var(--color-text-tertiary)' }}>
              Note: Higher frequencies experience significantly more path loss over the same distance.
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4 mb-8">
          <InfoCallout type="aha" title="The 20 dB / Decade Rule">
            Because FSPL is proportional to $d^2$, every time you multiply the distance by 10 (a decade), 
            the path loss increases by exactly <strong>20 dB</strong>. 
            Similarly, doubling the distance adds exactly <strong>~6 dB</strong> of loss.
          </InfoCallout>
          
          <InfoCallout type="warning" title="Why higher frequencies have higher FSPL">
            It's a common misconception that high frequency waves "fade faster" in a vacuum. 
            The extra loss actually comes from the receiving antenna! 
            To maintain the same gain, a higher frequency antenna must be physically smaller, 
            meaning its effective aperture (capture area) is smaller.
          </InfoCallout>
        </div>
        
      </motion.div>
    </div>
  );
}
