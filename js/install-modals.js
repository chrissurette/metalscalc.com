(function () {
  function openModal(id) {
    var el = document.getElementById(id);
    if (!el) return;
    el.classList.add('is-open');
    document.body.style.overflow = 'hidden';
    el.querySelector('.modal__close').focus();
  }

  function closeModal(el) {
    el.classList.remove('is-open');
    document.body.style.overflow = '';
  }

  document.addEventListener('click', function (e) {
    var iosBtn = e.target.closest('.btn--install-ios');
    var androidBtn = e.target.closest('.btn--install-android');
    if (iosBtn)     { e.preventDefault(); openModal('modal-ios');     return; }
    if (androidBtn) { e.preventDefault(); openModal('modal-android'); return; }

    if (e.target.closest('.modal__close') || e.target.classList.contains('modal__backdrop')) {
      var modal = e.target.closest('.modal');
      if (modal) closeModal(modal);
    }
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      var open = document.querySelector('.modal.is-open');
      if (open) closeModal(open);
    }
  });
}());
