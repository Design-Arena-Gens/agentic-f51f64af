'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

const WIDTH = 1080; // 9:16 portrait
const HEIGHT = 1920;
const FPS = 30;
const DURATION_SEC = 60;

const SCRIPT_TEXT = [
  "I shouldn't have taken room two-thirteen.",
  "The hallway smells like bleach and something older.",
  "The carpet sighs under my shoes as I reach the door.",
  "Room two-thirteen blinks at me, brass numbers dull, as if tired of being noticed.",
  "The key slides, the lock resists, then gives, like a held breath finally exhaled.",
  "Inside is colder than the corridor. The air tastes metallic.",
  "There's a hum I can't place, low and steady, between the walls.",
  "The bathroom mirror carries a thin film, fingerprints from a hand not quite human.",
  "I whisper hello, to no one. Something whispers back, but it's my voice, too slow.",
  "The lights flicker. The hum turns into a throat clearing in the ceiling.",
  "I step toward the bed. Shadows move where my feet don't.",
  "The numbers two and thirteen are on the alarm clock, even though it's midnight.",
  "The door closes by itself, a soft click that sounds final.",
  "The hum stops. The room listens.",
  "In the silence I hear someone breathing, inside my ear, inside my head.",
  "I turn. In the window, my reflection is a half step late.",
  "It smiles before I do.",
  "I don't remember teaching it that.",
  "Something sits on the mattress. The springs don't move.",
  "I reach for the lamp. My hand goes through the switch like water.",
  "A whisper threads the dark: welcome back.",
  "I run for the door. The handle is warm, like a mouth.",
  "The brass numbers outside are reversed: three-one-two.",
  "There's no hallway. Only another door. Mine.",
  "I knock from inside. I hear knuckles on the other side.",
  "Room two-thirteen inhales.",
  "And the lights finally go out."
];

function chooseVoice(synth) {
  const voices = synth.getVoices();
  const preferredNames = [
    'Google UK English Male',
    'Google US English',
    'Microsoft Aria Online (Natural) - English (United States)',
    'Microsoft Guy Online (Natural) - English (United States)',
  ];
  for (const name of preferredNames) {
    const v = voices.find((x) => x.name === name);
    if (v) return v;
  }
  // fallback to any English
  const english = voices.find((v) => v.lang?.toLowerCase().startsWith('en'));
  return english || voices[0];
}

function useSpeech() {
  const [ready, setReady] = useState(false);
  const [voice, setVoice] = useState(null);
  useEffect(() => {
    const synth = window.speechSynthesis;
    const update = () => {
      const v = chooseVoice(synth);
      setVoice(v || null);
      setReady(true);
    };
    synth.onvoiceschanged = update;
    update();
  }, []);
  return { ready, voice };
}

