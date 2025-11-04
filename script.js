/* script.js
   - Particle field
   - Mobile menu interactions
   - Simple scroll reveal for sections
   - Small UI helpers
*/

// ---------- utility ----------
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => Array.from(document.querySelectorAll(sel));

/* ---------- particles canvas ---------- */
(() => {
  const canvas = document.getElementById("particles");
  const ctx = canvas.getContext("2d");
  let width = (canvas.width = innerWidth);
  let height = (canvas.height = innerHeight);
  const DPR = Math.max(1, window.devicePixelRatio || 1);
  canvas.width = width * DPR;
  canvas.height = height * DPR;
  canvas.style.width = width + "px";
  canvas.style.height = height + "px";
  ctx.scale(DPR, DPR);

  let particles = [];
  const OPTIONS = {
    count: Math.round(((width * height) / 60000) * 35) || 50,
    maxVel: 0.6,
    sizeMin: 0.6,
    sizeMax: 2.4,
    hueA: 320, // pinkish
    hueB: 330,
  };

  function rand(min, max) {
    return Math.random() * (max - min) + min;
  }

  function create() {
    particles = new Array(OPTIONS.count).fill(0).map((_) => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: rand(-OPTIONS.maxVel, OPTIONS.maxVel),
      vy: rand(-OPTIONS.maxVel, OPTIONS.maxVel),
      r: rand(OPTIONS.sizeMin, OPTIONS.sizeMax),
      alpha: rand(0.08, 0.35),
      hue: rand(OPTIONS.hueA, OPTIONS.hueB),
    }));
  }

  function onResize() {
    width = canvas.width = innerWidth;
    height = canvas.height = innerHeight;
    canvas.width = width * DPR;
    canvas.height = height * DPR;
    canvas.style.width = width + "px";
    canvas.style.height = height + "px";
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    create();
  }

  function draw() {
    ctx.clearRect(0, 0, width, height);
    for (const p of particles) {
      p.x += p.vx;
      p.y += p.vy;

      if (p.x < -10) p.x = width + 10;
      if (p.x > width + 10) p.x = -10;
      if (p.y < -10) p.y = height + 10;
      if (p.y > height + 10) p.y = -10;

      ctx.beginPath();
      const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 6);
      g.addColorStop(0, `hsla(${p.hue},100%,60%, ${p.alpha})`);
      g.addColorStop(0.5, `hsla(${p.hue},90%,48%, ${p.alpha * 0.18})`);
      g.addColorStop(1, `rgba(0,0,0,0)`);
      ctx.fillStyle = g;
      ctx.arc(p.x, p.y, p.r * 6, 0, Math.PI * 2);
      ctx.fill();
    }
    requestAnimationFrame(draw);
  }

  window.addEventListener("resize", () => {
    clearTimeout(window._pt);
    window._pt = setTimeout(onResize, 120);
  });

  create();
  draw();
})();

/* ---------- mobile menu ---------- */
(() => {
  const menuBtn = document.getElementById("menuBtn");
  const mobileMenu = document.getElementById("mobileMenu");
  const closeBtn = document.getElementById("closeMobile");
  const focusable = 'a,button,input,textarea,[tabindex]:not([tabindex="-1"])';

  function openMenu() {
    menuBtn.setAttribute("aria-expanded", "true");
    mobileMenu.setAttribute("aria-hidden", "false");
    mobileMenu.style.display = "flex";
    // trap focus on first focusable element
    const first = mobileMenu.querySelector(focusable);
    if (first) first.focus();
    document.body.style.overflow = "hidden";
  }
  function closeMenu() {
    menuBtn.setAttribute("aria-expanded", "false");
    mobileMenu.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    menuBtn.focus();
    // allow animation to finish then hide to avoid accessible reveal
    setTimeout(() => (mobileMenu.style.display = "none"), 320);
  }

  menuBtn.addEventListener("click", () => {
    const expanded = menuBtn.getAttribute("aria-expanded") === "true";
    if (expanded) closeMenu();
    else openMenu();
  });
  closeBtn.addEventListener("click", closeMenu);

  // close when user clicks a link inside mobile menu
  mobileMenu.addEventListener("click", (e) => {
    if (e.target.matches(".mobile-link")) closeMenu();
  });

  // close on escape
  document.addEventListener("keydown", (e) => {
    if (
      e.key === "Escape" &&
      mobileMenu.getAttribute("aria-hidden") === "false"
    ) {
      closeMenu();
    }
  });
})();

