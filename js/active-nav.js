(function () {
  var path = window.location.pathname.toLowerCase();
  var section = "";

  if (
    path.indexOf("markets") !== -1 ||
    path.indexOf("analysis") !== -1 ||
    path.indexOf("ratio") !== -1 ||
    path.indexOf("economic-calendar") !== -1 ||
    path.indexOf("market-heatmap") !== -1 ||
    path.indexOf("ai-forecasts") !== -1
  ) {
    section = "markets";
  } else if (path.indexOf("buy") !== -1) {
    section = "buy";
  } else if (path.indexOf("sell") !== -1) {
    section = "sell";
  } else if (
    path.indexOf("learn") !== -1 ||
    path.indexOf("guide") !== -1 ||
    path.indexOf("gold-marks") !== -1
  ) {
    section = "learn";
  }

  if (!section) return;

  document.querySelectorAll(".nav__link").forEach(function (link) {
    var href = (link.getAttribute("href") || "").toLowerCase();
    var matchesSection = href.indexOf("/" + section + ".html") !== -1;

    if (matchesSection) {
      link.classList.add("is-active");
      link.setAttribute("aria-current", "page");
    }
  });
}());
