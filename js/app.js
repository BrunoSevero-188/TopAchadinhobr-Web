(function () {
  "use strict";

  function escapeHtml(text) {
    return String(text)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function resolveRemainingText(template, diasRestantes) {
    return template.replace("{dias}", String(diasRestantes));
  }

  function renderSocialLink(social) {
    return (
      '<a href="' +
      escapeHtml(social.href) +
      '" target="_blank" rel="noopener noreferrer" aria-label="' +
      escapeHtml(social.alt) +
      '" class="social-link">' +
      '<img src="' +
      escapeHtml(social.src) +
      '" alt="' +
      escapeHtml(social.alt) +
      '" loading="lazy" width="128" height="128" />' +
      "</a>"
    );
  }

  function renderCardProduto(produto) {
    var copy = cardStrings;
    var categoria = produto.categoria || "Sem categoria";
    var total = produto.precoNovo;
    var discountedTotal = produto.precoNovo;

    var diasRestantes = 0;
    if (produto.dataFim) {
      var fim = new Date(produto.dataFim + "T23:59:59");
      var agora = new Date();
      var diffMs = fim.getTime() - agora.getTime();
      diasRestantes = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
      if (isNaN(diasRestantes)) diasRestantes = 0;
    }

    var isIndisponivel = diasRestantes <= 0;
    var diasRestantesTexto = isIndisponivel
      ? "PRODUTO INDISPONIVEL NO MOMENTO ATUAL"
      : resolveRemainingText(copy.offerRemainingText, diasRestantes);

    var hasLink = produto.link && produto.link !== "#";
    var linkHref = hasLink ? produto.link : "#";
    var linkAttrs = isIndisponivel
      ? 'aria-disabled="true" tabindex="-1"'
      : hasLink
      ? 'target="_blank" rel="noreferrer"'
      : 'aria-disabled="true" tabindex="-1"';

    var imagemHtml = produto.imagem
      ? '<img class="card-produto__image" src="' +
        escapeHtml(produto.imagem) +
        '" alt="' +
        escapeHtml(produto.titulo) +
        '" loading="lazy" />'
      : '<div class="card-produto__image card-produto__image--placeholder">Sem imagem</div>';

    var precoAntigoHtml = produto.precoAntigo
      ? "<small>" + escapeHtml(produto.precoAntigo) + "</small>"
      : "";

    return (
      '<article class="card-produto">' +
      '<div class="card-produto__header">' +
      "<h2>" +
      escapeHtml(copy.offerTitle) +
      "</h2>" +
      "<p>" +
      escapeHtml(diasRestantesTexto) +
      "</p>" +
      "</div>" +
      '<div class="card-produto__product">' +
      imagemHtml +
      '<div class="card-produto__info">' +
      "<h4>" +
      escapeHtml(produto.titulo) +
      "</h4>" +
      "<span>" +
      escapeHtml(copy.categoryLabel) +
      " " +
      escapeHtml(categoria) +
      "</span>" +
      "</div>" +
      '<div class="card-produto__price">' +
      precoAntigoHtml +
      "<strong>" +
      escapeHtml(produto.precoNovo) +
      "</strong>" +
      "</div>" +
      "</div>" +
      '<div class="card-produto__details">' +
      '<div class="card-produto__row">' +
      "<span>" +
      escapeHtml(copy.discountedTotalLabel) +
      "</span>" +
      "<span>" +
      escapeHtml(discountedTotal) +
      "</span>" +
      "</div>" +

      '<div class="card-produto__row card-produto__row--total">' +
      "<span>" +
      escapeHtml(copy.totalLabel) +
      "</span>" +
      "<span>" +
      escapeHtml(total) +
      "</span>" +
      "</div>" +
      "</div>" +
      '<a href="' +
      escapeHtml(linkHref) +
      '" ' +
      linkAttrs +
      ' class="card-produto__button" aria-label="' +
      escapeHtml(copy.buttonAriaLabel) +
      '">' +
      escapeHtml(copy.buttonLabel) +
      "</a>" +
      "</article>"
    );
  }

  function renderProdutos() {
    var grid = document.getElementById("produtos-grid");
    if (!grid) return;

    if (!produtos.length) {
      grid.innerHTML =
        '<p class="produtos-vazio">Nenhum produto cadastrado no momento. Volte em breve!</p>';
      return;
    }

    grid.innerHTML = produtos.map(renderCardProduto).join("");
  }

  function renderSocialLinks() {
    var slidebarLinks = document.getElementById("slidebar-links");
    var mobileSocial = document.getElementById("mobile-social");
    var html = socialLinks.map(renderSocialLink).join("");

    if (slidebarLinks) slidebarLinks.innerHTML = html;
    if (mobileSocial) mobileSocial.innerHTML = html;
  }

  function renderTextoAnuncio() {
    var el = document.getElementById("texto-anuncio");
    if (!el) return;

    el.innerHTML =
      "<p>" +
      escapeHtml(textoAnuncio.linha1) +
      "<br />" +
      escapeHtml(textoAnuncio.linha2) +
      "<br />" +
      escapeHtml(textoAnuncio.linha3) +
      "<br />" +
      escapeHtml(textoAnuncio.linha4) +
      "</p>";
  }

  function renderHeader() {
    var logoImg = document.getElementById("header-logo");
    if (logoImg) {
      logoImg.src = LOGO_SRC;
      logoImg.alt = "Top Achadinho";
    }

    var slidebarLogo = document.getElementById("slidebar-logo");
    if (slidebarLogo) {
      slidebarLogo.src = LOGO_SRC;
      slidebarLogo.alt = "Top Achadinhos";
    }
  }

  function initLoginModal() {
    var modal = document.getElementById("login-modal");
    if (!modal) return;

    var overlay = modal.querySelector(".login-modal__overlay");
    var btnGoogle = document.getElementById("login-google");
    var btnGuest = document.getElementById("login-guest");
    var status = document.getElementById("login-status");
    var btnChangeToGuest = document.getElementById("login-change-to-guest");

    var STORAGE_KEY = "topachadinho_user_mode";

    var saved = null;
    try {
      saved = localStorage.getItem(STORAGE_KEY);
    } catch (e) {
      saved = null;
    }

    function setStatus(text) {
      if (status) status.textContent = text;
    }

    function closeModal() {
      modal.classList.remove("is-open");
      if (overlay) overlay.setAttribute("aria-hidden", "true");
    }

    function openModal() {
      modal.classList.add("is-open");
      if (overlay) overlay.setAttribute("aria-hidden", "false");
    }

    var userIdentifier = document.getElementById("user-identifier");

    function setUserIdentifier(mode) {
      if (!userIdentifier) return;
      if (mode === "google") {
        userIdentifier.textContent = "Conectado com Google";
      } else if (mode === "guest") {
        userIdentifier.textContent = "Conectado como conta anônima";
      } else {
        userIdentifier.textContent = "";
      }
    }

    function choose(mode) {
      try {
        localStorage.setItem(STORAGE_KEY, mode);
      } catch (e) {}
      if (mode === "google") setStatus("Modo Google selecionado (integração pendente).");
      if (mode === "guest") setStatus("Você está usando sem conta.");

      setUserIdentifier(mode);
      closeModal();
    }


    function handleOverlayClick(e) {
      if (!e) return;
      if (e.target && overlay && e.target === overlay) {
        closeModal();
      }
    }


    // Persistência: se já escolheu, não mostra
    if (saved === "google" || saved === "guest") {
      setUserIdentifier(saved);
      closeModal();
      return;
    }

    openModal();


    if (overlay) {
      overlay.addEventListener("click", handleOverlayClick);
    }

    if (btnGoogle) {
      btnGoogle.addEventListener("click", function () {
        choose("google");
      });
    }

    if (btnGuest) {
      btnGuest.addEventListener("click", function () {
        choose("guest");
      });
    }

    if (btnChangeToGuest) {
      btnChangeToGuest.addEventListener("click", function () {
        choose("guest");
      });
    }
  }


  function init() {
    renderHeader();
    renderTextoAnuncio();
    renderSocialLinks();
    renderProdutos();
    initLoginModal();
  }


  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
