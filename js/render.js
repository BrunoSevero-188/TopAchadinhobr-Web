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

    var selo = desconto ? '<span class="card__selo">-' + desconto + "%</span>" : "";
    var antigo = TA.parsePreco(produto.precoAntigo);
    var novo = TA.parsePreco(produto.precoNovo);
    var de = !isNaN(antigo) && (isNaN(novo) || antigo > novo)
      ? '<span class="card__de">De: <s>' + esc(produto.precoAntigo) + "</s></span>"
      : "";
    var desc = produto.descricao ? '<p class="card__desc">' + esc(produto.descricao) + "</p>" : "";
    var validade = dias === 1 ? TA.textos.ofertaAteUm : TA.textos.ofertaAte.replace("{dias}", dias);

    var acao = href
      ? '<a class="btn btn--primario" href="' + esc(href) + '" target="_blank" rel="nofollow sponsored noopener noreferrer">' + esc(botaoTexto) + "</a>"
      : '<span class="btn btn--primario" aria-disabled="true">' + esc(botaoTexto) + "</span>";

    return (
      '<article class="card">' +
      '<div class="card__midia">' + selo + midiaHtml(produto, false) + "</div>" +
      '<div class="card__corpo">' +
      categoriasHtml(produto) +
      '<h3 class="card__titulo">' + esc(produto.titulo) + "</h3>" +
      desc +
      '<p class="card__preco">' + de +
      '<span class="card__por">Por: <strong>' + esc(produto.precoNovo || "") + "</strong></span></p>" +
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
})(window);
