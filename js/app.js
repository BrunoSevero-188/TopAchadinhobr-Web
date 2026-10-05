/* Top Achadinho BR — Orquestração: carrega dados e liga filtros às seções */
(function (global) {
  "use strict";

  var TA = global.TA;
  var produtos = [];

  function el(id) { return document.getElementById(id); }

  function renderDestaques() {
    var grid = el("destaques-grid");
    if (!grid) return;
    var lista = TA.selecionarDestaques(produtos);
    grid.innerHTML = lista.length
      ? TA.renderCards(lista)
      : TA.renderVazio(
          "Nenhuma oferta ativa no momento",
          "Estamos preparando os próximos achadinhos. Entre no grupo do WhatsApp para ser avisado.",
          true
        );
  }

  function renderCategorias() {
    var info = TA.contarCategorias(produtos);
    var grid = el("categorias-grid");
    if (grid) {
      grid.innerHTML = info.nomes.length
        ? TA.renderCategoriasCards(info.nomes, info.contagem)
        : TA.renderVazio("Categorias em breve", "Elas aparecem aqui assim que os primeiros produtos forem publicados.", false);
    }
    var chips = el("filtro-categorias");
    if (chips) chips.innerHTML = info.nomes.length ? TA.renderChips(info.nomes, info.contagem, produtos.length, TA.estado.categoria) : "";
  }

  function renderLista() {
    var grid = el("produtos-grid");
    var status = el("produtos-status");
    if (!grid) return;

    var lista = TA.filtrar(produtos);
    if (!produtos.length) {
      grid.innerHTML = TA.renderVazio("Nenhum produto cadastrado no momento", "Volte em breve!", false);
    } else if (!lista.length) {
      grid.innerHTML = TA.renderVazio("Nada encontrado", "Tente outra palavra ou limpe os filtros.", false);
    } else {
      grid.innerHTML = TA.renderCards(lista);
    }
    if (status) {
      status.textContent = produtos.length ? lista.length + (lista.length === 1 ? " achadinho" : " achadinhos") : "";
    }

    // Atualiza o estado visual dos chips sem recriá-los
    document.querySelectorAll("#filtro-categorias .chip").forEach(function (c) {
      c.setAttribute("aria-pressed", String(c.getAttribute("data-categoria") === TA.estado.categoria));
    });
  }

  function escolherCategoria(valor, rolar) {
    TA.estado.categoria = valor;
    renderLista();
    if (rolar) TA.rolarPara("novidades");
  }

  function ligarEventos() {
    var form = el("form-busca");
    var busca = el("busca");
    var soOfertas = el("so-ofertas");

    if (busca) {
      busca.addEventListener("input", function () {
        TA.estado.busca = busca.value;
        renderLista();
      });
    }
    if (form) {
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        TA.estado.busca = busca ? busca.value : "";
        renderLista();
        if (TA.fecharMenu) TA.fecharMenu();
        TA.rolarPara("novidades");
      });
    }
    if (soOfertas) {
      soOfertas.addEventListener("change", function () {
        TA.estado.soOfertas = soOfertas.checked;
        renderLista();
      });
    }

    var chips = el("filtro-categorias");
    if (chips) {
      chips.addEventListener("click", function (e) {
        var b = e.target.closest("[data-categoria]");
        if (b) escolherCategoria(b.getAttribute("data-categoria"), false);
      });
    }
    var cards = el("categorias-grid");
    if (cards) {
      cards.addEventListener("click", function (e) {
        var b = e.target.closest("[data-categoria]");
        if (b) escolherCategoria(b.getAttribute("data-categoria"), true);
      });
    }
  }

  function erroCarregamento() {
    var msg = TA.renderVazio("Não foi possível carregar os produtos", "Tente novamente mais tarde.", false);
    ["destaques-grid", "produtos-grid"].forEach(function (id) {
      var g = el(id);
      if (g) g.innerHTML = msg;
    });
  }

  function init() {
    TA.atualizarAno();
    TA.iniciarMenu();
    TA.iniciarHeaderScroll();
    TA.iniciarFallbackImagens();
    ligarEventos();

    TA.carregarProdutos()
      .then(function (lista) {
        produtos = lista;
        renderDestaques();
        renderCategorias();
        renderLista();
      })
      .catch(erroCarregamento);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})(window);
