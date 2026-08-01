import type { MouseEvent } from "react";

let scrollRaf = 0;

function prefersReducedMotion() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function navOffset() {
  return window.matchMedia("(min-width: 1024px)").matches ? 0 : 72;
}

/** Short eased scroll (~200ms). Cancels any in-flight scroll on new clicks. */
export function scrollToSection(
  id: string,
  opts?: { duration?: number; updateHash?: boolean; instant?: boolean },
) {
  const el = document.getElementById(id);
  if (!el) return;

  const updateHash = opts?.updateHash ?? true;
  const reduce = prefersReducedMotion();
  const duration = opts?.instant || reduce ? 0 : (opts?.duration ?? 200);
  const top = el.getBoundingClientRect().top + window.scrollY - navOffset();

  if (updateHash) {
    history.replaceState(null, "", `#${id}`);
  }

  cancelAnimationFrame(scrollRaf);

  if (duration <= 0) {
    window.scrollTo(0, Math.max(0, top));
    return;
  }

  const start = window.scrollY;
  const dist = top - start;
  const t0 = performance.now();

  const tick = (now: number) => {
    const t = Math.min(1, (now - t0) / duration);
    const eased = 1 - (1 - t) ** 3;
    window.scrollTo(0, start + dist * eased);
    if (t < 1) scrollRaf = requestAnimationFrame(tick);
  };

  scrollRaf = requestAnimationFrame(tick);
}

export function scrollToTop(opts?: { duration?: number; clearHash?: boolean }) {
  const reduce = prefersReducedMotion();
  const duration = reduce ? 0 : (opts?.duration ?? 180);
  if (opts?.clearHash !== false) {
    history.replaceState(null, "", window.location.pathname + window.location.search);
  }

  cancelAnimationFrame(scrollRaf);

  if (duration <= 0) {
    window.scrollTo(0, 0);
    return;
  }

  const start = window.scrollY;
  const t0 = performance.now();

  const tick = (now: number) => {
    const t = Math.min(1, (now - t0) / duration);
    const eased = 1 - (1 - t) ** 3;
    window.scrollTo(0, start * (1 - eased));
    if (t < 1) scrollRaf = requestAnimationFrame(tick);
  };

  scrollRaf = requestAnimationFrame(tick);
}

export function onSectionNavClick(e: MouseEvent<HTMLAnchorElement>, id: string) {
  e.preventDefault();
  scrollToSection(id);
}
