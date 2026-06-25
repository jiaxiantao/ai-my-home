"use client";

import { useEffect } from "react";

/** Keep the homepage at the top unless the URL already targets a section. */
export function HomeScrollRestoration() {
  useEffect(() => {
    if (window.location.hash) return;

    const previous = history.scrollRestoration;
    history.scrollRestoration = "manual";
    window.scrollTo(0, 0);

    return () => {
      history.scrollRestoration = previous;
    };
  }, []);

  return null;
}
