function initScrollExperience() {
  // 1. Sincronización nativa de video con el progreso del scroll
  const scrollVideoSections = document.querySelectorAll('.scene-scroll-video');

  scrollVideoSections.forEach((section) => {
    const video = section.querySelector('.bg-video');
    if (!video) return;

    let targetTime = 0;
    let currentTime = 0;
    let isVideoReady = false;

    // Si el MP4 aún no existe (ej. escena-03.mp4), convierte la sección a altura normal
    const handleVideoError = () => {
      video.style.display = 'none';
      section.classList.remove('scene-scroll-video');
    };

    video.addEventListener('error', handleVideoError);
    const sourceEl = video.querySelector('source');
    if (sourceEl) {
      sourceEl.addEventListener('error', handleVideoError);
    }

    // Mostrar el primer cuadro apenas carguen los metadatos
    video.addEventListener('loadedmetadata', () => {
      isVideoReady = true;
      try {
        video.currentTime = 0.01;
      } catch (e) {}
    });

    // Desbloquear decodificador de video en móviles al primer toque o scroll
    const unlockMobileVideo = () => {
      video.play()
        .then(() => {
          video.pause();
          isVideoReady = true;
        })
        .catch(() => {});
      window.removeEventListener('touchstart', unlockMobileVideo);
      window.removeEventListener('pointerdown', unlockMobileVideo);
    };
    window.addEventListener('touchstart', unlockMobileVideo, { passive: true });
    window.addEventListener('pointerdown', unlockMobileVideo, { passive: true });

    // Bucle fluido a 60fps para mapear el scroll al tiempo del video
    function renderScrollVideo() {
      if (video.style.display !== 'none' && (isVideoReady || video.readyState >= 1) && video.duration) {
        const rect = section.getBoundingClientRect();
        const scrollableDistance = section.offsetHeight - window.innerHeight;

        if (scrollableDistance > 0) {
          // Progreso de 0 (inicio de la sección) a 1 (final de la sección)
          const rawProgress = -rect.top / scrollableDistance;
          const clampedProgress = Math.min(1, Math.max(0, rawProgress));
          targetTime = clampedProgress * (video.duration - 0.04);
        }

        // Suavizado (lerp) para evitar saltos bruscos al mover el dedo
        currentTime += (targetTime - currentTime) * 0.16;

        if (Math.abs(video.currentTime - currentTime) > 0.015) {
          try {
            video.currentTime = currentTime;
          } catch (e) {}
        }
      }

      requestAnimationFrame(renderScrollVideo);
    }

    requestAnimationFrame(renderScrollVideo);
  });

  // 2. Animación suave de aparición de tarjetas al hacer scroll
  const revealElements = document.querySelectorAll('.reveal-up');

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );

    revealElements.forEach((el) => observer.observe(el));
  } else {
    revealElements.forEach((el) => el.classList.add('is-visible'));
  }

  // Asegurar que la portada sea visible desde el instante inicial
  setTimeout(() => {
    document.querySelectorAll('#escena-1 .reveal-up').forEach((el) => {
      el.classList.add('is-visible');
    });
  }, 100);
}

function initScrollExperience() {
  // 1. Secuencia de fotogramas en <canvas> con detección automática de cantidad
  const section1 = document.getElementById('escena-1');
  const canvas = document.getElementById('canvas-escena-1');

  if (section1 && canvas) {
    const ctx = canvas.getContext('2d');
    const frames = [];
    let targetFrame = 0;
    let currentFrame = 0;
    let lastDrawnFrame = -1;

    const getFramePath = (index) => {
      const padded = String(index + 1).padStart(4, '0');
      return `./assets/frames/escena-01/frame-${padded}.webp`;
    };

    const drawFrame = (index) => {
      const img = frames[index];
      if (!img || !img.complete || img.naturalWidth === 0) return;

      if (canvas.width !== img.naturalWidth || canvas.height !== img.naturalHeight) {
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      lastDrawnFrame = index;
    };

    // Cargar fotogramas secuencialmente hasta encontrar el último archivo disponible
    const loadNextFrame = (index) => {
      const img = new Image();
      img.onload = () => {
        frames.push(img);
        if (index === 0) drawFrame(0);
        loadNextFrame(index + 1);
      };
      img.onerror = () => {
        // Se alcanzó el último fotograma de la carpeta
      };
      img.src = getFramePath(index);
    };

    loadNextFrame(0);

    // Renderizado fluido a 60fps vinculado al scroll
    function renderCanvasSequence() {
      const total = frames.length;
      if (total > 1) {
        const rect = section1.getBoundingClientRect();
        const scrollableDistance = section1.offsetHeight - window.innerHeight;

        if (scrollableDistance > 0) {
          const rawProgress = -rect.top / scrollableDistance;
          const clampedProgress = Math.min(1, Math.max(0, rawProgress));
          targetFrame = clampedProgress * (total - 1);
        }

        currentFrame += (targetFrame - currentFrame) * 0.22;
        const frameIndex = Math.min(total - 1, Math.max(0, Math.round(currentFrame)));

        if (frameIndex !== lastDrawnFrame) {
          drawFrame(frameIndex);
        }
      }

      requestAnimationFrame(renderCanvasSequence);
    }

    requestAnimationFrame(renderCanvasSequence);
  }

  // 2. Ajustar Escena 3 automáticamente mientras no tenga MP4
  const section3 = document.getElementById('escena-3');
  const video3 = document.getElementById('video-escena-3');
  if (section3 && video3) {
    const hideMissingVideo = () => {
      video3.style.display = 'none';
      section3.classList.remove('scene-scroll-video');
    };
    video3.addEventListener('error', hideMissingVideo);
    const src3 = video3.querySelector('source');
    if (src3) src3.addEventListener('error', hideMissingVideo);
  }

  // 3. Aparición suave de tarjetas al hacer scroll
  const revealElements = document.querySelectorAll('.reveal-up');

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );

    revealElements.forEach((el) => observer.observe(el));
  } else {
    revealElements.forEach((el) => el.classList.add('is-visible'));
  }

  setTimeout(() => {
    document.querySelectorAll('#escena-1 .reveal-up').forEach((el) => {
      el.classList.add('is-visible');
    });
  }, 100);
}