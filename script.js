const header = document.querySelector("[data-header]");
const nav = document.querySelector("[data-nav]");
const toggle = document.querySelector("[data-menu-toggle]");
const hero = document.querySelector(".hero");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const i18n = window.portfolioI18n;

const updateHeader = () => {
  header.classList.toggle("is-scrolled", window.scrollY > 20);
};

updateHeader();
window.addEventListener("scroll", updateHeader, { passive: true });

toggle.addEventListener("click", () => {
  const isOpen = toggle.getAttribute("aria-expanded") === "true";
  toggle.setAttribute("aria-expanded", String(!isOpen));
  nav.classList.toggle("is-open", !isOpen);
  document.body.classList.toggle("menu-open", !isOpen);
});

nav.addEventListener("click", (event) => {
  if (event.target.tagName !== "A") return;
  toggle.setAttribute("aria-expanded", "false");
  nav.classList.remove("is-open");
  document.body.classList.remove("menu-open");
});

document.querySelectorAll('a[href^="#"]').forEach((link) => {
  if (link.hasAttribute("data-category-link")) return;
  link.addEventListener("click", (event) => {
    const target = document.querySelector(link.getAttribute("href"));
    if (!target) return;
    event.preventDefault();
    target.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
    history.pushState(null, "", link.getAttribute("href"));
  });
});

document.querySelectorAll(".section, .work-card, .category-tile, .project-detail, .service-list article, .timeline article, .visual-lab, .contact-section").forEach((element) => {
  element.classList.add("reveal-target");
});

if (!reduceMotion) {
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      revealObserver.unobserve(entry.target);
    });
  }, { threshold: 0.14, rootMargin: "0px 0px -8% 0px" });

  document.querySelectorAll(".reveal-target").forEach((element) => revealObserver.observe(element));
} else {
  document.querySelectorAll(".reveal-target").forEach((element) => element.classList.add("is-visible"));
}

const cinematicShowcase = document.querySelector("[data-cinematic-showcase]");
const cinematicSlides = Array.from(document.querySelectorAll("[data-cinematic-slide]"));

if (cinematicShowcase && cinematicSlides.length) {
  const currentLabel = cinematicShowcase.querySelector("[data-cinematic-current]");
  const prevButton = cinematicShowcase.querySelector("[data-cinematic-prev]");
  const nextButton = cinematicShowcase.querySelector("[data-cinematic-next]");
  let currentSlide = 0;
  let wheelLocked = false;
  let touchStartY = 0;

  const showSlide = (index) => {
    currentSlide = Math.max(0, Math.min(index, cinematicSlides.length - 1));
    cinematicSlides.forEach((slide, slideIndex) => {
      const isActive = slideIndex === currentSlide;
      slide.classList.toggle("is-active", isActive);
      slide.setAttribute("aria-hidden", String(!isActive));
      const link = slide.querySelector("a");
      if (link) link.tabIndex = isActive ? 0 : -1;
    });
    currentLabel.textContent = String(currentSlide + 1).padStart(2, "0");
    prevButton.disabled = currentSlide === 0;
    nextButton.disabled = currentSlide === cinematicSlides.length - 1;
  };

  const moveSlide = (direction) => {
    const nextSlide = currentSlide + direction;
    if (nextSlide < 0 || nextSlide >= cinematicSlides.length) return false;
    showSlide(nextSlide);
    return true;
  };

  cinematicShowcase.addEventListener("wheel", (event) => {
    if (Math.abs(event.deltaY) < 8 || Math.abs(event.deltaX) > Math.abs(event.deltaY)) return;
    const direction = event.deltaY > 0 ? 1 : -1;
    const canMove = direction > 0 ? currentSlide < cinematicSlides.length - 1 : currentSlide > 0;
    if (!canMove) return;

    event.preventDefault();
    if (wheelLocked) return;
    wheelLocked = true;
    moveSlide(direction);
    window.setTimeout(() => {
      wheelLocked = false;
    }, reduceMotion ? 120 : 620);
  }, { passive: false });

  cinematicShowcase.addEventListener("touchstart", (event) => {
    touchStartY = event.changedTouches[0].clientY;
  }, { passive: true });

  cinematicShowcase.addEventListener("touchend", (event) => {
    const distance = touchStartY - event.changedTouches[0].clientY;
    if (Math.abs(distance) < 42) return;
    moveSlide(distance > 0 ? 1 : -1);
  }, { passive: true });

  cinematicShowcase.addEventListener("keydown", (event) => {
    if (!["ArrowUp", "ArrowDown", "PageUp", "PageDown"].includes(event.key)) return;
    const direction = event.key === "ArrowDown" || event.key === "PageDown" ? 1 : -1;
    if (moveSlide(direction)) event.preventDefault();
  });

  prevButton.addEventListener("click", () => moveSlide(-1));
  nextButton.addEventListener("click", () => moveSlide(1));
  showSlide(0);
}

