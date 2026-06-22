(function () {
  var SYMBOLS = ['XAU', 'XAG', 'XPT'];
  var BASE    = 'https://api.gold-api.com/price/';

  function fmt(price) {
    return '$' + price.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }

  function refresh() {
    Promise.all(
      SYMBOLS.map(function (sym) {
        return fetch(BASE + sym).then(function (r) {
          if (!r.ok) throw new Error(r.status);
          return r.json();
        });
      })
    ).then(function (results) {
      results.forEach(function (data) {
        var el = document.querySelector(
          '.quote[data-sym="' + data.symbol + '"] .quote__price'
        );
        if (el) el.textContent = fmt(data.price);
      });
    }).catch(function () {
      // network error — dashes remain, live dot continues pulsing
    });
  }

  refresh();
  setInterval(refresh, 5 * 60 * 1000); // re-fetch every 5 minutes
}());
