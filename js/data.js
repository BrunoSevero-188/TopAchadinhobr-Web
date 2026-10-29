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

  // Primeiro dia de exibição = dataFim menos um mês, como número AAAAMMDD (inválido/ausente = NaN).
  // Ex.: "2026-12-03" -> 20261103. Se o mês anterior for mais curto, usa o último dia dele
  // (ex.: "2026-03-31" -> 20260228).
  TA.getInicioExibicao = function (produto) {
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String((produto && produto.dataFim) || "").trim());
    if (!m) return NaN;
    var ano = Number(m[1]);
    var mes = Number(m[2]) - 1;
    var dia = Number(m[3]);
    var conferida = new Date(ano, mes, dia);
    if (conferida.getFullYear() !== ano || conferida.getMonth() !== mes || conferida.getDate() !== dia) return NaN;
    var anoAlvo = mes === 0 ? ano - 1 : ano;
    var mesAlvo = mes === 0 ? 11 : mes - 1;
    var ultimoDia = new Date(anoAlvo, mesAlvo + 1, 0).getDate();
    return anoAlvo * 10000 + (mesAlvo + 1) * 100 + Math.min(dia, ultimoDia);
  };

  // Mostra o produto se a data local do navegador for >= dataFim menos um mês.
  // Sem dataFim válida não há como aplicar a regra: o produto segue o comportamento de sempre.
  TA.estaNoPeriodoDeExibicao = function (produto, agora) {
    var inicio = TA.getInicioExibicao(produto);
    if (isNaN(inicio)) return true;
    var hoje = agora || new Date();
    return hoje.getFullYear() * 10000 + (hoje.getMonth() + 1) * 100 + hoje.getDate() >= inicio;
  };

  // Produtos válidos que ainda não entraram no período de exibição (ficam fora do site)
  TA.produtosAgendados = [];

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

  // Busca um produto pelo campo "id" do catálogo (aceita 3 ou "3"); sem correspondência -> null
  TA.getProdutoPorId = function (produtos, id) {
    var alvo = /^\d+$/.test(String(id).trim()) ? Number(id) : NaN;
    if (isNaN(alvo)) return null;
    for (var i = 0; i < produtos.length; i++) {
      if (Number(produtos[i].id) === alvo) return produtos[i];
    }
    return null;
  };

  TA.carregarProdutos = function () {
    return fetch(TA.PRODUTOS_JSON_URL)
      .then(function (r) {
        if (!r.ok) throw new Error("Falha ao carregar produtos");
        return r.json();
      })
      .then(function (lista) {
        var validos = Array.isArray(lista) ? lista.filter(TA.ehProdutoValido) : [];
        var agora = new Date();
        TA.produtosAgendados = validos.filter(function (p) { return !TA.estaNoPeriodoDeExibicao(p, agora); });
        return validos.filter(function (p) { return TA.estaNoPeriodoDeExibicao(p, agora); });
      });
  };
})(window);
