const TRACE_LEN = 200;

export const state = {
  audioCtx: null,
  workletNode: null,
  currentStream: null,
  cNasal: 0,
  cOral: 0,
  cNasalance: 0,
  relativeMode: true,
  gNasal: 1.0,
  gOral: 1.0,
  gAlpha: 0.92,
  nasalanceHistory: new Float32Array(TRACE_LEN),
  traceHead: 0,
  traceLen: TRACE_LEN,
};
