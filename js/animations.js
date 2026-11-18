function initAmbientBubbles() {
  const container = document.querySelector('.bubbles-layer');
  if (!container) return;

  const bubbleCount = 22;
  for (let i = 0; i < bubbleCount; i++) {
    const bubble = document.createElement('span');
    bubble.className = 'pastel-bubble';

    const size = Math.floor(Math.random() * 24) + 12; // 12px - 36px
    const left = Math.random() * 94 + 2;
    const duration = Math.random() * 8 + 8; // 8s - 16s
    // Delay negativo para que ya haya burbujas flotando al abrir la página
    const delay = -(Math.random() * duration);

    bubble.style.width = `${size}px`;
    bubble.style.height = `${size}px`;
    bubble.style.left = `${left}%`;
    bubble.style.animationDuration = `${duration}s`;
    bubble.style.animationDelay = `${delay}s`;

    container.appendChild(bubble);
  }
}