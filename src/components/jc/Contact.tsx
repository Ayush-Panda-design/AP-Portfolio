import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { Magnetic, scrollToY } from "./lib";

const EMAIL = "pandaayush25305@gmail.com";
const LINKS = [
  { k: "M", label: "Email", href: `mailto:${EMAIL}`, c: "#EF4B3F", c2: "#B42318", cap: "Say hi. I reply fast." },
  { k: "G", label: "GitHub", href: "https://github.com/Ayush-Panda-design", c: "#3A3F4B", c2: "#171A21", cap: "Where I build in public." },
  { k: "L", label: "LinkedIn", href: "https://www.linkedin.com/in/ayush-panda-a04280215/", c: "#2F7BEA", c2: "#1B4FA8", cap: "Let's connect." },
  { k: "X", label: "X / Twitter", href: "https://x.com/AyushPanda85699", c: "#6B46E5", c2: "#43279F", cap: "Thoughts & updates." },
  { k: "H", label: "Hashnode", href: "https://hashnode.com/@Ayush-Panda", c: "#2A5BFF", c2: "#1738B3", cap: "Things I write." },
  { k: "R", label: "Resume", href: "/resume/Ayush_Panda_Resume.pdf", c: "#FFD23F", c2: "#C99A12", cap: "Hire me. Grab my resume.", dark: true },
];
const AVATARS = ["#FFD23F", "#FF6B4A", "#9FD3FF", "#B7A2FF", "#4F9E4A"];

export function Contact() {
  const [toast, setToast] = useState("");
  const [modal, setModal] = useState(false);
  const [name, setName] = useState("");
  const [msg, setMsg] = useState("");
  const [av, setAv] = useState(0);

  const stars = useMemo(() => Array.from({ length: 46 }, (_, i) => ({ x: (i * 53.7) % 100, y: (i * 29.3) % 80, s: 1 + (i % 3), d: (i % 7) * 0.5 })), []);

  const flash = (t: string) => {
    setToast(t);
    setTimeout(() => setToast(""), 2200);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement;
      if (el.closest("input,textarea") || e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === "Escape") setModal(false);
      const l = LINKS.find((x) => x.k.toLowerCase() === e.key.toLowerCase());
      if (l) window.open(l.href, l.href.startsWith("mailto") ? "_self" : "_blank");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const copy = async () => {
    await navigator.clipboard.writeText(EMAIL).catch(() => {});
    flash("Email copied ✓");
  };

  const pin = () => {
    if (!msg.trim()) return;
    const body = `${msg.trim()}\n\n— ${name.trim() || "a visitor"}`;
    window.location.href = `mailto:${EMAIL}?subject=${encodeURIComponent("A note from your portfolio")}&body=${encodeURIComponent(body)}`;
    setModal(false);
    setMsg("");
    flash("Opening your mail app…");
  };

  return (
    <footer id="contact" data-scene="forth" className="jc-sec jc-contact ct2">
      <div className="ct2-sky" aria-hidden>
        {stars.map((st, i) => <i key={i} className="ct-star" style={{ left: `${st.x}%`, top: `${st.y}%`, width: st.s, height: st.s, animationDelay: `${st.d}s` }} />)}
        <i className="ct2-cloud c1" /><i className="ct2-cloud c2" /><i className="ct2-cloud c3" />
      </div>
      <div className="ct2-in">
        <motion.h2 className="ct2-h" initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-80px" }} transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}>
          Let&apos;s make<br />something<br />nobody<br /><span className="ct2-hl"><span>rage quits.</span></span>
        </motion.h2>
        <p className="ct2-sub">Open to SDE internships, freelance work &amp; full-time roles. <b>I reply fast.</b></p>
        <div className="ct2-acts">
          <Magnetic><button className="ct2-btn sun" onClick={() => setModal(true)}>Leave a note</button></Magnetic>
          <Magnetic><button className="ct2-btn" onClick={copy}>Copy email</button></Magnetic>
        </div>

        <div className="ct2-panel">
          <p className="ct2-hint">psst, these work on your keyboard too: {LINKS.map((l) => <kbd key={l.k}>{l.k}</kbd>)}</p>
          <div className="ct2-tiles">
            {LINKS.map((l) => (
              <a key={l.k} className="ct2-tile" href={l.href} target={l.href.startsWith("mailto") ? undefined : "_blank"} rel="noreferrer" style={{ "--c": l.c, "--c2": l.c2, "--fg": l.dark ? "#1a1a1a" : "#fff" } as React.CSSProperties}>
                <span className="ct2-cap">{l.cap}<i>↓</i></span>
                <span className="ct2-key"><small>{l.k}</small><b>{l.label}</b></span>
              </a>
            ))}
          </div>
        </div>
        <p className="ct-copy">
          © {new Date().getFullYear()} Ayush Panda · <button className="ct2-top" onClick={() => scrollToY(0)}>Back to top ↑</button>
        </p>
      </div>

      <AnimatePresence>
        {modal && (
          <motion.div className="jc-modal" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setModal(false)}>
            <motion.div
              className="jc-sheet"
              style={{ textAlign: "left" }}
              initial={{ y: 40, scale: 0.92, rotate: -2 }}
              animate={{ y: 0, scale: 1, rotate: 0 }}
              exit={{ y: 30, opacity: 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-label="Leave a note"
            >
              <h3>Write a note</h3>
              <p style={{ color: "var(--ink2)", margin: 0, fontSize: 14 }}>Say hi, share feedback, or tell me what you&apos;re building.</p>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 14 }}>
                <button
                  onClick={() => setAv((a) => (a + 1) % AVATARS.length)}
                  aria-label="Shuffle avatar"
                  style={{ width: 52, height: 52, borderRadius: "50%", background: AVATARS[av], display: "grid", placeItems: "center", fontWeight: 900, color: "#13233A", transition: "transform .4s var(--spring)" }}
                >
                  {(name[0] || "?").toUpperCase()}
                </button>
                <span style={{ fontSize: 12, color: "var(--ink2)" }}>tap to shuffle</span>
              </div>
              <input className="jc-field" placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} maxLength={40} />
              <textarea className="jc-field" placeholder="Your note…" value={msg} onChange={(e) => setMsg(e.target.value.slice(0, 200))} />
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 12 }}>
                <span style={{ fontSize: 12, color: "var(--ink2)" }}>{msg.length}/200</span>
                <div style={{ display: "flex", gap: 8 }}>
                  <button className="jc-pill" style={{ border: "1px solid var(--line)" }} onClick={() => setModal(false)}>Cancel</button>
                  <button className="jc-btn sun" onClick={pin} disabled={!msg.trim()} style={{ opacity: msg.trim() ? 1 : 0.5 }}>Send it ↗</button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>{toast && <motion.div className="jc-toast" initial={{ y: -30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -30, opacity: 0 }}>{toast}</motion.div>}</AnimatePresence>
    </footer>
  );
}
