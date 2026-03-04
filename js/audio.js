import { state } from './state.js';

export async function createProcessor(ctx) {
  // Attempt 1: AudioWorklet via external file
  if (ctx.audioWorklet) {
    try {
      await ctx.audioWorklet.addModule('nasalance-processor.js');
      const node = new AudioWorkletNode(ctx, 'nasalance-processor', {
        channelCount: 2, channelCountMode: 'explicit'
      });
      node.port.onmessage = (e) => {
        state.cNasal = e.data.nasal;
        state.cOral = e.data.oral;
        state.cNasalance = e.data.nasalance;
      };
      console.log('Using AudioWorklet');
      return node;
    } catch(e) {
      console.warn('AudioWorklet failed, falling back:', e.message);
    }
  }

  // Attempt 2: ScriptProcessorNode (deprecated but universal)
  console.log('Using ScriptProcessorNode fallback');
  let smoothN = 0, smoothO = 0;

  // HPF state (1st-order IIR at 100 Hz)
  const hpfAlpha = 1 / (1 + 2 * Math.PI * 100 / ctx.sampleRate);
  let prevInN = 0, prevOutN = 0;
  let prevInO = 0, prevOutO = 0;

  const node = ctx.createScriptProcessor(256, 2, 2);
  node.onaudioprocess = (e) => {
    const nCh = e.inputBuffer.getChannelData(0);
    const oCh = e.inputBuffer.getChannelData(1);
    const N = nCh.length;

    // HPF + gain
    const filtN = new Float32Array(N);
    const filtO = new Float32Array(N);
    for (let i = 0; i < N; i++) {
      prevOutN = hpfAlpha * (prevOutN + nCh[i] - prevInN);
      prevInN = nCh[i];
      filtN[i] = prevOutN * state.gNasal;

      prevOutO = hpfAlpha * (prevOutO + oCh[i] - prevInO);
      prevInO = oCh[i];
      filtO[i] = prevOutO * state.gOral;
    }

    // DC offset removal + RMS
    let meanN = 0, meanO = 0;
    for (let i = 0; i < N; i++) {
      meanN += filtN[i];
      meanO += filtO[i];
    }
    meanN /= N;
    meanO /= N;

    let nSum = 0, oSum = 0;
    for (let i = 0; i < N; i++) {
      const ns = filtN[i] - meanN;
      const os = filtO[i] - meanO;
      nSum += ns * ns;
      oSum += os * os;
    }

    smoothN = state.gAlpha * smoothN + (1 - state.gAlpha) * Math.sqrt(nSum / N);
    smoothO = state.gAlpha * smoothO + (1 - state.gAlpha) * Math.sqrt(oSum / N);
    const total = smoothN + smoothO;
    state.cNasal = smoothN;
    state.cOral = smoothO;
    state.cNasalance = total > 0.001 ? smoothN / total : 0;
    // Copy input to output to keep node alive
    for (let ch = 0; ch < 2; ch++) {
      e.outputBuffer.getChannelData(ch).set(e.inputBuffer.getChannelData(ch));
    }
  };
  return node;
}

export async function switchSource(devId) {
  if (state.currentStream) state.currentStream.getTracks().forEach(t => t.stop());
  const stream = await navigator.mediaDevices.getUserMedia({
    audio: {
      deviceId: { exact: devId }, channelCount: 2,
      echoCancellation: false, noiseSuppression: false, autoGainControl: false
    }
  });
  state.currentStream = stream;
  state.audioCtx.createMediaStreamSource(stream).connect(state.workletNode);
}