/* ---------- Simple intersection reveal for sections ---------- */
(() => {
  const items = $$("section, .service-card, .project, .testimonial");
  const io = new IntersectionObserver(
    (entries) => {
      for (const ent of entries) {
        if (ent.isIntersecting) {
          ent.target.classList.add("in-view");
          io.unobserve(ent.target);
        }
      }
    },
    { threshold: 0.12 },
  );

  items.forEach((i) => io.observe(i));
})();

/* ---------- small UX helpers ---------- */
(() => {
  // year in footer
  const year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();

  // nav active highlight on scroll
  const navLinks = $$(".nav-link");
  const sections = navLinks.map((a) =>
    document.querySelector(a.getAttribute("href")),
  );
  window.addEventListener("scroll", () => {
    const mid = innerHeight / 3 + pageYOffset;
    let current = sections.findIndex((s) => s && s.offsetTop <= mid);
    navLinks.forEach((l) => l.classList.remove("active"));
    if (current >= 0 && navLinks[current])
      navLinks[current].classList.add("active");
  });

  // -------- EmailJS contact form integration --------
  // Configuration: replace the three values below with your EmailJS account values.
  // - Service ID:    looks like 'service_xxxxxx'
  // - Template ID:   looks like 'template_xxxxxx'
  // - Public Key:    found in EmailJS Account > API Keys (or the 'user_xxx' legacy key)
  // Example:
  //   const EMAILJS_SERVICE_ID = 'service_abcd123';
  //   const EMAILJS_TEMPLATE_ID = 'template_efgh456';
  //   const EMAILJS_PUBLIC_KEY = 'publicKeyHere';
  const EMAILJS_SERVICE_ID = "service_ye7zt3b"; // Replace with your Service ID
  const EMAILJS_TEMPLATE_ID = "template_krbzgdh"; // Replace with your Template ID
  const EMAILJS_PUBLIC_KEY = "5SBsvEKQeyeUXKld7"; // Replace with your Public Key

  // Initialize EmailJS if the SDK is available and a public key has been provided.
  if (window.emailjs && typeof window.emailjs.init === "function") {
    try {
      if (EMAILJS_PUBLIC_KEY && EMAILJS_PUBLIC_KEY !== "YOUR_PUBLIC_KEY") {
        emailjs.init(EMAILJS_PUBLIC_KEY);
      } else {
        // If no real key is present, log a helpful message but continue (send will be blocked later)
        console.warn(
          "EmailJS public key not set. Set EMAILJS_PUBLIC_KEY in script.js to your key to enable email sending.",
        );
      }
    } catch (err) {
      console.error("Failed to initialize EmailJS:", err);
    }
  } else {
    console.warn(
      "EmailJS SDK not found. Make sure the EmailJS script (https://cdn.emailjs.com/sdk/3.11.0/email.min.js) is loaded before script.js",
    );
  }

  // Helper to show inline feedback for form submissions
  function showFormMessage(form, message, type = "info") {
    let el = form.querySelector(".form-status");
    if (!el) {
      el = document.createElement("div");
      el.className = "form-status";
      el.setAttribute("role", "status");
      el.style.marginTop = "0.75rem";
      form.appendChild(el);
    }
    el.textContent = message;
    el.style.color = type === "error" ? "#ffb4c6" : "#b8ffec";
  }

  document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("contact-form");
    if (!form) return;

    // Allow configuration via data-attributes on the form element as an alternative
    // to editing this file. Useful if you prefer to set values in `index.html`.
    // Example:
    // <form id="contact-form" data-emailjs-service="service_xxx" data-emailjs-template="template_xxx" data-emailjs-key="publicKeyHere">
    // If present, these override the constants above.
    const ds = form.dataset || {};
    const resolvedService = ds.emailjsService || EMAILJS_SERVICE_ID;
    const resolvedTemplate = ds.emailjsTemplate || EMAILJS_TEMPLATE_ID;
    const resolvedKey = ds.emailjsKey || EMAILJS_PUBLIC_KEY;

    // If we got a public key from data-attrs, attempt to initialise the SDK with it.
    // If the SDK isn't present (blocked or not loaded), try to load it dynamically as a fallback.
    function initEmailJsWithKey(key) {
      try {
        if (
          key &&
          key !== "YOUR_PUBLIC_KEY" &&
          window.emailjs &&
          typeof window.emailjs.init === "function"
        ) {
          emailjs.init(key);
          console.info("EmailJS initialized with provided key.");
        }
      } catch (e) {
        console.warn("EmailJS init via form dataset failed:", e);
      }
    }

    if (!window.emailjs) {
      // SDK not found — attempt to load it dynamically from multiple CDNs as a fallback.
      // Some environments block a single CDN; trying alternatives increases chance of success.
      const tryUrls = [
        "https://cdn.emailjs.com/sdk/3.11.0/email.min.js",
        // Alternative mirrors (version may differ; these are common public CDNs)
        "https://cdn.jsdelivr.net/npm/emailjs-com@3.2.0/dist/email.min.js",
        "https://unpkg.com/emailjs-com@3.2.0/dist/email.min.js",
      ];
      console.warn(
        "EmailJS SDK not present. Attempting to load from CDNs:",
        tryUrls,
      );

      // Try each URL in order until one succeeds
      function tryLoadAtIndex(index) {
        if (index >= tryUrls.length) {
          console.error("Failed to load EmailJS SDK from all known CDNs.");
          return;
        }
        const url = tryUrls[index];
        const s = document.createElement("script");
        s.src = url;
        s.async = true;
        s.onload = () => {
          console.info("EmailJS SDK loaded from:", url);
          // give the SDK a tick to initialize global
          setTimeout(() => initEmailJsWithKey(resolvedKey), 20);
        };
        s.onerror = (err) => {
          console.warn("Failed to load EmailJS SDK from", url, ":", err);
          // try next
          tryLoadAtIndex(index + 1);
        };
        document.head.appendChild(s);
      }

      tryLoadAtIndex(0);
    } else {
      // SDK already present
      initEmailJsWithKey(resolvedKey);
    }

    // Debugging helper: print short status about resolved EmailJS values when page loads.
    // NOTE: This prints to the console to help identify why the "Email sending is not configured" message appears.
    try {
      const short = (v) =>
        typeof v === "string" && v.length > 12 ? v.slice(0, 8) + "…" : v;
      console.info("EmailJS resolved config:", {
        sdkLoaded: !!window.emailjs,
        service: short(resolvedService),
        template: short(resolvedTemplate),
        hasKey: !!resolvedKey && resolvedKey !== "YOUR_PUBLIC_KEY",
      });
    } catch (e) {
      /* ignore console errors */
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();

      const submitBtn = form.querySelector("button[type='submit']");
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.dataset.origText = submitBtn.textContent;
        submitBtn.textContent = "Sending...";
      }

      // Basic client-side validation (matches EmailJS template variables)
      const firstName = form
        .querySelector('[name="first_name"]')
        ?.value?.trim();
      const lastName = form.querySelector('[name="last_name"]')?.value?.trim();
      const email = form.querySelector('[name="user_email"]')?.value?.trim();
      const phone = form.querySelector('[name="user_phone"]')?.value?.trim();
      const message = form.querySelector('[name="message"]')?.value?.trim();
      if (!firstName || !lastName || !email || !message) {
        showFormMessage(
          form,
          "Please fill in your first name, last name, email and message.",
          "error",
        );
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = submitBtn.dataset.origText || "Send message";
        }
        return;
      }

      // If EmailJS isn't configured, give a specific reason and bail
      const sdkLoaded = !!window.emailjs;
      const serviceOk =
        resolvedService && resolvedService !== "YOUR_SERVICE_ID";
      const templateOk =
        resolvedTemplate && resolvedTemplate !== "YOUR_TEMPLATE_ID";
      if (!sdkLoaded || !serviceOk || !templateOk) {
        // Log detailed info for debugging
        console.warn("EmailJS send prevented, configuration issue:", {
          sdkLoaded,
          resolvedService,
          resolvedTemplate,
        });

        let userMsg = "Email sending is not configured.";
        if (!sdkLoaded)
          userMsg =
            "EmailJS SDK not loaded. Make sure the SDK script is included before script.js.";
        else if (!serviceOk)
          userMsg =
            "EmailJS Service ID is missing or not set (update script.js or form data attributes).";
        else if (!templateOk)
          userMsg =
            "EmailJS Template ID is missing or not set (update script.js or form data attributes).";

        showFormMessage(form, userMsg + " Check console for details.", "error");
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = submitBtn.dataset.origText || "Send message";
        }
        return;
      }

      // Send the form using EmailJS (use resolved values which may come from the form dataset)
      emailjs.sendForm(resolvedService, resolvedTemplate, form).then(
        (response) => {
          showFormMessage(
            form,
            "Message sent successfully, thank you!",
            "success",
          );
          form.reset();
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent =
              submitBtn.dataset.origText || "Send message";
          }
        },
        (err) => {
          console.error("EmailJS error:", err);
          showFormMessage(
            form,
            "Failed to send message. Try again later.",
            "error",
          );
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent =
              submitBtn.dataset.origText || "Send message";
          }
        },
      );
    });
  });
})();