const categoryDetails = document.querySelector("#category-details");
const categoryItems = Array.from(document.querySelectorAll("[data-category-item]"));
const categoryLinks = document.querySelectorAll("[data-category-link]");
const categoryClose = document.querySelector("[data-category-close]");
const aigcTabs = document.querySelector("[data-aigc-tabs]");
const aigcArchive = document.querySelector("#aigc-archive");
const aigcFilterButtons = Array.from(document.querySelectorAll("[data-aigc-filter]"));
let activeCategory = null;
let activeAigcFilter = "short";

const categoryContent = {
  commercial: {
    kicker: "COMMERCIAL FILM",
    title: "影视广告",
    description: "品牌命题、实拍制作与后期成片。"
  },
  aigc: {
    kicker: "AIGC VIDEO",
    title: "AIGC 影像",
    description: "从概念生成、动态化到剪辑交付的 AI 影像实践。"
  },
  stage: {
    kicker: "STAGE PROJECTION",
    title: "舞台投影设计",
    description: "舞台视觉策划、投影内容制作与现场视觉落地。"
  },
  photography: {
    kicker: "PHOTOGRAPHY",
    title: "摄影作品",
    description: "风光、城市与空间中的光线观察。"
  },
  other: {
    kicker: "OTHER WORKS",
    title: "综合视觉创作",
    description: "平面设计、品牌视觉、三维与多媒介视觉实验。"
  }
};

const updateCategoryItems = () => {
  categoryItems.forEach((item) => {
    const isCategory = item.dataset.categoryItem === activeCategory;
    const isAigcKind = activeCategory !== "aigc"
      || item.dataset.aigcKind === "featured"
      || item.dataset.aigcKind === "archive"
      || item.dataset.aigcKind === activeAigcFilter;
    const isCurrent = isCategory && isAigcKind;
    item.hidden = !isCurrent;
    if (isCurrent) item.classList.add("is-visible");
  });
};

const setAigcFilter = (filter) => {
  activeAigcFilter = filter;
  aigcFilterButtons.forEach((button) => {
    const isActive = button.dataset.aigcFilter === filter;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });
  updateCategoryItems();
};

const updateCategoryHeading = () => {
  if (!categoryDetails || !activeCategory) return;
  const content = categoryContent[activeCategory];
  categoryDetails.querySelector("[data-category-kicker]").textContent = content.kicker;
  categoryDetails.querySelector("[data-category-title]").textContent = i18n.t(content.title);
  categoryDetails.querySelector("[data-category-description]").textContent = i18n.t(content.description);
};

const openCategory = (category) => {
  if (!categoryDetails || !categoryContent[category]) return;
  activeCategory = category;
  updateCategoryHeading();
  aigcTabs.hidden = category !== "aigc";
  if (category === "aigc") {
    if (aigcArchive) aigcArchive.open = false;
    setAigcFilter("short");
  } else {
    updateCategoryItems();
  }
  categoryDetails.hidden = false;
  window.requestAnimationFrame(() => {
    categoryDetails.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
  });
};

categoryLinks.forEach((link) => {
  link.addEventListener("click", (event) => {
    event.preventDefault();
    openCategory(link.dataset.categoryLink);
    history.pushState(null, "", "#category-details");
  });
});

aigcFilterButtons.forEach((button) => {
  button.addEventListener("click", () => setAigcFilter(button.dataset.aigcFilter));
});

if (categoryClose) {
  categoryClose.addEventListener("click", () => {
    categoryDetails.hidden = true;
    history.pushState(null, "", "#works");
    document.querySelector("#works").scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
  });
}

