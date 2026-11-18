function initScrollExperience() {
  // 1. Secuencias de fotogramas en <canvas> vinculadas al scroll
  const canvasScenes = [
    {
      sectionId: 'escena-1',
      canvasId: 'canvas-escena-1',
      folder: './assets/frames/escena-01'
    },
    {
      sectionId: 'escena-3',
      canvasId: 'canvas-escena-3',
      folder: './assets/frames/escena-03'
    }
  ];

  canvasScenes.forEach(({ sectionId, canvasId, folder }) => {
    const section = document.getElementById(sectionId);
    const canvas = document.getElementById(canvasId);
    if (!section || !canvas) return;

    const ctx = canvas.getContext('2d');
    const frames = [];
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

    const loadNextFrame = (index) => {
      const img = new Image();
      img.onload = () => {
        frames.push(img);
        if (index === 0) drawFrame(0);
        loadNextFrame(index + 1);
      };
      img.onerror = () => {
        if (index === 0) {
          canvas.style.display = 'none';
          section.classList.remove('scene-scroll-video');
        }
      };
      img.src = getFramePath(index);
    };

    loadNextFrame(0);

    function renderCanvasSequence() {
      const total = frames.length;
      if (total > 1) {
        const rect = section.getBoundingClientRect();
        const scrollableDistance = section.offsetHeight - window.innerHeight;

        if (scrollableDistance > 0) {
          const rawProgress = -rect.top / scrollableDistance;
          const clampedProgress = Math.min(1, Math.max(0, rawProgress));
          targetFrame = clampedProgress * (total - 1);
        }

        currentFrame += (targetFrame - currentFrame) * 0.42;
        const frameIndex = Math.min(total - 1, Math.max(0, Math.round(currentFrame)));

        if (frameIndex !== lastDrawnFrame) {
          drawFrame(frameIndex);
        }
      }

      requestAnimationFrame(renderCanvasSequence);
    }

    requestAnimationFrame(renderCanvasSequence);
  });

  // 2. Aparición suave de tarjetas al hacer scroll
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

        currentFrame += (targetFrame - currentFrame) * 0.42;
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