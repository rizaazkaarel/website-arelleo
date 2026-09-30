
(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var canHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };

  
  var yearEl = $("#year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  
  var header = $("#header");
  var progress = document.createElement("div");
  progress.className = "progress";
  progress.setAttribute("aria-hidden", "true");
  document.body.appendChild(progress);

  var ticking = false;
  function onScroll() {
    var y = window.scrollY || window.pageYOffset;
    var max = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.transform = "scaleX(" + (max > 0 ? Math.min(y / max, 1) : 0) + ")";
    if (header) header.classList.toggle("scrolled", y > 40);
    ticking = false;
  }
  window.addEventListener("scroll", function () {
    if (!ticking) {
      window.requestAnimationFrame(onScroll);
      ticking = true;
    }
  }, { passive: true });
  onScroll();

  
  var menuBtn = $("#menuBtn");
  var nav = $("#nav");

  function setMenu(open) {
    if (!menuBtn || !nav) return;
    nav.classList.toggle("open", open);
    menuBtn.setAttribute("aria-expanded", String(open));
    menuBtn.setAttribute("aria-label", open ? "Tutup menu" : "Buka menu");
    document.body.classList.toggle("menu-open", open);
  }

  if (menuBtn && nav) {
    menuBtn.addEventListener("click", function () {
      setMenu(menuBtn.getAttribute("aria-expanded") !== "true");
    });
    $$("a", nav).forEach(function (a) {
      a.addEventListener("click", function () { setMenu(false); });
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") setMenu(false);
    });
    window.addEventListener("resize", function () {
      if (window.innerWidth > 820) setMenu(false);
    });
  }

  
  var navLinks = $$('.nav a[href^="#"]');
  var sections = $$("main section[id]");
  if ("IntersectionObserver" in window && sections.length) {
    var navObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var id = "#" + entry.target.id;
        navLinks.forEach(function (link) {
          link.classList.toggle("active", link.getAttribute("href") === id && !link.classList.contains("nav-cta"));
        });
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    sections.forEach(function (s) { navObserver.observe(s); });
  }

  
  var typedEl = $("#typed");
  if (typedEl) {
    var words = [
      "web developer.",
      "skeleton",
      "legal 17",
      "tugas tipis tipis main besar besar."
    ];

    if (reduceMotion) {
      typedEl.textContent = words[0];
    } else {
      var wi = 0, ci = 0, deleting = false;
      (function tick() {
        var word = words[wi];
        ci += deleting ? -1 : 1;
        typedEl.textContent = word.slice(0, ci);

        var delay = deleting ? 35 : 80;
        if (!deleting && ci === word.length) {
          deleting = true;
          delay = 1700;
        } else if (deleting && ci === 0) {
          deleting = false;
          wi = (wi + 1) % words.length;
          delay = 350;
        }
        setTimeout(tick, delay);
      })();
    }
  }

  
  var hero = $(".hero");
  var heroTitle = $(".hero-title");
  if (hero && canHover && !reduceMotion) {
    hero.addEventListener("pointermove", function (e) {
      var r = hero.getBoundingClientRect();
      var x = e.clientX - r.left;
      var y = e.clientY - r.top;
      hero.style.setProperty("--mx", x + "px");
      hero.style.setProperty("--my", y + "px");
      if (heroTitle) {
        var dx = (x / r.width - 0.5) * 14;
        var dy = (y / r.height - 0.5) * 10;
        heroTitle.style.transform = "translate(" + dx + "px," + dy + "px)";
      }
    });
    hero.addEventListener("pointerleave", function () {
      if (heroTitle) heroTitle.style.transform = "";
    });
  }

  
  if (canHover && !reduceMotion) {
    $$(".btn").forEach(function (btn) {
      btn.addEventListener("pointermove", function (e) {
        var r = btn.getBoundingClientRect();
        var x = (e.clientX - r.left - r.width / 2) * 0.22;
        var y = (e.clientY - r.top - r.height / 2) * 0.3;
        btn.style.transform = "translate(" + x + "px," + y + "px)";
      });
      btn.addEventListener("pointerleave", function () {
        btn.style.transform = "";
      });
    });
  }

  
  var revealTargets = $$(
    ".section-title, .about-text, .stats li, .skills li, .filters, .work, .contact-lead, .socials li, .form"
  );
  var groups = new Map();
  revealTargets.forEach(function (el) {
    el.classList.add("reveal");
    var parent = el.parentElement;
    var n = groups.get(parent) || 0;
    el.style.setProperty("--d", Math.min(n * 0.08, 0.5) + "s");
    groups.set(parent, n + 1);
  });

  if ("IntersectionObserver" in window && !reduceMotion) {
    var revealObserver = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
    revealTargets.forEach(function (el) { revealObserver.observe(el); });
  } else {
    revealTargets.forEach(function (el) { el.classList.add("in"); });
  }

  
  var counters = $$("[data-count]");
  function animateCount(el) {
    var target = parseInt(el.getAttribute("data-count"), 10) || 0;
    if (reduceMotion || target === 0) {
      el.textContent = target;
      return;
    }
    var duration = 1400;
    var start = null;
    function step(ts) {
      if (start === null) start = ts;
      var p = Math.min((ts - start) / duration, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased);
      if (p < 1) window.requestAnimationFrame(step);
    }
    window.requestAnimationFrame(step);
  }

  if ("IntersectionObserver" in window) {
    var countObserver = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animateCount(entry.target);
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.6 });
    counters.forEach(function (c) { countObserver.observe(c); });
  } else {
    counters.forEach(animateCount);
  }

  
  var filterBtns = $$(".filter");
  var works = $$(".work");

  filterBtns.forEach(function (btn) {
    btn.setAttribute("aria-pressed", btn.classList.contains("active") ? "true" : "false");
    btn.addEventListener("click", function () {
      var filter = btn.getAttribute("data-filter");

      filterBtns.forEach(function (b) {
        var on = b === btn;
        b.classList.toggle("active", on);
        b.setAttribute("aria-pressed", String(on));
      });

      var shown = 0;
      works.forEach(function (w) {
        var match = filter === "all" || w.getAttribute("data-cat") === filter;
        w.classList.remove("pop");
        w.classList.toggle("is-hidden", !match);
        if (match) {
          w.classList.add("in");
          
          void w.offsetWidth;
          w.style.animationDelay = shown * 0.07 + "s";
          w.classList.add("pop");
          shown++;
        }
      });
    });
  });

  
  if (canHover && !reduceMotion) {
    works.forEach(function (card) {
      card.addEventListener("pointermove", function (e) {
        var r = card.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width - 0.5;
        var py = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform =
          "perspective(800px) rotateY(" + px * 9 + "deg) rotateX(" + -py * 9 + "deg)";
      });
      card.addEventListener("pointerleave", function () {
        card.style.transform = "";
      });
    });
  }

  
  var form = $("#form");
  var note = $("#formNote");

  function setNote(msg, type) {
    if (!note) return;
    note.textContent = msg;
    note.className = "form-note" + (type ? " " + type : "");
  }

  if (form) {
    var emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

    $$("input, textarea", form).forEach(function (field) {
      field.addEventListener("input", function () {
        field.closest("label").classList.remove("invalid");
      });
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();

      var nama = form.elements["nama"];
      var email = form.elements["email"];
      var pesan = form.elements["pesan"];
      var firstInvalid = null;

      [nama, email, pesan].forEach(function (f) {
        var val = f.value.trim();
        var bad = !val || (f === email && !emailRe.test(val));
        f.closest("label").classList.toggle("invalid", bad);
        if (bad && !firstInvalid) firstInvalid = f;
      });

      if (firstInvalid) {
        setNote("Isi semua kolom dengan benar dulu ya.", "error");
        firstInvalid.focus();
        return;
      }

      
      var subject = encodeURIComponent("Pesan dari " + nama.value.trim() + " (portofolio)");
      var body = encodeURIComponent(
        pesan.value.trim() + "\n\n— " + nama.value.trim() + " (" + email.value.trim() + ")"
      );
      window.location.href = "mailto:rizaleo709@gmail.com?subject=" + subject + "&body=" + body;

      setNote("Membuka aplikasi email kamu… terima kasih, " + nama.value.trim() + "!", "ok");
      form.reset();
    });
  }
})();