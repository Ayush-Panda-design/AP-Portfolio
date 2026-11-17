import { motion, useScroll, useTransform, type MotionValue } from "framer-motion";
import { useRef } from "react";
import { Counter, Reveal, SecHead } from "./lib";
import { setHot } from "./bus";
import { TOTAL_PROJECTS } from "@/data/projects";

const WORDS = ["React", "Next.js", "TypeScript", "Node.js", "PostgreSQL", "tRPC", "Prisma", "Docker", "Redis", "Kafka", "Socket.io", "Tailwind"];
const LEAD = "Started with CSS landing pages. Kept going until I was building products with auth, realtime, background jobs and AI, and putting them".split(" ");

function Word({ w, i, n, p, em }: { w: string; i: number; n: number; p: MotionValue<number>; em?: boolean }) {
  const a = (i / n) * 0.8;
  const o = useTransform(p, [a, a + 0.14], [0.18, 1]);
  const y = useTransform(p, [a, a + 0.14], [8, 0]);
  return (
    <motion.span style={{ opacity: o, y, display: "inline-block", whiteSpace: "pre" }}>
      {em ? <em>{w}</em> : w}
      {" "}
    </motion.span>
  );
}

/** Each word lights up as you scroll past it. */
function ScrollWords() {
  const ref = useRef<HTMLParagraphElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 88%", "end 52%"] });
  const all = [...LEAD, "live."];
  return (
    <p className="jc-big" ref={ref}>
      {all.map((w, i) => <Word key={i} w={w} i={i} n={all.length} p={scrollYProgress} em={i === all.length - 1} />)}
    </p>
  );
}

export function Story() {
  return (
    <section id="about" data-scene="dean" className="jc-sec jc-center jc-story">
      <div className="jc-wrap">
        <SecHead label="How I got here" title="A CS student who learns by shipping." variant="ink" />
        <motion.div className="st-open" initial={{ opacity: 0, scale: 0.8 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ type: "spring", stiffness: 200, damping: 14, delay: 0.2 }}>
          <i /> Available right now
        </motion.div>
        <ScrollWords />
        <div className="jc-stats">
          {[
            { v: <Counter to={5} suffix="th" />, l: "semester, B.Tech CSE at VSSUT" },
            { v: "Freelance", l: "work, alongside college" },
            { v: <Counter to={TOTAL_PROJECTS} suffix="+" />, l: "projects built, 4 in production" },
            { v: "Open", l: "to internships and collabs" },
          ].map((s, i) => (
            <motion.div
              key={i}
              className="jc-stat st-card"
              initial={{ opacity: 0, y: 60, rotate: i % 2 ? 4 : -4, scale: 0.88 }}
              whileInView={{ opacity: 1, y: 0, rotate: 0, scale: 1 }}
              whileHover={{ y: -8, rotate: i % 2 ? 1.5 : -1.5 }}
              whileTap={{ scale: 0.96 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ type: "spring", stiffness: 150, damping: 14, delay: i * 0.1 }}
              onMouseEnter={() => setHot(`dw${i}`, true)}
              onMouseLeave={() => setHot(`dw${i}`, false)}
            >
              <b>{s.v}</b>
              <span>{s.l}</span>
              <motion.i className="st-bar" initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: true }} transition={{ duration: 0.9, delay: 0.5 + i * 0.1, ease: [0.22, 1, 0.36, 1] }} />
            </motion.div>
          ))}
        </div>
      </div>
      <Reveal delay={0.1} y={20}>
        <div className="jc-marq" aria-hidden>
          <div>{[...WORDS, ...WORDS].map((w, i) => <span key={i}>{w}</span>)}</div>
        </div>
        <div className="jc-marq rev" aria-hidden>
          <div>{[...WORDS].reverse().concat([...WORDS].reverse()).map((w, i) => <span key={i}>{w}</span>)}</div>
        </div>
      </Reveal>
    </section>
  );
}
