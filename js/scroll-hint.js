(function () {
  function easeInOut(t) {
    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
  }

  function animateScroll(el, from, to, duration, onDone) {
    var start = null;
    function step(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / duration, 1);
      el.scrollTop = from + (to - from) * easeInOut(p);
      if (p < 1) { requestAnimationFrame(step); }
      else if (onDone) { onDone(); }
    }
    requestAnimationFrame(step);
  }

  function hintScroll(el, delay) {
    var maxScroll = el.scrollHeight - el.clientHeight;
    var peekTo = Math.min(Math.round(maxScroll * 0.6), 260);
    console.log('[scroll-hint] hintScroll called, peekTo=' + peekTo + ', maxScroll=' + maxScroll);
    if (peekTo <= 10) return;
    setTimeout(function () {
      console.log('[scroll-hint] animating down to ' + peekTo);
      animateScroll(el, 0, peekTo, 750, function () {
        setTimeout(function () {
          console.log('[scroll-hint] animating back to 0');
          animateScroll(el, peekTo, 0, 650, null);
        }, 450);
      });
    }, delay || 500);
  }

  function isInViewport(el) {
    var r = el.getBoundingClientRect();
    return r.top < window.innerHeight && r.bottom > 0;
  }

  function init() {
    var viewports = document.querySelectorAll('.iphone__viewport');
    console.log('[scroll-hint] init, found ' + viewports.length + ' viewports');
    var seen = new WeakSet();

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting && !seen.has(entry.target)) {
          seen.add(entry.target);
          observer.unobserve(entry.target);
          console.log('[scroll-hint] observer triggered');
          hintScroll(entry.target, 400);
        }
      });
    }, { threshold: 0.3 });

    viewports.forEach(function (el) {
      if (isInViewport(el)) {
        console.log('[scroll-hint] viewport already visible, triggering directly');
        seen.add(el);
        hintScroll(el, 600);
      } else {
        observer.observe(el);
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
}());
