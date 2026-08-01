import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import {
  ArrowUpRightIcon as ArrowUpRight,
  ExternalLinkIcon as ExternalLink,
  BookOpenIcon as BookOpen,
  FlaskConicalIcon as Flask,
} from "lucide-react";
import { Github } from "./icons";
import { SectionLabel } from "./SectionLabel";
import { TextGenerate } from "./effects/TextGenerate";
import { LEARNING_TOPICS, LEARNING_COUNT } from "@/data/projects";
import { cn } from "@/lib/utils";

export function LearningPath() {
  const [active, setActive] = useState(LEARNING_TOPICS[0].id);
  const topic = LEARNING_TOPICS.find((t) => t.id === active) ?? LEARNING_TOPICS[0];

  return (
    <section id="learning" className="scroll-mt-24 border-t border-border-line pt-14 lg:pt-16">
      <div className="mb-2 flex items-center gap-2">
        <Flask size={14} className="text-accent" />
        <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-accent">
          Built while learning
        </span>
      </div>
      <SectionLabel num="06.">Practice trail</SectionLabel>
      <h2 className="font-display text-2xl font-bold leading-snug tracking-tight text-ink sm:text-3xl">
        <TextGenerate words="Concepts first — then a project for each." />
      </h2>
      <p className="mt-3 text-[14px] leading-relaxed text-ink-soft">
        {LEARNING_COUNT} smaller builds made <span className="text-ink">during</span> learning — not only after.
        Pick a topic to see the practice projects and stack.
      </p>

      {/* Topic grid — wraps fully, no horizontal clip */}
      <div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-3">
        {LEARNING_TOPICS.map((t) => {
          const on = t.id === active;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setActive(t.id)}
              className={cn(
                "min-w-0 rounded-xl border px-3 py-2.5 text-left transition-all",
                on
                  ? "border-accent/40 bg-accent/10 text-accent shadow-[0_0_20px_-10px_var(--color-accent-glow)]"
                  : "border-border-line bg-surface/30 text-ink-faint hover:border-accent/25 hover:text-ink",
              )}
            >
              <div className="font-mono text-[10px] font-medium leading-snug tracking-wide sm:text-[11px]">
                {t.label}
              </div>
              <div className="mt-1 font-mono text-[10px] opacity-70">
                {t.projects.length} project{t.projects.length === 1 ? "" : "s"}
              </div>
            </button>
          );
        })}
      </div>

      <AnimatePresence initial={false}>
        <motion.div
          key={topic.id}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.15 }}
          className="mt-5 rounded-2xl border border-border-line bg-surface/50 p-4 sm:p-5"
        >
          <div className="mb-4 flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-accent/25 bg-accent/10 text-accent">
              <BookOpen size={16} />
            </div>
            <div>
              <h3 className="font-display text-lg font-bold text-ink">{topic.label}</h3>
              <p className="mt-1 text-[13px] leading-relaxed text-ink-soft">{topic.concept}</p>
            </div>
          </div>

          <div className="space-y-3">
            {topic.projects.map((p, i) => (
              <motion.article
                key={p.id}
                initial={{ opacity: 0, x: -4 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.02, duration: 0.15 }}
                className="rounded-xl border border-border-line/80 bg-bg/60 p-4 transition-colors hover:border-accent/30"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h4 className="font-display text-base font-semibold text-ink">{p.title}</h4>
                    <p className="mt-1 text-[13px] leading-relaxed text-ink-soft">{p.blurb}</p>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {p.stack.map((s) => (
                        <span
                          key={s}
                          className="rounded-full bg-accent/10 px-2 py-0.5 font-mono text-[10px] text-accent/90"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <a
                    href={p.github}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-full border border-border-line px-3 py-1.5 text-[11px] font-medium text-ink-soft hover:border-accent/40 hover:text-accent"
                  >
                    <Github size={12} /> Code <ArrowUpRight size={11} />
                  </a>
                  {p.live && (
                    <a
                      href={p.live}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-full border border-accent/25 bg-accent/10 px-3 py-1.5 text-[11px] font-medium text-accent hover:bg-accent/15"
                    >
                      <ExternalLink size={11} /> Demo
                    </a>
                  )}
                </div>
              </motion.article>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>
    </section>
  );
}
