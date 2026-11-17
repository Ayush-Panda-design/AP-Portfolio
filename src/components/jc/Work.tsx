import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Link } from "@tanstack/react-router";
import { XIcon } from "lucide-react";
import { PRODUCTION, type ProductionProject } from "@/data/projects";
import { Stage } from "./Stage";
import { MobileTrack } from "./MobileTrack";

const ACCENT: Record<string, string> = { violet: "#a78bfa", amber: "#ffb534", teal: "#3fd9c0", pink: "#ff6b8f" };

export function Work() {
  const [pick, setPick] = useState<ProductionProject | null>(null);
  const [shot, setShot] = useState(0);

  useEffect(() => {
    setShot(0);
  }, [pick]);
  // the popup lives under .jc (not inside this section) so it sits above the fixed UI and keeps the theme vars
  // decode every screenshot up front so cards never pop in half-painted
  useEffect(() => {
    PRODUCTION.forEach((p) => p.screenshots.forEach((s) => {
      if (!s.src) return;
      const im = new Image();
      im.decoding = "async";
      im.src = s.src;
      im.decode?.().catch(() => {});
    }));
  }, []);
  const [host, setHost] = useState<HTMLElement | null>(null);
  useEffect(() => {
    setHost(document.querySelector<HTMLElement>(".jc") ?? document.body);
  }, []);
  useEffect(() => {
    if (!pick) return;
    window.__lenis?.stop();
    return () => window.__lenis?.start();
  }, [pick]);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setPick(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const acc = pick ? ACCENT[pick.accent] ?? "#ffb534" : "#ffb534";

  return (
    <section id="work" data-scene="victoria" className="jc-sec jc-stagesec">
      <Stage
        label="Selected work"
        title="Things I shipped."
        variant="neon"
        kind="card"
        hot="w"
        theme="charcoal"
        items={PRODUCTION.map((p) => ({
          id: p.id, num: p.num, title: p.title, tag: p.tag, img: p.screenshots[0]?.src, accent: ACCENT[p.accent] ?? "#ffb534", url: p.live,
        }))}
        onOpen={(it) => setPick(PRODUCTION.find((p) => p.id === it.id) ?? null)}
      />

      <div className="wk-m">
        <MobileTrack
          label="Selected work"
          title="Things I shipped."
          hint="Keep scrolling · tap a card to open it"
          vh={70}
          throwImages={PRODUCTION.map((p) => p.screenshots[0]?.src)}
          items={PRODUCTION.map((p) => ({
            key: p.id,
            accent: ACCENT[p.accent] ?? "#ffb534",
            label: p.title,
            node: (
              <button className="wk-m-card" onClick={() => setPick(p)}>
                {p.screenshots[0]?.src && <img src={p.screenshots[0].src} alt="" decoding="async" draggable={false} />}
                <span className="wk-m-t"><small>{p.num} · {p.tag}</small><b>{p.title}</b></span>
                <i aria-hidden>↗</i>
              </button>
            ),
          }))}
        />
      </div>

      {host && createPortal(
      <AnimatePresence>
        {pick && (
          <motion.div className="jc-pop-ov" data-lenis-prevent initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setPick(null)}>
            <motion.div
              className="jc-pop"
              style={{ ["--a" as string]: acc }}
              initial={{ y: 40, scale: 0.94, opacity: 0 }}
              animate={{ y: 0, scale: 1, opacity: 1 }}
              exit={{ y: 24, scale: 0.97, opacity: 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 26 }}
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-label={pick.title}
            >
              <button className="x" onClick={() => setPick(null)} aria-label="Close"><XIcon size={18} /></button>
              <div className="media">
                <div className="frame">
                  <AnimatePresence mode="wait">
                    <motion.img key={shot} src={pick.screenshots[shot]?.src} alt={pick.screenshots[shot]?.alt} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} />
                  </AnimatePresence>
                </div>
                {pick.screenshots.length > 1 && (
                  <div className="thumbs">
                    {pick.screenshots.map((s, i) => (
                      <button key={s.src} className={i === shot ? "on" : ""} onClick={() => setShot(i)} aria-label={s.label}>
                        <img src={s.src} alt="" />
                        <span>{s.label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="info">
                <small>{pick.num} · {pick.tag}</small>
                <h3>{pick.title}</h3>
                <p>{pick.summary}</p>
                <ul>{pick.features.map((f) => <li key={f}>{f}</li>)}</ul>
                <div className="chips">{pick.stack.map((t) => <span key={t}>{t}</span>)}</div>
                <div className="acts">
                  <Link to="/projects/$projectId" params={{ projectId: pick.id }}>Case study →</Link>
                  {pick.live && <a href={pick.live} target="_blank" rel="noreferrer">Live ↗</a>}
                  <a href={pick.github} target="_blank" rel="noreferrer">GitHub ↗</a>
                </div>
              </div>
            </motion.div>
            <button className="jc-pop-x" onClick={(e) => { e.stopPropagation(); setPick(null); }} aria-label="Close"><XIcon size={20} /></button>
          </motion.div>
        )}
      </AnimatePresence>,
      host,
      )}
    </section>
  );
}
