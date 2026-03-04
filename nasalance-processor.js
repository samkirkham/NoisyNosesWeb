class NasalanceProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.smoothNasal = 0;
    this.smoothOral = 0;
    this.alpha = 0.92;
    this.gainNasal = 1.0;
    this.gainOral = 1.0;

    // HPF state (1st-order IIR at 100 Hz)
    this.hpfAlpha = 1 / (1 + 2 * Math.PI * 100 / sampleRate);
    this.prevInN = 0;
    this.prevOutN = 0;
    this.prevInO = 0;
    this.prevOutO = 0;

    // Block accumulation: gather 2 render quanta (2×128 = 256 samples)
    this.accumN = new Float32Array(256);
    this.accumO = new Float32Array(256);
    this.accumPos = 0;

    this.port.onmessage = (e) => {
      if (e.data.alpha !== undefined) this.alpha = e.data.alpha;
      if (e.data.gainNasal !== undefined) this.gainNasal = e.data.gainNasal;
      if (e.data.gainOral !== undefined) this.gainOral = e.data.gainOral;
    };
  }

  process(inputs) {
    const input = inputs[0];
    if (!input || input.length < 2) return true;

    const nasalCh = input[0];
    const oralCh = input[1];
    const N = nasalCh.length;
    const a = this.hpfAlpha;

    // HPF + gain, accumulate into buffer
    for (let i = 0; i < N; i++) {
      // HPF nasal
      const inN = nasalCh[i];
      this.prevOutN = a * (this.prevOutN + inN - this.prevInN);
      this.prevInN = inN;
      this.accumN[this.accumPos + i] = this.prevOutN * this.gainNasal;

      // HPF oral
      const inO = oralCh[i];
      this.prevOutO = a * (this.prevOutO + inO - this.prevInO);
      this.prevInO = inO;
      this.accumO[this.accumPos + i] = this.prevOutO * this.gainOral;
    }

    this.accumPos += N;

    // Only compute + post when we have 256 samples
    if (this.accumPos < 256) return true;
    this.accumPos = 0;

    const blockLen = 256;

    // DC offset removal + RMS
    let meanN = 0, meanO = 0;
    for (let i = 0; i < blockLen; i++) {
      meanN += this.accumN[i];
      meanO += this.accumO[i];
    }
    meanN /= blockLen;
    meanO /= blockLen;

    let nasalSum = 0, oralSum = 0;
    for (let i = 0; i < blockLen; i++) {
      const ns = this.accumN[i] - meanN;
      const os = this.accumO[i] - meanO;
      nasalSum += ns * ns;
      oralSum += os * os;
    }

    const nasalRMS = Math.sqrt(nasalSum / blockLen);
    const oralRMS = Math.sqrt(oralSum / blockLen);

    this.smoothNasal = this.alpha * this.smoothNasal + (1 - this.alpha) * nasalRMS;
    this.smoothOral = this.alpha * this.smoothOral + (1 - this.alpha) * oralRMS;

    const total = this.smoothNasal + this.smoothOral;
    const nasalance = total > 0.001 ? this.smoothNasal / total : 0;

    this.port.postMessage({
      nasal: this.smoothNasal,
      oral: this.smoothOral,
      nasalance
    });

    return true;
  }
}
registerProcessor('nasalance-processor', NasalanceProcessor);
