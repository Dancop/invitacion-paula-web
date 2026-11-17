function initScrollExperience() {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

  gsap.registerPlugin(ScrollTrigger);

  // Configurar scrubbing suave para escenas con video MP4
  const videoScenes = [
    { sectionId: '#escena-1', videoId: 'video-escena-1' },
    { sectionId: '#escena-3', videoId: 'video-escena-3' }
  ];

  videoScenes.forEach(({ sectionId, videoId }) => {
    const section = document.querySelector(sectionId);
    const video = document.getElementById(videoId);
    if (!section || !video) return;

    let targetTime = 0;
    let currentTime = 0;

    // Desbloquear reproducción en iOS/Android al primer toque
    const unlockVideo = () => {
      video.play().then(() => video.pause()).catch(() => {});
      window.removeEventListener('touchstart', unlockVideo);
    };
    window.addEventListener('touchstart', unlockVideo, { passive: true });

    ScrollTrigger.create({
      trigger: section,
      start: 'top top',
      end: 'bottom bottom',
      scrub: true,
      onUpdate: (self) => {
        if (video.duration && !Number.isNaN(video.duration)) {
          targetTime = self.progress * video.duration;
        }
      }
    });

    // Interpolación suave (lerp) para evitar saltos en móvil
    gsap.ticker.add(() => {
      if (video.style.display === 'none' || !video.duration) return;
      currentTime += (targetTime - currentTime) * 0.14;
      if (Math.abs(video.currentTime - currentTime) > 0.01) {
        try {
          video.currentTime = currentTime;
        } catch (e) {
          // Ignorar si el frame aún está cargando
        }
      }
    });
  });

  // Aparición suave de tarjetas al hacer scroll
  gsap.utils.toArray('.reveal-up').forEach((card) => {
    gsap.from(card, {
      y: 28,
      opacity: 0,
      duration: 0.85,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: card,
        start: 'top 85%',
        once: true
      }
    });
  });
}