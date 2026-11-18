function initScrollExperience() {
  const preloader = document.getElementById('spa-preloader');
  const barFill = document.getElementById('preloader-bar-fill');
  const percentText = document.getElementById('preloader-percent');

  // 1. Configurar secuencias de fotogramas en <canvas> vinculadas al scroll
  const canvasScenes = [
    {
      sectionId: 'escena-1',
      canvasId: 'canvas-escena-1',
      folder: './assets/frames/escena-01',
      expectedCount: 190
    },
    {
      sectionId: 'escena-3',
      canvasId: 'canvas-escena-3',
      folder: './assets/frames/escena-03',
      expectedCount: 96
    }
  ];

  const totalExpected = canvasScenes.reduce((acc, s) => acc + s.expectedCount, 0);
  let loadedCount = 0;
  let completedScenes = 0;
  let preloaderClosed = false;

  const closePreloader = () => {
    if (preloaderClosed) return;
    preloaderClosed = true;
    if (barFill) barFill.style.width = '100%';
    if (percentText) percentText.textContent = '100%';
    document.body.classList.remove('is-loading');
    if (preloader) {
      setTimeout(() => {
        preloader.classList.add('is-hidden');
      }, 280);
    }
  };

  const updatePreloaderProgress = () => {
    loadedCount++;
    const pct = Math.min(99, Math.round((loadedCount / totalExpected) * 100));
    if (barFill) barFill.style.width = `${pct}%`;
    if (percentText) percentText.textContent = `${pct}%`;
  };

  // Respaldo de seguridad: abrir la web aunque la red esté muy lenta (máx. 6s)
  const safetyTimer = setTimeout(closePreloader, 6000);

  const sceneControllers = {};

  canvasScenes.forEach(({ sectionId, canvasId, folder }) => {
    const section = document.getElementById(sectionId);
    const canvas = document.getElementById(canvasId);
    if (!section || !canvas) return;

    const ctx = canvas.getContext('2d');
    const frames = [];
    let targetFrame = 0;
    let currentFrame = 0;
    let lastDrawnFrame = -1;

    const controller = {
      getProgress: () => {
        const rect = section.getBoundingClientRect();
        const scrollable = section.offsetHeight - window.innerHeight;
        if (scrollable <= 0) return 1;
        return Math.min(1, Math.max(0, -rect.top / scrollable));
      }
    };
    sceneControllers[sectionId] = controller;

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
        updatePreloaderProgress();
        if (index === 0) drawFrame(0);
        loadNextFrame(index + 1);
      };
      img.onerror = () => {
        completedScenes++;
        if (index === 0) {
          canvas.style.display = 'none';
          section.classList.remove('scene-scroll-video');
        }
        if (completedScenes >= canvasScenes.length) {
          clearTimeout(safetyTimer);
          closePreloader();
        }
      };
      img.src = getFramePath(index);
    };

    loadNextFrame(0);

    function renderCanvasSequence() {
      const total = frames.length;
      if (total > 1) {
        const progress = controller.getProgress();
        targetFrame = progress * (total - 1);

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

  // =========================================
  // 2. SALTO MAGNÉTICO ENTRE ESCENAS
  // =========================================
  const scenes = Array.from(document.querySelectorAll('.scene'));
  let isAutoSnapping = false;
  let snapAnimId = null;
  let snapCooldown = false;
  let lastScrollY = window.scrollY;
  let scrollDirection = 'down';
  let scrollEndTimer = null;

  const smoothMagnetScrollTo = (targetY, duration = 620) => {
    if (snapAnimId) cancelAnimationFrame(snapAnimId);
    isAutoSnapping = true;
    snapCooldown = true;

    const startY = window.scrollY;
    const distance = targetY - startY;
    if (Math.abs(distance) < 4) {
      isAutoSnapping = false;
      setTimeout(() => { snapCooldown = false; }, 250);
      return;
    }

    const startTime = performance.now();
    const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

    const step = (now) => {
      if (!isAutoSnapping) return;
      const elapsed = now - startTime;
      const t = Math.min(1, elapsed / duration);
      window.scrollTo(0, startY + distance * easeOutCubic(t));

      if (t < 1) {
        snapAnimId = requestAnimationFrame(step);
      } else {
        isAutoSnapping = false;
        setTimeout(() => { snapCooldown = false; }, 320);
      }
    };

    snapAnimId = requestAnimationFrame(step);
  };

  // Cancelar salto automático si el usuario vuelve a tocar la pantalla
  window.addEventListener('touchstart', () => {
    if (isAutoSnapping) {
      isAutoSnapping = false;
      if (snapAnimId) cancelAnimationFrame(snapAnimId);
    }
  }, { passive: true });

  const evaluateMagneticSnap = () => {
    if (isAutoSnapping || snapCooldown || preloaderClosed === false) return;

    const viewportH = window.innerHeight;
    const currentY = window.scrollY;

    for (let i = 0; i < scenes.length; i++) {
      const scene = scenes[i];
      const rect = scene.getBoundingClientRect();
      const sceneTopDoc = currentY + rect.top;
      const sceneBottomDoc = sceneTopDoc + scene.offsetHeight;

      // Detectar qué escena ocupa la pantalla actualmente
      if (rect.top <= viewportH * 0.45 && rect.bottom >= viewportH * 0.45) {
        const isAnimatedScene = scene.classList.contains('scene-scroll-video');
        const nextScene = scenes[i + 1];
        const prevScene = scenes[i - 1];

        if (isAnimatedScene && sceneControllers[scene.id]) {
          const progress = sceneControllers[scene.id].getProgress();

          // Al finalizar la animación hacia abajo (progress >= 0.93), saltar magnéticamente a la siguiente escena
          if (scrollDirection === 'down' && progress >= 0.93 && nextScene) {
            const nextTop = currentY + nextScene.getBoundingClientRect().top;
            smoothMagnetScrollTo(nextTop);
            return;
          }

          // Si sube cerca del inicio de la escena animada, alinear magnéticamente al inicio
          if (scrollDirection === 'up' && progress <= 0.06 && Math.abs(rect.top) > 10) {
            smoothMagnetScrollTo(sceneTopDoc);
            return;
          }
        } else {
          // Escenas estáticas (Escena 2, 4, 5): saltar magnéticamente al deslizar hacia la siguiente o anterior
          if (scrollDirection === 'down' && rect.top < -viewportH * 0.14 && nextScene) {
            const nextTop = currentY + nextScene.getBoundingClientRect().top;
            smoothMagnetScrollTo(nextTop);
            return;
          }

          if (scrollDirection === 'up' && rect.top > viewportH * 0.14 && prevScene) {
            // Si la escena anterior es animada, llevar al final de su animación; si no, a su inicio
            const prevTarget = prevScene.classList.contains('scene-scroll-video')
              ? (currentY + prevScene.getBoundingClientRect().bottom - viewportH - 12)
              : (currentY + prevScene.getBoundingClientRect().top);
            smoothMagnetScrollTo(Math.max(0, prevTarget));
            return;
          }

          // Alinear exactamente la escena actual si quedó ligeramente desplazada
          if (Math.abs(rect.top) > 8 && Math.abs(rect.top) <= viewportH * 0.14) {
            smoothMagnetScrollTo(sceneTopDoc);
            return;
          }
        }
        break;
      }
    }
  };

  window.addEventListener('scroll', () => {
    const newY = window.scrollY;
    if (Math.abs(newY - lastScrollY) > 2) {
      scrollDirection = newY > lastScrollY ? 'down' : 'up';
      lastScrollY = newY;
    }

    if (isAutoSnapping) return;

    // Disparo inmediato al completar el 95% de una escena animada bajando
    if (scrollDirection === 'down' && !snapCooldown) {
      ['escena-1', 'escena-3'].forEach((id, idx) => {
        const ctrl = sceneControllers[id];
        const el = document.getElementById(id);
        if (ctrl && el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 0 && rect.bottom >= window.innerHeight * 0.5 && ctrl.getProgress() >= 0.95) {
            const nextEl = el.nextElementSibling;
            if (nextEl) {
              smoothMagnetScrollTo(window.scrollY + nextEl.getBoundingClientRect().top);
            }
          }
        }
      });
    }

    clearTimeout(scrollEndTimer);
    scrollEndTimer = setTimeout(evaluateMagneticSnap, 110);
  }, { passive: true });

  // =========================================
  // 3. APARICIÓN SUAVE DE TEXTOS AL ENTRAR
  // =========================================
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