(function () {
  "use strict";

  var todosProdutos = [];
  var categoriaAtiva = "todas";

  function escapeHtml(text) {
    return String(text)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function resolveRemainingText(template, diasRestantes) {
    return template.replace("{dias}", String(diasRestantes));
  }

  // Normaliza o valor bruto de uma categoria para um rótulo de exibição.
  function normalizeCategoria(categoriaBruta) {
    var bruta = String(categoriaBruta || "").trim();
    if (!bruta) return "Sem categoria";
    return bruta.charAt(0).toUpperCase() + bruta.slice(1);
  }

  // Um produto pode ter de 1 a 5 categorias: categoria01..categoria03 são
  // as principais, categoria04 e categoria05 são opcionais (ficam "" quando
  // não usadas). Retorna a lista de rótulos únicos e já normalizados.
  function getCategoriasProduto(produto) {
    var chaves = ["categoria01", "categoria02", "categoria03", "categoria04", "categoria05"];
    var vistos = {};
    var categorias = [];

    chaves.forEach(function (chave) {
      var bruta = String((produto && produto[chave]) || "").trim();
      if (!bruta) return; // categoria04/05 opcionais — pula se vazia

      var label = normalizeCategoria(bruta);
      if (!vistos[label]) {
        vistos[label] = true;
        categorias.push(label);
      }
    });

    if (!categorias.length) categorias.push("Sem categoria");
    return categorias;
  }

  // Um produto "vazio" (slot de template ainda não preenchido pelo
  // scraper) não tem título nem link — não deve virar card nem entrar
  // na contagem de categorias.
  function ehProdutoValido(produto) {
    return Boolean(produto && String(produto.titulo || "").trim());
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

    var categoriasProduto = getCategoriasProduto(produto);
    var categoriasHtml = categoriasProduto
      .map(function (categoria) {
        return '<span class="card-produto__categoria-tag">' + escapeHtml(categoria) + "</span>";
      })
      .join("");

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
      '<div class="card-produto__categorias">' +
      categoriasHtml +
      "</div>" +
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
      var mensagem =
        categoriaAtiva === "todas"
          ? "Nenhum produto cadastrado no momento. Volte em breve!"
          : "Nenhum produto encontrado nesta categoria.";
      grid.innerHTML = '<p class="produtos-vazio">' + escapeHtml(mensagem) + "</p>";
      return;
    }

    grid.innerHTML = produtos.map(renderCardProduto).join("");
  }

  // ---------------------------------------------------------------------
  // Filtro de categorias
  // ---------------------------------------------------------------------

  function coletarCategorias(produtos) {
    var contagemPorCategoria = {};
    produtos.forEach(function (produto) {
      getCategoriasProduto(produto).forEach(function (label) {
        contagemPorCategoria[label] = (contagemPorCategoria[label] || 0) + 1;
      });
    });
    return contagemPorCategoria;
  }

  function filtrarProdutosPorCategoria(produtos) {
    if (categoriaAtiva === "todas") return produtos;
    return produtos.filter(function (produto) {
      return getCategoriasProduto(produto).indexOf(categoriaAtiva) !== -1;
    });
  }

  function renderFiltroBotao(chave, label, contagem, ativo) {
    return (
      '<button type="button" class="filtro-categorias__item' +
      (ativo ? " filtro-categorias__item--ativo" : "") +
      '" data-categoria="' +
      escapeHtml(chave) +
      '" aria-pressed="' +
      (ativo ? "true" : "false") +
      '">' +
      escapeHtml(label) +
      ' <span class="filtro-categorias__contagem">' +
      contagem +
      "</span>" +
      "</button>"
    );
  }

  function aplicarFiltro(novaCategoria) {
    categoriaAtiva = novaCategoria;
    renderFiltroCategorias(todosProdutos);
    renderProdutos(filtrarProdutosPorCategoria(todosProdutos));
  }

  function renderFiltroCategorias(produtos) {
    var container = document.getElementById("filtro-categorias");
    if (!container) return;

    if (!produtos.length) {
      container.innerHTML = "";
      return;
    }

    var contagemPorCategoria = coletarCategorias(produtos);
    var categoriasOrdenadas = Object.keys(contagemPorCategoria).sort(function (a, b) {
      return a.localeCompare(b, "pt-BR", { numeric: true, sensitivity: "base" });
    });

    var botoes = [
      renderFiltroBotao("todas", "Todos", produtos.length, categoriaAtiva === "todas"),
    ];

    categoriasOrdenadas.forEach(function (label) {
      botoes.push(
        renderFiltroBotao(label, label, contagemPorCategoria[label], categoriaAtiva === label)
      );
    });

    container.innerHTML = botoes.join("");

    var itens = container.querySelectorAll("[data-categoria]");
    for (var i = 0; i < itens.length; i++) {
      itens[i].addEventListener("click", function (evento) {
        aplicarFiltro(evento.currentTarget.getAttribute("data-categoria"));
      });
    }
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
        return Array.isArray(produtos) ? produtos.filter(ehProdutoValido) : [];
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

      carregarProdutos().then(function (produtos) {
        todosProdutos = produtos;
        categoriaAtiva = "todas";
        renderFiltroCategorias(todosProdutos);
        renderProdutos(filtrarProdutosPorCategoria(todosProdutos));
      });
    } catch (err) {
      var gridErro = document.getElementById("produtos-grid");
      var anuncio = document.getElementById("texto-anuncio");
      var msg = err && err.message ? err.message : String(err);

      if (anuncio) {
        anuncio.innerHTML = "<p>Erro ao carregar página. " + escapeHtml(msg) + "</p>";
      }
      if (gridErro) {
        gridErro.innerHTML =
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
