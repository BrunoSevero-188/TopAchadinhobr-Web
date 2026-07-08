(function () {
  "use strict";

  function initSlidebar() {
    var btn = document.getElementById("slidebar-toggle");
    var slidebar = document.querySelector("aside.slidebar");
    var reopenBtn = document.getElementById("slidebar-reopen");

    if (!slidebar || !reopenBtn) return;

    function syncReopenBtn() {
      var isHidden = slidebar.classList.contains("slidebar--hidden");

      if (isHidden) {
        reopenBtn.classList.add("slidebar-reopen--visible");
      } else {
        reopenBtn.classList.remove("slidebar-reopen--visible");
      }
    }

    if (btn) {
      btn.addEventListener("click", function () {
        slidebar.classList.add("slidebar--hidden");
        syncReopenBtn();
      });
    }

    if (reopenBtn) {
      reopenBtn.addEventListener("click", function () {
        slidebar.classList.remove("slidebar--hidden");
        syncReopenBtn();
      });
    }

    syncReopenBtn();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initSlidebar);
  } else {
    initSlidebar();
  }
})();
