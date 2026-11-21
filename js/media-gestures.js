(() => {
  const media = 'img, picture, svg, video';

  document.addEventListener('contextmenu', event => {
    if (event.target.closest?.('input, textarea, [contenteditable]:not([contenteditable="false"])')) return;
    event.preventDefault();
  }, true);

  document.addEventListener('dragstart', event => {
    const target = event.target;
    if (target.closest?.(media) || (target.matches?.('a') && target.querySelector(media))) {
      event.preventDefault();
    }
  }, true);
})();
