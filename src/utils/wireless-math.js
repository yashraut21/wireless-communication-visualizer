import { SPEED_OF_LIGHT, PI } from './constants';

/**
 * Calculate wavelength from frequency
 * λ = c / f
 */
export function wavelength(frequencyHz) {
  return SPEED_OF_LIGHT / frequencyHz;
}

/**
 * Free Space Path Loss (dB)
 * FSPL = 32.44 + 20·log10(d_km) + 20·log10(f_MHz)
 */
export function fsplDb(distanceM, frequencyHz) {
  const dKm = distanceM / 1000;
  const fMHz = frequencyHz / 1e6;
  if (dKm <= 0 || fMHz <= 0) return 0;
  return 32.44 + 20 * Math.log10(dKm) + 20 * Math.log10(fMHz);
}

/**
 * Convert Watts to dBm
 */
export function wattToDbm(watts) {
  if (watts <= 0) return -Infinity;
  return 10 * Math.log10(watts * 1000);
}

/**
 * Convert dBm to Watts
 */
export function dbmToWatt(dbm) {
  return Math.pow(10, (dbm - 30) / 10);
}

/**
 * Convert dBm to dBW
 */
export function dbmToDbw(dbm) {
  return dbm - 30;
}

/**
 * Convert dBW to dBm
 */
export function dbwToDbm(dbw) {
  return dbw + 30;
}

/**
 * Calculate co-channel reuse distance
 * D = R * sqrt(3 * K) where K is cluster size
 */
export function reuseDistance(cellRadius, clusterSize) {
  return cellRadius * Math.sqrt(3 * clusterSize);
}

/**
 * Calculate number of cells to cover an area
 * N = Area / (2.6 * R^2) for hexagonal cells
 */
export function cellsTocover(areaKm2, cellRadiusKm) {
  return Math.ceil(areaKm2 / (2.6 * cellRadiusKm * cellRadiusKm));
}

/**
 * Two-ray ground reflection model
 * Pr = Pt * Gt * Gr * (ht * hr)^2 / d^4  (for d >> d_breakpoint)
 */
export function twoRayReceivedPower(ptWatts, gt, gr, ht, hr, distanceM) {
  if (distanceM <= 0) return ptWatts;
  return ptWatts * gt * gr * Math.pow(ht * hr, 2) / Math.pow(distanceM, 4);
}

/**
 * Two-ray breakpoint distance
 * d_break = 4π * ht * hr / λ
 */
export function twoRayBreakpoint(ht, hr, frequencyHz) {
  const lambda = wavelength(frequencyHz);
  return (4 * PI * ht * hr) / lambda;
}

/**
 * Okumura-Hata path loss (urban) in dB
 * Valid for: 150-1500 MHz, 1-20 km, 30-200m BS, 1-10m MS
 */
export function hataUrban(frequencyMHz, htM, hrM, distanceKm) {
  const ahR = (1.1 * Math.log10(frequencyMHz) - 0.7) * hrM -
    (1.56 * Math.log10(frequencyMHz) - 0.8);

  return 69.55 +
    26.16 * Math.log10(frequencyMHz) -
    13.82 * Math.log10(htM) -
    ahR +
    (44.9 - 6.55 * Math.log10(htM)) * Math.log10(distanceKm);
}

/**
 * Okumura-Hata path loss (suburban) in dB
 */
export function hataSuburban(frequencyMHz, htM, hrM, distanceKm) {
  const urban = hataUrban(frequencyMHz, htM, hrM, distanceKm);
  return urban - 2 * Math.pow(Math.log10(frequencyMHz / 28), 2) - 5.4;
}

/**
 * Okumura-Hata path loss (open/rural) in dB
 */
export function hataOpen(frequencyMHz, htM, hrM, distanceKm) {
  const urban = hataUrban(frequencyMHz, htM, hrM, distanceKm);
  return urban -
    4.78 * Math.pow(Math.log10(frequencyMHz), 2) +
    18.33 * Math.log10(frequencyMHz) - 40.94;
}

/**
 * Doppler frequency shift
 * fd = (v / λ) * cos(θ)
 */
