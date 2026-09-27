/* =========================================================
   FlexGrid — interactive behavior
   Features:
   1. Dark / light theme toggle (persisted)
   2. Mobile navigation toggle
   3. Scroll progress bar
   4. Scroll-reveal animations (IntersectionObserver)
   5. Active nav link highlighting on scroll
   6. Animated stat counters
   7. Live Flexbox playground
   8. Back-to-top button
   9. Contact form validation
   ========================================================= */

(function () {
  "use strict";

  var root = document.documentElement;
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- 1. Theme toggle ---------- */
  var themeToggle = document.getElementById("themeToggle");
  if (themeToggle) {
    themeToggle.addEventListener("click", function () {
      var isDark = root.getAttribute("data-theme") === "dark";
      if (isDark) {
        root.removeAttribute("data-theme");
        try { localStorage.setItem("fg-theme", "light"); } catch (e) {}
      } else {
        root.setAttribute("data-theme", "dark");
        try { localStorage.setItem("fg-theme", "dark"); } catch (e) {}
      }
    });
  }

  /* ---------- 2. Mobile navigation toggle ---------- */
  var navToggle = document.getElementById("navToggle");
  var mainNav = document.getElementById("mainNav");
  if (navToggle && mainNav) {
    navToggle.addEventListener("click", function () {
      var isOpen = mainNav.classList.toggle("open");
      navToggle.classList.toggle("open", isOpen);
      navToggle.setAttribute("aria-expanded", String(isOpen));
    });

    // Close menu after clicking a link (helpful on mobile)
    mainNav.addEventListener("click", function (event) {
      if (event.target.tagName === "A") {
        mainNav.classList.remove("open");
        navToggle.classList.remove("open");
        navToggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  /* ---------- 3. Scroll progress bar ---------- */
  var progress = document.getElementById("scrollProgress");
  var toTop = document.getElementById("toTop");

  function onScroll() {
    var scrollTop = window.scrollY || document.documentElement.scrollTop;
    var height = document.documentElement.scrollHeight - window.innerHeight;
    var pct = height > 0 ? (scrollTop / height) * 100 : 0;

    if (progress) progress.style.width = pct + "%";

    // 8. Back-to-top visibility
    if (toTop) toTop.classList.toggle("show", scrollTop > 500);
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- 8. Back-to-top click ---------- */
  if (toTop) {
    toTop.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
    });
  }

  /* ---------- 4. Scroll-reveal animations ---------- */
  var revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !reduceMotion) {
    var revealObserver = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry, i) {
        if (entry.isIntersecting) {
          // Slight stagger for a polished cascade effect
          var delay = Math.min(i * 60, 180);
          setTimeout(function () {
            entry.target.classList.add("visible");
          }, delay);
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });

    revealEls.forEach(function (el) { revealObserver.observe(el); });
  } else {
    // Fallback: show everything immediately
    revealEls.forEach(function (el) { el.classList.add("visible"); });
  }

  /* ---------- 5. Active nav link on scroll ---------- */
  var navLinks = Array.prototype.slice.call(document.querySelectorAll(".main-nav a"));
  var sections = navLinks
    .map(function (link) {
      var id = link.getAttribute("href");
      return id && id.charAt(0) === "#" ? document.querySelector(id) : null;
    })
    .filter(Boolean);

  if ("IntersectionObserver" in window && sections.length) {
    var navObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          navLinks.forEach(function (l) {
            l.classList.toggle("active", l.getAttribute("href") === "#" + entry.target.id);
          });
        }
      });
    }, { threshold: 0.5, rootMargin: "-80px 0px -50% 0px" });

    sections.forEach(function (sec) { navObserver.observe(sec); });
  }

  /* ---------- 6. Animated stat counters ---------- */
  var counters = document.querySelectorAll(".counter");
  function animateCounter(el) {
    var target = parseInt(el.getAttribute("data-target"), 10) || 0;
    var suffix = el.getAttribute("data-suffix") || "";
    if (reduceMotion || target === 0) {
      el.textContent = target + suffix;
      return;
    }
    var duration = 1200;
    var start = null;
    function step(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / duration, 1);
      // ease-out for a natural finish
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(eased * target) + suffix;
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  if ("IntersectionObserver" in window) {
    var counterObserver = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.6 });
    counters.forEach(function (c) { counterObserver.observe(c); });
  } else {
    counters.forEach(function (c) {
      c.textContent = (c.getAttribute("data-target") || "0") + (c.getAttribute("data-suffix") || "");
    });
  }

  /* ---------- 7. Live Flexbox playground ---------- */
  var stage = document.getElementById("pgStage");
  var codeOut = document.getElementById("pgCode");
  var pgDirection = document.getElementById("pgDirection");
  var pgJustify = document.getElementById("pgJustify");
  var pgAlign = document.getElementById("pgAlign");
  var pgWrap = document.getElementById("pgWrap");
  var pgGap = document.getElementById("pgGap");
  var pgGapValue = document.getElementById("pgGapValue");

  function updatePlayground() {
    if (!stage) return;
    var direction = pgDirection.value;
    var justify = pgJustify.value;
    var align = pgAlign.value;
    var wrap = pgWrap.value;
    var gap = pgGap.value;

    // Apply the chosen flex properties directly to the stage
    stage.style.flexDirection = direction;
    stage.style.justifyContent = justify;
    stage.style.alignItems = align;
    stage.style.flexWrap = wrap;
    stage.style.gap = gap + "px";

    if (pgGapValue) pgGapValue.textContent = gap;

    // Mirror the current state as copy-ready CSS
    if (codeOut) {
      codeOut.textContent =
        ".container {\n" +
        "  display: flex;\n" +
        "  flex-direction: " + direction + ";\n" +
        "  justify-content: " + justify + ";\n" +
        "  align-items: " + align + ";\n" +
        "  flex-wrap: " + wrap + ";\n" +
        "  gap: " + gap + "px;\n" +
        "}";
    }
  }

  if (stage) {
    [pgDirection, pgJustify, pgAlign, pgWrap, pgGap].forEach(function (ctrl) {
      if (ctrl) ctrl.addEventListener("input", updatePlayground);
    });
    updatePlayground(); // initialize on load
  }

  /* ---------- 9. Contact form validation ---------- */
  var form = document.getElementById("contactForm");
  var feedback = document.getElementById("formFeedback");
  if (form) {
    form.addEventListener("submit", function (event) {
      event.preventDefault(); // no backend — demonstrate the flow

      var name = form.name.value.trim();
      var email = form.email.value.trim();
      var message = form.message.value.trim();

      if (!name || !email || !message) {
        feedback.textContent = "Please fill in your name, email and message before submitting.";
        feedback.style.color = "#ef4444";
        return;
      }

      var emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(email)) {
        feedback.textContent = "Please enter a valid email address.";
        feedback.style.color = "#ef4444";
        return;
      }

      feedback.textContent = "Thanks, " + name + "! Your message has been received.";
      feedback.style.color = "";
      form.reset();
    });
  }

  /* ---------- Footer year (keeps copyright current) ---------- */
  // (Static markup already shows 2026; nothing to update here.)
})();
