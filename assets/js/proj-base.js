/* ============================================================
   四时工坊 · 项目页共享行为
   菜单开合 / 滚动显现 / 顶栏滚动态
   ============================================================ */
(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var btn = document.querySelector('.menu-btn');
  var overlay = document.querySelector('.menu-overlay');
  if (btn && overlay) {
    btn.addEventListener('click', function () {
      var open = overlay.classList.toggle('open');
      btn.classList.toggle('open', open);
      document.body.style.overflow = open ? 'hidden' : '';
    });
    overlay.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') {
        overlay.classList.remove('open');
        btn.classList.remove('open');
        document.body.style.overflow = '';
      }
    });
  }

  if (!reduce && 'IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      var batch = 0;
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        en.target.style.setProperty('--d', (batch++ * 70) + 'ms');
        en.target.classList.add('in');
        io.unobserve(en.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    document.querySelectorAll('.reveal').forEach(function (el) { io.observe(el); });
    // 兜底：IO 被节流（后台标签）时也能放行
    setTimeout(function () {
      document.querySelectorAll('.reveal:not(.in)').forEach(function (el) { el.classList.add('in'); });
    }, 1400);
  } else {
    document.querySelectorAll('.reveal').forEach(function (el) { el.classList.add('in'); });
  }
})();
