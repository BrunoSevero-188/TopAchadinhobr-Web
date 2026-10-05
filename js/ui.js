/* Top Achadinho BR — Interações de interface (menu, header, ano) */
(function (global) {
  "use strict";

  var TA = global.TA;

  TA.iniciarMenu = function () {
    var botao = document.getElementById("menu-toggle");
    var painel = document.getElementById("menu");
    if (!botao || !painel) return;

    function definir(aberto) {
      painel.setAttribute("data-aberto", aberto ? "true" : "false");
      botao.setAttribute("aria-expanded", aberto ? "true" : "false");
      botao.setAttribute("aria-label", aberto ? "Fechar menu" : "Abrir menu");
    }

    botao.addEventListener("click", function () {
      definir(painel.getAttribute("data-aberto") !== "true");
    });
    painel.addEventListener("click", function (e) {
      if (e.target.closest("a")) definir(false);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && painel.getAttribute("data-aberto") === "true") {
        definir(false);
        botao.focus();
      }
    });
    document.addEventListener("click", function (e) {
      if (!e.target.closest(".header")) definir(false);
    });
    global.matchMedia("(min-width: 1180px)").addEventListener("change", function () { definir(false); });
    TA.fecharMenu = function () { definir(false); };
  };

  TA.iniciarHeaderScroll = function () {
    var header = document.querySelector(".header");
    if (!header) return;
    function aoRolar() { header.classList.toggle("header--rolou", global.scrollY > 4); }
    global.addEventListener("scroll", aoRolar, { passive: true });
    aoRolar();
  };

  TA.rolarPara = function (id) {
    var el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  TA.iniciarFallbackImagens = function () {
    // "error" não propaga: usa captura no document
    document.addEventListener("error", function (e) {
      if (e.target && e.target.tagName === "IMG" && e.target.classList.contains("card__img")) {
        TA.fallbackImagem(e.target);
      }
    }, true);
  };

  TA.atualizarAno = function () {
    var el = document.getElementById("ano-atual");
    if (el) el.textContent = new Date().getFullYear();
  };
})(window);
