(function () {
  "use strict";

  /* ─── Utilitários ─── */

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

  /* ─── Render: links sociais ─── */

  function renderSocialLink(social) {
    return (
      '<a href="' + escapeHtml(social.href) + '" target="_blank" rel="noopener noreferrer" aria-label="' + escapeHtml(social.alt) + '" class="social-link">' +
      '<img src="' + escapeHtml(social.src) + '" alt="' + escapeHtml(social.alt) + '" loading="lazy" width="128" height="128" />' +
      "</a>"
    );
  }

  /* ─── Render: cards de produto ─── */

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

    function formatDataFim(dataFimStr) {
      if (!dataFimStr) return "";
      var fimDate = new Date(dataFimStr);
      if (isNaN(fimDate.getTime())) {
        return escapeHtml(String(dataFimStr));
      }
      var dd = String(fimDate.getDate()).padStart(2, "0");
      var mm = String(fimDate.getMonth() + 1).padStart(2, "0");
      var yyyy = fimDate.getFullYear();
      return dd + "/" + mm + "/" + yyyy;
    }

    var isIndisponivel = diasRestantes <= 0;
    var diasRestantesTexto = isIndisponivel
      ? "Oferta até " + formatDataFim(produto.dataFim)
      : resolveRemainingText(copy.offerRemainingText, diasRestantes);

    var hasLink = produto.link && produto.link !== "#";

    var linkHref = hasLink ? produto.link : "#";
    var linkAttrs = isIndisponivel
      ? 'aria-disabled="true" tabindex="-1"'
      : hasLink
      ? 'target="_blank" rel="noreferrer"'
      : 'aria-disabled="true" tabindex="-1"';

    var imagemHtml = produto.imagem
      ? '<div class="card-produto__image-wrap"><img class="card-produto__image" src="' + escapeHtml(produto.imagem) + '" alt="' + escapeHtml(produto.titulo) + '" loading="lazy" /></div>'
      : '<div class="card-produto__image-wrap card-produto__image--placeholder">Sem imagem</div>';

    var precoAntigoHtml = produto.precoAntigo
      ? "<small>" + escapeHtml(produto.precoAntigo) + "</small>"
      : "";

    return (
      '<article class="card-produto">' +
      '<div class="card-produto__header">' +
      "<h2>" + escapeHtml(copy.offerTitle) + "</h2>" +
      "<p>" + escapeHtml(diasRestantesTexto) + "</p>" +
      "</div>" +
      '<div class="card-produto__product">' +
      imagemHtml +
      '<div class="card-produto__info">' +
      "<h4>" + escapeHtml(produto.titulo) + "</h4>" +
      "<span>" + escapeHtml(copy.categoryLabel) + " " + escapeHtml(categoria) + "</span>" +
      "</div>" +
      '<div class="card-produto__price">' +
      precoAntigoHtml +
      "<strong>" + escapeHtml(produto.precoNovo) + "</strong>" +
      "</div>" +
      "</div>" +
      '<div class="card-produto__details">' +
      '<div class="card-produto__row">' +
      "<span>" + escapeHtml(copy.discountedTotalLabel) + "</span>" +
      "<span>" + escapeHtml(discountedTotal) + "</span>" +
      "</div>" +
      '<div class="card-produto__row card-produto__row--total">' +
      "<span>" + escapeHtml(copy.totalLabel) + "</span>" +
      "<span>" + escapeHtml(total) + "</span>" +
      "</div>" +
      "</div>" +
      '<a href="' + escapeHtml(linkHref) + '" ' + linkAttrs + ' class="card-produto__button" aria-label="' + escapeHtml(copy.buttonAriaLabel) + '">' +
      escapeHtml(copy.buttonLabel) +
      "</a>" +
      "</article>"
    );
  }

  function renderProdutos() {
    var grid = document.getElementById("produtos-grid");
    if (!grid) return;

    if (!produtos.length) {
      grid.innerHTML = '<p class="produtos-vazio">Nenhum produto cadastrado no momento. Volte em breve!</p>';
      return;
    }

    grid.innerHTML = produtos.map(renderCardProduto).join("");
  }

  /* ─── Render: links sociais nas duas zonas ─── */

  function renderSocialLinks() {
    var slidebarLinks = document.getElementById("slidebar-links");
    var mobileSocial  = document.getElementById("mobile-social");
    var html = socialLinks.map(renderSocialLink).join("");
    if (slidebarLinks) slidebarLinks.innerHTML = html;
    if (mobileSocial)  mobileSocial.innerHTML  = html;
  }

  /* ─── Render: texto do hero ─── */

  function renderTextoAnuncio() {
    var el = document.getElementById("texto-anuncio");
    if (!el) return;
    el.innerHTML =
      "<p>" +
      escapeHtml(textoAnuncio.linha1) + "<br />" +
      escapeHtml(textoAnuncio.linha2) + "<br />" +
      escapeHtml(textoAnuncio.linha3) + "<br />" +
      escapeHtml(textoAnuncio.linha4) +
      "</p>";
  }

  /* ─── Render: logo do header ─── */

  function renderHeader() {
    var logoImg = document.getElementById("header-logo");
    if (logoImg) {
      logoImg.src = LOGO_SRC;
      logoImg.alt = "Top Achadinho";
    }
  }

  /* ─── Init ─── */

  function init() {
    renderHeader();
    renderTextoAnuncio();
    renderSocialLinks();
    renderProdutos();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();