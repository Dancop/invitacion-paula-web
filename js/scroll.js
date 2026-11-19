function initScrollExperience() {
  const preloader = document.getElementById('spa-preloader');
  const barFill = document.getElementById('preloader-bar-fill');
  const percentText = document.getElementById('preloader-percent');

  // 1. Configuración de secuencias de fotogramas
  const scenesConfig = [
    {
      sectionId: 'escena-1',
      canvasId: 'canvas-escena-1',
      folder: './assets/frames/escena-01',
      totalFrames: 190,
      blockPreloader: true // El preloader espera a que esta escena esté 100% lista
    },
    {
      sectionId: 'escena-3',
      canvasId: 'canvas-escena-3',
      folder: './assets/frames/escena-03',
      totalFrames: 96,
      blockPreloader: false // Se carga en paralelo en segundo plano
    }
  ];

  let preloaderClosed = false;

const closePreloader = () => {
    if (preloaderClosed) return;
    preloaderClosed = true;
    if (barFill) barFill.style.width = '100%';
    if (percentText) percentText.textContent = '100%';

    const enterBtn = document.getElementById('enter-invite-btn');
    const track = document.getElementById('preloader-track');
    const titleEl = preloader ? preloader.querySelector('.preloader-title') : null;

    if (enterBtn && preloader) {
      if (track) track.style.display = 'none';
      if (percentText) percentText.style.display = 'none';
      if (titleEl) titleEl.textContent = '¡Todo listo para celebrar!';
      enterBtn.style.display = 'inline-flex';

      enterBtn.addEventListener('click', () => {
        document.body.classList.remove('is-loading');
        preloader.classList.add('is-hidden');
        if (typeof window.startInviteMusic === 'function') {
          window.startInviteMusic();
        }
      }, { once: true });
    } else {
      document.body.classList.remove('is-loading');
      if (preloader) preloader.classList.add('is-hidden');
    }
  };

  // Respaldo extremo (25s) solo por si falla la conexión del invitado
  const safetyTimer = setTimeout(closePreloader, 25000);

  scenesConfig.forEach(({ sectionId, canvasId, folder, totalFrames, blockPreloader }) => {
    const section = document.getElementById(sectionId);
    const canvas = document.getElementById(canvasId);
    if (!section || !canvas) return;

    const ctx = canvas.getContext('2d');
    const frames = new Array(totalFrames);
    let loadedInScene = 0;
    let validFrames = 0;
    let nextIndexToRequest = 0;
    let targetFrame = 0;
    let currentFrame = 0;
    let lastDrawnFrame = -1;

    const getFramePath = (index) => {
      const padded = String(index + 1).padStart(4, '0');
      return `${folder}/frame-${padded}.webp`;
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

    const onAssetSettled = (index, success) => {
      loadedInScene++;
      if (success) {
        validFrames++;
        if (index === 0) drawFrame(0);
      } else if (index === 0) {
        canvas.style.display = 'none';
        section.classList.remove('scene-scroll-video');
      }

      if (blockPreloader) {
        const pct = Math.min(100, Math.round((loadedInScene / totalFrames) * 100));
        if (barFill) barFill.style.width = `${pct}%`;
        if (percentText) percentText.textContent = `${pct}%`;

        if (loadedInScene >= totalFrames) {
          clearTimeout(safetyTimer);
          closePreloader();
        }
      }

      // Pedir el siguiente fotograma del lote
      if (nextIndexToRequest < totalFrames) {
        requestFrame(nextIndexToRequest++);
      }
    };

    const requestFrame = (index) => {
      const img = new Image();
      frames[index] = img;
      img.onload = () => onAssetSettled(index, true);
      img.onerror = () => onAssetSettled(index, false);
      img.src = getFramePath(index);
    };

    // Lanzar 8 descargas simultáneas (en paralelo) para acelerar la carga en Netlify
    const CONCURRENCY = 8;
    const initialBatch = Math.min(CONCURRENCY, totalFrames);
    for (let i = 0; i < initialBatch; i++) {
      requestFrame(nextIndexToRequest++);
    }

    // Bucle fluido a 60fps vinculado al scroll libre
    function renderCanvasSequence() {
      if (validFrames > 1) {
        const rect = section.getBoundingClientRect();
        const scrollableDistance = section.offsetHeight - window.innerHeight;

        if (scrollableDistance > 0) {
          const rawProgress = -rect.top / scrollableDistance;
          const clampedProgress = Math.min(1, Math.max(0, rawProgress));
          targetFrame = clampedProgress * (validFrames - 1);
        }

        currentFrame += (targetFrame - currentFrame) * 0.42;
        const frameIndex = Math.min(validFrames - 1, Math.max(0, Math.round(currentFrame)));

        if (frameIndex !== lastDrawnFrame) {
          drawFrame(frameIndex);
        }
      }
      requestAnimationFrame(renderCanvasSequence);
    }

    requestAnimationFrame(renderCanvasSequence);
  });

  // 2. Aparición suave de textos al hacer scroll
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