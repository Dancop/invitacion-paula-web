function initAudioControl() {
  const toggleBtn = document.getElementById('audio-toggle');
  const audio = document.getElementById('bg-music');
  const label = toggleBtn ? toggleBtn.querySelector('.audio-label') : null;

  if (!toggleBtn || !audio) return;

  toggleBtn.addEventListener('click', () => {
    if (audio.paused) {
      audio.play()
        .then(() => {
          toggleBtn.setAttribute('aria-pressed', 'true');
          if (label) label.textContent = 'Música: On';
        })
        .catch(() => {
          if (label) label.textContent = 'Sin pista';
        });
    } else {
      audio.pause();
      toggleBtn.setAttribute('aria-pressed', 'false');
      if (label) label.textContent = 'Música: Off';
    }
  });
}