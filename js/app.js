(function () {
  "use strict";

  function escapeHtml(text) {
    return String(text)
      .replace(/&/g, "&amp;")
      .replace(/</g, "<")
      .replace(/>/g, ">")
      .replace(/\"/g, '"')
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
      ? '<div class="card-produto__image-wrap"><img class="card-produto__image" src="' +
        escapeHtml(produto.imagem) +
        '" alt="' +
        escapeHtml(produto.titulo) +
        '" loading="lazy" /></div>'
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
      "<span>" +
      escapeHtml(copy.categoryLabel) +
      " " +
      escapeHtml(categoria) +
      "</span>" +
      "</div>" +
      '<div class="card-produto__price">' +
      precoAntigoHtml +
      "<strong>" + escapeHtml(produto.precoNovo) + "</strong>" +
      "</div>" +
      "</div>" +
      '<div class="card-produto__details">' +
      '<div class="card-produto__row card-produto__row--total">' +
      "<span>" + escapeHtml(copy.totalLabel) + "</span>" +
      "<span>" + escapeHtml(total) + "</span>" +
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

  function renderProdutos(produtos) {
    var grid = document.getElementById("produtos-grid");
    if (!grid) return;

    if (!produtos.length) {
      grid.innerHTML =
        '<p class="produtos-vazio">Nenhum produto cadastrado no momento. Volte em breve!</p>';
      return;
    }

    grid.innerHTML = produtos.map(renderCardProduto).join("");
  }

  function carregarProdutos() {
    var grid = document.getElementById("produtos-grid");
    if (!grid) return Promise.resolve([]);

    return fetch(PRODUTOS_JSON_URL)
      .then(function (response) {
        if (!response.ok) throw new Error("Falha ao carregar produtos");
        return response.json();
      })
      .then(function (produtos) {
        return Array.isArray(produtos) ? produtos : [];
      })
      .catch(function () {
        grid.innerHTML =
          '<p class="produtos-vazio">Não foi possível carregar os produtos. Tente novamente mais tarde.</p>';
        return [];
      });
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
      escapeHtml(textoAnuncio.linha1) + "<br />" +
      escapeHtml(textoAnuncio.linha2) + "<br />" +
      escapeHtml(textoAnuncio.linha3) + "<br />" +
      escapeHtml(textoAnuncio.linha4) +
      "</p>";
  }

  function renderHeader() {
    var logoImg = document.getElementById("header-logo");
    if (!logoImg) return;

    logoImg.src = LOGO_SRC;
    logoImg.alt = "Top Achadinho";
  }

  function init() {
    try {
      // garante que não vai quebrar em branco
      if (typeof LOGO_SRC === "undefined") {
        var grid = document.getElementById("produtos-grid");
        if (grid) {
          grid.innerHTML =
            '<p class="produtos-vazio">Erro: LOGO_SRC não definido. Verifique js/data.js.</p>';
        }
        return;
      }

      // texto do anúncio (mesmo se textoAnuncio vier ausente)
      renderHeader();

      if (typeof textoAnuncio !== "undefined") {
        renderTextoAnuncio();
      } else {
        var el = document.getElementById("texto-anuncio");
        if (el) el.innerHTML = "<p>Bem-vindo ao Top Achadinhos 🛒</p>";
      }

      if (typeof socialLinks !== "undefined") {
        renderSocialLinks();
      }

      if (typeof cardStrings === "undefined") {
        var grid2 = document.getElementById("produtos-grid");
        if (grid2) {
          grid2.innerHTML =
            '<p class="produtos-vazio">Erro: cardStrings não definido. Verifique js/data.js.</p>';
        }
        return;
      }

      carregarProdutos().then(renderProdutos);
    } catch (err) {
      var grid = document.getElementById("produtos-grid");
      var anuncio = document.getElementById("texto-anuncio");
      var msg = err && err.message ? err.message : String(err);

      if (anuncio) {
        anuncio.innerHTML = '<p>Erro ao carregar página. ' + escapeHtml(msg) + "</p>";
      }
      if (grid) {
        grid.innerHTML =
          '<p class="produtos-vazio">Erro ao carregar produtos: ' + escapeHtml(msg) + "</p>";
      }

      try {
        console.error(err);
      } catch (e) {}
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();

