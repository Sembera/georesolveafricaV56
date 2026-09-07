(() => {
  const panel = document.querySelector('.gu-v2-plan');
  if (!panel) return;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const replay = () => {
    panel.classList.remove('is-replaying');
    if (reduced.matches) return;
    void panel.offsetWidth;
    panel.classList.add('is-replaying');
  };
  panel.querySelector('.gu-v2-replay')?.addEventListener('click', replay);
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) {
        replay();
        observer.disconnect();
      }
    }, { threshold: 0.3 });
    observer.observe(panel);
  }
})();