function measureText(ctx, text, maxWidth) {
  const words = text.split(' ');
  const lines = [];
  let line = '';
  for (const w of words) {
    const test = line ? `${line} ${w}` : w;
    const width = ctx.measureText(test).width;
    if (width > maxWidth && line) {
      lines.push(line);
      line = w;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  return lines;
}

function drawScene(ctx, t) {
  // t in seconds (0..DURATION_SEC)
  // Background gradient (dark desaturated)
  const top = ctx.createLinearGradient(0, 0, 0, HEIGHT);
  top.addColorStop(0, '#050508');
  top.addColorStop(1, '#0b0b0e');
  ctx.fillStyle = top;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  // Subtle vignette
  const vignette = ctx.createRadialGradient(
    WIDTH / 2,
    HEIGHT / 2,
    Math.min(WIDTH, HEIGHT) * 0.2,
    WIDTH / 2,
    HEIGHT / 2,
    Math.max(WIDTH, HEIGHT) * 0.75
  );
  vignette.addColorStop(0, 'rgba(0,0,0,0)');
  vignette.addColorStop(1, 'rgba(0,0,0,0.75)');
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  // Camera sway
  const swayX = Math.sin(t * 0.6) * 6;
  const swayY = Math.cos(t * 0.7) * 4;
  ctx.save();
  ctx.translate(swayX, swayY);

  // Corridor/room morphing based on time
  // 0-18s: hallway approach; 18-40s: in room; 40-58s: distortions; 58-60s: blackout
  // Draw floor perspective
  const horizon = HEIGHT * 0.35;
  const floorColor = '#121217';
  ctx.fillStyle = floorColor;
  ctx.beginPath();
  ctx.moveTo(0, horizon);
  ctx.lineTo(WIDTH, horizon);
  ctx.lineTo(WIDTH, HEIGHT);
  ctx.lineTo(0, HEIGHT);
  ctx.closePath();
  ctx.fill();

  // Walls converging
  const wallColor = '#0f0f14';
  ctx.fillStyle = wallColor;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(WIDTH * 0.2, horizon);
  ctx.lineTo(0, HEIGHT);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(WIDTH, 0);
  ctx.lineTo(WIDTH * 0.8, horizon);
  ctx.lineTo(WIDTH, HEIGHT);
  ctx.closePath();
  ctx.fill();

  // Door 213 at the end or as interior door depending on time
  const doorProgress = Math.min(1, t / 16); // approach rate
  const doorWidth = 220 - doorProgress * 60;
  const doorHeight = 440 - doorProgress * 100;
  const doorX = WIDTH / 2 - doorWidth / 2;
  const doorY = horizon - doorHeight + 40;
  const doorColor = '#1f1f27';
  ctx.fillStyle = doorColor;
  ctx.fillRect(doorX, doorY, doorWidth, doorHeight);
  // Door frame
  ctx.strokeStyle = '#2b2b36';
  ctx.lineWidth = 6;
  ctx.strokeRect(doorX, doorY, doorWidth, doorHeight);
  // Door number plate
  ctx.fillStyle = '#272733';
  const plateW = 96;
  const plateH = 40;
  const plateX = doorX + doorWidth / 2 - plateW / 2;
  const plateY = doorY + doorHeight * 0.2;
  ctx.fillRect(plateX, plateY, plateW, plateH);
  ctx.strokeStyle = '#3a3a48';
  ctx.lineWidth = 3;
  ctx.strokeRect(plateX, plateY, plateW, plateH);
  // Number "213"
  ctx.fillStyle = '#c5b36a';
  ctx.font = 'bold 34px ui-sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('213', plateX + plateW / 2, plateY + plateH / 2 + 2);

  // Flicker and shadow events
  const flicker =
    (Math.sin(t * 13.7) * Math.sin(t * 7.9) > 0.8 ? 0.65 : 0) +
    (t > 48 && t < 50 ? 0.9 : 0) +
    (t > 58 ? 1 : 0);
  if (flicker > 0) {
    ctx.fillStyle = `rgba(255,255,255,${0.08 * flicker})`;
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
  }

  // Moving shadow passing under door
  const shadowT = (t % 9) / 9;
  const shadowY = doorY + doorHeight - 30 + Math.sin(shadowT * Math.PI * 2) * 18;
  ctx.fillStyle = 'rgba(0,0,0,0.35)';
  ctx.fillRect(doorX - 40, shadowY, doorWidth + 80, 20);

  // Inside room sequence: draw bed and lamp after 18s
  if (t > 18) {
    // Bed
    const bedX = WIDTH * 0.2;
    const bedY = HEIGHT * 0.58;
    ctx.fillStyle = '#1a1a22';
    ctx.fillRect(bedX, bedY, WIDTH * 0.6, 36);
    ctx.fillStyle = '#22222b';
    ctx.fillRect(bedX + 12, bedY - 70, WIDTH * 0.6 - 24, 70);
    // Lamp
    ctx.fillStyle = '#25252e';
    ctx.fillRect(WIDTH * 0.72, HEIGHT * 0.5, 16, 100);
    ctx.beginPath();
    ctx.moveTo(WIDTH * 0.69, HEIGHT * 0.5);
    ctx.lineTo(WIDTH * 0.81, HEIGHT * 0.5);
    ctx.lineTo(WIDTH * 0.75, HEIGHT * 0.45);
    ctx.closePath();
    ctx.fill();
    // Lamp light cone (dim, flickering)
    const lampPulse = 0.2 + 0.1 * Math.sin(t * 12.3);
    const radial = ctx.createRadialGradient(
      WIDTH * 0.75,
      HEIGHT * 0.49,
      10,
      WIDTH * 0.75,
      HEIGHT * 0.49,
      420
    );
    radial.addColorStop(0, `rgba(240,235,210,${0.08 + lampPulse})`);
    radial.addColorStop(1, 'rgba(240,235,210,0)');
    ctx.fillStyle = radial;
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
  }

  // Creeping silhouette (late sequence)
  if (t > 32) {
    ctx.save();
    const creep = Math.min(1, (t - 32) / 14);
    const cx = WIDTH * (0.2 + creep * 0.6);
    const cy = HEIGHT * (0.7 - creep * 0.25);
    ctx.translate(cx, cy);
    ctx.fillStyle = 'rgba(0,0,0,0.7)';
    // Head
    ctx.beginPath();
    ctx.ellipse(0, -90, 40, 54, 0, 0, Math.PI * 2);
    ctx.fill();
    // Torso
    ctx.fillRect(-28, -90, 56, 140);
    // Arms
    ctx.beginPath();
    ctx.moveTo(-28, -50);
    ctx.lineTo(-80, 10);
    ctx.lineTo(-70, 20);
    ctx.lineTo(-18, -40);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(28, -50);
    ctx.lineTo(80, 10);
    ctx.lineTo(70, 20);
    ctx.lineTo(18, -40);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  ctx.restore();

  // CRT noise overlay
  const noiseStrength = 0.06;
  const imgData = ctx.getImageData(0, 0, WIDTH, HEIGHT);
  const data = imgData.data;
  for (let i = 0; i < data.length; i += 4) {
    const n = (Math.random() - 0.5) * 255 * noiseStrength;
    data[i] = Math.max(0, Math.min(255, data[i] + n));
    data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + n));
    data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + n));
  }
  ctx.putImageData(imgData, 0, 0);
}

