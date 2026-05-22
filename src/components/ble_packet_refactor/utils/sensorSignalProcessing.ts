/**
 * sensorSignalProcessing.updated.ts
 *
 * File xử lý riêng cho dữ liệu PPG type6 và ACC type5.
 */

const SAMPLE_RATE_HZ = 50;
const EXPECTED_SIGNAL_LENGTH = 1500;
const EPSILON = 1e-6;
const ACC_SCALE_FACTOR = 0.0047856;

const HEART_RATE_MIN_HZ = 0.67;
const HEART_RATE_MAX_HZ = 3.5;

/**
 * SOS coefficients Butterworth bandpass:
 * order = 2, fs = 50 Hz, passband = 0.5–8 Hz.
 */
const PPG_BANDPASS_SOS: number[][] = [
  [0.13110644, 0.26221288, 0.13110644, 1.0, -0.74247256, 0.29711777],
  [1.0, -2.0, 1.0, 1.0, -1.91198346, 0.91618532],
];

export type ProcessedSensorFusionSignals = {
  ppgProcessed: number[];
  accProcessed: number[];
};

/**
 * Hàm xử lý dữ liệu cho model.
 *
 * Input:
 * - type6: PPG raw
 * - type5x: ACC X raw
 * - type5y: ACC Y raw
 * - type5z: ACC Z raw
 *
 * Output:
 * - ppgProcessed: PPG đã lọc + Z-score
 * - accProcessed: ACC magnitude + Z-score
 */
export function preprocessSensorFusionSignals(
  type6: number[],
  type5x: number[],
  type5y: number[],
  type5z: number[],
): ProcessedSensorFusionSignals {
  validateFourSignalArrays(type6, type5x, type5y, type5z);

  const ppgFiltered = filterPpgZeroPhase(type6);
  const ppgProcessed = zScoreNormalize(ppgFiltered);

  const accMagnitude = type5x.map((x, index) => {
    const y = type5y[index];
    const z = type5z[index];

    return Math.sqrt(x * x + y * y + z * z) * ACC_SCALE_FACTOR;
  });

  const accProcessed = zScoreNormalize(accMagnitude);

  return {
    ppgProcessed,
    accProcessed,
  };
}

/**
 * Hàm tính nhịp tim từ type6.
 *
 * Chỉ gọi khi type6 đã đủ 1500 mẫu.
 */
export function calculateHeartRateFromType6(type6: number[]): number | null {
  validateOneSignalArray(type6, 'type6');

  const ppgFiltered = filterPpgZeroPhase(type6);

  const dominantFrequencyHz = findDominantFrequencyByFft(
    ppgFiltered,
    SAMPLE_RATE_HZ,
    HEART_RATE_MIN_HZ,
    HEART_RATE_MAX_HZ,
  );

  if (dominantFrequencyHz === null) {
    return null;
  }

  const heartRateBpm = dominantFrequencyHz * 60;

  return Number(heartRateBpm.toFixed(2));
}

function filterPpgZeroPhase(input: number[]): number[] {
  const forward = applySosFilter(input, PPG_BANDPASS_SOS);
  const backward = applySosFilter([...forward].reverse(), PPG_BANDPASS_SOS);

  return backward.reverse();
}

function applySosFilter(input: number[], sos: number[][]): number[] {
  let output = [...input];

  for (const section of sos) {
    const [b0, b1, b2, a0, a1, a2] = section;

    if (Math.abs(a0) < Number.EPSILON) {
      throw new Error('Invalid SOS coefficients: a0 must not be zero.');
    }

    let z1 = 0;
    let z2 = 0;

    output = output.map((sample) => {
      const y = (b0 / a0) * sample + z1;

      const nextZ1 = (b1 / a0) * sample - (a1 / a0) * y + z2;
      const nextZ2 = (b2 / a0) * sample - (a2 / a0) * y;

      z1 = nextZ1;
      z2 = nextZ2;

      return y;
    });
  }

  return output;
}

function zScoreNormalize(input: number[]): number[] {
  const mean = input.reduce((sum, value) => sum + value, 0) / input.length;

  const variance =
    input.reduce((sum, value) => {
      const diff = value - mean;
      return sum + diff * diff;
    }, 0) / input.length;

  const std = Math.sqrt(variance);

  return input.map((value) => (value - mean) / (std + EPSILON));
}

