/* Top Achadinho BR — Carrossel de vídeos promocionais
   Lê data/video-produto.json, vincula cada vídeo ao produto do catálogo (quando existir)
   e monta o carrossel. Reutiliza o carrossel scroll-snap (js/carrossel.js) para as setas. */
(function (global) {
  "use strict";

  var TA = global.TA;

  var URL_JSON = "data/video-produto.json";
  var EXT_ARQUIVO = /\.(mp4|webm|ogv|ogg|m4v|m3u8)$/i;
  var TIPOS = { arquivo: true, youtube: true, link: true };
  var MAX_PONTOS = 10;
  var TITULO_PADRAO = "Vídeo do achadinho";

  var ICONE_PLAY =
    '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5.14v13.72a1 1 0 0 0 1.5.86l11-6.86a1 1 0 0 0 0-1.72l-11-6.86A1 1 0 0 0 8 5.14z"/></svg>';

  var estado = { slides: [], cards: [], trilho: null, nav: null };

  function el(id) { return document.getElementById(id); }
  function esc(t) { return TA.esc(t); }

  /* ---------- Identificação do tipo de URL ---------- */

  // Devolve o ID de 11 caracteres de links do YouTube (watch, youtu.be, shorts, embed, live) ou ""
  function idYoutube(url) {
    try {
      var u = new URL(url, global.location.href);
      var host = u.hostname.replace(/^(www|m)\./, "");
      var id = "";
      if (host === "youtu.be") {
        id = u.pathname.slice(1).split("/")[0];
      } else if (host === "youtube.com" || host === "youtube-nocookie.com") {
        if (u.pathname === "/watch") id = u.searchParams.get("v") || "";
        else {
          var m = u.pathname.match(/^\/(?:shorts|embed|live)\/([^/?#]+)/);
          if (m) id = m[1];
        }
      }
      return /^[\w-]{11}$/.test(id) ? id : "";
    } catch (e) {
      return "";
    }
  }

  function caminho(url) {
    try { return new URL(url, global.location.href).pathname; } catch (e) { return ""; }
  }

  function hospedeiro(url) {
    try { return new URL(url, global.location.href).hostname.replace(/^www\./, ""); } catch (e) { return ""; }
  }

  // Aceita "https://..." ou { url, tipo } (tipo opcional: "arquivo" | "youtube" | "link")
  function classificar(entrada) {
    var bruto = typeof entrada === "string" ? { url: entrada } : entrada;
    if (!bruto || typeof bruto !== "object") return null;
    var url = TA.urlSegura(bruto.url);
    if (!url) return null;

    var yt = idYoutube(url);
    var tipo = TIPOS[bruto.tipo] ? bruto.tipo : "";
    if (!tipo) tipo = yt ? "youtube" : EXT_ARQUIVO.test(caminho(url)) ? "arquivo" : "link";
    if (tipo === "youtube" && !yt) tipo = "link";
    return { url: url, tipo: tipo, ytId: yt };
  }

  /* ---------- Vínculo com o catálogo (por id) ---------- */

  // Cada item do JSON tem { id, video }; título e link vêm do produto com o mesmo id em produtos.json
  function normalizarVideos(dados, produtos) {
    var slides = [];
    if (!Array.isArray(dados)) return slides;
    dados.forEach(function (item) {
      if (!item || typeof item !== "object") return;
      var v = classificar(item.video);
      if (!v) return;
      var produto = TA.getProdutoPorId(produtos, item.id);
      // Produto ainda fora do período de exibição (dataFim - 1 mês): o vídeo dele também não aparece
      if (!produto && TA.getProdutoPorId(TA.produtosAgendados || [], item.id)) return;
      if (!produto && global.console) console.warn("[videos] id sem produto correspondente:", item.id);
      slides.push({
        produto: produto,
        titulo: produto ? String(produto.titulo) : TITULO_PADRAO,
        url: v.url,
        tipo: v.tipo,
        ytId: v.ytId,
      });
    });
    return slides;
  }

  /* ---------- Renderização ---------- */

  function facadeHtml(s) {
    return (
      '<button class="video-card__facade" type="button" data-yt="' + esc(s.ytId) +
      '" aria-label="Reproduzir vídeo: ' + esc(s.titulo) + '">' +
      '<img src="https://i.ytimg.com/vi/' + esc(s.ytId) + '/hqdefault.jpg" alt="" loading="lazy" decoding="async" />' +
      '<span class="video-card__play">' + ICONE_PLAY + "</span></button>"
    );
  }

  function externoHtml(url) {
    return (
      '<a class="video-card__externo" href="' + esc(url) + '" target="_blank" rel="noopener noreferrer">' +
      '<span class="video-card__play">' + ICONE_PLAY + "</span>" +
      "<strong>Assistir vídeo</strong><span>" + esc(hospedeiro(url)) + "</span></a>"
    );
  }

  function erroHtml() {
    return (
      '<div class="video-card__erro" role="status"><strong>Vídeo indisponível</strong>' +
      "<span>Não foi possível carregar este vídeo agora.</span></div>"
    );
  }

  function midiaHtml(s) {
    if (s.tipo === "youtube") return facadeHtml(s);
    if (s.tipo === "arquivo") {
      var poster = s.produto ? TA.urlSegura(s.produto.imagem) : "";
      return (
        '<video class="video-card__video" controls playsinline preload="none"' +
        (poster ? ' poster="' + esc(poster) + '"' : "") +
        ' data-src="' + esc(s.url) + '" aria-label="' + esc(s.titulo) + '"></video>'
      );
    }
    return externoHtml(s.url);
  }

  function corpoHtml(s) {
    var p = s.produto;
    var preco = "";
    var acao = "";
    if (p) {
      if (TA.isIndisponivel(p)) {
        acao = '<span class="video-card__status">' + esc(TA.textos.tagIndisponivel) + "</span>";
      } else {
        var href = TA.urlSegura(p.link);
        if (p.precoNovo) preco = '<p class="video-card__preco">Por ' + esc(p.precoNovo) + "</p>";
        if (href) {
          acao =
            '<a class="btn btn--primario btn--sm" href="' + esc(href) +
            '" target="_blank" rel="nofollow sponsored noopener noreferrer">' +
            esc(p.textoBotao || TA.textos.botaoPadrao) + "</a>";
        }
      }
    }
    return (
      '<div class="video-card__corpo"><h3 class="video-card__nome">' + esc(s.titulo) + "</h3>" +
      preco + (acao ? '<div class="video-card__acao">' + acao + "</div>" : "") + "</div>"
    );
  }

  function cardHtml(s, i) {
    return (
      '<article class="video-card" data-indice="' + i + '">' +
      '<div class="video-card__midia">' + midiaHtml(s) + "</div>" + corpoHtml(s) + "</article>"
    );
  }

  function navHtml(slides) {
    var total = slides.length;
    var pontos = "";
    if (total <= MAX_PONTOS) {
      pontos = '<div class="videos__pontos" role="group" aria-label="Escolher vídeo">';
      slides.forEach(function (s, i) {
        pontos +=
          '<button type="button" class="videos__ponto" data-ir="' + i + '" aria-current="false" aria-label="Ir para o vídeo ' +
          (i + 1) + " de " + total + ": " + esc(s.titulo) + '"></button>';
      });
      pontos += "</div>";
    }
    return '<span class="videos__contador"></span>' + pontos;
  }

  /* ---------- Reprodução: um vídeo por vez ---------- */

  function restaurarFacade(card) {
    var s = estado.slides[Number(card.getAttribute("data-indice"))];
    var midia = card.querySelector(".video-card__midia");
    if (s && midia && s.tipo === "youtube") midia.innerHTML = facadeHtml(s);
  }

  function pararTodos(exceto) {
    estado.cards.forEach(function (card) {
      var v = card.querySelector("video");
      if (v && v !== exceto && !v.paused) v.pause();
      if (card.querySelector("iframe")) restaurarFacade(card);
    });
  }

  function tocarYoutube(botao) {
    var card = botao.closest(".video-card");
    var midia = botao.parentNode;
    var s = estado.slides[Number(card.getAttribute("data-indice"))];
    if (!s || !s.ytId) return;
    pararTodos(null);
    var ifr = document.createElement("iframe");
    ifr.className = "video-card__iframe";
    ifr.src = "https://www.youtube-nocookie.com/embed/" + s.ytId + "?autoplay=1&rel=0&playsinline=1";
    ifr.title = "Vídeo: " + s.titulo;
    ifr.allow = "autoplay; encrypted-media; picture-in-picture; fullscreen";
    ifr.allowFullscreen = true;
    ifr.setAttribute("referrerpolicy", "strict-origin-when-cross-origin");
    midia.innerHTML = "";
    midia.appendChild(ifr);
  }

  function ligarObservadores() {
    var videos = estado.trilho.querySelectorAll("video[data-src]");

    function carregar(v) {
      var src = v.getAttribute("data-src");
      if (!src) return;
      v.preload = v.hasAttribute("poster") ? "none" : "metadata";
      v.src = src;
      v.removeAttribute("data-src");
    }

    if (!("IntersectionObserver" in global)) {
      Array.prototype.forEach.call(videos, carregar);
      return;
    }

    // Só começa a baixar o vídeo quando o card está perto da área visível
    var perto = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (e) {
        if (e.isIntersecting) {
          carregar(e.target);
          perto.unobserve(e.target);
        }
      });
    }, { root: estado.trilho, rootMargin: "0px 300px" });
    Array.prototype.forEach.call(videos, function (v) { perto.observe(v); });

    // Pausa o que sai de vista (rolou a página ou o carrossel)
    var visivel = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (e) {
        if (e.isIntersecting) return;
        var v = e.target.querySelector("video");
        if (v && !v.paused) v.pause();
        if (e.target.querySelector("iframe")) restaurarFacade(e.target);
      });
    }, { threshold: 0.35 });
    estado.cards.forEach(function (c) { visivel.observe(c); });
  }

  /* ---------- Indicadores ---------- */

  function atualizarIndicadores() {
    var t = estado.trilho;
    var nav = estado.nav;
    if (!t || !nav || !estado.cards.length) return;

    var rolavel = t.scrollWidth - t.clientWidth > 4;
    nav.hidden = !rolavel || estado.cards.length < 2;
    if (nav.hidden) return;

    var base = t.getBoundingClientRect().left + (parseFloat(global.getComputedStyle(t).paddingLeft) || 0);
    var ativo = 0;
    var menor = Infinity;
    estado.cards.forEach(function (c, i) {
      var d = Math.abs(c.getBoundingClientRect().left - base);
      if (d < menor) { menor = d; ativo = i; }
    });
    if (t.scrollWidth - t.clientWidth - t.scrollLeft <= 4) ativo = estado.cards.length - 1;

    var cont = nav.querySelector(".videos__contador");
    if (cont) cont.textContent = ativo + 1 + " / " + estado.cards.length;
    Array.prototype.forEach.call(nav.querySelectorAll(".videos__ponto"), function (b, i) {
      b.setAttribute("aria-current", String(i === ativo));
    });
  }

  function irPara(i) {
    var card = estado.cards[i];
    var t = estado.trilho;
    if (!card || !t) return;
    var pad = parseFloat(global.getComputedStyle(t).paddingLeft) || 0;
    var delta = card.getBoundingClientRect().left - t.getBoundingClientRect().left - pad;
    var reduzido = global.matchMedia && global.matchMedia("(prefers-reduced-motion: reduce)").matches;
    t.scrollBy({ left: delta, behavior: reduzido ? "auto" : "smooth" });
  }

  /* ---------- Eventos (delegados, ligados uma única vez) ---------- */

  function ligarEventos() {
    var t = estado.trilho;
    var agendado = false;

    t.addEventListener("scroll", function () {
      if (agendado) return;
      agendado = true;
      global.requestAnimationFrame(function () { agendado = false; atualizarIndicadores(); });
    }, { passive: true });

    t.addEventListener("click", function (e) {
      var b = e.target.closest(".video-card__facade");
      if (b) tocarYoutube(b);
    });

    // "play" e "error" não propagam: captura no trilho
    t.addEventListener("play", function (e) {
      if (e.target.tagName === "VIDEO") pararTodos(e.target);
    }, true);

    t.addEventListener("error", function (e) {
      if (e.target.tagName !== "VIDEO") return;
      var midia = e.target.closest(".video-card__midia");
      if (midia) midia.innerHTML = erroHtml();
    }, true);

    // Setas do teclado dentro do player controlam o vídeo, não o carrossel
    t.addEventListener("keydown", function (e) {
      if (e.target.tagName === "VIDEO" && (e.key === "ArrowLeft" || e.key === "ArrowRight")) {
        e.stopPropagation();
      }
    });

    estado.nav.addEventListener("click", function (e) {
      var b = e.target.closest("[data-ir]");
      if (b) irPara(Number(b.getAttribute("data-ir")));
    });

    global.addEventListener("resize", atualizarIndicadores);
  }

  /* ---------- Fluxo principal ---------- */

  function mostrar(slides) {
    var t = estado.trilho;
    estado.slides = slides;

    if (!slides.length) {
      estado.cards = [];
      estado.nav.hidden = true;
      t.innerHTML = TA.renderVazio(
        "Vídeos em breve",
        "Estamos preparando os primeiros vídeos dos achadinhos. Entre no grupo do WhatsApp para ser avisado.",
        true
      );
    } else {
      t.innerHTML = slides.map(cardHtml).join("");
      estado.cards = Array.prototype.slice.call(t.querySelectorAll(".video-card"));
      estado.nav.innerHTML = navHtml(slides);
      ligarObservadores();
    }
    if (TA.atualizarCarrosseis) TA.atualizarCarrosseis();
    atualizarIndicadores();
  }

  function mostrarErro() {
    estado.slides = [];
    estado.cards = [];
    estado.nav.hidden = true;
    estado.trilho.innerHTML = TA.renderVazio("Não foi possível carregar os vídeos", "Tente novamente mais tarde.", false);
    if (TA.atualizarCarrosseis) TA.atualizarCarrosseis();
  }

  // promessaProdutos: a mesma promessa do catálogo (para vincular vídeo ↔ produto)
  TA.iniciarVideos = function (promessaProdutos) {
    estado.trilho = el("videos-trilho");
    estado.nav = el("videos-nav");
    if (!estado.trilho || !estado.nav) return;
    ligarEventos();

    var dados = fetch(URL_JSON).then(function (r) {
      if (!r.ok) throw new Error("Falha ao carregar vídeos");
      return r.json();
    });
    var produtos = Promise.resolve(promessaProdutos).catch(function () { return []; });

    Promise.all([dados, produtos])
      .then(function (r) {
        mostrar(normalizarVideos(r[0], Array.isArray(r[1]) ? r[1] : []));
      })
      .catch(mostrarErro);
  };

  // Funções puras expostas para teste
  TA.videosUtil = { idYoutube: idYoutube, classificar: classificar, normalizarVideos: normalizarVideos };
})(window);
