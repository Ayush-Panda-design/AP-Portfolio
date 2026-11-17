import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { BriefcaseIcon, HouseIcon, MailIcon, MoonIcon, RouteIcon, SunIcon, UserIcon, VolumeXIcon } from "lucide-react";
import { scrollToId } from "./lib";

const ITEMS = [
  { id: "top", label: "Home", Icon: HouseIcon },
  { id: "journey", label: "Journey", Icon: RouteIcon },
  { id: "work", label: "Work", Icon: BriefcaseIcon },
  { id: "about", label: "About", Icon: UserIcon },
  { id: "contact", label: "Contact", Icon: MailIcon },
] as const;

export function Nav({ resumeHref }: { resumeHref: string }) {
  const [active, setActive] = useState<string>("top");

  useEffect(() => {
    const els = ITEMS.map((i) => document.getElementById(i.id)).filter(Boolean) as HTMLElement[];
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(e.target.id)),
      { rootMargin: "-45% 0px -45% 0px" },
    );
    els.forEach((e) => io.observe(e));
    return () => io.disconnect();
  }, []);

  return (
    <motion.nav
      className="jc-nav jc-glass"
      initial={{ x: "-50%", y: 100, opacity: 0 }}
      animate={{ x: "-50%", y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 170, damping: 18, delay: 2 }}
      aria-label="Primary"
    >
      {ITEMS.map(({ id, label, Icon }) => (
        <button key={id} onClick={() => scrollToId(id)} aria-current={active === id}>
          {active === id && <motion.span layoutId="jc-nav-pill" className="pill" transition={{ type: "spring", stiffness: 360, damping: 28 }} />}
          {active === id && (
            <motion.span initial={{ scale: 0, rotate: -40 }} animate={{ scale: 1, rotate: 0 }} style={{ display: "flex" }}>
              <Icon size={18} />
            </motion.span>
          )}
          <span>{label}</span>
        </button>
      ))}
      <a className="cta" href={resumeHref} target="_blank" rel="noreferrer">
        Resume ↗
      </a>
    </motion.nav>
  );
}

const TOUR = ["top", "journey", "work", "stack", "process", "github", "recognition", "about", "life", "contact"];

export function TopBar({ mode, onToggle }: { mode: "night" | "day"; onToggle: (e: React.MouseEvent) => void }) {
  const [touring, setTouring] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    if (!touring) return;
    let i = 0;
    const step = () => {
      const id = TOUR[i];
      // the journey is a tall pinned section: let it play out before moving on
      if (id === "journey") {
        const el = document.getElementById(id);
        if (el) {
          const top = el.getBoundingClientRect().top + window.scrollY;
          window.__lenis?.scrollTo(top + el.offsetHeight - window.innerHeight, { duration: 7, easing: (t: number) => t });
          i++;
          timer.current = setTimeout(step, 8000);
          return;
        }
      }
      scrollToId(id);
      i++;
      if (i >= TOUR.length) {
        timer.current = setTimeout(() => setTouring(false), 3500);
        return;
      }
      timer.current = setTimeout(step, 3800);
    };
    step();
    const stop = () => setTouring(false);
    window.addEventListener("wheel", stop, { passive: true });
    window.addEventListener("touchstart", stop, { passive: true });
    return () => {
      clearTimeout(timer.current);
      window.removeEventListener("wheel", stop);
      window.removeEventListener("touchstart", stop);
    };
  }, [touring]);

  return (
    <motion.div className="jc-topbar" initial={{ y: -80, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ type: "spring", stiffness: 160, damping: 18, delay: 2.1 }}>
      <button className="jc-tpill jc-glass" onClick={() => setTouring((t) => !t)} aria-pressed={touring}>
        <span className="jc-orb" />
        <span className="lbl">{touring ? "Stop tour" : "Take a tour"}</span>
      </button>
      <button className="jc-tpill noav jc-glass" onClick={onToggle} aria-label={mode === "night" ? "Switch to day" : "Switch to night"}>
        <motion.span key={mode} initial={{ rotate: -120, scale: 0 }} animate={{ rotate: 0, scale: 1 }} transition={{ type: "spring", stiffness: 260, damping: 12 }} style={{ display: "flex", color: "var(--sun)" }}>
          {mode === "night" ? <SunIcon size={22} /> : <MoonIcon size={22} />}
        </motion.span>
        <span className="lbl">{mode === "night" ? "Day" : "Night"}</span>
      </button>
    </motion.div>
  );
}

const midiHz = (m: number) => 440 * Math.pow(2, (m - 69) / 12);
// Cmaj7 - Am7 - Fmaj7 - G(sus): a warm, slow lo-fi loop
const CHORDS = [[48, 52, 55, 59], [45, 48, 52, 55], [41, 45, 48, 52], [43, 47, 50, 55]];
const SCALE = [72, 74, 76, 79, 81, 84];

