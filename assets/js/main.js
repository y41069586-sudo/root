/* =========================================================
   Glowé — Interaktion
   Kein Framework, keine Abhängigkeiten. ~4 KB.
   ========================================================= */
(function () {
  "use strict";

  document.documentElement.classList.add("js");

  var reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  /* ---------- 1. Fade-in beim Scrollen ---------- */
  function initReveal() {
    var items = document.querySelectorAll(".reveal");
    if (!items.length) return;

    if (reduceMotion || !("IntersectionObserver" in window)) {
      items.forEach(function (el) {
        el.classList.add("is-visible");
      });
      return;
    }

    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
    );

    items.forEach(function (el, i) {
      // Gestaffelt innerhalb einer Gruppe, nicht über die ganze Seite.
      var group = el.closest("[data-reveal-group]");
      if (group) {
        var siblings = Array.prototype.slice.call(
          group.querySelectorAll(".reveal")
        );
        el.style.setProperty(
          "--reveal-delay",
          Math.min(siblings.indexOf(el), 5) * 90 + "ms"
        );
      }
      io.observe(el);
    });
  }

  /* ---------- 2. Header: opak ab Scroll ---------- */
  function initHeader() {
    var header = document.querySelector(".header");
    if (!header) return;
    var ticking = false;
    function update() {
      header.classList.toggle("is-stuck", window.scrollY > 8);
      ticking = false;
    }
    window.addEventListener(
      "scroll",
      function () {
        if (ticking) return;
        ticking = true;
        window.requestAnimationFrame(update);
      },
      { passive: true }
    );
    update();
  }

  /* ---------- 3. Mobile-Navigation ---------- */
  function initBurger() {
    var burger = document.querySelector(".burger");
    var nav = document.getElementById("mobile-nav");
    if (!burger || !nav) return;
    burger.addEventListener("click", function () {
      var open = burger.getAttribute("aria-expanded") === "true";
      burger.setAttribute("aria-expanded", String(!open));
      nav.hidden = open;
    });
    nav.addEventListener("click", function (e) {
      if (e.target.tagName === "A") {
        burger.setAttribute("aria-expanded", "false");
        nav.hidden = true;
      }
    });
  }

  /* ---------- 4. Feature-Tabs (echtes Tab-Pattern inkl. Tastatur) ---------- */
  function initTabs() {
    var list = document.querySelector('[role="tablist"][data-tabs]');
    if (!list) return;
    var tabs = Array.prototype.slice.call(list.querySelectorAll('[role="tab"]'));

    function select(tab, focus) {
      tabs.forEach(function (t) {
        var on = t === tab;
        t.setAttribute("aria-selected", String(on));
        t.tabIndex = on ? 0 : -1;
        var panel = document.getElementById(t.getAttribute("aria-controls"));
        if (panel) panel.classList.toggle("is-active", on);
      });
      if (focus) tab.focus();
    }

    tabs.forEach(function (tab) {
      tab.addEventListener("click", function () {
        select(tab, false);
      });
      tab.addEventListener("keydown", function (e) {
        var i = tabs.indexOf(tab);
        var next = null;
        if (e.key === "ArrowDown" || e.key === "ArrowRight")
          next = tabs[(i + 1) % tabs.length];
        else if (e.key === "ArrowUp" || e.key === "ArrowLeft")
          next = tabs[(i - 1 + tabs.length) % tabs.length];
        else if (e.key === "Home") next = tabs[0];
        else if (e.key === "End") next = tabs[tabs.length - 1];
        if (next) {
          e.preventDefault();
          select(next, true);
        }
      });
    });
  }

  /* ---------- 5. Skin-Score-Screen: Now / In 14 days ---------- */
  var SCORES = {
    now: {
      overall: 56,
      texture: 55,
      redness: 52,
      pores: 57,
      evenness: 58,
      glow: 60,
      hydration: 59,
      blemishes: 50
    },
    later: {
      overall: 74,
      texture: 72,
      redness: 71,
      pores: 69,
      evenness: 76,
      glow: 80,
      hydration: 78,
      blemishes: 68
    }
  };

  function paintScores(root, set, animate) {
    Object.keys(set).forEach(function (key) {
      var cell = root.querySelector('[data-score="' + key + '"]');
      if (!cell) return;
      var value = set[key];
      var out = cell.querySelector(".score__value");
      var fill = cell.querySelector(".score__fill");
      if (fill) fill.style.width = value + "%";
      if (!out) return;
      if (!animate || reduceMotion) {
        out.textContent = value;
        return;
      }
      countTo(out, parseInt(out.textContent, 10) || 0, value, 520);
    });
  }

  function countTo(el, from, to, duration) {
    var start = null;
    function frame(ts) {
      if (start === null) start = ts;
      var t = Math.min((ts - start) / duration, 1);
      var eased = 1 - Math.pow(1 - t, 3);
      el.textContent = Math.round(from + (to - from) * eased);
      if (t < 1) window.requestAnimationFrame(frame);
    }
    window.requestAnimationFrame(frame);
  }

  function initSkinScreen() {
    var screen = document.querySelector("[data-skin-screen]");
    if (!screen) return;
    var seg = screen.querySelector(".seg");
    var btns = Array.prototype.slice.call(screen.querySelectorAll(".seg__btn"));
    var painted = false;

    function show(index, animate) {
      seg.dataset.active = String(index);
      btns.forEach(function (b, i) {
        b.setAttribute("aria-selected", String(i === index));
        b.tabIndex = i === index ? 0 : -1;
      });
      paintScores(screen, index === 0 ? SCORES.now : SCORES.later, animate);
    }

    btns.forEach(function (btn, i) {
      btn.addEventListener("click", function () {
        show(i, true);
      });
      btn.addEventListener("keydown", function (e) {
        if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
        e.preventDefault();
        var next = e.key === "ArrowRight" ? 1 : 0;
        show(next, true);
        btns[next].focus();
      });
    });

    // Balken erst füllen, wenn das Telefon sichtbar wird.
    function fill() {
      if (painted) return;
      painted = true;
      show(0, false);
    }
    if (reduceMotion || !("IntersectionObserver" in window)) {
      fill();
    } else {
      var io = new IntersectionObserver(
        function (entries) {
          if (entries[0].isIntersecting) {
            fill();
            io.disconnect();
          }
        },
        { threshold: 0.25 }
      );
      io.observe(screen);
    }
  }

  /* ---------- 6. Routine-Screen: Schritte abhaken ---------- */
  function initRoutineScreen() {
    var screen = document.querySelector("[data-routine-screen]");
    if (!screen) return;

    var steps = Array.prototype.slice.call(screen.querySelectorAll(".step"));
    var total = steps.length;
    var totalOut = screen.querySelector("[data-steps-total]");
    var doneOut = screen.querySelector("[data-steps-done]");
    var bar = screen.querySelector("[data-steps-bar]");

    function refresh() {
      var done = 0;
      screen.querySelectorAll("[data-block]").forEach(function (block) {
        var all = block.querySelectorAll(".step");
        var checked = block.querySelectorAll('.step[aria-pressed="true"]');
        done += checked.length;
        var count = block.querySelector(".block__count");
        if (count) count.textContent = checked.length + " / " + all.length;
      });
      if (doneOut) doneOut.textContent = done;
      if (totalOut) totalOut.textContent = total;
      if (bar) bar.style.width = Math.round((done / total) * 100) + "%";
    }

    steps.forEach(function (step) {
      step.addEventListener("click", function () {
        var on = step.getAttribute("aria-pressed") === "true";
        step.setAttribute("aria-pressed", String(!on));
        refresh();
      });
    });

    // Tag-Auswahl
    var days = Array.prototype.slice.call(screen.querySelectorAll(".day"));
    days.forEach(function (day) {
      day.addEventListener("click", function () {
        days.forEach(function (d) {
          d.setAttribute("aria-pressed", String(d === day));
        });
      });
    });

    refresh();
  }

  /* ---------- 7. Pfeil: echte Pfadlänge für die Zeichen-Animation ---------- */
  function initArrow() {
    var paths = document.querySelectorAll(".duo__arrow path");
    Array.prototype.forEach.call(paths, function (path) {
      var len = Math.ceil(path.getTotalLength());
      path.style.setProperty("--len", len);
    });
  }

  /* ---------- 8. App-Store-Links in In-App-Browsern ----------
     TikTok, Instagram & Co. öffnen kein zweites Fenster: ein Klick auf einen
     Link mit target="_blank" endet dort in „Action cannot be completed".
     Deshalb navigieren wir im obersten Fenster — iOS reicht den Universal
     Link dann an den App Store weiter. */
  function initAppStore() {
    var links = document.querySelectorAll("[data-appstore]");
    if (!links.length) return;

    Array.prototype.forEach.call(links, function (link) {
      link.addEventListener("click", function (e) {
        // Auf dem Desktop soll Cmd/Ctrl/Shift-Klick weiter einen Tab öffnen.
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
        e.preventDefault();
        var url = link.href;
        try {
          window.top.location.href = url;
        } catch (err) {
          window.location.href = url;
        }
      });
    });
  }

  /* ---------- Start ---------- */
  function boot() {
    initHeader();
    initBurger();
    initReveal();
    initTabs();
    initSkinScreen();
    initRoutineScreen();
    initArrow();
    initAppStore();
    var year = document.querySelectorAll("[data-year]");
    year.forEach(function (el) {
      el.textContent = new Date().getFullYear();
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
