/* =====================================================================
   Projeto 28 Dias – Rotina Leve
   script.js — configuração e interações
   ===================================================================== */

/* ---------------------------------------------------------------------
   1) CONFIGURAÇÃO EDITÁVEL
   Altere apenas os valores abaixo. Nada mais precisa ser mexido.
   --------------------------------------------------------------------- */

/* Link do checkout (PayT). Deixe "#" enquanto não tiver a URL final. */
const CHECKOUT_URL = "#";

/* Preço exibido em toda a página (hero, oferta, CTA fixo). */
const PRICE = "R$ 97,00";

/* Texto exibido no FAQ "Quanto tempo tenho acesso?" */
const ACCESS_TEXT = "Acesso conforme condições informadas no momento da compra.";

/* Data de "última atualização" das páginas de Termos, Privacidade e Reembolso. */
const LEGAL_UPDATED = "informe a data";

/* Dados da empresa / responsável — aparecem no rodapé e nas páginas legais. */
const COMPANY = {
  name: "Projeto 28 Dias Pro",
  doc: "CNPJ: 67.550.941/0001-70",
  email: "suporte28dias@outlook.com",
};

/* ---------------------------------------------------------------------
   2) TRACKING — pontos de integração futura
   Ative um por um quando tiver os IDs. Nada é carregado agora.
   --------------------------------------------------------------------- */
const TRACKING = {
  metaPixelId: "",        // ex.: "123456789012345"
  ga4Id: "",              // ex.: "G-XXXXXXXXXX"
  utmifyEnabled: false,   // repassa UTMs da URL atual para o CHECKOUT_URL
};

/* Repassa parâmetros UTM da página para o link de checkout (UTMify / Ads). */
function appendUtms(url) {
  if (url === "#" || !url) return url;
  try {
    const current = new URLSearchParams(window.location.search);
    const keep = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "src", "sck", "xcod"];
    const target = new URL(url, window.location.href);
    keep.forEach((k) => {
      if (current.has(k)) target.searchParams.set(k, current.get(k));
    });
    return target.toString();
  } catch (e) {
    return url;
  }
}

/* Dispare aqui os eventos de conversão quando o pixel estiver ativo. */
function trackCheckoutClick(origin) {
  // Exemplo (Meta Pixel):
  // if (window.fbq) fbq('track', 'InitiateCheckout', { origin: origin });
  // Exemplo (GA4):
  // if (window.gtag) gtag('event', 'begin_checkout', { origin: origin });
}

/* ---------------------------------------------------------------------
   3) APLICAÇÃO DA CONFIGURAÇÃO NA PÁGINA
   --------------------------------------------------------------------- */
document.addEventListener("DOMContentLoaded", () => {
  // Preço
  document.querySelectorAll(".js-price").forEach((el) => { el.textContent = PRICE; });

  // Texto de acesso (FAQ)
  document.querySelectorAll(".js-access-text").forEach((el) => { el.textContent = ACCESS_TEXT; });

  // Dados da empresa
  document.querySelectorAll(".js-company-name").forEach((el) => { el.textContent = COMPANY.name; });
  document.querySelectorAll(".js-company-doc").forEach((el) => { el.textContent = COMPANY.doc; });
  document.querySelectorAll(".js-contact-link").forEach((el) => {
    el.setAttribute("href", "mailto:" + COMPANY.email);
    if (!el.textContent.trim() || el.textContent.trim() === "Contato") {
      el.textContent = "Contato: " + COMPANY.email;
    }
  });

  // Ano no copyright
  document.querySelectorAll(".js-year").forEach((el) => { el.textContent = new Date().getFullYear(); });

  // Data das páginas institucionais
  document.querySelectorAll(".js-legal-date").forEach((el) => { el.textContent = LEGAL_UPDATED; });

  // Botões de checkout
  document.querySelectorAll(".js-checkout").forEach((el) => {
    const finalUrl = TRACKING.utmifyEnabled ? appendUtms(CHECKOUT_URL) : CHECKOUT_URL;

    if (CHECKOUT_URL === "#") {
      // Ainda sem link: rola até a oferta em vez de sair da página.
      el.setAttribute("href", "#oferta");
    } else {
      el.setAttribute("href", finalUrl);
      el.setAttribute("target", "_blank");
      el.setAttribute("rel", "noopener");
    }

    el.addEventListener("click", () => {
      trackCheckoutClick(el.dataset.track || "cta");
    });
  });

  initAccordions();
  initReveal();
  initStickyCta();
});

/* ---------------------------------------------------------------------
   4) ACCORDIONS (módulos e FAQ)
   --------------------------------------------------------------------- */
function initAccordions() {
  document.querySelectorAll(".accordion").forEach((accordion) => {
    const triggers = accordion.querySelectorAll(".accordion__trigger");
    triggers.forEach((trigger) => {
      const panel = document.getElementById(trigger.getAttribute("aria-controls"));
      trigger.addEventListener("click", () => {
        const isOpen = trigger.getAttribute("aria-expanded") === "true";

        // Fecha os demais itens do mesmo accordion
        triggers.forEach((t) => {
          if (t !== trigger) {
            t.setAttribute("aria-expanded", "false");
            const p = document.getElementById(t.getAttribute("aria-controls"));
            if (p) p.style.maxHeight = null;
          }
        });

        trigger.setAttribute("aria-expanded", String(!isOpen));
        panel.style.maxHeight = isOpen ? null : panel.scrollHeight + "px";
      });
    });
  });

  // Recalcula altura ao redimensionar (evita corte de texto)
  window.addEventListener("resize", () => {
    document.querySelectorAll('.accordion__trigger[aria-expanded="true"]').forEach((t) => {
      const p = document.getElementById(t.getAttribute("aria-controls"));
      if (p) p.style.maxHeight = p.scrollHeight + "px";
    });
  });
}

/* ---------------------------------------------------------------------
   5) REVEAL ao rolar
   --------------------------------------------------------------------- */
function initReveal() {
  const els = document.querySelectorAll(".reveal");
  if (!("IntersectionObserver" in window)) {
    els.forEach((el) => el.classList.add("is-visible"));
    return;
  }
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
  );
  els.forEach((el) => io.observe(el));
}

/* ---------------------------------------------------------------------
   6) CTA FIXO no mobile — aparece depois do hero
   --------------------------------------------------------------------- */
function initStickyCta() {
  const cta = document.getElementById("stickyCta");
  const hero = document.querySelector(".hero");
  const offer = document.getElementById("oferta");
  if (!cta || !hero) return;

  const update = () => {
    const past = window.scrollY > hero.offsetHeight - 80;
    const atOffer = offer && window.scrollY + window.innerHeight > offer.offsetTop + 120
      && window.scrollY < offer.offsetTop + offer.offsetHeight;
    cta.hidden = !past || atOffer;
  };
  update();
  window.addEventListener("scroll", update, { passive: true });
  window.addEventListener("resize", update);
}
