(function () {
  "use strict";

  function initSlidebar() {
    var btn = document.getElementById("slidebar-toggle");
    var slidebar = document.querySelector("aside.slidebar");
    var reopenBtn = document.getElementById("slidebar-reopen");

    if (!slidebar || !reopenBtn) return;

    function syncButtons() {
      var isHidden = slidebar.classList.contains("slidebar--hidden");

      if (isHidden) {
        reopenBtn.classList.add("slidebar-reopen--visible");
        if (btn) btn.classList.add("slidebar__toggle--hidden");
      } else {
        reopenBtn.classList.remove("slidebar-reopen--visible");
        if (btn) btn.classList.remove("slidebar__toggle--hidden");
      }
    }

    if (btn) {
      btn.addEventListener("click", function () {
        slidebar.classList.add("slidebar--hidden");
        syncButtons();
      });
    }

    if (reopenBtn) {
      reopenBtn.addEventListener("click", function () {
        slidebar.classList.remove("slidebar--hidden");
        syncButtons();
      });
    }

    syncButtons();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initSlidebar);
  } else {
    initSlidebar();
  }
})();