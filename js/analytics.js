/* SpotCalc analytics loader.
 *
 * Turnkey: paste your IDs below and analytics activates site-wide. While the
 * IDs are blank this file does nothing, so it is safe to deploy as-is.
 * Loaded with `defer` from every page, so it survives page regeneration.
 *
 * See LAUNCH-CHECKLIST.md for where to get each ID.
 */
(function () {
  // ======= CONFIG — paste your IDs here to turn analytics on =======
  var GA4_MEASUREMENT_ID = ''; // Google Analytics 4, e.g. 'G-XXXXXXXXXX'
  var CLARITY_PROJECT_ID = ''; // Microsoft Clarity,   e.g. 'abcde12345'
  // =================================================================

  // --- Google Analytics 4 (gtag.js) ---
  if (GA4_MEASUREMENT_ID) {
    var ga = document.createElement('script');
    ga.async = true;
    ga.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA4_MEASUREMENT_ID;
    document.head.appendChild(ga);
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    window.gtag('config', GA4_MEASUREMENT_ID, { anonymize_ip: true });
  }

  // --- Microsoft Clarity ---
  if (CLARITY_PROJECT_ID) {
    (function (c, l, a, r, i, t, y) {
      c[a] = c[a] || function () { (c[a].q = c[a].q || []).push(arguments); };
      t = l.createElement(r); t.async = 1; t.src = 'https://www.clarity.ms/tag/' + i;
      y = l.getElementsByTagName(r)[0]; y.parentNode.insertBefore(t, y);
    })(window, document, 'clarity', 'script', CLARITY_PROJECT_ID);
  }
})();
