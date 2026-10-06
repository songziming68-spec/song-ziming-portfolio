(() => {
  const cover = document.querySelector(".home-cover");
  const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const homeHash = !window.location.hash || window.location.hash === "#home";
  if (!cover || motion.matches || !homeHash || window.scrollY > 80
    || typeof cover.animate !== "function") return;

  const compact = window.matchMedia("(max-width: 760px)").matches;
  const animations = [];

  const reveal = (element, delay, duration, letter = false) => {
    if (!element) return;
    const anchor = element.matches(".home-scroll") ? "translateX(-50%) " : "";
    const frames = [
      { opacity: 0, transform: `${anchor}translateY(${letter ? 24 : 12}px)` },
      { opacity: 1, transform: `${anchor}translateY(0)` }
    ];
    if (!compact) {
      frames[0].filter = `blur(${letter ? 5 : 3}px)`;
      frames[1].filter = "blur(0px)";
    }
    animations.push(element.animate(frames, {
      delay,
      duration,
      easing: "cubic-bezier(0.16, 1, 0.3, 1)",
      fill: "backwards"
    }));
  };

  reveal(cover.querySelector(".eyebrow"), 60, 700);
  cover.querySelectorAll(".home-name-word > span").forEach((letter, index) => {
    reveal(letter, 170 + index * (compact ? 25 : 38), compact ? 800 : 1100, true);
  });
  reveal(cover.querySelector(".hero-role"), compact ? 430 : 620, 850);
  reveal(cover.querySelector(".hero-copy"), compact ? 510 : 720, 850);
  reveal(cover.querySelector(".hero-actions"), compact ? 610 : 850, 800);
  reveal(cover.querySelector(".home-scroll"), compact ? 700 : 1000, 700);

  // Interacting or leaving the hero immediately restores the static final state.
  let complete = false;
  let fallback;
  const finish = () => {
    if (complete) return;
    complete = true;
    animations.forEach((animation) => animation.cancel());
    window.clearTimeout(fallback);
    window.removeEventListener("scroll", onScroll);
    window.removeEventListener("pointerdown", finish);
    window.removeEventListener("keydown", onKey);
    document.removeEventListener("visibilitychange", onVisibility);
    motion.removeEventListener("change", onMotion);
  };
  const onScroll = () => { if (window.scrollY > 80) finish(); };
  const onKey = (event) => { if (["Escape", "Tab"].includes(event.key)) finish(); };
  const onVisibility = () => { if (document.hidden) finish(); };
  const onMotion = (event) => { if (event.matches) finish(); };

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("pointerdown", finish, { once: true });
  window.addEventListener("keydown", onKey);
  document.addEventListener("visibilitychange", onVisibility);
  motion.addEventListener("change", onMotion);
  fallback = window.setTimeout(finish, compact ? 1800 : 2400);
})();