const videoDialog = document.querySelector("[data-video-dialog]");
const videoPlayer = videoDialog?.querySelector("[data-video-player]");
const videoModalTitle = videoDialog?.querySelector("[data-video-modal-title]");
let activeVideoTrigger = null;

const unloadVideo = () => {
  if (!videoPlayer) return;
  videoPlayer.pause();
  videoPlayer.removeAttribute("src");
  videoPlayer.removeAttribute("poster");
  videoPlayer.load();
  activeVideoTrigger = null;
};

const syncConcertVersion = (switcher) => {
  const option = switcher.querySelector("[data-concert-option].is-active");
  const launch = switcher.querySelector("[data-concert-launch]");
  const preview = launch?.querySelector("img");
  const playLabel = launch?.querySelector("[data-concert-play-label]");
  if (!option || !launch || !preview) return;
  launch.dataset.videoSrc = option.dataset.concertVideo;
  launch.dataset.videoPoster = option.dataset.concertPoster;
  launch.dataset.videoTitle = option.dataset.concertTitle;
  launch.setAttribute("aria-label", i18n.playLabel(option.dataset.concertTitle));
  preview.src = option.dataset.concertPoster;
  preview.alt = i18n.frameLabel(option.dataset.concertTitle);
  if (playLabel) playLabel.textContent = i18n.t(option.dataset.concertVideo.includes("-full-") ? "播放现场完整版" : "播放预览版");
};

document.querySelectorAll("[data-concert-switcher]").forEach((switcher) => {
  const options = Array.from(switcher.querySelectorAll("[data-concert-option]"));

  options.forEach((option) => {
    option.addEventListener("click", () => {
      options.forEach((item) => {
        const isActive = item === option;
        item.classList.toggle("is-active", isActive);
        item.setAttribute("aria-pressed", String(isActive));
      });

      syncConcertVersion(switcher);
    });
  });
});

document.querySelectorAll("[data-video-src]").forEach((trigger) => {
  trigger.addEventListener("click", () => {
    if (!videoDialog || !videoPlayer) return;
    activeVideoTrigger = trigger;
    videoPlayer.src = trigger.dataset.videoSrc;
    if (trigger.dataset.videoPoster) videoPlayer.poster = trigger.dataset.videoPoster;
    if (videoModalTitle) videoModalTitle.textContent = trigger.dataset.videoTitle || i18n.t("作品视频");
    videoPlayer.load();
    videoDialog.showModal();
    videoPlayer.play().catch(() => {});
  });
});

videoDialog?.querySelector("[data-video-close]")?.addEventListener("click", () => videoDialog.close());
videoDialog?.addEventListener("click", (event) => {
  if (event.target === videoDialog) videoDialog.close();
});
videoDialog?.addEventListener("close", unloadVideo);

const lightbox = document.querySelector("[data-lightbox-dialog]");
const lightboxImage = lightbox?.querySelector("[data-lightbox-image]");
let activeImageTrigger = null;

document.querySelectorAll("[data-lightbox]").forEach((button) => {
  button.addEventListener("click", () => {
    activeImageTrigger = button;
    lightboxImage.src = button.dataset.lightbox;
    lightboxImage.alt = button.querySelector("img")?.alt || i18n.t("作品大图预览");
    lightbox.showModal();
  });
});

lightbox?.querySelector("[data-lightbox-close]")?.addEventListener("click", () => lightbox.close());
lightbox?.addEventListener("click", (event) => {
  if (event.target === lightbox) lightbox.close();
});
lightbox?.addEventListener("close", () => { activeImageTrigger = null; });

window.addEventListener("portfolio:languagechange", () => {
  updateCategoryHeading();
  document.querySelectorAll("[data-concert-switcher]").forEach(syncConcertVersion);
  if (videoDialog?.open && activeVideoTrigger && videoModalTitle) {
    videoModalTitle.textContent = activeVideoTrigger.dataset.videoTitle || i18n.t("作品视频");
  }
  if (lightbox?.open && activeImageTrigger && lightboxImage) {
    lightboxImage.alt = activeImageTrigger.querySelector("img")?.alt || i18n.t("作品大图预览");
  }
});

