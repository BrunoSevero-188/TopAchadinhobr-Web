/* Top Achadinho BR — Tema automático por horário local do dispositivo */
(function (global, document) {
  "use strict";

  var TEMA_CLARO = "claro";
  var TEMA_ESCURO = "escuro";
  var HORA_INICIO_CLARO = 6;
  var HORA_INICIO_ESCURO = 18;

  function obterTemaPeloHorario() {
    var hora = new Date().getHours();
    return hora >= HORA_INICIO_CLARO && hora < HORA_INICIO_ESCURO
      ? TEMA_CLARO
      : TEMA_ESCURO;
  }

  function aplicarTema() {
    var tema = obterTemaPeloHorario();
    document.documentElement.setAttribute("data-tema", tema);

    var metaTema = document.querySelector('meta[name="theme-color"]');
    if (metaTema) {
      metaTema.setAttribute(
        "content",
        tema === TEMA_ESCURO ? "#111111" : "#F5C400"
      );
    }

    return tema;
  }

  function agendarAtualizacao() {
    var agora = new Date();
    var proximaHora = new Date(agora);
    proximaHora.setMinutes(0, 0, 0);
    proximaHora.setHours(agora.getHours() + 1);

    var atraso = Math.max(proximaHora.getTime() - agora.getTime(), 1000);

    global.setTimeout(function () {
      aplicarTema();
      agendarAtualizacao();
    }, atraso);
  }

  global.TA = global.TA || {};
  global.TA.obterTemaAtual = obterTemaPeloHorario;
  global.TA.aplicarTemaAutomatico = aplicarTema;

  aplicarTema();
  agendarAtualizacao();

  global.addEventListener("focus", aplicarTema);
  global.addEventListener("pageshow", aplicarTema);
})(window, document);
