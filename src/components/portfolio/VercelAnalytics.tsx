import { useEffect } from "react";

/**
 * Vercel Web Analytics, loaded without an npm package. Counts visitors and page views
 * (no cookies, no sign-in). Only runs on the deployed site, so local dev stays quiet.
 * Turn it on once in Vercel: project, Analytics tab, Enable.
 */
export function VercelAnalytics() {
  useEffect(() => {
    if (import.meta.env.DEV || document.getElementById("vercel-analytics")) return;
    const w = window as unknown as { va?: (...a: unknown[]) => void; vaq?: unknown[] };
    w.va =
      w.va ||
      function (...a: unknown[]) {
        (w.vaq = w.vaq || []).push(a);
      };
    const s = document.createElement("script");
    s.id = "vercel-analytics";
    s.defer = true;
    s.src = "/_vercel/insights/script.js";
    document.head.appendChild(s);
  }, []);
  return null;
}