if (hero && !reduceMotion) {
  hero.addEventListener("pointermove", (event) => {
    const rect = hero.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    hero.style.setProperty("--mx", `${x}%`);
    hero.style.setProperty("--my", `${y}%`);
  });
}

document.querySelectorAll("a[href]").forEach((link) => {
  const href = link.getAttribute("href");
  if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:") || href.endsWith(".pdf")) return;

  link.addEventListener("click", (event) => {
    event.preventDefault();
    document.body.classList.add("is-leaving");
    window.setTimeout(() => {
      window.location.href = href;
    }, reduceMotion ? 0 : 240);
  });
});

const initHeroPrism = (canvas) => {
  const gl = canvas.getContext("webgl", { alpha: true, antialias: false, premultipliedAlpha: false });
  if (!gl) return;

  const vertexShaderSource = `
    attribute vec2 aPosition;

    void main() {
      gl_Position = vec4(aPosition, 0.0, 1.0);
    }
  `;

  const fragmentShaderSource = `
    precision highp float;

    uniform vec2 uResolution;
    uniform vec2 uPointer;
    uniform float uTime;

    float hash(vec2 p) {
      return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
    }

    float noise(vec2 p) {
      vec2 i = floor(p);
      vec2 f = fract(p);
      vec2 u = f * f * (3.0 - 2.0 * f);
      return mix(
        mix(hash(i + vec2(0.0, 0.0)), hash(i + vec2(1.0, 0.0)), u.x),
        mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
        u.y
      );
    }

    mat2 rotate2d(float a) {
      float s = sin(a);
      float c = cos(a);
      return mat2(c, -s, s, c);
    }

    void main() {
      vec2 uv = (gl_FragCoord.xy - 0.5 * uResolution.xy) / uResolution.y;
      vec2 pointer = (uPointer - 0.5) * vec2(0.08, -0.06);
      float t = uTime * 0.001;
      float drift = t * 0.42;

      vec2 autoMove = vec2(
        sin(drift * 0.83) * 0.13 + sin(drift * 1.41) * 0.035,
        cos(drift * 0.72) * 0.10 + sin(drift * 1.08) * 0.045
      );

      uv += vec2(0.0, -0.08) + pointer + autoMove;
      vec2 p = rotate2d(-0.18 + sin(drift * 0.9) * 0.16) * uv;
      p *= 1.16 + sin(drift * 0.66) * 0.08;
      p.x += sin(p.y * 2.4 + drift * 1.6) * 0.055;
      p.y += cos(p.x * 1.8 - drift * 1.3) * 0.04;

      float prism = max(abs(p.x) * 0.9 + p.y * 0.42, abs(p.y) * 0.52);
      float pulse = 0.5 + 0.5 * sin(drift * 2.2);
      float inner = smoothstep(0.50 + pulse * 0.04, 0.18, prism);
      float edge = smoothstep(0.52, 0.39, prism) * (1.0 - smoothstep(0.39, 0.28, prism));
      float blade = smoothstep(0.020, 0.0, abs(abs(p.x) * 0.72 + p.y * 0.34 - 0.23 + sin(drift * 1.7) * 0.08));
      float beamA = smoothstep(0.42, -0.03, abs(p.y + 0.08 + sin(p.x * 2.4 + drift * 2.2) * 0.08)) * smoothstep(1.18, 0.18, abs(p.x));
      float beamB = smoothstep(0.30, -0.03, abs(p.x * 0.42 - p.y + sin(drift * 1.35) * 0.22)) * smoothstep(1.10, 0.16, length(p));
      float beam = max(beamA, beamB * 0.72);
      float fan = smoothstep(1.10, 0.12, length(p)) * smoothstep(-0.56, 0.38, p.y);

      vec3 cool = vec3(0.10, 0.30, 0.48);
      vec3 silver = vec3(0.66, 0.86, 0.94);
      vec3 ice = vec3(0.40, 0.92, 1.0);
      vec3 color = mix(cool, silver, inner);

      float cyanRay = smoothstep(0.26, -0.02, abs(p.y + p.x * 0.18 + sin(drift * 1.1) * 0.16));
      float blueRay = smoothstep(0.28, -0.02, abs(p.y - p.x * 0.36 - cos(drift * 0.92) * 0.14));
      float violetRay = smoothstep(0.30, -0.02, abs(p.y + p.x * 0.62 + sin(drift * 1.34) * 0.18));
      vec3 dispersion =
        vec3(0.30, 0.90, 1.00) * cyanRay +
        vec3(0.22, 0.48, 1.00) * blueRay +
        vec3(0.62, 0.46, 1.00) * violetRay;

      vec3 split = vec3(
        sin((p.x + p.y) * 8.0 + drift * 3.2),
        sin((p.x - p.y) * 9.0 + drift * 3.7 + 1.8),
        sin(p.x * 11.0 - drift * 3.1 + 3.1)
      ) * 0.5 + 0.5;

      color += split * edge * (0.42 + pulse * 0.22);
      color += ice * beam * (0.28 + pulse * 0.20);
      color += dispersion * fan * 0.18;
      color += silver * blade * 0.30;

      float grain = noise(gl_FragCoord.xy * 0.82 + t * 30.0) - 0.5;
      float alpha = clamp(inner * 0.12 + edge * 0.58 + beam * 0.34 + fan * 0.10 + blade * 0.28, 0.0, 0.78);
      color += grain * 0.045;

      gl_FragColor = vec4(color, alpha);
    }
  `;

  const createShader = (type, source) => {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      gl.deleteShader(shader);
      return null;
    }
    return shader;
  };

  const vertexShader = createShader(gl.VERTEX_SHADER, vertexShaderSource);
  const fragmentShader = createShader(gl.FRAGMENT_SHADER, fragmentShaderSource);
  if (!vertexShader || !fragmentShader) return;

  const program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return;

  const positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);

  const positionLocation = gl.getAttribLocation(program, "aPosition");
  const resolutionLocation = gl.getUniformLocation(program, "uResolution");
  const pointerLocation = gl.getUniformLocation(program, "uPointer");
  const timeLocation = gl.getUniformLocation(program, "uTime");
  const pointer = { x: 0.5, y: 0.5 };
  const targetPointer = { x: 0.5, y: 0.5 };
  let frameId = null;
  let isActive = true;

  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE);

  const resize = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const width = Math.max(1, Math.floor(canvas.clientWidth * dpr));
    const height = Math.max(1, Math.floor(canvas.clientHeight * dpr));
    if (canvas.width === width && canvas.height === height) return;
    canvas.width = width;
    canvas.height = height;
    gl.viewport(0, 0, width, height);
  };

  const render = (time) => {
    if (!isActive) {
      frameId = null;
      return;
    }

    resize();
    pointer.x += (targetPointer.x - pointer.x) * 0.055;
    pointer.y += (targetPointer.y - pointer.y) * 0.055;

    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.useProgram(program);
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
    gl.uniform2f(resolutionLocation, canvas.width, canvas.height);
    gl.uniform2f(pointerLocation, pointer.x, pointer.y);
    gl.uniform1f(timeLocation, time);
    gl.drawArrays(gl.TRIANGLES, 0, 3);

    frameId = window.requestAnimationFrame(render);
  };

  const setActive = (nextActive) => {
    isActive = nextActive && !document.hidden;
    if (isActive && frameId === null) frameId = window.requestAnimationFrame(render);
    if (!isActive && frameId !== null) {
      window.cancelAnimationFrame(frameId);
      frameId = null;
    }
  };

  window.addEventListener("resize", resize, { passive: true });
  if (hero) {
    hero.addEventListener("pointermove", (event) => {
      const rect = hero.getBoundingClientRect();
      targetPointer.x = (event.clientX - rect.left) / rect.width;
      targetPointer.y = (event.clientY - rect.top) / rect.height;
    }, { passive: true });
  }

  if ("IntersectionObserver" in window) {
    const prismObserver = new IntersectionObserver(([entry]) => setActive(entry.isIntersecting), { threshold: 0.01 });
    prismObserver.observe(canvas);
  }

  document.addEventListener("visibilitychange", () => {
    const isInView = canvas.getBoundingClientRect().bottom > 0 && canvas.getBoundingClientRect().top < window.innerHeight;
    setActive(isInView);
  });

  resize();
  frameId = window.requestAnimationFrame(render);
};

const heroPrism = document.querySelector(".hero-prism");
if (heroPrism && !reduceMotion) {
  initHeroPrism(heroPrism);
}
