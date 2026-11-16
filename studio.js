/* Erza Studio page: language switch, scroll reveal, scroll-driven bottles, hero canvas. No dependencies, no network, no storage. */
(function () {
  "use strict";
  var root = document.documentElement;
  var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* language: browser language by default, buttons override for this visit (nothing is stored) */
  function setLang(l) {
    root.setAttribute("data-lang", l);
    root.lang = l;
    $$(".lang button").forEach(function (b) { b.setAttribute("aria-pressed", String(b.getAttribute("data-set") === l)); });
    $$("[data-al-pl]").forEach(function (el) { el.setAttribute("aria-label", el.getAttribute(l === "pl" ? "data-al-pl" : "data-al-en")); });
    var t = $("title"); if (t) { if (!t.getAttribute("data-en")) t.setAttribute("data-en", t.textContent); t.textContent = (l === "pl" && t.getAttribute("data-pl")) || t.getAttribute("data-en"); }
  }
  var nav = (navigator.languages && navigator.languages[0]) || navigator.language || "en";
  setLang(/^pl/i.test(nav) ? "pl" : "en");
  $$(".lang button").forEach(function (b) { b.addEventListener("click", function () { setLang(b.getAttribute("data-set")); }); });

  if (reduce) { initHero(true); return; }
  root.classList.add("anim");

  /* reveal */
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
    }, { threshold: 0.15 });
    $$(".reveal").forEach(function (el) { io.observe(el); });
  } else { $$(".reveal").forEach(function (el) { el.classList.add("in"); }); }

  /* pointer glow on cards */
  $$(".glow").forEach(function (c) {
    c.addEventListener("pointermove", function (e) {
      var r = c.getBoundingClientRect();
      c.style.setProperty("--mx", (e.clientX - r.left) + "px");
      c.style.setProperty("--my", (e.clientY - r.top) + "px");
    });
  });

  /* scroll-driven: story bottles fill with scroll, hero card eases out */
  var story = $("#how"), stage = story && $(".stage", story), bottles = story && $(".bottles", story), hero = $(".hero");
  if (!story || !hero) { initHero(false); return; }
  var ticking = false;
  function update() {
    ticking = false;
    var vh = window.innerHeight;
    var r = story.getBoundingClientRect();
    var span = Math.max(1, r.height - vh);
    var p = Math.min(1, Math.max(0, -r.top / span));
    bottles.style.setProperty("--p", p.toFixed(4));
    stage.setAttribute("data-step", p < 0.34 ? "1" : p < 0.74 ? "2" : "3");
    var h = hero.getBoundingClientRect();
    root.style.setProperty("--hs", Math.min(1, Math.max(0, -h.top / Math.max(1, h.height))).toFixed(3));
  }
  function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }
  addEventListener("scroll", onScroll, { passive: true });
  addEventListener("resize", onScroll);
  update();
  initHero(false);

  /* hero: drifting glowing bottles and drops on a canvas (paused offscreen / in background tabs) */
  function initHero(still) {
    var cv = $("#bg"); if (!cv || !cv.getContext) return;
    var ctx = cv.getContext("2d"), W = 0, H = 0, dpr = 1, items = [], drops = [], sprites = [];
    var COLORS = ["#E5484D", "#F7C948", "#1FB5C4", "#8E55D9", "#3FA2F6", "#F06BB0", "#8CD13F", "#F5822B"];
    var seed = 7; function rnd() { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; }

    function sprite(color) {
      var s = document.createElement("canvas"); s.width = 160; s.height = 300;
      var c = s.getContext("2d"); c.translate(80, 150);
      function path() {
        c.beginPath(); c.moveTo(-18, -110); c.lineTo(18, -110); c.lineTo(18, -78);
        c.quadraticCurveTo(38, -66, 38, -42); c.lineTo(38, 92); c.quadraticCurveTo(38, 112, 18, 112);
        c.lineTo(-18, 112); c.quadraticCurveTo(-38, 112, -38, 92); c.lineTo(-38, -42);
        c.quadraticCurveTo(-38, -66, -18, -78); c.closePath();
      }
      c.save(); path(); c.clip();
      c.shadowColor = color; c.shadowBlur = 26; c.fillStyle = color; c.globalAlpha = .9;
      c.fillRect(-40, 8, 80, 110); c.restore();
      c.shadowBlur = 0; c.globalAlpha = 1; path();
      c.strokeStyle = "rgba(255,255,255,.4)"; c.lineWidth = 2; c.stroke();
      c.fillStyle = "rgba(255,255,255,.05)"; c.fill();
      return s;
    }
    COLORS.forEach(function (col) { sprites.push(sprite(col)); });

    function build() {
      var n = W < 700 ? 7 : 12; items = []; drops = [];
      for (var i = 0; i < n; i++) {
        var depth = .35 + rnd() * .9;
        items.push({ x: rnd() * W, y: rnd() * (H + 200) - 100, s: depth * (W < 700 ? .55 : .8), vy: 5 + depth * 10, vx: (rnd() - .5) * 4,
          r: (rnd() - .5) * .8, vr: (rnd() - .5) * .04, sp: sprites[i % sprites.length], a: .18 + depth * .32 });
      }
      for (var j = 0; j < 22; j++) drops.push({ x: rnd() * W, y: rnd() * H, r: 1.5 + rnd() * 3.5, vy: 6 + rnd() * 16, c: COLORS[j % COLORS.length], a: .25 + rnd() * .5 });
    }
    function size() {
      dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      var b = cv.getBoundingClientRect(); W = b.width; H = b.height;
      cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0); build(); draw(0);
    }
    function draw(dt) {
      ctx.clearRect(0, 0, W, H);
      var i, it, d;
      for (i = 0; i < drops.length; i++) {
        d = drops[i]; d.y -= d.vy * dt; if (d.y < -10) { d.y = H + 10; d.x = rnd() * W; }
        ctx.globalAlpha = d.a; ctx.fillStyle = d.c; ctx.shadowColor = d.c; ctx.shadowBlur = 14;
        ctx.beginPath(); ctx.arc(d.x, d.y, d.r, 0, 6.2832); ctx.fill();
      }
      ctx.shadowBlur = 0;
      for (i = 0; i < items.length; i++) {
        it = items[i]; it.y -= it.vy * dt; it.x += it.vx * dt; it.r += it.vr * dt;
        if (it.y < -200) { it.y = H + 200; it.x = rnd() * W; }
        ctx.save(); ctx.globalAlpha = it.a; ctx.translate(it.x, it.y); ctx.rotate(it.r); ctx.scale(it.s, it.s);
        ctx.drawImage(it.sp, -80, -150); ctx.restore();
      }
      ctx.globalAlpha = 1;
    }
    size();
    var rt; addEventListener("resize", function () { clearTimeout(rt); rt = setTimeout(size, 150); });
    if (still) return;
    var run = true, last = 0, vis = true;
    function frame(t) {
      if (run && vis) { draw(Math.min(.05, (t - last) / 1000)); }
      last = t; requestAnimationFrame(frame);
    }
    if ("IntersectionObserver" in window) new IntersectionObserver(function (es) { run = es[0].isIntersecting; }).observe(cv);
    document.addEventListener("visibilitychange", function () { vis = !document.hidden; });
    requestAnimationFrame(function (t) { last = t; frame(t); });
  }
})();
