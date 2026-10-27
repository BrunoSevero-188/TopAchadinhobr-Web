/* Top Achadinho BR — Carrossel de vídeos de produtos */
(function (global) {
  "use strict";

  var SELECTOR = "[data-video-carrossel]";
  var indice = 0;
  var itens = [];
  var resizeTimer;

  function el(id) { return document.getElementById(id); }
  function seguro(texto) {
    return String(texto == null ? "" : texto).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function urlSegura(valor) {
    var url = String(valor || "").trim();
    if (!url) return "";
    try {
      var parsed = new URL(url, global.location.href);
      return parsed.protocol === "https:" || parsed.protocol === "http:" ? url : "";
    } catch (e) { return ""; }
  }
  function youtubeId(url) {
    try {
      var u = new URL(url);
      if (u.hostname === "youtu.be" || u.hostname === "www.youtu.be") return u.pathname.split("/").filter(Boolean)[0] || "";
      if (u.hostname.endsWith("youtube.com") || u.hostname.endsWith("youtube-nocookie.com")) {
        if (u.pathname === "/watch") return u.searchParams.get("v") || "";
        var parts = u.pathname.split("/").filter(Boolean);
        if (["embed", "shorts", "live"].indexOf(parts[0]) >= 0) return parts[1] || "";
      }
    } catch (e) {}
    return "";
  }
  function mensagem(titulo, texto) {
    return '<div class="video-vazio"><strong>' + seguro(titulo) + '</strong><p>' + seguro(texto) + '</p></div>';
  }
  function normalizar(lista) {
    if (!Array.isArray(lista)) return [];
    var saida = [];
    lista.forEach(function (produto) {
      if (!produto || !String(produto.nome || "").trim() || !Array.isArray(produto.videos)) return;
      produto.videos.forEach(function (entrada) {
        var video = typeof entrada === "string" ? { url: entrada } : entrada;
        if (!video || video.ativo === false) return;
        var url = urlSegura(video.url);
        if (!url) return;
        var idYT = youtubeId(url);
        var tipo = idYT ? "youtube" : String(video.tipo || "").toLowerCase();
        if (!idYT && ["mp4", "webm"].indexOf(tipo) < 0) {
          tipo = /\.webm(?:$|\?)/i.test(url) ? "webm" : "mp4";
        }
        saida.push({
          nome: String(produto.nome).trim(),
          titulo: String(video.titulo || produto.nome).trim(),
          url: url,
          tipo: tipo,
          youtubeId: idYT,
          miniatura: urlSegura(video.miniatura),
          linkProduto: urlSegura(produto.linkProduto || produto.link || "")
        });
      });
    });
    return saida;
  }
  function card(video, posicao) {
    var media;
    if (video.tipo === "youtube" && video.youtubeId) {
      var thumb = video.miniatura || "https://i.ytimg.com/vi/" + encodeURIComponent(video.youtubeId) + "/hqdefault.jpg";
      media = '<div class="video-card__media video-card__media--youtube">' +
        '<img src="' + seguro(thumb) + '" alt="" loading="lazy" />' +
        '<button class="video-card__play" type="button" data-video-play="' + posicao + '" aria-label="Reproduzir vídeo: ' + seguro(video.titulo) + '">▶</button>' +
        '</div>';
    } else {
      media = '<video class="video-card__media" controls playsinline preload="none" ' +
        (video.miniatura ? 'poster="' + seguro(video.miniatura) + '" ' : '') +
        'aria-label="' + seguro(video.titulo) + '" data-video-media="' + posicao + '">' +
        '<source src="' + seguro(video.url) + '" type="' + (video.tipo === "webm" ? "video/webm" : "video/mp4") + '">' +
        'Seu navegador não conseguiu reproduzir este vídeo.</video>';
    }
    var youtubeEmbed = video.tipo === "youtube" && video.youtubeId
      ? '<iframe class="video-card__embed" data-video-embed="' + posicao + '" title="' + seguro(video.titulo) + '" src="" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen loading="lazy"></iframe>'
      : "";
    return '<article class="video-card">' + media + youtubeEmbed +
      '<div class="video-card__body"><p class="video-card__eyebrow">Vídeo do produto</p>' +
      '<h3>' + seguro(video.titulo) + '</h3><p class="video-card__product">' + seguro(video.nome) + '</p>' +
      (video.linkProduto ? '<a class="btn btn--primario video-card__link" href="' + seguro(video.linkProduto) + '" target="_blank" rel="noopener noreferrer">Ver produto</a>' : '') +
      '</div></article>';
  }
  function pausarForaDoAtual() {
    var trilho = el("video-produto-trilho");
    if (!trilho) return;
    trilho.querySelectorAll("video").forEach(function (video) {
      if (!video.paused) video.pause();
    });
    trilho.querySelectorAll("iframe").forEach(function (frame) { frame.src = ""; });
    trilho.querySelectorAll(".video-card__media--youtube").forEach(function (media) { media.hidden = false; });
  }
  function atualizarSetas() {
    var trilho = el("video-produto-trilho");
    var anterior = el("video-produto-anterior");
    var proximo = el("video-produto-proximo");
    if (!trilho || !anterior || !proximo) return;
    var max = Math.max(0, trilho.scrollWidth - trilho.clientWidth);
    anterior.hidden = trilho.scrollLeft <= 2;
    proximo.hidden = trilho.scrollLeft >= max - 2;
  }
  function montar() {
    var secao = el("videos-produtos");
    var trilho = el("video-produto-trilho");
    if (!secao || !trilho) return;
    if (!itens.length) {
      secao.hidden = false;
      trilho.innerHTML = mensagem("Vídeos em breve", "Estamos preparando vídeos dos nossos achadinhos. Volte em breve!");
      atualizarSetas();
      return;
    }
    trilho.innerHTML = itens.map(card).join("");
    trilho.querySelectorAll("video").forEach(function (video) {
      video.addEventListener("play", function () {
        trilho.querySelectorAll("video").forEach(function (outro) { if (outro !== video) outro.pause(); });
        trilho.querySelectorAll("iframe").forEach(function (frame) { frame.src = ""; });
        trilho.querySelectorAll(".video-card__media--youtube").forEach(function (media) { media.hidden = false; });
      });
      video.addEventListener("error", function () {
        var cardAtual = video.closest(".video-card");
        if (cardAtual) {
          var aviso = document.createElement("p");
          aviso.className = "video-card__erro";
          aviso.textContent = "Não foi possível carregar este vídeo. Verifique o endereço do arquivo.";
          if (!cardAtual.querySelector(".video-card__erro")) cardAtual.querySelector(".video-card__body").appendChild(aviso);
        }
      });
    });
    atualizarSetas();
  }
  function iniciar() {
    var secao = el("videos-produtos");
    var trilho = el("video-produto-trilho");
    if (!secao || !trilho) return;
    var anterior = el("video-produto-anterior");
    var proximo = el("video-produto-proximo");
    if (anterior) anterior.addEventListener("click", function () {
      trilho.scrollBy({ left: -Math.max(240, trilho.clientWidth * 0.8), behavior: "smooth" });
    });
    if (proximo) proximo.addEventListener("click", function () {
      trilho.scrollBy({ left: Math.max(240, trilho.clientWidth * 0.8), behavior: "smooth" });
    });
    trilho.addEventListener("scroll", atualizarSetas, { passive: true });
    trilho.addEventListener("click", function (event) {
      var botao = event.target.closest("[data-video-play]");
      if (!botao) return;
      var posicao = Number(botao.getAttribute("data-video-play"));
      var video = itens[posicao];
      if (!video || !video.youtubeId) return;
      pausarForaDoAtual();
      var cardAtual = botao.closest(".video-card");
      var frame = cardAtual && cardAtual.querySelector("[data-video-embed]");
      var capa = cardAtual && cardAtual.querySelector(".video-card__media--youtube");
      if (frame && capa) {
        frame.src = "https://www.youtube-nocookie.com/embed/" + encodeURIComponent(video.youtubeId) + "?autoplay=1&rel=0";
        frame.classList.add("is-active");
        capa.hidden = true;
      }
    });
    global.addEventListener("resize", function () {
      global.clearTimeout(resizeTimer);
      resizeTimer = global.setTimeout(atualizarSetas, 120);
    });
    fetch("data/video-produto.json")
      .then(function (resposta) {
        if (!resposta.ok) throw new Error("Não foi possível carregar data/video-produto.json");
        return resposta.json();
      })
      .then(function (dados) { itens = normalizar(dados); montar(); })
      .catch(function () {
        secao.hidden = false;
        trilho.innerHTML = mensagem("Vídeos indisponíveis", "Não foi possível carregar a lista de vídeos agora.");
      });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", iniciar);
  else iniciar();
})(window);
