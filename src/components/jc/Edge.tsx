import { motion } from "framer-motion";
import { useMemo } from "react";

/** Small seeded random, so the torn edge is the same on every render. */
function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

/** A hand-torn edge between two sections: the lower tone bites into the upper one with a soft shadow along the rip. */
export function Edge({ from, to, seed = 1, dot = false }: { from: string; to: string; seed?: number; dot?: boolean }) {
  const d = useMemo(() => {
    const r = rng(seed * 7919);
    const W = 1440, H = 64;
    let x = 0;
    let y = 24;
    const pts: string[] = [`M0 ${H}`, `L0 ${y.toFixed(1)}`];
    while (x < W) {
      x += 4 + r() * 14;
      const wave = Math.sin(x / 130 + seed) * 7 + Math.sin(x / 41 + seed * 2) * 3;
      y = 26 + wave + (r() - 0.5) * 11;
      pts.push(`L${Math.min(x, W).toFixed(1)} ${y.toFixed(1)}`);
    }
    pts.push(`L${W} ${H}`, "Z");
    return pts.join(" ");
  }, [seed]);

  return (
    <div className="jc-edge" aria-hidden style={{ background: from }}>
      <motion.svg
        viewBox="0 0 1440 64"
        preserveAspectRatio="xMidYMid slice"
        initial={{ clipPath: "inset(0 100% 0 0)" }}
        whileInView={{ clipPath: "inset(0 0% 0 0)" }}
        viewport={{ once: true, margin: "0px 0px -10% 0px" }}
        transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
      >
        <path d={d} fill={to} />
      </motion.svg>
      {dot && (
        <motion.i
          className="jc-edge-dot"
          initial={{ scale: 0, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ type: "spring", stiffness: 260, damping: 12, delay: 0.7 }}
        />
      )}
    </div>
  );
}
