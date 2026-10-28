/* Top Achadinho BR — Carrossel horizontal (scroll-snap + setas), no estilo das vitrines do Mercado Livre */
(function (global) {
  "use strict";

  var TA = global.TA;

  function atualizar(raiz) {
    var trilho = raiz.querySelector(".carrossel__trilho");
    var prev = raiz.querySelector(".carrossel__seta--prev");
    var next = raiz.querySelector(".carrossel__seta--next");
    if (!trilho || !prev || !next) return;

    var max = trilho.scrollWidth - trilho.clientWidth;
    var temRolagem = max > 4;
    prev.hidden = !temRolagem || trilho.scrollLeft <= 4;
    next.hidden = !temRolagem || trilho.scrollLeft >= max - 4;
  }

  function rolar(raiz, direcao) {
    var trilho = raiz.querySelector(".carrossel__trilho");
    if (!trilho) return;
    var reduzido = global.matchMedia && global.matchMedia("(prefers-reduced-motion: reduce)").matches;
    trilho.scrollBy({
      left: direcao * trilho.clientWidth * 0.85,
      behavior: reduzido ? "auto" : "smooth",
    });
  }

  TA.atualizarCarrosseis = function () {
    document.querySelectorAll("[data-carrossel]").forEach(atualizar);
  };

  var globaisLigados = false;

  // Pode ser chamada de novo: só liga os carrosséis que ainda não foram ligados
  TA.iniciarCarrosseis = function () {
    document.querySelectorAll("[data-carrossel]").forEach(function (raiz) {
      if (raiz.getAttribute("data-carrossel-pronto")) return;
      raiz.setAttribute("data-carrossel-pronto", "1");
      var trilho = raiz.querySelector(".carrossel__trilho");
      raiz.querySelector(".carrossel__seta--prev").addEventListener("click", function () { rolar(raiz, -1); });
      raiz.querySelector(".carrossel__seta--next").addEventListener("click", function () { rolar(raiz, 1); });
      trilho.addEventListener("scroll", function () { atualizar(raiz); }, { passive: true });
      // Setas do teclado quando o trilho está focado
      trilho.addEventListener("keydown", function (e) {
        if (e.key === "ArrowRight") { e.preventDefault(); rolar(raiz, 1); }
        if (e.key === "ArrowLeft") { e.preventDefault(); rolar(raiz, -1); }
      });
      atualizar(raiz);
    });
    if (globaisLigados) return;
    globaisLigados = true;
    global.addEventListener("resize", TA.atualizarCarrosseis);
    // Imagens carregando mudam a largura útil; reavalia as setas
    global.addEventListener("load", TA.atualizarCarrosseis);
  };
})(window);
