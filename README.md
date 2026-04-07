# NoisyNosesWeb

`NoisyNosesWeb` is an application for real-time visualisation of acoustic nasalance in a web browser. The application takes audio input from a pair of microphones (one for oral energy, one for nasal energy), computes the nasalance value in real-time, and visualises it using a simple graphical interface. The application is designed for use in speech therapy and public engagement settings to provide immediate feedback on nasalance levels during speech production.

You can find our open-source hardware for acoustic nasalance [here](https://github.com/phoneticslab/nosey) and a project for developing fully open-source nasometry [here](https://porupski.github.io/Nosey_MEMS/).

An older prototype of the `NoisyNosesWeb` software is available as [NoisyNoses](https://github.com/NoisyNoses)

## Features

- Animated face with nose/mouth colour mapped to nasal/oral energy
- Nasalance percentage readout (relative mode) or per-channel dB (absolute mode)
- Rolling nasalance trace (time × percentage)
- Per-channel gain sliders and smoothing control
- Toggle (☰) next to top logo to hide controls


## Local usage

```bash
npx serve .
# or
python3 -m http.server 8000
```

Open in a browser, select your stereo audio device, and click **Start**.

## Author

Sam Kirkham