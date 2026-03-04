import { state } from './state.js';
import { createProcessor } from './audio.js';
import { populateDevices, initDeviceListeners } from './devices.js';
import { initControls } from './controls.js';
import { initCanvases, startRenderLoop } from './render.js';

const startScreen = document.getElementById('start-screen');
const appDiv = document.getElementById('app');
const startBtn = document.getElementById('start-btn');
const errorDiv = document.getElementById('error');
const audioSrc = document.getElementById('audio-source');

populateDevices();
initDeviceListeners();
initControls();

startBtn.addEventListener('click', async () => {
  try {
    errorDiv.style.display = 'none';
    const devId = audioSrc.value;
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        deviceId: devId ? { exact: devId } : undefined,
        channelCount: 2,
        echoCancellation: false,
        noiseSuppression: false,
        autoGainControl: false
      }
    });
    state.currentStream = stream;

    const settings = stream.getAudioTracks()[0].getSettings();
    state.audioCtx = new AudioContext({ sampleRate: 44100 });
    const src = state.audioCtx.createMediaStreamSource(stream);

    state.workletNode = await createProcessor(state.audioCtx);
    src.connect(state.workletNode);
    state.workletNode.connect(state.audioCtx.destination);

    startScreen.style.display = 'none';
    appDiv.style.display = 'block';
    initCanvases();
    startRenderLoop();

    if (settings.channelCount === 1) {
      errorDiv.textContent = 'Warning: mono input detected. Need stereo (L=nasal, R=oral).';
      errorDiv.style.display = 'block';
    }
  } catch (err) {
    errorDiv.textContent = err.name === 'NotAllowedError'
      ? 'Mic access denied. Please allow and retry.'
      : `Error: ${err.message}`;
    errorDiv.style.display = 'block';
  }
});
