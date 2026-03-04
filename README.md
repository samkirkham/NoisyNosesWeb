# NoisyNosesWeb

Real-time nasalance visualization in the browser. Connect two microphones (left channel = nasal, right channel = oral) and see nasalance displayed on an animated face, as well as some additional visualizations.

## Features

- Animated face with nose/mouth colour mapped to nasal/oral energy
- Nasalance percentage readout (relative mode) or per-channel dB (absolute mode)
- Rolling nasalance trace (time × percentage)
- Per-channel gain sliders and smoothing control
- Toggle (☰) next to top logo to hide controls for demos/presentations
- 100 Hz high-pass filter and DC offset removal for stable readings

## Local usage

```bash
npx serve .
# or
python3 -m http.server 8000
```

Open in a browser, select your stereo audio device, and click **Start**.

## Author
Sam Kirkham