export function dopplerShift(velocityMs, frequencyHz, angleRad = 0) {
  const lambda = wavelength(frequencyHz);
  return (velocityMs / lambda) * Math.cos(angleRad);
}

/**
 * Coherence time (approximation)
 * Tc ≈ 0.423 / fd
 */
export function coherenceTime(maxDopplerHz) {
  if (maxDopplerHz <= 0) return Infinity;
  return 0.423 / maxDopplerHz;
}

/**
 * Coherence bandwidth (50% correlation)
 * Bc ≈ 1 / (5 * σ_τ)
 */
export function coherenceBandwidth(rmsDelaySpreadS) {
  if (rmsDelaySpreadS <= 0) return Infinity;
  return 1 / (5 * rmsDelaySpreadS);
}

/**
 * RMS delay spread from power delay profile taps
 * σ_τ = sqrt(τ²_bar - τ_bar²)
 */
export function rmsDelaySpread(taps) {
  const totalPower = taps.reduce((sum, t) => sum + t.power, 0);
  if (totalPower === 0) return 0;

  const tauBar = taps.reduce((sum, t) => sum + t.delay * t.power, 0) / totalPower;
  const tau2Bar = taps.reduce((sum, t) => sum + t.delay * t.delay * t.power, 0) / totalPower;

  return Math.sqrt(Math.max(0, tau2Bar - tauBar * tauBar));
}

/**
 * Generate Rayleigh fading samples (envelope)
 */
export function generateRayleighSamples(numSamples, sigma = 1) {
  const samples = [];
  for (let i = 0; i < numSamples; i++) {
    // Box-Muller transform for two independent Gaussian RVs
    const u1 = Math.random();
    const u2 = Math.random();
    const x = sigma * Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * PI * u2);
    const y = sigma * Math.sqrt(-2 * Math.log(u1)) * Math.sin(2 * PI * u2);
    samples.push(Math.sqrt(x * x + y * y));
  }
  return samples;
}

/**
 * Format frequency with appropriate unit
 */
export function formatFrequency(hz) {
  if (hz >= 1e9) return `${(hz / 1e9).toFixed(1)} GHz`;
  if (hz >= 1e6) return `${(hz / 1e6).toFixed(1)} MHz`;
  if (hz >= 1e3) return `${(hz / 1e3).toFixed(1)} kHz`;
  return `${hz.toFixed(0)} Hz`;
}

/**
 * Format distance with appropriate unit
 */
export function formatDistance(meters) {
  if (meters >= 1000) return `${(meters / 1000).toFixed(1)} km`;
  if (meters >= 1) return `${meters.toFixed(1)} m`;
  if (meters >= 0.01) return `${(meters * 100).toFixed(1)} cm`;
  return `${(meters * 1000).toFixed(1)} mm`;
}

/**
 * Error function approximation (Abramowitz and Stegun)
 */
export function erf(x) {
  const sign = x < 0 ? -1 : 1;
  x = Math.abs(x);
  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;
  const p = 0.3275911;

  const t = 1.0 / (1.0 + p * x);
  const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);

  return sign * y;
}

/**
 * Q-function: Tail probability of standard normal distribution
 * Q(x) = 0.5 * erfc(x / sqrt(2))
 */
export function qFunction(x) {
  return 0.5 * (1 - erf(x / Math.SQRT2));
}

/**
 * Modified Bessel function of the first kind, zeroth order I0(x)
 * Polynomial approximation (Abramowitz and Stegun)
 */
export function besselI0(x) {
  const ax = Math.abs(x);
  if (ax < 3.75) {
    const t = ax / 3.75;
    const t2 = t * t;
    return 1.0 + t2 * (3.5156229 + t2 * (3.0899424 + t2 * (1.2067492 + t2 * (0.2659732 + t2 * (0.0360768 + t2 * 0.0045813)))));
  } else {
    const t = 3.75 / ax;
    return (Math.exp(ax) / Math.sqrt(ax)) * (0.39894228 + t * (0.01328592 + t * (0.00225319 + t * (-0.00157565 + t * (0.00916281 + t * (-0.02057706 + t * (0.02635537 + t * (-0.01647633 + t * 0.00392377))))))));
  }
}