function findDominantFrequencyByFft(
  signal: number[],
  sampleRateHz: number,
  minHz: number,
  maxHz: number,
): number | null {
  const fftSize = nextPowerOfTwo(signal.length);

  const real = new Array<number>(fftSize).fill(0);
  const imag = new Array<number>(fftSize).fill(0);

  for (let i = 0; i < signal.length; i += 1) {
    real[i] = signal[i];
  }

  fftRadix2(real, imag);

  const minBin = Math.ceil((minHz * fftSize) / sampleRateHz);
  const maxBin = Math.floor((maxHz * fftSize) / sampleRateHz);

  let peakBin = -1;
  let peakMagnitudeSquared = -Infinity;

  for (let bin = minBin; bin <= maxBin; bin += 1) {
    const re = real[bin];
    const im = imag[bin];
    const magnitudeSquared = re * re + im * im;

    if (magnitudeSquared > peakMagnitudeSquared) {
      peakMagnitudeSquared = magnitudeSquared;
      peakBin = bin;
    }
  }

  if (peakBin < 0) {
    return null;
  }

  return (peakBin * sampleRateHz) / fftSize;
}

function fftRadix2(real: number[], imag: number[]): void {
  const n = real.length;

  if ((n & (n - 1)) !== 0) {
    throw new Error('FFT length must be a power of two.');
  }

  let j = 0;

  for (let i = 1; i < n; i += 1) {
    let bit = n >> 1;

    while (j & bit) {
      j ^= bit;
      bit >>= 1;
    }

    j ^= bit;

    if (i < j) {
      [real[i], real[j]] = [real[j], real[i]];
      [imag[i], imag[j]] = [imag[j], imag[i]];
    }
  }

  for (let len = 2; len <= n; len <<= 1) {
    const angle = (-2 * Math.PI) / len;
    const wLenCos = Math.cos(angle);
    const wLenSin = Math.sin(angle);

    for (let i = 0; i < n; i += len) {
      let wCos = 1;
      let wSin = 0;

      for (let k = 0; k < len / 2; k += 1) {
        const evenIndex = i + k;
        const oddIndex = i + k + len / 2;

        const oddRe = real[oddIndex] * wCos - imag[oddIndex] * wSin;
        const oddIm = real[oddIndex] * wSin + imag[oddIndex] * wCos;

        const evenRe = real[evenIndex];
        const evenIm = imag[evenIndex];

        real[evenIndex] = evenRe + oddRe;
        imag[evenIndex] = evenIm + oddIm;

        real[oddIndex] = evenRe - oddRe;
        imag[oddIndex] = evenIm - oddIm;

        const nextWCos = wCos * wLenCos - wSin * wLenSin;
        const nextWSin = wCos * wLenSin + wSin * wLenCos;

        wCos = nextWCos;
        wSin = nextWSin;
      }
    }
  }
}

function nextPowerOfTwo(value: number): number {
  let power = 1;

  while (power < value) {
    power <<= 1;
  }

  return power;
}

function validateFourSignalArrays(
  type6: number[],
  type5x: number[],
  type5y: number[],
  type5z: number[],
): void {
  validateOneSignalArray(type6, 'type6');
  validateOneSignalArray(type5x, 'type5x');
  validateOneSignalArray(type5y, 'type5y');
  validateOneSignalArray(type5z, 'type5z');

  if (
    type6.length !== type5x.length ||
    type6.length !== type5y.length ||
    type6.length !== type5z.length
  ) {
    throw new Error(
      `Signal length mismatch: type6=${type6.length}, type5x=${type5x.length}, type5y=${type5y.length}, type5z=${type5z.length}`,
    );
  }
}

function validateOneSignalArray(signal: number[], signalName: string): void {
  if (!Array.isArray(signal)) {
    throw new Error(`${signalName} must be an array.`);
  }

  if (signal.length !== EXPECTED_SIGNAL_LENGTH) {
    throw new Error(
      `${signalName} must contain exactly ${EXPECTED_SIGNAL_LENGTH} samples, received ${signal.length}.`,
    );
  }

  const hasInvalidValue = signal.some((value) => !Number.isFinite(value));

  if (hasInvalidValue) {
    throw new Error(`${signalName} contains NaN or Infinity.`);
  }
}
