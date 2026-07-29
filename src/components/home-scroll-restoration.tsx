"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

import { scheduleScrollToHash } from "@/lib/smooth-hash";

const SCROLL_Y_KEY = "ai-my-home:home-scroll-y";
const RESTORE_KEY = "ai-my-home:home-scroll-restore";

export function persistHomeScrollY() {
  if (typeof window === "undefined") return;
  if (window.location.pathname !== "/") return;
  sessionStorage.setItem(SCROLL_Y_KEY, String(Math.max(0, window.scrollY)));
}

export function markHomeScrollRestore() {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(RESTORE_KEY, "1");
}

export function clearHomeScrollRestore() {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(RESTORE_KEY);
}

function consumeHomeScrollRestore() {
  const pending = sessionStorage.getItem(RESTORE_KEY) === "1";
  sessionStorage.removeItem(RESTORE_KEY);
  return pending;
}

function readSavedScrollY() {
  return Number(sessionStorage.getItem(SCROLL_Y_KEY) || "0");
}

function isBackForwardNavigation() {
  const entry = performance.getEntriesByType("navigation")[0] as
    | PerformanceNavigationTiming
    | undefined;
  return entry?.type === "back_forward";
}

/**
 * Lives in the site chrome so popstate is heard while on nested pages.
 * Marks restore only when Back lands on `/`; clears stale marks otherwise.
 */
export function HomeScrollRestoreListener() {
  const pathname = usePathname();
  const prevPathRef = useRef(pathname);

  useEffect(() => {
    const onPopState = () => {
      if (window.location.pathname === "/") {
        markHomeScrollRestore();
      } else {
        clearHomeScrollRestore();
      }
    };
    const onPageHide = () => {
      persistHomeScrollY();
    };

    window.addEventListener("popstate", onPopState);
    window.addEventListener("pagehide", onPageHide);
    return () => {
      window.removeEventListener("popstate", onPopState);
      window.removeEventListener("pagehide", onPageHide);
    };
  }, []);

  useEffect(() => {
    const prev = prevPathRef.current;
    prevPathRef.current = pathname;

    // Soft-nav away from a detail page to another non-home route abandons restore.
    if (pathname !== "/" && prev !== "/" && prev !== pathname) {
      clearHomeScrollRestore();
    }
  }, [pathname]);

  return null;
}

/** Call before leaving the homepage for a detail page that should restore scroll. */
export function rememberHomeScrollForReturn() {
  persistHomeScrollY();
  markHomeScrollRestore();
}

/** Homepage-only: restore prior scroll on back, otherwise stay at top. */
export function HomeScrollRestoration() {
  useEffect(() => {
    const { hash } = window.location;

    if (hash) {
      clearHomeScrollRestore();
      scheduleScrollToHash(hash, "smooth");
      return;
    }

    const previous = history.scrollRestoration;
    history.scrollRestoration = "manual";

    const timeouts: number[] = [];
    let restored = false;

    const restoreToSaved = () => {
      const savedY = readSavedScrollY();
      if (savedY <= 0) {
        return false;
      }
      window.scrollTo({ top: savedY, left: 0, behavior: "auto" });
      return true;
    };

    const decide = () => {
      const shouldRestore =
        consumeHomeScrollRestore() || isBackForwardNavigation();

      if (shouldRestore && restoreToSaved()) {
        restored = true;
        timeouts.push(window.setTimeout(restoreToSaved, 80));
        timeouts.push(window.setTimeout(restoreToSaved, 240));
        timeouts.push(window.setTimeout(restoreToSaved, 480));
        return;
      }

      if (!restored) {
        window.scrollTo(0, 0);
      }
    };

    // Allow popstate to mark restore before forcing the page to the top.
    timeouts.push(window.setTimeout(decide, 0));
    timeouts.push(
      window.setTimeout(() => {
        if (restored) return;
        if (consumeHomeScrollRestore() && restoreToSaved()) {
          restored = true;
          timeouts.push(window.setTimeout(restoreToSaved, 80));
          timeouts.push(window.setTimeout(restoreToSaved, 240));
        }
      }, 48),
    );

    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        persistHomeScrollY();
        ticking = false;
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      persistHomeScrollY();
      window.removeEventListener("scroll", onScroll);
      timeouts.forEach((id) => window.clearTimeout(id));
      history.scrollRestoration = previous;
    };
  }, []);

  return null;
}
