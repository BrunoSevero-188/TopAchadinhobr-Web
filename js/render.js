/* Top Achadinho BR — Renderização (somente gera HTML, sem estado) */
(function (global) {
  "use strict";

  var TA = global.TA;

  var ICONE_SACOLA =
    '<svg class="card__sacola" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path fill-rule="evenodd" d="M7.5 6v.75H5.513c-.96 0-1.764.724-1.853 1.684l-.57 6.161c-.101 1.092.766 2.055 1.862 2.055h14.106c1.096 0 1.963-.963 1.862-2.055l-.57-6.161c-.09-.96-.893-1.684-1.853-1.684H16.5V6a4.5 4.5 0 1 0-9 0Zm9 0V6a3 3 0 1 0-6 0v.75h6ZM3.513 8.684A.75.75 0 0 1 4.266 8h15.468a.75.75 0 0 1 .753.684l.57 6.161a.75.75 0 0 1-.726.815H4.02a.75.75 0 0 1-.726-.815l.57-6.161Z" clip-rule="evenodd"/></svg>';

  var ICONE_TAG =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20.5 13 13 20.5a2 2 0 0 1-2.8 0L3.5 13.8V3.5h10.3L20.5 10a2 2 0 0 1 0 3z"/><circle cx="8" cy="8" r="1.3"/></svg>';

  function esc(texto) {
    return String(texto)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }
  TA.esc = esc;

  // 254.53 -> { inteiro: "254", centavos: "53" } (milhar com ponto, centavos sobrescritos)
  function partesPreco(valor) {
    var fixo = valor.toFixed(2).split(".");
    return { inteiro: fixo[0].replace(/\B(?=(\d{3})+(?!\d))/g, "."), centavos: fixo[1] };
  }

  function precoAtualHtml(produto, desconto) {
    var novo = TA.parsePreco(produto.precoNovo);
    var off = desconto ? '<span class="card__off">' + desconto + "% OFF</span>" : "";
    if (isNaN(novo)) {
      return '<span class="card__atual"><span class="card__atual-texto">' + esc(produto.precoNovo || "") + "</span>" + off + "</span>";
    }
    var p = partesPreco(novo);
    return (
      '<span class="card__atual" aria-label="Por ' + esc(produto.precoNovo) + '">' +
      '<span class="card__moeda" aria-hidden="true">R$</span>' +
      '<span class="card__inteiro" aria-hidden="true">' + p.inteiro + "</span>" +
      (p.centavos !== "00" ? '<sup class="card__centavos" aria-hidden="true">' + p.centavos + "</sup>" : "") +
      off + "</span>"
    );
  }

  function categoriasHtml(produto) {
    return (
      '<div class="card__categorias">' +
      TA.getCategorias(produto)
        .map(function (c) {
          return '<span class="card__categoria">' + esc(c) + "</span>";
        })
        .join("") +
      "</div>"
    );
  }

  function midiaHtml(produto, indisponivel) {
    var src = TA.urlSegura(produto.imagem);
    var img = src
      ? '<img class="card__img" src="' + esc(src) + '" alt="' + (indisponivel ? "" : esc(produto.titulo)) + '" loading="lazy" decoding="async" />'
      : indisponivel
        ? ICONE_SACOLA
        : '<span class="card__sem-img">Sem imagem</span>';
    return img;
  }

  function cardDisponivel(produto) {
    var desconto = TA.getDesconto(produto);
    var dias = TA.getDiasRestantes(produto);
    var href = TA.urlSegura(produto.link);
    var botaoTexto = produto.textoBotao || TA.textos.botaoPadrao;

    var antigo = TA.parsePreco(produto.precoAntigo);
    var novo = TA.parsePreco(produto.precoNovo);
    var de = !isNaN(antigo) && (isNaN(novo) || antigo > novo)
      ? '<s class="card__de">' + esc(produto.precoAntigo) + "</s>"
      : "";
    var desc = produto.descricao ? '<p class="card__desc">' + esc(produto.descricao) + "</p>" : "";
    var validade = dias === 1 ? TA.textos.ofertaAteUm : TA.textos.ofertaAte.replace("{dias}", dias);

    var acao = href
      ? '<a class="btn btn--primario" href="' + esc(href) + '" target="_blank" rel="nofollow sponsored noopener noreferrer">' + esc(botaoTexto) + "</a>"
      : '<span class="btn btn--primario" aria-disabled="true">' + esc(botaoTexto) + "</span>";

    return (
      '<article class="card">' +
      '<div class="card__midia">' + midiaHtml(produto, false) + "</div>" +
      '<div class="card__corpo">' +
      categoriasHtml(produto) +
      '<h3 class="card__titulo">' + esc(produto.titulo) + "</h3>" +
      desc +
      '<p class="card__preco">' + de + precoAtualHtml(produto, desconto) + "</p>" +
      '<p class="card__validade">' + esc(validade) + "</p>" +
      "</div>" +
      '<div class="card__acao">' + acao + "</div>" +
      "</article>"
    );
  }

  // Modelo "indisponível": card escuro, área cinza, sacola e selo rotacionado
  function cardIndisponivel(produto) {
    var t = TA.textos;
    var fimTexto = String(produto.dataFim || "").split("-").reverse().join("/");
    if (!/^\d{2}\/\d{2}\/\d{4}$/.test(fimTexto)) fimTexto = "";
    return (
      '<article class="card card--indisponivel" aria-label="' + esc(produto.titulo) + " — " + esc(t.seloIndisponivel) + '">' +
      '<div class="card__topo"><h3 class="card__topo-titulo">' + esc(t.topoIndisponivel) + "</h3>" +
      '<span class="card__tag">' + esc(t.tagIndisponivel) + "</span></div>" +
      '<div class="card__vitrine">' +
      '<div class="card__midia">' + midiaHtml(produto, true) +
      '<span class="card__selo-indisp">' + esc(t.seloIndisponivel) + "</span></div>" +
      '<div class="card__status"><span>' + esc(t.statusIndisponivel) + "</span>" + (fimTexto ? "<span>Fim: " + esc(fimTexto) + "</span>" : "") + "</div>" +
      "</div>" +
      '<div class="card__corpo">' + categoriasHtml(produto) +
      '<h3 class="card__titulo">' + esc(produto.titulo) + "</h3></div>" +
      '<div class="card__acao"><button class="btn" type="button" disabled aria-disabled="true">' + esc(t.botaoIndisponivel) + "</button></div>" +
      "</article>"
    );
  }

  // Fallback quando a imagem do produto não carrega
  TA.fallbackImagem = function (img) {
    var card = img.closest(".card");
    var indisp = card && card.classList.contains("card--indisponivel");
    var wrap = document.createElement("div");
    wrap.innerHTML = indisp ? ICONE_SACOLA : '<span class="card__sem-img">Sem imagem</span>';
    img.replaceWith(wrap.firstChild);
  };

  TA.renderCard = function (produto) {
    return TA.isIndisponivel(produto) ? cardIndisponivel(produto) : cardDisponivel(produto);
  };

  TA.renderCards = function (lista) {
    return lista.map(TA.renderCard).join("");
  };

  TA.renderVazio = function (titulo, texto, comBotao) {
    return (
      '<div class="vazio"><strong>' + esc(titulo) + "</strong>" + esc(texto) +
      (comBotao
        ? '<br /><a class="btn btn--primario" href="#whatsapp">Receber avisos no WhatsApp</a>'
        : "") +
      "</div>"
    );
  };

  TA.renderChips = function (categorias, contagem, total, ativa) {
    var chip = function (valor, label, qtd) {
      return (
        '<button type="button" class="chip" data-categoria="' + esc(valor) + '" aria-pressed="' + (ativa === valor) + '">' +
        esc(label) + '<span class="chip__qtd">' + qtd + "</span></button>"
      );
    };
    return (
      chip("todas", "Todos", total) +
      categorias.map(function (c) { return chip(c, c, contagem[c]); }).join("")
    );
  };

  TA.renderCategoriasCards = function (categorias, contagem) {
    return categorias
      .map(function (c) {
        var n = contagem[c];
        return (
          '<button type="button" class="categoria-card" data-categoria="' + esc(c) + '">' +
          '<span class="categoria-card__icone">' + ICONE_TAG + "</span>" +
          '<span><span class="categoria-card__nome">' + esc(c) + "</span>" +
          '<span class="categoria-card__qtd">' + n + (n === 1 ? " achadinho" : " achadinhos") + "</span></span></button>"
        );
      })
      .join("");
  };

  var SETA_ESQ =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m15 5-7 7 7 7" /></svg>';
  var SETA_DIR =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m9 5 7 7-7 7" /></svg>';

  var SETA_VER =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>';

  // Carrossel de produtos de uma categoria (título, "Ver todos" e o mesmo carrossel padrão do "Menos de R$ 100")
  TA.renderVitrine = function (nome, total, lista) {
    var restantes = total - lista.length;
    var cartaoMais = restantes > 0
      ? '<button type="button" class="vitrine__mais" data-categoria="' + esc(nome) + '">' +
        '<span class="vitrine__mais-icone">' + SETA_VER + "</span>" +
        "<strong>Ver todos</strong><span>+ " + restantes + (restantes === 1 ? " achadinho" : " achadinhos") + "</span></button>"
      : "";
    return (
      '<div class="vitrine">' +
      '<div class="vitrine__cab"><h3 class="vitrine__titulo"><span class="vitrine__nome">' + esc(nome) + "</span>" +
      '<span class="vitrine__qtd">' + total + (total === 1 ? " achadinho" : " achadinhos") + "</span></h3>" +
      '<button type="button" class="btn btn--contorno btn--sm vitrine__ver" data-categoria="' + esc(nome) + '">Ver todos' + SETA_VER + "</button></div>" +
      '<div class="carrossel" data-carrossel>' +
      '<button class="carrossel__seta carrossel__seta--prev" type="button" aria-label="Produtos anteriores de ' + esc(nome) + '" hidden>' + SETA_ESQ + "</button>" +
      '<div class="carrossel__trilho" role="region" aria-label="Achadinhos de ' + esc(nome) + '" tabindex="0">' +
      TA.renderCards(lista) + cartaoMais + "</div>" +
      '<button class="carrossel__seta carrossel__seta--next" type="button" aria-label="Próximos produtos de ' + esc(nome) + '" hidden>' + SETA_DIR + "</button>" +
      "</div></div>"
    );
  };
})(window);
