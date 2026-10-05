/* Top Achadinho BR — Dados e modelo de produto
   Responsável por: configuração, textos dos cards, carregamento do JSON
   e regras de negócio (preço, desconto, prazo, categorias). */
(function (global) {
  "use strict";

  var TA = (global.TA = global.TA || {});

  TA.PRODUTOS_JSON_URL = "data/produtos.json";

  TA.textos = {
    ofertaAte: "Oferta até {dias} dias no site",
    ofertaAteUm: "Oferta até 1 dia no site",
    botaoPadrao: "Ver oferta",
    botaoIndisponivel: "Produto indisponível",
    seloIndisponivel: "Produto indisponível",
    topoIndisponivel: "Oferta Achadinho",
    tagIndisponivel: "Oferta encerrada",
    statusIndisponivel: "Status: Esgotado",
    semCategoria: "Sem categoria",
  };

  var CHAVES_CATEGORIA = ["categoria01", "categoria02", "categoria03", "categoria04", "categoria05"];

  // "R$ 104,56" -> 104.56  |  vazio/inválido -> NaN
  TA.parsePreco = function (texto) {
    var limpo = String(texto || "")
      .replace(/[^\d,.-]/g, "")
      .replace(/\.(?=\d{3}(\D|$))/g, "")
      .replace(",", ".");
    return limpo ? parseFloat(limpo) : NaN;
  };

  // Usa o campo "desconto" se existir; senão calcula entre precoAntigo e precoNovo.
  TA.getDesconto = function (produto) {
    var manual = String((produto && produto.desconto) || "").replace(/[^\d]/g, "");
    if (manual) return parseInt(manual, 10);
    var antigo = TA.parsePreco(produto.precoAntigo);
    var novo = TA.parsePreco(produto.precoNovo);
    if (isNaN(antigo) || isNaN(novo) || antigo <= 0 || novo >= antigo) return 0;
    return Math.round((1 - novo / antigo) * 100);
  };

  // Dias restantes pelo dataFim (preserva a regra original: sem data válida = encerrado)
  TA.getDiasRestantes = function (produto) {
    if (!produto || !produto.dataFim) return 0;
    var fim = new Date(produto.dataFim + "T23:59:59");
    var dias = Math.ceil((fim.getTime() - Date.now()) / 86400000);
    return isNaN(dias) ? 0 : dias;
  };

  TA.isIndisponivel = function (produto) {
    return TA.getDiasRestantes(produto) <= 0;
  };

  function normalizarCategoria(bruta) {
    var t = String(bruta || "").trim();
    return t ? t.charAt(0).toUpperCase() + t.slice(1) : "";
  }

  TA.getCategorias = function (produto) {
    var vistos = {};
    var lista = [];
    CHAVES_CATEGORIA.forEach(function (chave) {
      var label = normalizarCategoria(produto && produto[chave]);
      if (label && !vistos[label]) {
        vistos[label] = true;
        lista.push(label);
      }
    });
    if (!lista.length) lista.push(TA.textos.semCategoria);
    return lista;
  };

  TA.ehProdutoValido = function (produto) {
    return Boolean(produto && String(produto.titulo || "").trim());
  };

  // Aceita apenas http(s) ou caminho relativo
  TA.urlSegura = function (url) {
    var u = String(url || "").trim();
    if (!u || u === "#") return "";
    try {
      var p = new URL(u, global.location.href).protocol;
      return p === "http:" || p === "https:" ? u : "";
    } catch (e) {
      return "";
    }
  };

  TA.carregarProdutos = function () {
    return fetch(TA.PRODUTOS_JSON_URL)
      .then(function (r) {
        if (!r.ok) throw new Error("Falha ao carregar produtos");
        return r.json();
      })
      .then(function (lista) {
        return Array.isArray(lista) ? lista.filter(TA.ehProdutoValido) : [];
      });
  };
})(window);
