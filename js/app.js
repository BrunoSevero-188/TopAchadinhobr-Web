(function () {
  "use strict";

  var todosProdutos = [];
  var buscaCategorias = "";
  var filtroCaixaAberta = false;

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

  function normalizeCategoria(categoriaBruta) {
    var bruta = String(categoriaBruta || "").trim();
    if (!bruta) return "Sem categoria";
    return bruta.charAt(0).toUpperCase() + bruta.slice(1);
  }

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

    var isIndisponivel = diasRestantes <= 0;
    
    var diasRestantesTexto = isIndisponivel
      ? "(" + (produto.titulo || "Este produto") + " não está mais em promoção)"
      : resolveRemainingText(copy.offerRemainingText, diasRestantes);

    var hasLink = produto.link && produto.link !== "#";
    var finalHref = isIndisponivel ? "#" : (hasLink ? produto.link : "#");
    var linkAttrs = isIndisponivel ? 'data-indisponivel="true"' : (hasLink ? 'target="_blank" rel="noreferrer"' : '');

    var seloIndisponivelHtml = isIndisponivel
      ? '<div class="absolute inset-0 flex items-center justify-center pointer-events-none z-20">' +
        '<span class="rotated-badge bg-black/80 text-white font-extrabold text-lg sm:text-xl tracking-wider uppercase px-5 py-2.5 rounded-xl shadow-2xl border border-white/20 text-center">' +
        'PRODUTO INDISPONÍVEL</span></div>'
      : '';

    var imagemHtml = produto.imagem
      ? '<div class="card-produto__image-wrap relative w-full flex items-center justify-center">' +
        '<img class="card-produto__image ' + (isIndisponivel ? 'opacity-60' : '') + '" src="' + escapeHtml(produto.imagem) + '" alt="' + escapeHtml(produto.titulo) + '" loading="lazy" />' +
        seloIndisponivelHtml +
        '</div>'
      : '<div class="card-produto__image-wrap card-produto__image--placeholder relative w-full flex items-center justify-center">' +
        '<span>Sem imagem</span>' +
        seloIndisponivelHtml +
        '</div>';

    var precoAntigoHtml = produto.precoAntigo
      ? "<small>" + escapeHtml(produto.precoAntigo) + "</small>"
      : "";

    var cardClasses = "card-produto" + (isIndisponivel ? " card-produto--indisponivel" : "");

    return (
      '<article class="' + cardClasses + '">' +
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
      escapeHtml(finalHref) +
      '" ' +
      linkAttrs +
      ' class="card-produto__button" aria-label="' +
      escapeHtml(copy.buttonAriaLabel) +
      '">' +
      (isIndisponivel ? "Indisponível" : escapeHtml(copy.buttonLabel)) +
      "</a>" +
      "</article>"
    );
  }

  function renderProdutos(produtos) {
    var grid = document.getElementById("produtos-grid");
    if (!grid) return;

    if (!produtos.length) {
      var mensagem = !buscaCategorias.trim()
        ? "Nenhum produto cadastrado no momento. Volte em breve!"
        : "Nenhum produto encontrado para essas categorias.";
      grid.innerHTML = '<p class="produtos-vazio">' + escapeHtml(mensagem) + "</p>";
      return;
    }

    grid.innerHTML = produtos.map(renderCardProduto).join("");
  }

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
    var termos = parseTermosBusca(buscaCategorias);
    if (!termos.length) return produtos;

    return produtos.filter(function (produto) {
      var categoriasProduto = getCategoriasProduto(produto).map(function (categoria) {
        return categoria.toLowerCase();
      });
      return termos.some(function (termo) {
        return categoriasProduto.some(function (categoria) {
          return categoria.indexOf(termo) !== -1;
        });
      });
    });
  }

  // "roupa, camiseta nike" -> ["roupa", "camiseta nike"]
  function parseTermosBusca(texto) {
    return String(texto || "")
      .split(",")
      .map(function (termo) {
        return termo.trim().toLowerCase();
      })
      .filter(function (termo) {
        return termo.length > 0;
      });
  }

  function renderFiltroBotaoTodos(total, ativo) {
    return (
      '<button type="button" class="filtro-categorias__item' +
      (ativo ? " filtro-categorias__item--ativo" : "") +
      '" data-categoria="todas" aria-pressed="' +
      (ativo ? "true" : "false") +
      '">' +
      "Todos" +
      ' <span class="filtro-categorias__contagem">' +
      total +
      "</span>" +
      "</button>"
    );
  }

  function limparFiltro() {
    buscaCategorias = "";
    filtroCaixaAberta = false;
    renderFiltroCategorias(todosProdutos);
    renderProdutos(filtrarProdutosPorCategoria(todosProdutos));
  }

  function alternarCaixaFiltro() {
    filtroCaixaAberta = !filtroCaixaAberta;
    renderFiltroCategorias(todosProdutos);
    var input = document.getElementById("filtro-categorias-input");
    if (filtroCaixaAberta && input) input.focus();
  }

  function aoDigitarBusca(evento) {
    buscaCategorias = evento.target.value;
    renderProdutos(filtrarProdutosPorCategoria(todosProdutos));

    // Só atualiza o estado do botão "Todos" na hora — evita redesenhar
    // a caixa inteira a cada tecla, o que tiraria o foco do input.
    var botaoTodos = document.querySelector('[data-categoria="todas"]');
    if (botaoTodos) {
      var todosAtivo = !buscaCategorias.trim();
      botaoTodos.classList.toggle("filtro-categorias__item--ativo", todosAtivo);
      botaoTodos.setAttribute("aria-pressed", todosAtivo ? "true" : "false");
    }
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

    var todosAtivo = !buscaCategorias.trim();

    var datalistOptions = categoriasOrdenadas
      .map(function (label) {
        return (
          '<option value="' +
          escapeHtml(label) +
          '" label="' +
          escapeHtml(label) +
          " (" +
          contagemPorCategoria[label] +
          ')"></option>'
        );
      })
      .join("");

    container.innerHTML =
      '<div class="filtro-categorias__barra">' +
      renderFiltroBotaoTodos(produtos.length, todosAtivo) +
      '<button type="button" id="filtro-categorias-toggle" class="filtro-categorias__toggle' +
      (filtroCaixaAberta ? " filtro-categorias__toggle--ativo" : "") +
      '" aria-expanded="' +
      (filtroCaixaAberta ? "true" : "false") +
      '" aria-controls="filtro-categorias-caixa">' +
      "Filtrar categorias" +
      "</button>" +
      "</div>" +
      '<div id="filtro-categorias-caixa" class="filtro-categorias__caixa' +
      (filtroCaixaAberta ? "" : " filtro-categorias__caixa--oculta") +
      '">' +
      '<input type="text" id="filtro-categorias-input" class="filtro-categorias__input" list="filtro-categorias-lista" placeholder="Digite categorias, separadas por vírgula (ex: Roupa, Camiseta)" aria-label="Digite categorias para filtrar" value="' +
      escapeHtml(buscaCategorias) +
      '" />' +
      '<datalist id="filtro-categorias-lista">' +
      datalistOptions +
      "</datalist>" +
      "</div>";

    var botaoTodos = container.querySelector('[data-categoria="todas"]');
    if (botaoTodos) botaoTodos.addEventListener("click", limparFiltro);

    var botaoToggle = document.getElementById("filtro-categorias-toggle");
    if (botaoToggle) botaoToggle.addEventListener("click", alternarCaixaFiltro);

    var inputBusca = document.getElementById("filtro-categorias-input");
    if (inputBusca) inputBusca.addEventListener("input", aoDigitarBusca);
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
        buscaCategorias = "";
        filtroCaixaAberta = false;
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

  function mostrarAvisoIndisponivel() {
 
   var alertaAntigo = document.getElementById('toast-indisponivel');
    if (alertaAntigo) {
      alertaAntigo.remove();
    }

    var toast = document.createElement('div');
    toast.id = 'toast-indisponivel';
    toast.className = 'fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white px-6 py-3 rounded-xl shadow-2xl border border-red-500/40 text-sm font-medium z-50 flex items-center gap-3 transition-all duration-300 animate-bounce-short';
    toast.innerHTML = '<span class="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping"></span> Produto Indisponível - Esta promoção já foi encerrada.';

    document.body.appendChild(toast);

    setTimeout(function () {
      if (toast && toast.parentNode) {
        toast.style.opacity = '0';
        setTimeout(function() {
          toast.remove();
        }, 300);
      }
    }, 10000);
  }

  document.addEventListener('click', function (event) {
    var targetLink = event.target.closest('a[data-indisponivel="true"]');
    if (targetLink) {
      event.preventDefault(); 

      if (targetLink.getAttribute('data-active-alert') === 'true') return;
      targetLink.setAttribute('data-active-alert', 'true');

      var htmlOriginal = targetLink.innerHTML;

      targetLink.className = 'card-produto__button flex items-center justify-center gap-2 px-3 py-3 rounded-xl shadow-lg text-white font-bold text-xs sm:text-sm text-center transition-all duration-300 cursor-default';
      targetLink.style.background = 'linear-gradient(90deg, #ff331e 0%, #ff8c3b 50%, #ffd043 100%)';
      
      targetLink.innerHTML = `
        <div class="flex items-center justify-center w-7 h-7 rounded-full bg-red-600 border-2 border-white flex-shrink-0 shadow-md">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <span class="leading-tight tracking-wide text-left text-black font-extrabold drop-shadow-[0_1px_1px_rgba(255,255,255,0.6)]">Produto Indisponível - Esta promoção já foi encerrada.</span>
      `;

      setTimeout(function () {
        targetLink.innerHTML = htmlOriginal;
        targetLink.className = 'card-produto__button';
        targetLink.style.background = '';
        targetLink.removeAttribute('data-active-alert');
      }, 10000);
    }
  });
})();