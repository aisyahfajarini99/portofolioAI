// ===== Portofolio AI — script.js =====
(function () {
  'use strict';

  var cards = Array.prototype.slice.call(document.querySelectorAll('.card'));
  var buttons = document.querySelectorAll('.filters button');
  var empty = document.getElementById('empty');

  // 1. Nomor card otomatis (01, 02, ...) sesuai urutan di halaman
  cards.forEach(function (card, i) {
    var num = card.querySelector('.num');
    if (num) num.textContent = String(i + 1).padStart(2, '0');
  });

  // 2. Filter berdasarkan jenis file (data-type pada setiap card)
  function applyFilter(type) {
    var shown = 0;
    cards.forEach(function (card) {
      var match = type === 'all' || card.dataset.type === type;
      card.hidden = !match;
      if (match) shown++;
    });
    if (empty) empty.hidden = shown !== 0;
    buttons.forEach(function (b) {
      b.setAttribute('aria-pressed', String(b.dataset.filter === type));
    });
  }
  buttons.forEach(function (b) {
    b.addEventListener('click', function () { applyFilter(b.dataset.filter); });
  });

  // 3. Jika file media tidak ditemukan, tampilkan pesan yang jelas
  //    (event 'error' tidak bubble, jadi dipasang dengan capture)
  document.addEventListener('error', function (e) {
    var el = e.target;
    var tag = el.tagName;
    if (tag !== 'IMG' && tag !== 'SOURCE') return;
    var media = tag === 'SOURCE' ? el.parentElement : el;
    var path = el.getAttribute('src') || '';
    var note = document.createElement('div');
    note.className = 'media-missing';
    note.innerHTML = 'File belum ditemukan: <code></code><br>Periksa nama file dan folder di repository.';
    note.querySelector('code').textContent = path;
    // foto profil & poster video cukup disembunyikan, bukan diganti pesan
    if (media.classList.contains('avatar') || media.hasAttribute('poster')) { return; }
    if (media.parentNode) media.parentNode.replaceChild(note, media);
  }, true);

  // 4. Tahun otomatis di footer
  var year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();
})();
