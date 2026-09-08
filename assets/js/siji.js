/* ============================================================
   四时工坊 · 稿纸画布交互
   惯性平滑滚动 / 描线入场 / 滚动显现 / 荧光笔滑动标签 / 3D 卡片
   ============================================================ */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  /* ========== 惯性平滑滚动（Lenis 式 lerp） ========== */
  function SmoothScroll() {
    // 只在桌面精细指针 + 未开启弱动效时接管滚轮；触屏与键盘保持原生
    this.enabled = !reduceMotion && finePointer && window.innerWidth > 760;
    if (!this.enabled) return;

    this.current = window.scrollY || 0;
    this.target = this.current;
    this.lerp = 0.1;
    this.running = false;
    this.fallbackTimer = null;

    document.documentElement.style.scrollBehavior = 'auto';

    var self = this;
    this.tick = function () { self.onTick(); };

    window.addEventListener('wheel', function (e) { self.onWheel(e); }, { passive: false });
    // 键盘 / 滚动条 / 触屏等原生滚动发生时，重新对齐内部状态
    window.addEventListener('scroll', function () { self.onNativeScroll(); }, { passive: true });
    window.addEventListener('resize', function () { self.clamp(); });

    // 站内锚点：交给 lerp 动画滑过去
    document.addEventListener('click', function (e) {
      var a = e.target.closest && e.target.closest('a[href^="#"]');
      if (!a) return;
      var id = a.getAttribute('href').slice(1);
      if (!id) { e.preventDefault(); self.scrollTo(0); return; }
      var el = document.getElementById(id);
      if (!el) return;
      e.preventDefault();
      self.scrollTo(el.getBoundingClientRect().top + window.scrollY - 148);
    });
  }

  SmoothScroll.prototype.max = function () {
    return Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
  };
  SmoothScroll.prototype.clampVal = function (v) {
    return Math.max(0, Math.min(v, this.max()));
  };
  SmoothScroll.prototype.clamp = function () {
    this.target = this.clampVal(this.target);
    this.current = this.clampVal(this.current);
  };
  /* rAF 优先，超时兜底：标签页被节流（后台/遮挡）时动画仍会推进 */
  SmoothScroll.prototype.schedule = function () {
    var self = this;
    requestAnimationFrame(this.tick);
    this.fallbackTimer = setTimeout(this.tick, 48);
  };
  SmoothScroll.prototype.kick = function () {
    if (!this.running) {
      this.running = true;
      this.schedule();
    }
  };
  SmoothScroll.prototype.onTick = function () {
    clearTimeout(this.fallbackTimer);
    var diff = this.target - this.current;
    if (Math.abs(diff) < 0.4) {
      this.current = this.target;
      window.scrollTo(0, this.current);
      this.running = false;   // 静止后休眠，等待下次 kick
      return;
    }
    this.current += diff * this.lerp;
    window.scrollTo(0, this.current);
    this.schedule();
  };
  SmoothScroll.prototype.onWheel = function (e) {
    if (e.ctrlKey) return;                                  // 捏合缩放不接管
    if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;    // 横向滚动不接管
    if (e.deltaMode !== 0) return;                          // 行/页模式交给原生
    e.preventDefault();
    var d = Math.max(-220, Math.min(220, e.deltaY));
    this.target = this.clampVal(this.target + d);
    this.kick();
  };
  SmoothScroll.prototype.onNativeScroll = function () {
    var y = window.scrollY;
    if (Math.abs(y - this.current) > 1.5) {
      this.current = y;
      this.target = y;
    }
  };
  SmoothScroll.prototype.scrollTo = function (y) {
    this.target = this.clampVal(y);
    this.kick();
  };

  /* ========== 吉祥物描线入场（无 SVG 时仅触发放场） ========== */
  function prepMascot() {
    var reveal = function () {
      if (document.body.classList.contains('loaded')) return;
      document.body.classList.add('loaded');
      var paths = document.querySelectorAll('.hero-mascot .draw');
      paths.forEach(function (p) { p.style.strokeDashoffset = 0; });
    };
    var svg = document.querySelector('.hero-mascot svg');
    if (!svg) {
      // 页面未使用描线插画（如 3D 同心环 hero）时直接放场
      document.body.classList.add('loaded');
      return;
    }
    var paths = svg.querySelectorAll('.draw');
    paths.forEach(function (p, i) {
      var len;
      try { len = p.getTotalLength(); } catch (e) { return; }
      p.style.strokeDasharray = len;
      p.style.strokeDashoffset = reduceMotion ? 0 : len;
      p.style.transition = reduceMotion
        ? 'none'
        : 'stroke-dashoffset 1.1s cubic-bezier(0.4, 0, 0.2, 1) ' + (0.35 + i * 0.09).toFixed(2) + 's';
    });
    // 双 rAF 保证首帧过渡生效；超时兜底应对 rAF 被节流的后台标签
    requestAnimationFrame(function () {
      requestAnimationFrame(reveal);
    });
    setTimeout(reveal, 700);
  }

  /* ========== 滚动显现（同帧批次错峰） ========== */
  function setupReveal() {
    var items = document.querySelectorAll('.reveal');
    if (!('IntersectionObserver' in window) || reduceMotion) {
      items.forEach(function (el) { el.classList.add('in'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      var batch = 0;
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.style.setProperty('--d', (batch++ * 70) + 'ms');
        entry.target.classList.add('in');
        io.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    items.forEach(function (el) { io.observe(el); });
  }

  /* ========== 荧光笔标签：共享 marker 滑动 ========== */
  function setupTabs() {
    var inner = document.querySelector('.tabs-inner');
    var tabs = document.querySelectorAll('.tabs a');
    if (!inner || !tabs.length || !('IntersectionObserver' in window)) return;

    var marker = document.createElement('span');
    marker.className = 'tab-marker';
    marker.setAttribute('aria-hidden', 'true');
    inner.appendChild(marker);
    inner.classList.add('has-marker');

    var map = {};
    tabs.forEach(function (a) {
      var id = (a.getAttribute('href') || '').replace('#', '');
      if (id) map[id] = a;
    });

    function place(link, instant) {
      if (instant) marker.style.transition = 'none';
      marker.style.left = link.offsetLeft + 'px';
      marker.style.width = link.offsetWidth + 'px';
      if (instant) {
        void marker.offsetWidth;
        marker.style.transition = '';
      }
    }
    function setActive(link) {
      tabs.forEach(function (a) { a.classList.remove('active'); });
      if (link) {
        link.classList.add('active');
        place(link, !marker.style.width); // 首次直接就位，之后滑动
      } else {
        marker.style.width = '';
      }
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        setActive(map[entry.target.id]);
      });
    }, { rootMargin: '-38% 0px -55% 0px', threshold: 0 });
    Object.keys(map).forEach(function (id) {
      var sec = document.getElementById(id);
      if (sec) io.observe(sec);
    });
    window.addEventListener('resize', function () {
      var active = inner.querySelector('a.active');
      if (active) place(active, true);
    });
  }

  /* ========== 滚动视差：hero 离场 + 幽灵编号漂移 ========== */
  function setupParallax() {
    if (reduceMotion) return;
    var heroInner = document.querySelector('.hero-inner');
    var ghosts = document.querySelectorAll('.ghost-num');
    if (!heroInner && !ghosts.length) return;
    var ticking = false;
    window.addEventListener('scroll', function () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        var y = window.scrollY || window.pageYOffset;
        var vh = window.innerHeight;
        if (heroInner && y < vh * 1.2) {
          var p = Math.min(y / (vh * 0.85), 1);
          heroInner.style.transform = 'translateY(' + (y * 0.14) + 'px)';
          heroInner.style.opacity = String(Math.max(0, 1 - p));
        }
        ghosts.forEach(function (g) {
          var rect = g.getBoundingClientRect();
          if (rect.top < vh && rect.bottom > 0) {
            var progress = 1 - rect.top / vh;
            g.style.transform = 'translateY(' + ((progress - 0.5) * 90) + 'px)';
          }
        });
        ticking = false;
      });
    }, { passive: true });
  }

  /* ========== 卡片 3D 倾斜 + 面板 logo 视差 ========== */
  function setupTilt() {
    if (!finePointer || reduceMotion) return;
    var MAX_TILT = 2.4, MAX_SHIFT = 9;
    document.querySelectorAll('.p-card').forEach(function (card) {
      var rect = null, raf = null;
      card.addEventListener('mouseenter', function () {
        rect = card.getBoundingClientRect();
      });
      card.addEventListener('mousemove', function (e) {
        if (!rect) rect = card.getBoundingClientRect();
        var x = (e.clientX - rect.left) / rect.width - 0.5;
        var y = (e.clientY - rect.top) / rect.height - 0.5;
        if (raf) cancelAnimationFrame(raf);
        raf = requestAnimationFrame(function () {
          card.style.transform =
            'perspective(1100px) rotateX(' + (-y * MAX_TILT).toFixed(2) + 'deg)' +
            ' rotateY(' + (x * MAX_TILT).toFixed(2) + 'deg) translateY(-5px)';
          var logo = card.querySelector('.p-media .logo');
          if (logo) {
            logo.style.transform =
              'translate(' + (x * MAX_SHIFT).toFixed(1) + 'px,' + (y * MAX_SHIFT).toFixed(1) + 'px) scale(1.05)';
          }
        });
      });
      card.addEventListener('mouseleave', function () {
        if (raf) cancelAnimationFrame(raf);
        card.style.transform = '';
        var logo = card.querySelector('.p-media .logo');
        if (logo) logo.style.transform = '';
        rect = null;
      });
    });
  }

  function boot() {
    new SmoothScroll();
    prepMascot();
    setupReveal();
    setupTabs();
    setupParallax();
    setupTilt();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
