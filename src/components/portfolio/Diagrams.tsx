import { motion } from "framer-motion";

export function DnsDiagram() {
  const nodes = [
    { label: "Browser", x: 50, y: 12 },
    { label: "Resolver", x: 50, y: 32 },
    { label: "Root", x: 18, y: 55 },
    { label: "TLD", x: 50, y: 55 },
    { label: "Auth", x: 82, y: 55 },
    { label: "IP", x: 50, y: 82 },
  ];

  return (
    <div className="relative h-48 w-full overflow-hidden rounded-xl border border-border-line bg-bg/60 p-3">
      <svg viewBox="0 0 100 100" className="h-full w-full">
        <defs>
          <linearGradient id="dnsLine" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#5eead4" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#99f6e4" stopOpacity="0.4" />
          </linearGradient>
        </defs>
        {[
          [50, 18, 50, 28],
          [50, 38, 18, 50],
          [50, 38, 50, 50],
          [50, 38, 82, 50],
          [18, 60, 50, 76],
          [50, 60, 50, 76],
          [82, 60, 50, 76],
        ].map(([x1, y1, x2, y2], i) => (
          <motion.line
            key={i}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke="url(#dnsLine)"
            strokeWidth="0.4"
            initial={{ pathLength: 0, opacity: 0 }}
            whileInView={{ pathLength: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: i * 0.08 }}
          />
        ))}
        {nodes.map((n, i) => (
          <g key={n.label}>
            <motion.circle
              cx={n.x}
              cy={n.y}
              r="5"
              fill="#1a1a1a"
              stroke="#5eead4"
              strokeWidth="0.5"
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 + i * 0.08, type: "spring" }}
            />
            <text
              x={n.x}
              y={n.y + 0.8}
              textAnchor="middle"
              fill="#a39e98"
              fontSize="3.2"
              fontFamily="JetBrains Mono, monospace"
            >
              {n.label}
            </text>
          </g>
        ))}
      </svg>
      <div className="absolute bottom-2 left-3 font-mono text-[10px] uppercase tracking-[0.16em] text-accent">
        DNS resolution path
      </div>
    </div>
  );
}

export function TcpHandshakeDiagram() {
  const steps = [
    { from: "Client", to: "Server", label: "SYN" },
    { from: "Server", to: "Client", label: "SYN-ACK" },
    { from: "Client", to: "Server", label: "ACK" },
  ];

  return (
    <div className="rounded-xl border border-border-line bg-bg/60 p-4">
      <div className="mb-4 flex justify-between font-mono text-[11px] text-ink-soft">
        <span className="rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-accent">Client</span>
        <span className="rounded-full border border-ink-faint/40 bg-surface px-3 py-1 text-ink-soft">Server</span>
      </div>
      <div className="space-y-3">
        {steps.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, x: s.from === "Client" ? -20 : 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.15 }}
            className="flex items-center gap-3"
          >
            <div className={`h-px flex-1 ${s.from === "Client" ? "bg-gradient-to-r from-accent to-accent/40" : "bg-gradient-to-l from-accent to-accent/40"}`} />
            <span className="rounded-md border border-border-line bg-surface px-2 py-1 font-mono text-[10px] text-ink">
              {s.label}
            </span>
            <div className={`h-px flex-1 ${s.from === "Client" ? "bg-gradient-to-r from-accent/40 to-transparent" : "bg-gradient-to-l from-accent/40 to-transparent"}`} />
          </motion.div>
        ))}
      </div>
      <div className="mt-4 font-mono text-[10px] uppercase tracking-[0.16em] text-ink-faint">
        TCP three-way handshake
      </div>
    </div>
  );
}

export function ClientServerDiagram() {
  return (
    <div className="rounded-xl border border-border-line bg-bg/60 p-4">
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="rounded-xl border border-accent/30 bg-accent/5 p-4 text-center"
        >
          <div className="font-display text-lg font-bold text-ink">Client</div>
          <div className="mt-1 font-mono text-[10px] text-ink-faint">Browser · App</div>
        </motion.div>
        <div className="flex flex-col items-center gap-1">
          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            className="h-0.5 w-10 origin-left bg-gradient-to-r from-accent to-accent/50"
          />
          <span className="font-mono text-[9px] text-accent">HTTP</span>
          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            className="h-0.5 w-10 origin-right bg-gradient-to-l from-accent to-accent/50"
          />
        </div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="rounded-xl border border-border-line bg-surface/60 p-4 text-center"
        >
          <div className="font-display text-lg font-bold text-ink">Server</div>
          <div className="mt-1 font-mono text-[10px] text-ink-faint">API · Host</div>
        </motion.div>
      </div>
      <div className="mt-4 font-mono text-[10px] uppercase tracking-[0.16em] text-ink-faint">
        Request → Response cycle
      </div>
    </div>
  );
}

export function StackLayersDiagram() {
  const layers = [
    { label: "React / Next.js", color: "from-accent/30 to-accent/5" },
    { label: "Node.js / Express / tRPC", color: "from-accent/20 to-accent/5" },
    { label: "PostgreSQL · Redis · MongoDB", color: "from-ink-faint/30 to-ink-faint/5" },
    { label: "Docker · CI/CD · Cloud", color: "from-ink-soft/20 to-ink-soft/5" },
  ];

  return (
    <div className="space-y-2">
      {layers.map((l, i) => (
        <motion.div
          key={l.label}
          initial={{ opacity: 0, x: -24 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.04, duration: 0.2 }}
          className={`rounded-xl border border-border-line bg-gradient-to-r ${l.color} px-4 py-3 font-mono text-[12px] text-ink`}
        >
          {l.label}
        </motion.div>
      ))}
    </div>
  );
}
