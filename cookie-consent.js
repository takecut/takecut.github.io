// COOKIE CONSENT — TAKE CUT
// Guarda a escolha no navegador para o aviso não aparecer toda vez.
(function () {
  var STORAGE_KEY = "takecut_cookie_consent_v2";
  var POLICY_URL = "/termos.html#cookies";

  function safeGet() {
    try { return localStorage.getItem(STORAGE_KEY); }
    catch (e) { return null; }
  }

  function safeSet(value) {
    try { localStorage.setItem(STORAGE_KEY, value); }
    catch (e) {}
  }

  function safeRemove() {
    try { localStorage.removeItem(STORAGE_KEY); }
    catch (e) {}
  }

  // Para teste manual no console: window.takecutResetCookieBanner()
  window.takecutResetCookieBanner = function () {
    safeRemove();
    var oldBanner = document.querySelector(".cookie-consent");
    if (oldBanner && oldBanner.parentNode) oldBanner.parentNode.removeChild(oldBanner);
    createCookieConsent();
  };

  function updateGoogleConsent(choice) {
    if (typeof window.gtag !== "function") return;

    var granted = choice === "accepted" ? "granted" : "denied";

    window.gtag("consent", "update", {
      "analytics_storage": granted,
      "ad_storage": granted,
      "ad_user_data": granted,
      "ad_personalization": granted
    });
  }

  function closeBanner(banner, choice) {
    safeSet(choice);
    updateGoogleConsent(choice);
    banner.classList.remove("is-visible");

    setTimeout(function () {
      if (banner && banner.parentNode) banner.parentNode.removeChild(banner);
    }, 300);
  }

  function createCookieConsent() {
    var savedChoice = safeGet();

    if (savedChoice === "accepted" || savedChoice === "rejected") {
      updateGoogleConsent(savedChoice);
      return;
    }

    if (document.querySelector(".cookie-consent")) return;

    var banner = document.createElement("div");
    banner.className = "cookie-consent";
    banner.setAttribute("role", "dialog");
    banner.setAttribute("aria-live", "polite");
    banner.setAttribute("aria-label", "Aviso de cookies");

    banner.innerHTML =
      '<div class="cookie-icon" aria-hidden="true">✦</div>' +
      '<div class="cookie-copy">' +
        '<strong>Privacidade e cookies</strong>' +
        '<p>Usamos cookies essenciais e de análise para melhorar sua experiência e entender como o site é usado. Você pode aceitar ou recusar os cookies de análise. <a href="' + POLICY_URL + '">Ver política</a>.</p>' +
      '</div>' +
      '<div class="cookie-actions">' +
        '<button class="cookie-btn reject" type="button" data-cookie-choice="rejected">Recusar</button>' +
        '<button class="cookie-btn accept" type="button" data-cookie-choice="accepted">Aceitar cookies</button>' +
      '</div>';

    document.body.appendChild(banner);

    requestAnimationFrame(function () {
      banner.classList.add("is-visible");
    });

    banner.querySelectorAll("[data-cookie-choice]").forEach(function (button) {
      button.addEventListener("click", function () {
        closeBanner(banner, button.getAttribute("data-cookie-choice"));
      });
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", createCookieConsent);
  } else {
    createCookieConsent();
  }
})();
