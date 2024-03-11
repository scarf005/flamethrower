/** @typedef {import("./interfaces.d.ts").RouteChangeData} RouteChangeData */

/**
 * @type {(type: string, id?: string) => void}
 * scroll to position on next page
 */
export function scrollTo(type, id) {
  if (['link', 'go'].includes(type)) {
    if (id) {
      const el = document.querySelector(id);
      el ? el.scrollIntoView({ behavior: 'smooth', block: 'start' }) : globalThis.scrollTo({ top: 0 });
    } else {
      globalThis.scrollTo({ top: 0 });
    }
  }
}
/**
 * @type {(url?: string) => string}
 * standard formatting for urls
 * url == https://example.com/foo/bar
 */
export function fullURL(url) {
  const href = new URL(url || globalThis.location.href).href;
  return href.endsWith('/') || href.includes('.') || href.includes('#') ? href : `${href}/`;
}

/**
 * @type {(url: string) => void}
 * Writes URL to browser history
 */
export function addToPushState(url) {
  if (!globalThis.history.state || globalThis.history.state.url !== url) {
    globalThis.history.pushState({ url }, 'internalLink', url);
  }
}

/**
 * Smooth scroll to anchor link
 * @type {(anchor: string) => void}
 */
export function scrollToAnchor(anchor) {
  document
    .querySelector(anchor)
    ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/**
 * Handles back button/forward
 * @type {(e: PopStateEvent) => RouteChangeData}
 */
export function handlePopState(_) {
  const next = fullURL();
  // addToPushState(next);
  return { type: 'popstate', next };
}

/**
 * Organizes link clicks into types
 * @type {(e: MouseEvent) => RouteChangeData}
 */
export function handleLinkClick(e) {
  /** @type {HTMLAnchorElement | undefined} */
  let anchor = undefined;

  if (e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) {
    return { type: 'disqualified' };
  }

  // Find element containing href
  for (let n = /** @type {HTMLElement} */(e.target); n.parentNode; n = /** @type {HTMLElement} */(n.parentNode)) {
    if (n.nodeName === 'A') {
      anchor = /** @type {HTMLAnchorElement} */(n);
      break;
    }
  }

  // External links
  if (anchor && anchor.host !== location.host) {
    anchor.target = '_blank';
    return { type: 'external' };
  }

  // User opt-out
  if (anchor && 'cold' in anchor?.dataset) {
    return { type: 'disqualified' };
  }

  // Link qualified
  if (anchor?.hasAttribute('href')) {
    const ahref = anchor.getAttribute('href');
    const url = new URL(ahref, location.href);

    // Start router takeover
    e.preventDefault();

    // If anchor, scroll,
    if (ahref?.startsWith('#')) {
      scrollToAnchor(ahref);
      return { type: 'scrolled' };
    }

    // ID to scroll to after navigation, like /route/#some-id
    const scrollId = ahref.match(/#([\w'-]+)\b/g)?.[0];
    const next = fullURL(url.href);
    const prev = fullURL();

    addToPushState(next);
    return { type: 'link', next, prev, scrollId };
  } else {
    return { type: 'noop' };
  }
}