export default function Page() {
  const canvasRef = useRef(null);
  const [recording, setRecording] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [videoUrl, setVideoUrl] = useState(null);
  const [progress, setProgress] = useState(0);
  const { ready: ttsReady, voice } = useSpeech();

  const scriptCombined = useMemo(() => SCRIPT_TEXT.join(' '), []);

  const speak = () => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    const synth = window.speechSynthesis;
    synth.cancel();
    const utter = new SpeechSynthesisUtterance(scriptCombined);
    if (voice) utter.voice = voice;
    // Aim for ~60s total: set rate based on words
    const words = scriptCombined.split(/\s+/).length;
    const targetSeconds = DURATION_SEC;
    // average 180 wpm ~ 3 wps at rate 1; scale rate so duration ~ target
    const estSecondsAtRate1 = words / 3;
    const rate = Math.max(0.6, Math.min(1.4, estSecondsAtRate1 / targetSeconds));
    utter.rate = rate;
    utter.pitch = 0.9;
    utter.volume = 1.0;
    synth.speak(utter);
  };

  const animate = async () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { alpha: false });
    ctx.imageSmoothingEnabled = true;

    // Subtitles layout
    const drawCaption = (t) => {
      const segment = Math.floor((t / DURATION_SEC) * SCRIPT_TEXT.length);
      const text = SCRIPT_TEXT[Math.max(0, Math.min(SCRIPT_TEXT.length - 1, segment))];
      ctx.save();
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom';
      ctx.fillStyle = 'rgba(0,0,0,0.55)';
      ctx.fillRect(WIDTH * 0.1, HEIGHT * 0.82, WIDTH * 0.8, 140);
      ctx.font = '32px ui-sans-serif';
      ctx.fillStyle = '#e9e6dc';
      const lines = measureText(ctx, text, WIDTH * 0.75);
      const baseY = HEIGHT * 0.93;
      lines.forEach((line, i) => {
        ctx.fillText(line, WIDTH / 2, baseY - (lines.length - 1 - i) * 38);
      });
      ctx.restore();
    };

    let start;
    let rafId;
    let lastFrameTime = 0;
    const frameDuration = 1000 / FPS;
    function step(ts) {
      if (start == null) start = ts;
      const elapsed = ts - start;
      const t = elapsed / 1000;
      if (ts - lastFrameTime >= frameDuration - 1) {
        lastFrameTime = ts;
        drawScene(ctx, Math.min(DURATION_SEC, t));
        drawCaption(Math.min(DURATION_SEC, t));
        setProgress(Math.min(1, t / DURATION_SEC));
      }
      if (t < DURATION_SEC) {
        rafId = requestAnimationFrame(step);
      }
    }
    rafId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafId);
  };

  const generateVideo = async () => {
    if (generating) return;
    setVideoUrl((u) => {
      if (u) URL.revokeObjectURL(u);
      return null;
    });
    setGenerating(true);
    setProgress(0);
    const canvas = canvasRef.current;
    const stream = canvas.captureStream(FPS);
    const chunks = [];
    const mime = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
      ? 'video/webm;codecs=vp9'
      : 'video/webm;codecs=vp8';
    const rec = new MediaRecorder(stream, { mimeType: mime, videoBitsPerSecond: 6_000_000 });
    rec.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) chunks.push(e.data);
    };
    const stopped = new Promise((resolve) => (rec.onstop = resolve));
    rec.start();
    const cancelAnim = await animate();
    await new Promise((r) => setTimeout(r, DURATION_SEC * 1000 + 200));
    rec.stop();
    cancelAnim();
    await stopped;
    const blob = new Blob(chunks, { type: mime });
    const url = URL.createObjectURL(blob);
    setVideoUrl(url);
    setGenerating(false);
  };

  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
        padding: '24px 12px 48px',
        gap: 16,
      }}
    >
      <h1 style={{ margin: '8px 0 0', letterSpacing: 1 }}>
        Room 213 ? 2D Horror (9:16)
      </h1>
      <p style={{ margin: 0, opacity: 0.8, fontSize: 14 }}>
        One-minute animated short with first-person narration.
      </p>
      <div
        style={{
          width: 360,
          height: 640,
          borderRadius: 12,
          overflow: 'hidden',
          boxShadow: '0 10px 40px rgba(0,0,0,0.6)',
          border: '1px solid #1f1f1f',
          background: '#000',
        }}
      >
        <canvas
          ref={canvasRef}
          width={WIDTH}
          height={HEIGHT}
          style={{
            width: '100%',
            height: '100%',
            display: 'block',
          }}
        />
      </div>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <button
          onClick={() => {
            if (ttsReady) speak();
          }}
          disabled={!ttsReady}
          style={{
            background: '#1e1e2a',
            color: '#e7e7e7',
            border: '1px solid #2f2f3a',
            padding: '10px 14px',
            borderRadius: 8,
            cursor: ttsReady ? 'pointer' : 'not-allowed',
          }}
          title={ttsReady ? 'Play narration' : 'Loading voices...'}
        >
          Play narration
        </button>
        <button
          onClick={() => {
            if (!recording) {
              setRecording(true);
              animate();
              setTimeout(() => setRecording(false), DURATION_SEC * 1000 + 200);
            }
          }}
          disabled={recording || generating}
          style={{
            background: recording ? '#3a1e1e' : '#2a1e1e',
            color: '#e7e7e7',
            border: '1px solid #3a2f2f',
            padding: '10px 14px',
            borderRadius: 8,
            cursor: recording ? 'not-allowed' : 'pointer',
          }}
        >
          Preview animation
        </button>
        <button
          onClick={generateVideo}
          disabled={generating}
          style={{
            background: '#1e2a1e',
            color: '#e7e7e7',
            border: '1px solid #2f3a2f',
            padding: '10px 14px',
            borderRadius: 8,
            cursor: generating ? 'not-allowed' : 'pointer',
          }}
          title="Exports a 9:16 WebM video"
        >
          {generating ? 'Rendering?' : 'Generate & download'}
        </button>
        {videoUrl && (
          <a
            href={videoUrl}
            download="room-213.webm"
            style={{
              textDecoration: 'none',
              background: '#1e1e1e',
              border: '1px solid #2a2a2a',
              color: '#e7e7e7',
              padding: '10px 14px',
              borderRadius: 8,
            }}
          >
            Download video
          </a>
        )}
      </div>
      <div
        style={{
          width: 360,
          height: 8,
          background: '#1a1a1a',
          borderRadius: 999,
          overflow: 'hidden',
          border: '1px solid #242424',
        }}
      >
        <div
          style={{
            width: `${Math.floor(progress * 100)}%`,
            height: '100%',
            background:
              'linear-gradient(90deg, #6a5acd, #8a2be2, #b22222, #ff4500)',
            transition: 'width 120ms linear',
          }}
        />
      </div>
      <details style={{ maxWidth: 480, opacity: 0.8 }}>
        <summary style={{ cursor: 'pointer' }}>Narration script</summary>
        <p style={{ whiteSpace: 'pre-wrap', lineHeight: 1.5, marginTop: 8 }}>
          {SCRIPT_TEXT.join(' ')}
        </p>
      </details>
    </main>
  );
}

