/* Erza Studio page: language switch, screenshot lightbox, scroll reveal, soft hero canvas. No dependencies, no network, no storage. */
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
    var md = $('meta[name="description"]');
    if (md && md.getAttribute("data-pl")) md.setAttribute("content", md.getAttribute(l === "pl" ? "data-pl" : "data-en"));
    var ot = $('meta[property="og:title"]');
    if (ot && ot.getAttribute("data-pl")) ot.setAttribute("content", ot.getAttribute(l === "pl" ? "data-pl" : "data-en"));
    var od = $('meta[property="og:description"]');
    if (od && od.getAttribute("data-pl")) od.setAttribute("content", od.getAttribute(l === "pl" ? "data-pl" : "data-en"));
  }
  var nav = (navigator.languages && navigator.languages[0]) || navigator.language || "en";
  setLang(/^pl/i.test(nav) ? "pl" : "en");
  $$(".lang button").forEach(function (b) { b.addEventListener("click", function () { setLang(b.getAttribute("data-set")); }); });

  /* screenshot lightbox: any .frame button opens its visible (current-language) image full size */
  var frames = $$(".frame");
  if (frames.length && window.HTMLDialogElement) {
    var dlg = document.createElement("dialog"); dlg.className = "lb";
    dlg.innerHTML = '<button type="button" aria-label="Close">✕</button><img alt=""><p></p>';
    document.body.appendChild(dlg);
    var dImg = $("img", dlg), dCap = $("p", dlg), dBtn = $("button", dlg);
    dBtn.addEventListener("click", function () { dlg.close(); });
    dlg.addEventListener("click", function (e) { if (e.target === dlg) dlg.close(); });
    frames.forEach(function (f) {
      f.addEventListener("click", function () {
        var img = $$("img", f).filter(function (i) { return i.offsetParent !== null; })[0] || $("img", f);
        if (!img) return;
        dImg.src = img.currentSrc || img.src; dImg.alt = img.alt; dCap.textContent = img.alt;
        dBtn.setAttribute("aria-label", root.getAttribute("data-lang") === "pl" ? "Zamknij" : "Close");
        dlg.showModal();
      });
    });
  } else {
    frames.forEach(function (f) { f.style.cursor = "default"; });
  }

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

  initHero(false);

  /* hero: soft drifting shapes and drops on a canvas (paused offscreen / in background tabs) */
  function initHero(still) {
    var cv = $("#bg"); if (!cv || !cv.getContext) return;
    var ctx = cv.getContext("2d"), W = 0, H = 0, dpr = 1, items = [], drops = [], sprites = [];
    var COLORS = ["#E5484D", "#F7C948", "#1FB5C4", "#8E55D9", "#3FA2F6", "#F06BB0", "#8CD13F", "#F5822B"];
    var seed = 7; function rnd() { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; }

    function sprite(color, kind) {
      var s = document.createElement("canvas"); s.width = 160; s.height = 160;
      var c = s.getContext("2d"); c.translate(80, 80);
      function path() {
        c.beginPath();
        if (kind === 0) { c.arc(0, 0, 42, 0, 6.2832); }
        else if (kind === 1) { var r = 14, w = 38; c.moveTo(-w + r, -w); c.arcTo(w, -w, w, w, r); c.arcTo(w, w, -w, w, r); c.arcTo(-w, w, -w, -w, r); c.arcTo(-w, -w, w, -w, r); }
        else if (kind === 2) { for (var i = 0; i < 6; i++) { var a = Math.PI / 3 * i + Math.PI / 6; c[i ? "lineTo" : "moveTo"](Math.cos(a) * 44, Math.sin(a) * 44); } }
        else if (kind === 3) { c.moveTo(0, -48); c.lineTo(34, 0); c.lineTo(0, 48); c.lineTo(-34, 0); }
        else { c.arc(0, 0, 30, 0, 6.2832); }
        c.closePath();
      }
      path(); c.shadowColor = color; c.shadowBlur = 22; c.globalAlpha = kind === 4 ? .5 : .28; c.fillStyle = color; c.fill();
      c.shadowBlur = 0; c.globalAlpha = .55; c.strokeStyle = color; c.lineWidth = 2; c.stroke();
      return s;
    }
    COLORS.forEach(function (col, i) { sprites.push(sprite(col, i % 5)); });

    function build() {
      var n = W < 700 ? 6 : 10; items = []; drops = [];
      for (var i = 0; i < n; i++) {
        var depth = .35 + rnd() * .9;
        items.push({ x: rnd() * W, y: rnd() * (H + 120) - 60, s: depth * (W < 700 ? .5 : .75), vy: 3 + depth * 7, vx: (rnd() - .5) * 3,
          r: (rnd() - .5) * .8, vr: (rnd() - .5) * .03, sp: sprites[i % sprites.length], a: .12 + depth * .2 });
      }
      for (var j = 0; j < 18; j++) drops.push({ x: rnd() * W, y: rnd() * H, r: 1.2 + rnd() * 3, vy: 4 + rnd() * 12, c: COLORS[j % COLORS.length], a: .18 + rnd() * .38 });
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
        ctx.drawImage(it.sp, -it.sp.width / 2, -it.sp.height / 2); ctx.restore();
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
