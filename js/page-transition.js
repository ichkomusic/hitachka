(() => {
  const root = document.documentElement;
  const state = 'data-hitachka-wipe';
  const marker = '__hitachka_wipe';
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const current = new URL(location.href);
  const siteRoot = new URL('../', document.currentScript.src);
  const pages = new Set(['', 'services/', 'projects/', 'gallery/', 'calendar/', 'contact/']);
  const pagePath = url => url.pathname.slice(siteRoot.pathname.length).replace(/(^|\/)index\.html$/, '$1');
  const incoming = current.searchParams.get(marker) === '1';
  let departureTimer;
  let revealTimer;
  let wordmark;
  // Original PNG components, in reading order, followed by the two strokes.
  const pieces = motion.matches ? [] : [
    [0, 212, 325], [275, 203, 157], [454, 167, 299], [600, 139, 304],
    [933, 122, 278], [1179, 69, 323], [1453, 42, 331], [1744, 0, 304],
    [53, 395, 1973], [457, 498, 1208],
  ].map(([x, y, width], index) => {
    const image = new Image();
    image.fetchPriority = 'low';
    image.alt = '';
    image.src = new URL('assets/images/wipe/' + (index + 1) + '.png', siteRoot).href;
    image.style.setProperty('--x', x / 2048 * 100 + '%');
    image.style.setProperty('--y', y / 734 * 100 + '%');
    image.style.setProperty('--width', width / 2048 * 100 + '%');
    if (index < 8) {
      image.style.setProperty('--delay', 150 + index * 60 + 'ms');
    } else {
      image.className = 'wipe-line';
      image.style.setProperty('--delay', 770 + (index - 8) * 70 + 'ms');
    }
    return image;
  });

  function showWordmark() {
    if (!pieces.length || !pieces.every(image => image.complete && image.naturalWidth)) return false;
    wordmark = document.createElement('div');
    wordmark.className = 'wipe-wordmark';
    wordmark.setAttribute('aria-hidden', 'true');
    const art = document.createElement('div');
    art.className = 'wipe-wordmark-art';
    art.append(...pieces);
    wordmark.append(art);
    document.body.append(wordmark);
    return true;
  }


  function reset() {
    clearTimeout(departureTimer);
    clearTimeout(revealTimer);
    root.removeAttribute(state);
    wordmark?.remove();
    wordmark = undefined;
  }

  if (incoming) {
    current.searchParams.delete(marker);
    try { history.replaceState(history.state, '', current.href); }
    catch { /* Some browsers restrict history changes to local files. */ }

    if (!motion.matches) {
      root.setAttribute(state, 'hold');
      const reveal = () => {
        if (root.getAttribute(state) !== 'hold') return;
        clearTimeout(revealTimer);
        // Give the fully covered frame a chance to paint before revealing.
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            if (root.getAttribute(state) !== 'hold') return;
            root.setAttribute(state, 'reveal');
            revealTimer = setTimeout(reset, 470);
          });
        });
      };
      window.addEventListener('load', reveal, { once: true });
      revealTimer = setTimeout(reveal, 680);
    }
  }

  root.addEventListener('animationend', event => {
    if (event.target === root && event.animationName === 'hitachka-reveal') reset();
  });
  window.addEventListener('pageshow', event => {
    if (event.persisted) reset();
  });

  // Open the actual files when previewing the site directly from disk.
  if (current.protocol === 'file:') {
    document.addEventListener('DOMContentLoaded', () => {
      for (const link of document.querySelectorAll('a[href]')) {
        const destination = new URL(link.href);
        if (destination.protocol === 'file:' && destination.host === siteRoot.host &&
            destination.pathname.startsWith(siteRoot.pathname) &&
            destination.pathname.endsWith('/') && pages.has(pagePath(destination))) {
          destination.pathname += 'index.html';
          link.href = destination.href;
        }
      }
    });
  }

  document.addEventListener('click', event => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey ||
        event.shiftKey || event.altKey || motion.matches) return;

    const link = event.target.closest?.('a[href]');
    if (!link || link.hasAttribute('download') ||
        (link.target && link.target.toLowerCase() !== '_self') ||
        link.relList.contains('external')) return;

    const destination = new URL(link.href);
    if (destination.protocol !== current.protocol || destination.host !== current.host ||
        !destination.pathname.startsWith(siteRoot.pathname) ||
        !pages.has(pagePath(destination)) ||
        pagePath(destination) === pagePath(current)) return;

    event.preventDefault();
    if (root.getAttribute(state)?.startsWith('cover')) return;
    reset();
    const animated = showWordmark();
    root.setAttribute(state, animated ? 'cover-pop' : 'cover');
    destination.searchParams.set(marker, '1');

    let navigated = false;
    const navigate = () => {
      if (navigated) return;
      navigated = true;
      clearTimeout(departureTimer);
      root.removeEventListener('animationend', onCover);
      location.assign(destination.href);
    };
    const onCover = event => {
      if (event.target === root && event.animationName === (animated ? 'hitachka-cover-pop' : 'hitachka-cover')) navigate();
    };
    root.addEventListener('animationend', onCover);
    departureTimer = setTimeout(navigate, animated ? 1060 : 360);
  });
})();
