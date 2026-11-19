function initAudioControl() {
  const toggleBtn = document.getElementById('audio-toggle');
  const bgMusic = document.getElementById('bg-music');
  if (!toggleBtn || !bgMusic) return;

  bgMusic.volume = 0.45;

  const setPlayingState = (playing) => {
    toggleBtn.classList.toggle('is-playing', playing);
    toggleBtn.setAttribute('aria-pressed', String(playing));
    toggleBtn.setAttribute(
      'aria-label',
      playing ? 'Pausar música ambiental' : 'Reproducir música ambiental'
    );
  };

  // Función global para iniciar la música al tocar "Abrir invitación"
  window.startInviteMusic = () => {
    if (!bgMusic.paused) return;
    bgMusic.play()
      .then(() => setPlayingState(true))
      .catch(() => setPlayingState(false));
  };

  toggleBtn.addEventListener('click', () => {
    if (bgMusic.paused) {
      bgMusic.play()
        .then(() => setPlayingState(true))
        .catch(() => setPlayingState(false));
    } else {
      bgMusic.pause();
      setPlayingState(false);
    }
  });

  bgMusic.addEventListener('pause', () => setPlayingState(false));
  bgMusic.addEventListener('play', () => setPlayingState(true));
}