(function () {
  var zoomed = false;

  function scrollToWidget() {
    if (zoomed) return;
    zoomed = true;

    if (!('ontouchstart' in window) && navigator.maxTouchPoints === 0) return;

    var calc   = document.getElementById('scrap-calculator');
    var nav    = document.querySelector('.nav');
    var ticker = document.querySelector('.ticker');
    if (!calc) return;

    var offset = (nav    ? nav.offsetHeight    : 0)
               + (ticker ? ticker.offsetHeight : 0);

    var top = calc.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top: top, behavior: 'smooth' });
  }

  function tryAttach() {
    var input      = document.querySelector('#scrap-calculator input[inputmode="decimal"]');
    var toggleBtns = document.querySelectorAll('#scrap-calculator header button');
    if (!input && !toggleBtns.length) return false;

    // Weight input — first focus
    if (input) {
      input.addEventListener('focus', function onFocus() {
        input.removeEventListener('focus', onFocus);
        scrollToWidget();
      });
    }

    // Metal toggle buttons — first tap on any of them
    toggleBtns.forEach(function (btn) {
      btn.addEventListener('click', function onFirstClick() {
        toggleBtns.forEach(function (b) { b.removeEventListener('click', onFirstClick); });
        scrollToWidget();
      });
    });

    return true;
  }

  if (tryAttach()) return;

  // Widget mounts async via React — watch for it
  var observer = new MutationObserver(function (_, obs) {
    if (tryAttach()) obs.disconnect();
  });
  var root = document.getElementById('scrap-calculator') || document.body;
  observer.observe(root, { childList: true, subtree: true });
}());
