/* Top Achadinho BR — Estado e regras de filtro/ordenação */
(function (global) {
  "use strict";

  var TA = global.TA;

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

  // Destaques: só ofertas ativas; prioriza "destaque: true", depois maior desconto (máx. 4)
  TA.selecionarDestaques = function (lista) {
    var ativos = lista.filter(function (p) { return !TA.isIndisponivel(p); });
    var marcados = ativos.filter(function (p) { return p.destaque === true; });
    var base = marcados.length ? marcados : ativos.slice().sort(function (a, b) { return TA.getDesconto(b) - TA.getDesconto(a); });
    return base.slice(0, 4);
  };
})(window);