/** Generated ambient music (no audio file): warm pads, a soft bass and sparse bell notes in a roomy reverb. */
export function SoundToggle() {
  const [on, setOn] = useState(false);
  const ctx = useRef<AudioContext | null>(null);
  const master = useRef<GainNode | null>(null);
  const timer = useRef<ReturnType<typeof setInterval> | undefined>(undefined);
  const nodes = useRef<{ pad: AudioNode; bus: AudioNode } | null>(null);
  const sched = useRef({ chordAt: 0, chord: 0, noteAt: 0 });

  const tone = (t: number, midi: number, o: { type: OscillatorType; vol: number; atk: number; dur: number; rel: number; dest: AudioNode }) => {
    const c = ctx.current!;
    const osc = c.createOscillator();
    osc.type = o.type;
    osc.frequency.value = midiHz(midi);
    osc.detune.value = (Math.random() - 0.5) * 10;
    const e = c.createGain();
    e.gain.setValueAtTime(0.0001, t);
    e.gain.linearRampToValueAtTime(o.vol, t + o.atk);
    e.gain.setValueAtTime(o.vol, t + o.dur);
    e.gain.linearRampToValueAtTime(0.0001, t + o.dur + o.rel);
    osc.connect(e).connect(o.dest);
    osc.start(t);
    osc.stop(t + o.dur + o.rel + 0.1);
  };
  const bell = (t: number, midi: number) => {
    const c = ctx.current!;
    [[1, 0.05, 2.8], [2, 0.014, 1.3]].forEach(([mul, vol, dec]) => {
      const osc = c.createOscillator();
      osc.type = "sine";
      osc.frequency.value = midiHz(midi) * mul;
      const e = c.createGain();
      e.gain.setValueAtTime(0.0001, t);
      e.gain.exponentialRampToValueAtTime(vol, t + 0.012);
      e.gain.exponentialRampToValueAtTime(0.0001, t + dec);
      osc.connect(e).connect(nodes.current!.bus);
      osc.start(t);
      osc.stop(t + dec + 0.1);
    });
  };
  const tick = () => {
    const c = ctx.current;
    const n = nodes.current;
    if (!c || !n) return;
    const s = sched.current;
    const ahead = c.currentTime + 1.2;
    while (s.chordAt < ahead) {
      const t = Math.max(s.chordAt, c.currentTime + 0.05);
      const ch = CHORDS[s.chord % CHORDS.length];
      ch.forEach((m, i) => tone(t, m, { type: i % 2 ? "sine" : "triangle", vol: 0.07, atk: 2.2, dur: 5.2, rel: 3.2, dest: n.pad }));
      tone(t, ch[0] - 12, { type: "sine", vol: 0.13, atk: 0.7, dur: 6, rel: 2, dest: n.bus });
      s.chord++;
      s.chordAt = t + 8;
    }
    while (s.noteAt < ahead) {
      if (Math.random() < 0.55) bell(s.noteAt, SCALE[Math.floor(Math.random() * SCALE.length)]);
      s.noteAt += 0.9 + (Math.random() < 0.3 ? 0.9 : 0);
    }
  };

  const start = () => {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const c = new AC();
    const g = c.createGain();
    g.gain.value = 0;
    const comp = c.createDynamicsCompressor();
    const bus = c.createGain();
    const dry = c.createGain();
    dry.gain.value = 0.8;
    const wet = c.createGain();
    wet.gain.value = 0.6;
    const conv = c.createConvolver();
    const len = Math.floor(c.sampleRate * 3.2);
    const buf = c.createBuffer(2, len, c.sampleRate);
    for (let ch = 0; ch < 2; ch++) {
      const d = buf.getChannelData(ch);
      for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.6);
    }
    conv.buffer = buf;
    bus.connect(dry).connect(g);
    bus.connect(conv).connect(wet).connect(g);
    g.connect(comp).connect(c.destination);
    const pad = c.createBiquadFilter();
    pad.type = "lowpass";
    pad.frequency.value = 1200;
    pad.connect(bus);
    ctx.current = c;
    master.current = g;
    nodes.current = { pad, bus };
    sched.current = { chordAt: c.currentTime + 0.1, chord: 0, noteAt: c.currentTime + 2.5 };
  };

  const toggle = () => {
    if (!on) {
      if (!ctx.current) start();
      else void ctx.current.resume();
      master.current?.gain.cancelScheduledValues(0);
      master.current?.gain.linearRampToValueAtTime(0.7, (ctx.current?.currentTime ?? 0) + 2);
      clearInterval(timer.current);
      tick();
      timer.current = setInterval(tick, 250);
      setOn(true);
    } else {
      master.current?.gain.cancelScheduledValues(0);
      master.current?.gain.linearRampToValueAtTime(0, (ctx.current?.currentTime ?? 0) + 0.8);
      setTimeout(() => {
        clearInterval(timer.current);
        void ctx.current?.suspend();
      }, 900);
      setOn(false);
    }
  };

  useEffect(() => () => { clearInterval(timer.current); }, []);
  useEffect(() => () => void ctx.current?.close(), []);

  return (
    <motion.button
      className={`jc-sound jc-glass ${on ? "on" : ""}`}
      onClick={toggle}
      aria-label={on ? "Mute ambient sound" : "Play ambient sound"}
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: "spring", stiffness: 220, damping: 14, delay: 2.2 }}
    >
      {on ? (
        <span className="jc-eqbars"><i /><i /><i /><i /></span>
      ) : (
        <VolumeXIcon size={20} />
      )}
    </motion.button>
  );
}

