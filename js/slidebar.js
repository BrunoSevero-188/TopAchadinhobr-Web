(function () {
  "use strict";

  function initSlidebar() {
    var btn = document.getElementById("slidebar-toggle");
    var slidebar = document.querySelector("aside.slidebar");
    var reopenBtn = document.getElementById("slidebar-reopen");
    if (!slidebar) return;

    if (btn) {
      btn.addEventListener("click", function () {
        slidebar.classList.add("slidebar--hidden");
        if (reopenBtn) {
          reopenBtn.style.display = "inline-flex";
          reopenBtn.style.left = "1rem";
          reopenBtn.style.right = "auto";
        }
      });
    }

    if (reopenBtn) {
      reopenBtn.addEventListener("click", function () {
        slidebar.classList.remove("slidebar--hidden");
        // reposiciona/garante visibilidade do botão
        reopenBtn.style.display = slidebar.classList.contains("slidebar--hidden") ? "inline-flex" : "none";
      });
    }

    function syncReopenBtn() {
      if (!reopenBtn) return;
      // Mostra o botão apenas quando a slidebar estiver oculta
      reopenBtn.style.display = slidebar.classList.contains("slidebar--hidden") ? "inline-flex" : "none";
    }

    if (btn) {
      btn.addEventListener("click", function () {
        syncReopenBtn();
      });
    }

    // estado inicial
    syncReopenBtn();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initSlidebar);
  } else {
    initSlidebar();
  }
})();