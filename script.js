/* SIRAJ Jewels — motion (GSAP 3.12.5 + ScrollTrigger, met fallbacks)
   - ?static=1 kill-switch
   - prefers-reduced-motion gerespecteerd
   - content blijft zichtbaar zonder JS/GSAP (gsap.from verbergt pas runtime)
   - safety-timeout 3s */
(function () {
  "use strict";

  var params = new URLSearchParams(window.location.search);
  var staticMode = params.get("static") === "1";
  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Header shadow (werkt altijd, ook zonder GSAP)
  var header = document.querySelector(".site-header");
  function onScroll() {
    if (header) header.classList.toggle("is-scrolled", window.scrollY > 24);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // Kill-switch / reduced motion / GSAP niet geladen → alles blijft gewoon zichtbaar
  if (staticMode || reducedMotion) return;
  if (typeof window.gsap === "undefined" || typeof window.ScrollTrigger === "undefined") return;

  var gsap = window.gsap;
  gsap.registerPlugin(window.ScrollTrigger);

  // Start motion pas wanneer de pagina zichtbaar is (laden in achtergrondtab:
  // rAF/timers staan dan stil en de intro zou bevroren blijven op opacity 0).
  if (document.hidden) {
    document.addEventListener("visibilitychange", function onVisible() {
      if (document.hidden) return;
      document.removeEventListener("visibilitychange", onVisible);
      initMotion();
    });
  } else {
    initMotion();
  }

  function initMotion() {
  document.documentElement.classList.add("gsap-on");

  // Safety timeout: na 3s hero-intro definitief zichtbaar, wat er ook gebeurt.
  setTimeout(function () {
    gsap.set("[data-hero]", { clearProps: "opacity,transform" });
  }, 3000);

  try {
    // Hero: rustige, gestagede opkomst
    gsap.from("[data-hero]", {
      opacity: 0,
      y: 36,
      duration: 1.1,
      ease: "power3.out",
      stagger: 0.12,
      delay: 0.15,
      clearProps: "opacity,transform"
    });

    // Hero-gem: langzame tekenachtige binnenkomst + eeuwige subtiele zweving
    var heroGem = document.querySelector(".hero__gem");
    if (heroGem) {
      gsap.from(heroGem, { opacity: 0, scale: 0.85, duration: 1.4, ease: "power2.out" });
      gsap.to(heroGem, {
        y: -10,
        duration: 3.2,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1
      });
    }

    // Scroll-reveals per sectie (immediateRender:false → nooit vooraf verborgen)
    document.querySelectorAll(".section, .cta").forEach(function (section) {
      var items = section.querySelectorAll("[data-reveal]");
      if (!items.length) return;
      gsap.from(items, {
        opacity: 0,
        y: 42,
        duration: 0.95,
        ease: "power3.out",
        stagger: 0.1,
        immediateRender: false,
        clearProps: "opacity,transform",
        scrollTrigger: {
          trigger: section,
          start: "top 78%",
          once: true
        }
      });
    });

    // Marquee: naadloze loop
    var track = document.querySelector("[data-marquee]");
    if (track) {
      gsap.to(track, { xPercent: -50, ease: "none", duration: 28, repeat: -1 });
    }

    // Zachte parallax op decor-lijnen
    document.querySelectorAll("[data-parallax]").forEach(function (el) {
      var amount = parseFloat(el.getAttribute("data-parallax")) || 40;
      gsap.to(el, {
        y: amount,
        ease: "none",
        scrollTrigger: {
          trigger: document.body,
          start: "top top",
          end: "bottom bottom",
          scrub: 1.2
        }
      });
    });

    // Hero-titel: subtiele drift + fade bij wegscrollen
    var heroTitle = document.querySelector(".hero__title");
    if (heroTitle) {
      gsap.to(heroTitle, {
        y: -46,
        opacity: 0.3,
        ease: "none",
        scrollTrigger: {
          trigger: ".hero",
          start: "bottom 72%",
          end: "bottom 18%",
          scrub: true
        }
      });
    }

    // CTA-gem: langzame rotatie op scroll
    var ctaGem = document.querySelector(".cta__gem");
    if (ctaGem) {
      gsap.from(ctaGem, {
        rotate: -18,
        scale: 0.8,
        opacity: 0,
        duration: 1.2,
        ease: "power2.out",
        immediateRender: false,
        scrollTrigger: { trigger: ".cta", start: "top 75%", once: true }
      });
    }
  } catch (e) {
    // Bij elke fout: alles tonen
    gsap.set("[data-hero], [data-reveal]", { clearProps: "all", opacity: 1, y: 0 });
  }
  }
})();
