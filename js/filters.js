/* Top Achadinho BR — Estado e regras de filtro/ordenação */
(function (global) {
  "use strict";

  var TA = global.TA;

  // Seção "Explore por categoria": só as categorias mais relevantes
  var CATEGORIAS_MIN_PRODUTOS = 2;  // categoria com 1 produto só não vira card
  var CATEGORIAS_MAX = 12;
  // Vitrine (carrossel de produtos) por categoria
  var VITRINE_MIN_PRODUTOS = 5;     // a partir de quantos produtos a categoria ganha carrossel
  var VITRINE_MAX_CATEGORIAS = 4;   // limite de carrosséis, para não esticar a página
  var VITRINE_MAX_PRODUTOS = 12;    // produtos por carrossel

  TA.estado = { busca: "", categoria: "todas", soOfertas: false };

  // "perfume, natura" -> ["perfume", "natura"]
  function termos(texto) {
    return String(texto || "")
      .split(",")
      .map(function (t) { return t.trim().toLowerCase(); })
      .filter(Boolean);
  }

  // Disponíveis primeiro; dentro de cada grupo mantém a ordem do JSON
  TA.ordenar = function (lista) {
    var ativos = lista.filter(function (p) { return !TA.isIndisponivel(p); });
    var encerrados = lista.filter(TA.isIndisponivel);
    return ativos.concat(encerrados);
  };

  TA.filtrar = function (lista) {
    var e = TA.estado;
    var ts = termos(e.busca);

    return TA.ordenar(lista).filter(function (p) {
      if (e.categoria !== "todas" && TA.getCategorias(p).indexOf(e.categoria) === -1) return false;
      if (e.soOfertas && (TA.isIndisponivel(p) || TA.getDesconto(p) <= 0)) return false;
      if (!ts.length) return true;

      var alvo = (p.titulo + " " + (p.descricao || "") + " " + TA.getCategorias(p).join(" ")).toLowerCase();
      return ts.some(function (t) { return alvo.indexOf(t) !== -1; });
    });
  };

  TA.contarCategorias = function (lista) {
    var contagem = {};
    lista.forEach(function (p) {
      TA.getCategorias(p).forEach(function (c) { contagem[c] = (contagem[c] || 0) + 1; });
    });
    var nomes = Object.keys(contagem).sort(function (a, b) {
      return a.localeCompare(b, "pt-BR", { numeric: true, sensitivity: "base" });
    });
    return { nomes: nomes, contagem: contagem };
  };

  // Mais produtos primeiro; empate por ordem alfabética. Ignora "Sem categoria"
  function porRelevancia(info) {
    return info.nomes
      .filter(function (n) { return n !== TA.textos.semCategoria; })
      .sort(function (a, b) {
        return info.contagem[b] - info.contagem[a] ||
          a.localeCompare(b, "pt-BR", { numeric: true, sensitivity: "base" });
      });
  }

  // Categorias exibidas no carrossel de "Explore por categoria"
  TA.selecionarCategorias = function (info) {
    var todas = porRelevancia(info);
    var fortes = todas.filter(function (n) { return info.contagem[n] >= CATEGORIAS_MIN_PRODUTOS; });
    return (fortes.length ? fortes : todas).slice(0, CATEGORIAS_MAX);
  };

  // Categorias com produtos suficientes para ter um carrossel próprio
  TA.selecionarVitrines = function (info) {
    return porRelevancia(info)
      .filter(function (n) { return info.contagem[n] >= VITRINE_MIN_PRODUTOS; })
      .slice(0, VITRINE_MAX_CATEGORIAS);
  };

  // Produtos de uma categoria (disponíveis primeiro), limitados ao tamanho do carrossel
  TA.produtosDaCategoria = function (lista, nome) {
    var da = lista.filter(function (p) { return TA.getCategorias(p).indexOf(nome) !== -1; });
    return TA.ordenar(da).slice(0, VITRINE_MAX_PRODUTOS);
  };

  // Destaques: só ofertas ativas; prioriza "destaque: true", depois maior desconto (máx. 12, usados no carrossel)
  TA.selecionarDestaques = function (lista) {
    var ativos = lista.filter(function (p) { return !TA.isIndisponivel(p); });
    var marcados = ativos.filter(function (p) { return p.destaque === true; });
    var base = marcados.length ? marcados : ativos.slice().sort(function (a, b) { return TA.getDesconto(b) - TA.getDesconto(a); });
    return base.slice(0, 12);
  };

  // "Menos de R$ X": ofertas ativas com preço atual até o limite, maior desconto primeiro
  TA.selecionarAteValor = function (lista, limite, max) {
    return lista
      .filter(function (p) {
        var preco = TA.parsePreco(p.precoNovo);
        return !TA.isIndisponivel(p) && !isNaN(preco) && preco > 0 && preco <= limite;
      })
      .sort(function (a, b) { return TA.getDesconto(b) - TA.getDesconto(a); })
      .slice(0, max || 12);
  };
})(window);
