import { useEffect, useState } from "react";

// Returns `true` after the browser is idle (or next tick fallback).
// Useful to defer below-the-fold rendering and heavy computations.
export default function useDeferredRender(options = {}) {
  const { timeout = 800, enabled = true, deps = [] } = options;

  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!enabled) {
      setReady(true);
      return;
    }

    setReady(false);

    let cancelled = false;

    const schedule = (cb) => {
      if (typeof window === "undefined") return setTimeout(cb, 0);
      if ("requestIdleCallback" in window) {
        return window.requestIdleCallback(cb, { timeout });
      }
      return setTimeout(cb, 0);
    };

    const handle = schedule(() => {
      if (!cancelled) setReady(true);
    });

    return () => {
      cancelled = true;
      if (typeof window !== "undefined" && "cancelIdleCallback" in window) {
        window.cancelIdleCallback(handle);
      } else {
        clearTimeout(handle);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, timeout, ...deps]);

  return ready;
}
