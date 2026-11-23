(() => {
  "use strict";

  const AudioContext = window.AudioContext || window.webkitAudioContext;
  const duration = 10;
  let context;
  let master;
  let enabled = true;
  let recorded;
  let musicBus;
  let musicTimer;
  let generation = 0;

  function unlock() {
    if (!enabled || !AudioContext) return false;
    try {
      if (!context) {
        context = new AudioContext();
        master = context.createGain();
        master.gain.value = 0.75;
        master.connect(context.destination);
      }
      if (context.state === "suspended") context.resume().catch(() => {});
      return true;
    } catch {
      return false;
    }
  }

  function stop() {
    generation++;
    clearTimeout(musicTimer);
    if (recorded) {
      recorded.pause();
      recorded = null;
    }
    if (musicBus) {
      musicBus.disconnect();
      musicBus = null;
    }
  }

  function setEnabled(value) {
    enabled = value;
    if (master) master.gain.value = value ? 0.75 : 0;
    if (!value) stop();
    else unlock();
  }

  function tone(bus, time, freq, length, level, type = "sine", attack = 0.003, endFreq = freq) {
    const sound = context.createOscillator();
    const envelope = context.createGain();
    sound.type = type;
    sound.frequency.setValueAtTime(freq, time);
    sound.frequency.exponentialRampToValueAtTime(endFreq, time + length);
    envelope.gain.setValueAtTime(0.0001, time);
    envelope.gain.exponentialRampToValueAtTime(level, time + attack);
    envelope.gain.exponentialRampToValueAtTime(0.0001, time + length);
    sound.connect(envelope).connect(bus);
    sound.start(time);
    sound.stop(time + length + 0.015);
  }

  function noise(time, length, volume, type, startFreq, endFreq) {
    const buffer = context.createBuffer(1, Math.ceil(length * context.sampleRate), context.sampleRate);
    const samples = buffer.getChannelData(0);
    for (let i = 0; i < samples.length; i++) samples[i] = 2 * Math.random() - 1;
    const sound = context.createBufferSource();
    const filter = context.createBiquadFilter();
    const envelope = context.createGain();
    filter.type = type;
    filter.Q.value = 1.2;
    filter.frequency.setValueAtTime(startFreq, time);
    filter.frequency.exponentialRampToValueAtTime(endFreq, time + length);
    envelope.gain.setValueAtTime(volume, time);
    envelope.gain.exponentialRampToValueAtTime(0.0001, time + length);
    sound.buffer = buffer;
    sound.connect(filter).connect(envelope).connect(master);
    sound.start(time);
  }

  function effect(name) {
    if (!unlock()) return;
    const time = context.currentTime + 0.01;
    if (name === "bell") {
      [0, 0.19].forEach((offset, index) => {
        const fundamental = index ? 1048 : 929;
        noise(time + offset, 0.045, 0.12, "bandpass", 2000, 950);
        [1, 2.34, 3.77, 5.18].forEach((ratio, overtone) => {
          tone(master, time + offset, fundamental * ratio, 0.69 - overtone * 0.12, 0.15 / (overtone + 1));
        });
      });
    } else if (name === "printer") {
      for (let i = 0; i < 12; i++) {
        const onset = time + i * 0.075;
        tone(master, onset, 180 + i * 19, 0.087, 0.024, "sawtooth", 0.012, 420);
        noise(onset, 0.075, 0.09, "bandpass", 980, 1780);
      }
    } else if (name === "tear") {
      [0, 0.035, 0.09, 0.15].forEach((offset) => noise(time + offset, 0.09, 0.24, "highpass", 3600, 900));
    } else if (name === "stamp") {
      tone(master, time, 145, 0.21, 0.28, "triangle", 0.007, 44);
      noise(time, 0.12, 0.16, "lowpass", 800, 250);
    } else if (name === "receipt") {
      tone(master, time, 440, .3, .09, "sine");
      tone(master, time + .12, 659, .5, .08, "sine");
    }
  }

  const frequency = (midi) => 440 * 2 ** ((midi - 69) / 12);

  function pluck(bus, time, midi, volume, bright = false) {
    const period = Math.max(2, Math.round(context.sampleRate / frequency(midi) - 0.5));
    const buffer = context.createBuffer(1, Math.round(context.sampleRate * 1.55), context.sampleRate);
    const samples = buffer.getChannelData(0);
    const string = new Float32Array(period);
    for (let i = 0; i < period; i++) {
      string[i] = (Math.random() * 2 - 1) * (0.65 + 0.35 * Math.sin(i / period * Math.PI));
    }
    const damping = bright ? 0.998 : 0.994;
    for (let i = 0; i < samples.length; i++) {
      const index = i % period;
      const value = string[index];
      string[index] = damping * (value + string[(index + 1) % period]) * 0.5;
      samples[i] = value * Math.min(1, i / 30) * Math.exp(-2.1 * i / samples.length);
    }
    const source = context.createBufferSource();
    const body = context.createBiquadFilter();
    const envelope = context.createGain();
    body.type = "lowpass";
    body.frequency.value = bright ? 4750 : 2900;
    envelope.gain.value = volume;
    source.buffer = buffer;
    source.connect(body).connect(envelope).connect(bus);
    source.start(time);
  }

  function phrase(bus, time, id, city, ensemble) {
    const measure = ensemble ? 1.42 : 2.32;
    const chords = ensemble ? window.PigeonData.cities.xian.chords : city.chords;
    const level = ensemble ? 0.17 : 0.44;

    chords.forEach((chord, bar) => {
      const onset = time + bar * measure;
      if (id === "xian") {
        [0, 0.55, 0.95, 1.48, 1.91].forEach((beat, j) => {
          const strings = j % 2 ? chord.slice(2).reverse() : chord;
          strings.forEach((note, k) => pluck(bus, onset + beat * measure / 2.32 + k * 0.022, note, level * (j ? 0.29 : 0.49)));
        });
      } else {
        const order = id === "suzhou" ? [0, 4, 2, 5, 3, 4, 2] : [0, 2, 4, 3, 5, 4, 3];
        order.forEach((index, j) => pluck(bus, onset + j * measure / 8, chord[index % chord.length], level * (j ? 0.6 : 0.9), id === "nanchang"));
      }

      const notes = ensemble
        ? [chord[3] + 12, chord[4] + 12]
        : city.melody.slice(bar * 2, bar * 2 + 2);
      notes.forEach((note, j) => {
        const entry = onset + (j ? 0.56 : 0.12) * measure;
        if (id === "wuhan") {
          const pitch = frequency(note);
          tone(bus, entry, pitch, measure * .42, level * .29, "sine", .14);
          tone(bus, entry, pitch * 2.002, measure * .39, level * .074, "triangle", .17);
          tone(bus, entry, pitch * 1.005, measure * .36, level * .11, "sine", .21);
        } else if (id === "nanchang" || id === "suzhou") {
          pluck(bus, entry, id === "nanchang" ? note + 12 : note, level * 0.68, true);
        }
      });
    });
  }

  function synthesize(ids, seconds) {
    if (!unlock()) return;
    const time = context.currentTime + .035;
    musicBus = context.createGain();
    musicBus.connect(master);
    musicBus.gain.setValueAtTime(0.9, time);
    musicBus.gain.setValueAtTime(0.9, time + seconds - .65);
    musicBus.gain.exponentialRampToValueAtTime(.0001, time + seconds);
    for (const id of ids) phrase(musicBus, time, id, window.PigeonData.cities[id], ids.length > 1);
  }

  function play(ids, complete = () => {}) {
    stop();
    const current = generation;
    const seconds = ids.length === 1 ? duration : 6.7;
    const finish = () => {
      if (current !== generation) return;
      stop();
      complete();
    };
    const fallback = () => {
      if (current !== generation) return;
      synthesize(ids, seconds);
    };
    if (enabled && ids.length === 1) {
      const path = window.PigeonData.audioPath(window.PigeonData.cities[ids[0]]);
      if (path) {
        recorded = new Audio(path);
        recorded.volume = .75;
        recorded.play().catch(fallback);
      } else fallback();
    } else if (enabled) fallback();
    musicTimer = setTimeout(finish, seconds * 1000);
    return seconds;
  }

  window.PigeonAudio = { duration, unlock, setEnabled, effect, play, stop };
})();
