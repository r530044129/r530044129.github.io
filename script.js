/* ============================================================
   Zhang Renjie · Resume Site — script.js
   ============================================================ */

(function () {
  'use strict';

  // ---------- Year ----------
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // ---------- Scroll progress ----------
  const progressEl = document.getElementById('scrollProgress');
  const navEl = document.getElementById('nav');

  function onScroll() {
    const h = document.documentElement;
    const max = h.scrollHeight - h.clientHeight;
    const pct = max > 0 ? (h.scrollTop / max) * 100 : 0;
    if (progressEl) progressEl.style.width = pct + '%';
    if (navEl) navEl.classList.toggle('is-scrolled', h.scrollTop > 24);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // ---------- Reveal on scroll ----------
  const reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add('is-visible');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    reveals.forEach((el) => io.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add('is-visible'));
  }

  // ---------- Active section in nav ----------
  const navLinks = document.querySelectorAll('.nav-links a[data-section]');
  const sections = Array.from(navLinks)
    .map((a) => document.getElementById(a.dataset.section))
    .filter(Boolean);

  function updateActiveNav() {
    const y = window.scrollY + 140;
    let current = sections[0]?.id;
    for (const s of sections) {
      if (s.offsetTop <= y) current = s.id;
    }
    navLinks.forEach((a) => {
      a.classList.toggle('is-active', a.dataset.section === current);
    });
  }
  window.addEventListener('scroll', updateActiveNav, { passive: true });
  updateActiveNav();

  // ---------- Stat number count-up ----------
  const statNums = document.querySelectorAll('.stat-num[data-count]');
  if ('IntersectionObserver' in window) {
    const numIO = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        const el = e.target;
        const target = parseInt(el.dataset.count, 10) || 0;
        const dur = 1100;
        const start = performance.now();
        function step(now) {
          const t = Math.min(1, (now - start) / dur);
          const eased = 1 - Math.pow(1 - t, 3);
          el.textContent = Math.round(target * eased);
          if (t < 1) requestAnimationFrame(step);
          else el.textContent = target;
        }
        requestAnimationFrame(step);
        numIO.unobserve(el);
      });
    }, { threshold: 0.5 });
    statNums.forEach((el) => numIO.observe(el));
  }

  // ---------- Work gallery filter + featured/collapse ----------
  const chips = document.querySelectorAll('.work-filter .chip');
  const cards = document.querySelectorAll('.work-card');
  const featuredCount = document.querySelectorAll('.work-card.featured').length;
  const totalCountEl = document.getElementById('workCount');
  const workMore = document.getElementById('workMore');
  const workGrid = document.getElementById('workGrid');
  let currentFilter = 'all';
  let expanded = false;

  function updateCount() {
    if (!totalCountEl) return;
    if (currentFilter === 'all') {
      totalCountEl.textContent = expanded ? String(cards.length) : String(featuredCount);
    } else {
      const n = Array.from(cards).filter((c) => c.dataset.cat === currentFilter).length;
      totalCountEl.textContent = String(n);
    }
  }

  function applyFilter() {
    cards.forEach((c) => {
      let show = false;
      if (currentFilter === 'all') {
        show = expanded ? true : c.classList.contains('featured');
      } else {
        show = c.dataset.cat === currentFilter;
      }
      c.classList.toggle('is-hidden', !show);
      if (show) c.classList.add('is-visible'); // 确保被折叠后展开的卡片能正确显示
    });
    updateCount();
  }

  chips.forEach((chip) => {
    chip.addEventListener('click', () => {
      chips.forEach((x) => x.classList.remove('is-active'));
      chip.classList.add('is-active');
      currentFilter = chip.dataset.filter;
      // 切到某个分类时自动展开该分类全部，切回「精选」时收起
      if (currentFilter === 'all') {
        expanded = false;
        workGrid && workGrid.classList.remove('is-expanded');
        workMore && workMore.classList.remove('is-expanded');
        workMore && (workMore.querySelector('span').textContent = '展开全部作品');
      }
      applyFilter();
    });
  });

  if (workMore) {
    workMore.addEventListener('click', () => {
      expanded = !expanded;
      workMore.classList.toggle('is-expanded', expanded);
      workGrid && workGrid.classList.toggle('is-expanded', expanded);
      workMore.querySelector('span').textContent = expanded ? '收起，只看精选' : '展开全部作品';
      if (expanded && currentFilter !== 'all') {
        // 展开时回到「精选」视图
        chips.forEach((x) => x.classList.remove('is-active'));
        chips[0].classList.add('is-active');
        currentFilter = 'all';
      }
      applyFilter();
    });
  }

  updateCount();
  applyFilter();

  // ---------- Lightbox ----------
  const lb = document.getElementById('lightbox');
  const lbContent = document.getElementById('lbContent');
  const lbClose = document.getElementById('lbClose');
  const lbTitle = document.getElementById('lbTitle');
  const lbDesc = document.getElementById('lbDesc');

  function openLightbox(card) {
    if (!lb || !lbContent) return;
    const type = card.dataset.type;
    const src = card.dataset.src;
    const poster = card.dataset.poster || '';
    const title = card.dataset.title || '';
    const desc = card.dataset.desc || '';
    lbContent.innerHTML = '';
    if (type === 'video') {
      const v = document.createElement('video');
      v.src = src;
      if (poster) v.poster = poster;
      v.controls = true;
      v.playsInline = true;
      v.preload = 'none'; // 手机流量友好：点击播放才加载视频
      lbContent.appendChild(v);
    } else {
      const img = document.createElement('img');
      img.src = src;
      img.alt = title;
      lbContent.appendChild(img);
    }
    if (lbTitle) lbTitle.textContent = title;
    if (lbDesc) lbDesc.textContent = desc;
    lb.classList.add('is-open');
    lb.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }
  function closeLightbox() {
    if (!lb) return;
    lb.classList.remove('is-open');
    lb.setAttribute('aria-hidden', 'true');
    // remove any playing media
    if (lbContent) {
      lbContent.querySelectorAll('video').forEach((v) => {
        try { v.pause(); } catch (e) {}
      });
      lbContent.innerHTML = '';
    }
    document.body.style.overflow = '';
  }
  cards.forEach((card) => {
    card.addEventListener('click', (e) => {
      e.preventDefault();
      openLightbox(card);
    });
  });
  if (lbClose) lbClose.addEventListener('click', closeLightbox);
  if (lb) {
    lb.addEventListener('click', (e) => {
      if (e.target === lb) closeLightbox();
    });
  }
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && lb && lb.classList.contains('is-open')) closeLightbox();
  });

  // ---------- Mobile nav toggle ----------
  const navToggle = document.getElementById('navToggle');
  const nav = document.getElementById('nav');
  if (navToggle && nav) {
    navToggle.addEventListener('click', () => {
      const open = nav.classList.toggle('menu-open');
      navToggle.setAttribute('aria-expanded', String(open));
    });
    // 点击链接后收起菜单
    document.querySelectorAll('.nav-links a').forEach((a) => {
      a.addEventListener('click', () => {
        nav.classList.remove('menu-open');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });
    // 点击菜单外收起
    document.addEventListener('click', (e) => {
      if (nav.classList.contains('menu-open') && !nav.contains(e.target)) {
        nav.classList.remove('menu-open');
        navToggle.setAttribute('aria-expanded', 'false');
      }
    });
  }
})();

