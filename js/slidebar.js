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
      });
    }

    if (reopenBtn) {
      reopenBtn.addEventListener("click", function () {
        slidebar.classList.remove("slidebar--hidden");
      });
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initSlidebar);
  } else {
    initSlidebar();
  }
})();

