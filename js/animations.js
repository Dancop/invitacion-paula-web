function initAmbientBubbles() {
  const container = document.querySelector('.bubbles-layer');
  if (!container) return;

  const bubbleCount = 14;
  for (let i = 0; i < bubbleCount; i++) {
    const bubble = document.createElement('span');
    bubble.className = 'pastel-bubble';

    const size = Math.floor(Math.random() * 18) + 10; // 10px - 28px
    const left = Math.random() * 100;
    const duration = Math.random() * 9 + 9; // 9s - 18s
    const delay = Math.random() * 8;

    bubble.style.width = `${size}px`;
    bubble.style.height = `${size}px`;
    bubble.style.left = `${left}%`;
    bubble.style.animationDuration = `${duration}s`;
    bubble.style.animationDelay = `${delay}s`;

    container.appendChild(bubble);
  }
}