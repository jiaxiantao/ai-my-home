export function parseHashHref(href: string) {
  try {
    const url = new URL(href, "http://local.invalid");
    return {
      pathname: url.pathname || "/",
      hash: url.hash,
    };
  } catch {
    if (href.startsWith("#")) {
      return { pathname: "/", hash: href };
    }
    return { pathname: href, hash: "" };
  }
}

export function isSamePageHashLink(href: string, pathname: string) {
  const target = parseHashHref(href);
  if (!target.hash) {
    return false;
  }
  return target.pathname === pathname;
}

export function scrollToHash(hash: string, behavior: ScrollBehavior = "smooth") {
  const id = hash.replace(/^#/, "");
  if (!id) {
    return false;
  }

  const element = document.getElementById(id);
  if (!element) {
    return false;
  }

  element.scrollIntoView({ behavior, block: "start" });
  return true;
}

/** Same-page hash jump with history update. Returns true if handled. */
export function applySamePageHashNavigation(href: string, pathname: string) {
  if (typeof window === "undefined") {
    return false;
  }
  if (!isSamePageHashLink(href, pathname)) {
    return false;
  }

  const { hash } = parseHashHref(href);
  if (!hash) {
    return false;
  }

  window.history.pushState(null, "", hash);
  scrollToHash(hash, "smooth");
  return true;
}

export function scheduleScrollToHash(
  hash: string,
  behavior: ScrollBehavior = "smooth",
  attempts = 12,
) {
  if (!hash) {
    return;
  }

  let remaining = attempts;

  const tryScroll = () => {
    if (scrollToHash(hash, behavior) || remaining <= 0) {
      return;
    }
    remaining -= 1;
    window.requestAnimationFrame(tryScroll);
  };

  window.requestAnimationFrame(tryScroll);
}
