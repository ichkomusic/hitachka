const studioVideo = document.querySelector('.session-video');
const studioMotion = matchMedia('(prefers-reduced-motion: reduce)');

function playStudioVideo() {
  if (studioMotion.matches) return;
  if (!studioVideo.hasAttribute('src')) studioVideo.src = studioVideo.dataset.src;
  studioVideo.play().catch(() => {
    studioVideo.hidden = true;
  });
}

studioVideo.addEventListener('playing', () => {
  if (studioMotion.matches) {
    studioVideo.pause();
    return;
  }
  studioVideo.hidden = false;
});
studioVideo.addEventListener('error', () => {
  studioVideo.hidden = true;
});
studioMotion.addEventListener('change', () => {
  if (studioMotion.matches) {
    studioVideo.pause();
    studioVideo.hidden = true;
  } else {
    playStudioVideo();
  }
});
playStudioVideo();
