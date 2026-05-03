import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ParameterSlider, InfoCallout } from '../../components/interactive/ParameterPanel';
import { PolarPlot } from '../../components/charts/PolarPlot';

export default function ArrayDesigner() {
  const [numElements, setNumElements] = useState(4);
  const [spacing, setSpacing] = useState(0.5); // d/lambda
  const [phaseShift, setPhaseShift] = useState(0); // degrees

  const chartData = useMemo(() => {
    const data = [];
    const beta = (phaseShift * Math.PI) / 180; // convert to radians

    for (let theta = 0; theta <= 360; theta += 1) {
      const thetaRad = (theta * Math.PI) / 180;
      
      // psi = 2 * pi * (d/lambda) * cos(theta) + beta
      // Assuming linear array along the z-axis, measuring angle from z-axis
      // If we want broadside at 90 deg, we use cos(theta).
      const psi = 2 * Math.PI * spacing * Math.cos(thetaRad) + beta;
      
      let af = 0;
      if (Math.abs(psi) < 1e-5 || Math.abs(psi - 2 * Math.PI) < 1e-5 || Math.abs(psi + 2 * Math.PI) < 1e-5) {
        af = numElements;
      } else {
        af = Math.sin((numElements * psi) / 2) / Math.sin(psi / 2);
      }
      
      // Normalize to 1 (or 0 dB)
      af = Math.abs(af) / numElements;

      // Convert to dB, clamp at -40 dB for plotting
      let afDb = 20 * Math.log10(Math.max(af, 0.01));
      
      // For a polar plot, usually we plot linear or shifted dB. 
      // Let's plot normalized linear magnitude [0, 1] for visual intuition
      data.push({ angle: theta, value: af });
    }

    return [{ label: `N=${numElements}, d=${spacing}λ`, color: '#ec4899', data }];
  }, [numElements, spacing, phaseShift]);

  // Calculate beam steering angle based on phase shift
  // cos(theta_0) = -beta / (2 * pi * d/lambda)
  const betaRad = (phaseShift * Math.PI) / 180;
  const cosTheta0 = -betaRad / (2 * Math.PI * spacing);
  let steerAngle = 'None';
  if (Math.abs(cosTheta0) <= 1) {
    const theta0Deg = (Math.acos(cosTheta0) * 180) / Math.PI;
    steerAngle = `${theta0Deg.toFixed(1)}°`;
  } else {
    steerAngle = 'Invisible Space (No Main Beam)';
  }

  return (
    <div className="section-container py-10">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-2 mb-2">
          <div className="w-2 h-2 rounded-full" style={{ background: '#ec4899' }} />
          <span className="text-sm font-medium" style={{ color: '#ec4899' }}>10.4 · Playground</span>
        </div>
        <h1 className="mb-3">Phased Array Designer</h1>
        <p className="text-lg mb-8 max-w-2xl" style={{ color: 'var(--color-text-secondary)' }}>
          Antenna arrays combine the signals from multiple simple antennas to create highly directional beams. This is the core technology behind 5G Massive MIMO and modern radar systems.
        </p>

        <div className="grid lg:grid-cols-12 gap-6 mb-8">
          {/* Controls */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            <div className="glass-card p-6">
              <h3 className="text-base font-semibold mb-4 text-white">Array Parameters</h3>
              
              <ParameterSlider label="Number of Elements (N)" value={numElements} min={2} max={16} step={1} onChange={setNumElements} color="#ec4899" />
              <ParameterSlider label="Element Spacing (d / λ)" value={spacing} min={0.1} max={2.0} step={0.1} onChange={setSpacing} color="#f59e0b" description="Spacing relative to wavelength. 0.5λ is standard." />
              <ParameterSlider label="Progressive Phase Shift (β)" value={phaseShift} min={-180} max={180} step={5} onChange={setPhaseShift} color="#3b82f6" unit="°" description="Phase delay applied successively to each element." />

              <div className="mt-6 pt-4 border-t border-white/10 flex flex-col gap-4">
                <div className="flex justify-between items-center">
                  <div className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>Main Beam Direction</div>
                  <div className="font-mono text-lg font-bold" style={{ color: 'var(--color-accent-pink)' }}>
                    {steerAngle}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Visualization */}
          <div className="lg:col-span-8 glass-card p-6 flex flex-col items-center">
            <h3 className="text-base font-semibold mb-4 w-full text-left">Array Factor Polar Plot (Linear Scale)</h3>
            <div className="relative w-full max-w-[450px]">
              <PolarPlot 
                data={chartData}
                maxDomain={1.0}
              />
            </div>
            <div className="mt-4 text-sm text-center" style={{ color: 'var(--color-text-tertiary)' }}>
              The array lies horizontally along the 0° - 180° axis. <br/>
              A lobe at 90° is radiating "broadside" (perpendicular to the array).
            </div>
          </div>
        </div>

        <InfoCallout type="guide" title="How to use this visualizer">
          <strong>Goal:</strong> Learn how to shape and steer RF energy.<br/>
          <strong>Action:</strong> 
          1. Increase N to see the beam get sharper. 
          2. Increase Spacing &gt; 0.5λ to see "Grating Lobes" appear. 
          3. Slide Phase Shift (β) to steer the beam.<br/>
          <strong>Practical Conclusion:</strong> Adding elements (N) gives you higher gain and a narrower beam, but requires more hardware. If you place elements too far apart (&gt;0.5λ), you create unintended "grating lobes" that shoot energy in the wrong directions. Changing the phase shift (β) allows you to electronically sweep the beam to track a mobile user without physically moving the antenna!
        </InfoCallout>
      </motion.div>
    </div>
  );
}
