import { state } from './state.js';

export async function createProcessor(ctx) {
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
