(() => {
  const translations = window.PORTFOLIO_TRANSLATIONS;
  let language = "en";
  const normalize = value => value.replace(/\s+/g, " ").trim();
  const t = value => language === "zh" ? value : (translations[normalize(value)] || value);
  const setLanguage = value => {
    language = value === "zh" ? "zh" : "en";
    document.documentElement.lang = language === "zh" ? "zh-CN" : "en";
    document.querySelectorAll("[data-i18n]").forEach(element => {
      element.textContent = t(element.dataset.i18n);
    });
    document.querySelectorAll("[data-i18n-attrs]").forEach(element => {
      const attributes = JSON.parse(element.dataset.i18nAttrs);
      Object.entries(attributes).forEach(([name, source]) => element.setAttribute(name, t(source)));
    });
    document.querySelectorAll("[data-language]").forEach(button => {
      button.setAttribute("aria-pressed", String(button.dataset.language === language));
    });
    const control = document.querySelector(".language-switch");
    if (control) control.setAttribute("aria-label", language === "en" ? "Language" : "语言");
    try { localStorage.setItem("portfolio-language", language); } catch {}
    window.dispatchEvent(new CustomEvent("portfolio:languagechange", { detail: { language } }));
  };
  window.portfolioI18n = {
    t, setLanguage,
    get language() { return language; },
    playLabel: title => language === "en" ? `Play ${title}` : `播放${title}`,
    frameLabel: title => language === "en" ? `${title}: video frame` : `${title}视频画面`
  };
  document.querySelectorAll("[data-language]").forEach(button => {
    button.addEventListener("click", () => setLanguage(button.dataset.language));
  });
  let savedLanguage;
  try { savedLanguage = localStorage.getItem("portfolio-language"); } catch {}
  setLanguage(savedLanguage === "zh" ? "zh" : "en");
})();
