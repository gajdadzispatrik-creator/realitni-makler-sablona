/* =============================================================================
   main.js — čistý vanilla JS, žádné knihovny, žádné inline handlery.
   Vše defenzivně ošetřené proti chybějícím prvkům.
   ========================================================================== */
(function () {
  "use strict";

  var cfg = window.SITE_CONFIG || {};

  /* Pomocné selektory ----------------------------------------------------- */
  function $(sel, ctx) { return (ctx || document).querySelector(sel); }
  function $all(sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); }

  /* Bezpečné čtení vnořené cesty z configu: get(cfg, "agent.name") -------- */
  function get(obj, path) {
    return path.split(".").reduce(function (acc, key) {
      return (acc == null) ? undefined : acc[key];
    }, obj);
  }

  /* ---------------------------------------------------------------------------
     0) Odvozené hodnoty do configu (tel:/mailto:/ico řádek)
     ------------------------------------------------------------------------ */
  function deriveConfig() {
    if (!cfg.agent) cfg.agent = {};
    var a = cfg.agent;
    if (a.phoneHref) a.phoneTel = "tel:" + a.phoneHref;
    else if (a.phone) a.phoneTel = "tel:" + a.phone.replace(/\s+/g, "");
    if (a.email) a.emailMailto = "mailto:" + a.email;

    if (cfg.office && cfg.office.ico) {
      cfg.office.icoLine = "IČO: " + cfg.office.ico;
    }
  }

  /* ---------------------------------------------------------------------------
     1) Config binding — naplní data-cfg* atributy hodnotami z SITE_CONFIG.
        HTML obsahuje fallback texty, takže bez JS web stále funguje.
     ------------------------------------------------------------------------ */
  function applyBindings() {
    $all("[data-cfg]").forEach(function (el) {
      var val = get(cfg, el.getAttribute("data-cfg"));
      if (val != null && val !== "") {
        el.textContent = val;
      } else if (el.hasAttribute("data-cfg-hide-empty")) {
        el.remove();
      }
    });
    $all("[data-cfg-href]").forEach(function (el) {
      var val = get(cfg, el.getAttribute("data-cfg-href"));
      if (val != null && val !== "") el.setAttribute("href", val);
    });
    $all("[data-cfg-src]").forEach(function (el) {
      var val = get(cfg, el.getAttribute("data-cfg-src"));
      if (val != null && val !== "") el.setAttribute("src", val);
    });
    $all("[data-cfg-alt]").forEach(function (el) {
      var val = get(cfg, el.getAttribute("data-cfg-alt"));
      if (val != null && val !== "") el.setAttribute("alt", val);
    });
  }

  /* ---------------------------------------------------------------------------
     2) Jednoduché list-rendery (trust, stats, social, typy požadavku)
     ------------------------------------------------------------------------ */
  function renderReasons() {
    var host = $("[data-reasons]");
    var reasons = cfg.hero && cfg.hero.reasons;
    if (!host || !Array.isArray(reasons) || !reasons.length) return;
    host.innerHTML = "";
    reasons.forEach(function (t) {
      var li = document.createElement("li");
      // statická (bezpečná) ikona zaškrtnutí + text přes textContent
      li.innerHTML = '<svg class="hero__reason-ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>';
      var span = document.createElement("span");
      span.textContent = t;
      li.appendChild(span);
      host.appendChild(li);
    });
  }

  function renderStats() {
    var host = $("[data-stats]");
    if (!host || !Array.isArray(cfg.stats) || !cfg.stats.length) return;
    host.innerHTML = "";
    cfg.stats.forEach(function (s) {
      var li = document.createElement("li");
      li.className = "stat";
      var v = document.createElement("span");
      v.className = "stat__value";
      var num = document.createElement("span");
      num.className = "stat__num";
      var n = Number(s.value);
      if (s.value !== "" && isFinite(n)) {
        // čistě číselná hodnota → připravená pro count-up animaci
        num.setAttribute("data-target", String(n));
        num.textContent = "0";
      } else {
        num.textContent = s.value;
      }
      v.appendChild(num);
      if (s.suffix) {
        var suf = document.createElement("span");
        suf.className = "stat__suffix";
        suf.textContent = s.suffix;
        v.appendChild(suf);
      }
      var l = document.createElement("span");
      l.className = "stat__label";
      l.textContent = s.label;
      li.appendChild(v);
      li.appendChild(l);
      host.appendChild(li);
    });
  }

  // Count-up animace statistik. Všechna čísla mají STEJNOU dobu trvání,
  // takže doběhnou současně (8 i 500 skončí ve stejný okamžik).
  function animateStats() {
    var host = $("[data-stats]");
    if (!host) return;
    var nums = $all(".stat__num[data-target]", host);
    if (!nums.length) return;
    var targets = nums.map(function (el) { return parseInt(el.getAttribute("data-target"), 10); });
    var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    function finish() { nums.forEach(function (el, i) { el.textContent = targets[i]; }); }

    function run() {
      if (reduce) { finish(); return; }
      var duration = 1600, start = null;
      function ease(t) { return 1 - Math.pow(1 - t, 3); } // easeOutCubic
      function frame(ts) {
        if (start === null) start = ts;
        var p = Math.min((ts - start) / duration, 1);
        var e = ease(p);
        for (var i = 0; i < nums.length; i++) nums[i].textContent = Math.round(e * targets[i]);
        if (p < 1) requestAnimationFrame(frame); else finish();
      }
      requestAnimationFrame(frame);
    }

    if ("IntersectionObserver" in window) {
      var obs = new IntersectionObserver(function (entries) {
        for (var i = 0; i < entries.length; i++) {
          if (entries[i].isIntersecting) { run(); obs.disconnect(); break; }
        }
      }, { threshold: 0.4 });
      obs.observe(host);
    } else {
      run();
    }
  }

  function renderSocial() {
    var hosts = $all("[data-social]");
    if (!hosts.length || !cfg.social) return;
    var labels = { facebook: "Facebook", instagram: "Instagram", linkedin: "LinkedIn" };
    hosts.forEach(function (host) {
      host.innerHTML = "";
      Object.keys(labels).forEach(function (key) {
        var url = cfg.social[key];
        if (!url) return;
        var li = document.createElement("li");
        var a = document.createElement("a");
        a.href = url;
        a.textContent = labels[key];
        a.target = "_blank";
        a.rel = "noopener noreferrer";
        li.appendChild(a);
        host.appendChild(li);
      });
    });
  }

  function renderInquiryTypes() {
    var select = $("[data-inquiry-types]");
    if (!select || !Array.isArray(cfg.inquiryTypes)) return;
    cfg.inquiryTypes.forEach(function (t) {
      var opt = document.createElement("option");
      opt.value = t;
      opt.textContent = t;
      select.appendChild(opt);
    });
  }

  /* ---------------------------------------------------------------------------
     3) Recenze — provider manual/google/firmy + fallback
     ------------------------------------------------------------------------ */
  function stars(n) {
    var r = Math.max(0, Math.min(5, parseInt(n, 10) || 0));
    return "★★★★★".slice(0, r) + "☆☆☆☆☆".slice(0, 5 - r);
  }

  function renderReviews() {
    var host = $("[data-reviews]");
    var ctaHost = $("[data-reviews-cta]");
    if (!host) return;
    var rv = cfg.reviews || {};
    var provider = rv.provider || "manual";

    host.innerHTML = "";

    if (provider === "manual") {
      // homepage zobrazuje `featured`; `all` je zásoba pro budoucí použití
      var items = Array.isArray(rv.featured) ? rv.featured : (Array.isArray(rv.items) ? rv.items : []);
      if (!items.length) {
        host.appendChild(emptyReviews("Reference zatím připravujeme",
          "Spokojení klienti jsou pro nás prioritou. Reference doplníme brzy — mezitím se na nás neváhejte obrátit."));
      } else {
        items.forEach(function (it) { host.appendChild(reviewCard(it)); });
      }
    } else if (provider === "google" || provider === "firmy") {
      // Žádné API klíče / scraping ve frontendu — jen místo pro oficiální widget.
      var name = provider === "google" ? "Google" : "Firmy.cz / Mapy.com";
      host.appendChild(emptyReviews("Recenze na " + name,
        "Sem se vloží oficiální widget " + name + ". Mezitím si recenze prohlédnete přes odkaz níže."));
    }

    if (ctaHost) renderReviewCta(ctaHost, rv);
  }

  function reviewCard(it) {
    var card = document.createElement("article");
    card.className = "review";

    var st = document.createElement("div");
    st.className = "review__stars";
    st.setAttribute("aria-label", "Hodnocení " + (parseInt(it.rating, 10) || 0) + " z 5");
    st.textContent = stars(it.rating);

    var text = document.createElement("p");
    text.className = "review__text";
    text.textContent = it.text || "";

    var meta = document.createElement("div");
    meta.className = "review__meta";
    var name = document.createElement("span");
    name.className = "review__name";
    name.textContent = it.name || "Klient";

    var src = document.createElement("span");
    src.className = "review__source";
    // badge zdroje — u Google / Firmy.cz zobraz logo, jinak text (žádný proklik)
    var srcKey = (it.source || "").toLowerCase();
    if (srcKey === "google" || srcKey.indexOf("firmy") === 0) {
      var isFirmy = srcKey.indexOf("firmy") === 0;
      var logo = document.createElement("img");
      logo.className = "review__logo" + (isFirmy ? " review__logo--firmy" : "");
      logo.src = isFirmy ? "assets/img/firmy-logo.png" : "assets/img/google-logo.png";
      logo.alt = isFirmy ? "Firmy.cz recenze" : "Google recenze";
      logo.loading = "lazy";
      logo.decoding = "async";
      src.appendChild(logo);
    } else {
      src.textContent = it.badge || ((it.source || "") + (it.year ? " · " + it.year : ""));
    }

    meta.appendChild(name);
    meta.appendChild(src);
    if (it.rating) card.appendChild(st);
    card.appendChild(text);
    card.appendChild(meta);
    return card;
  }

  function emptyReviews(title, msg) {
    var box = document.createElement("div");
    box.className = "reviews__empty";
    var strong = document.createElement("strong");
    strong.textContent = title;
    var p = document.createElement("p");
    p.textContent = msg;
    box.appendChild(strong);
    box.appendChild(p);
    return box;
  }

  function renderReviewCta(host, rv) {
    host.innerHTML = "";
    // Sekundární textové odkazy (nekonkurují hlavnímu CTA webu)
    var links = [
      { url: rv.googleUrl, label: "Zobrazit recenze na Google" },
      { url: rv.firmyUrl, label: "Zobrazit recenze na Firmy.cz" },
      { url: rv.writeUrl, label: "Napsat recenzi" }
    ];
    links.forEach(function (l) {
      if (!l.url) return;
      var a = document.createElement("a");
      a.className = "review-link";
      a.href = l.url;
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      a.textContent = l.label;
      host.appendChild(a);
    });
  }

  // Souhrnné hodnocení (placeholder z configu) — skryje se, když není value
  function renderRating() {
    var box = $("[data-rating]");
    if (!box) return;
    var rv = cfg.reviews || {};
    var r = rv.rating;
    if (!r || !r.value) { box.hidden = true; return; }
    function set(sel, val) {
      var el = $(sel, box);
      if (el && val != null && val !== "") el.textContent = val;
    }
    set("[data-rating-value]", r.value);
    set("[data-rating-out]", r.outOf);
    set("[data-rating-label]", r.label);
    // Zdroje v rating boxu jako klikací odkazy (skryjí se, když není URL)
    function srcLink(sel, url) {
      var el = $(sel, box);
      if (!el) return;
      if (url && url !== "#") { el.href = url; }
      else { el.removeAttribute("href"); }
    }
    srcLink("[data-rating-google]", rv.googleUrl);
    srcLink("[data-rating-firmy]", rv.firmyUrl);
  }

  /* ---------------------------------------------------------------------------
     4) Mobilní menu — a11y, Escape, klik mimo, zavření po kliknutí na odkaz
     ------------------------------------------------------------------------ */
  function initMenu() {
    var toggle = $(".nav-toggle");
    var menu = $("#mobile-menu");
    var backdrop = $(".menu-backdrop");
    if (!toggle || !menu) return;

    function open() {
      menu.hidden = false;
      if (backdrop) backdrop.hidden = false;
      toggle.setAttribute("aria-expanded", "true");
      toggle.setAttribute("aria-label", "Zavřít menu");
      document.body.style.overflow = "hidden";
    }
    function close() {
      menu.hidden = true;
      if (backdrop) backdrop.hidden = true;
      toggle.setAttribute("aria-expanded", "false");
      toggle.setAttribute("aria-label", "Otevřít menu");
      document.body.style.overflow = "";
    }
    function isOpen() { return toggle.getAttribute("aria-expanded") === "true"; }

    toggle.addEventListener("click", function () { isOpen() ? close() : open(); });
    if (backdrop) backdrop.addEventListener("click", close);

    $all(".mobile-menu__link, .mobile-menu__actions a").forEach(function (link) {
      link.addEventListener("click", close);
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && isOpen()) { close(); toggle.focus(); }
    });

    // Pojistka: po přechodu na desktop menu zavři (sjednoceno se zlomem navigace 1080px)
    window.addEventListener("resize", function () {
      if (window.innerWidth >= 1080 && isOpen()) close();
    });
  }

  /* ---------------------------------------------------------------------------
     Plynulý scroll na kotvy BEZ #hashe v URL.
     Jméno v hlavičce (#top) posune úplně nahoru na hero.
     ------------------------------------------------------------------------ */
  function initSmoothNav() {
    var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var behavior = reduce ? "auto" : "smooth";
    $all('a[href^="#"]').forEach(function (link) {
      link.addEventListener("click", function (e) {
        var href = link.getAttribute("href");
        if (!href || href === "#") { e.preventDefault(); return; }
        var id = href.slice(1);
        if (id === "top") {
          e.preventDefault();
          window.scrollTo({ top: 0, behavior: behavior });
        } else {
          var target = document.getElementById(id);
          if (!target) return;
          e.preventDefault();
          target.scrollIntoView({ behavior: behavior, block: "start" });
        }
        // smaž #hash z adresního řádku
        if (history.replaceState) {
          history.replaceState(null, "", location.pathname + location.search);
        }
      });
    });
  }

  /* ---------------------------------------------------------------------------
     5) Scrollspy — aktivní stav navigace (IntersectionObserver, žádné scroll listenery)
     ------------------------------------------------------------------------ */
  function initScrollSpy() {
    var links = $all(".nav__link");
    if (!links.length || !("IntersectionObserver" in window)) return;

    var map = {};
    links.forEach(function (link) {
      var id = link.getAttribute("href");
      if (id && id.charAt(0) === "#") map[id.slice(1)] = link;
    });

    var sections = Object.keys(map)
      .map(function (id) { return document.getElementById(id); })
      .filter(Boolean);
    if (!sections.length) return;

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          links.forEach(function (l) { l.classList.remove("is-active"); });
          var active = map[entry.target.id];
          if (active) active.classList.add("is-active");
        }
      });
    }, { rootMargin: "-45% 0px -50% 0px", threshold: 0 });

    sections.forEach(function (s) { observer.observe(s); });
  }

  /* ---------------------------------------------------------------------------
     6) Formulář — základní validace (bez backendu)
        Připraveno na napojení: vyplň data-endpoint na <form> a doplň fetch níže.
     ------------------------------------------------------------------------ */
  function initForm() {
    var form = $("#contact-form");
    if (!form) return;

    var status = $("[data-form-status]", form);

    function setError(name, msg) {
      var field = form.elements[name];
      var slot = $('[data-error-for="' + name + '"]', form);
      if (field) field.setAttribute("aria-invalid", msg ? "true" : "false");
      if (slot) slot.textContent = msg || "";
    }

    function validEmail(v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); }
    function validPhone(v) { return v.replace(/[\s()+-]/g, "").length >= 9; }

    function validate() {
      var ok = true;
      var name = (form.elements.name.value || "").trim();
      var phone = (form.elements.phone.value || "").trim();
      var email = (form.elements.email.value || "").trim();
      var gdpr = form.elements.gdpr.checked;

      setError("name", name ? "" : "Vyplňte prosím jméno.");
      if (!name) ok = false;

      if (!phone) { setError("phone", "Vyplňte telefon."); ok = false; }
      else if (!validPhone(phone)) { setError("phone", "Zadejte platné telefonní číslo."); ok = false; }
      else setError("phone", "");

      if (!email) { setError("email", "Vyplňte e-mail."); ok = false; }
      else if (!validEmail(email)) { setError("email", "Zadejte platný e-mail."); ok = false; }
      else setError("email", "");

      setError("gdpr", gdpr ? "" : "Bez souhlasu nelze poptávku odeslat.");
      if (!gdpr) ok = false;

      return ok;
    }

    function showStatus(state, msg) {
      if (!status) return;
      status.hidden = false;
      status.setAttribute("data-state", state);
      status.textContent = msg;
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();

      // Honeypot: když je vyplněný, tváříme se jako úspěch a nic neodesíláme.
      if (form.elements.company && form.elements.company.value) {
        showStatus("success", "Děkujeme, ozveme se vám.");
        return;
      }

      if (!validate()) {
        showStatus("error", "Zkontrolujte prosím zvýrazněná pole.");
        var firstInvalid = $('[aria-invalid="true"]', form);
        if (firstInvalid) firstInvalid.focus();
        return;
      }

      // ----- MÍSTO PRO BUDOUCÍ NAPOJENÍ -----------------------------------
      // var endpoint = form.getAttribute("data-endpoint");
      // if (endpoint) {
      //   fetch(endpoint, { method: "POST", body: new FormData(form) })
      //     .then(...) — CRM / e-mail služba / serverless / webhook
      // }
      // Žádné API klíče ve frontendu!
      // --------------------------------------------------------------------

      showStatus("success", "Děkujeme za poptávku. Formulář zatím není napojený na server — propojení doplníme.");
    });

    // Vyčisti chybu při psaní
    $all("input, select, textarea", form).forEach(function (el) {
      el.addEventListener("input", function () {
        if (el.name) setError(el.name, "");
      });
    });
  }

  /* ---------------------------------------------------------------------------
     7) Drobnosti — rok v patičce
     ------------------------------------------------------------------------ */
  function initYear() {
    var el = $("[data-year]");
    if (el) el.textContent = String(new Date().getFullYear());
  }

  /* ---------------------------------------------------------------------------
     INIT
     ------------------------------------------------------------------------ */
  function init() {
    deriveConfig();
    renderReasons();
    renderStats();
    animateStats();
    renderSocial();
    renderInquiryTypes();
    renderReviews();
    renderRating();
    applyBindings(); // až po renderech, ať přepíše i vygenerovaný obsah
    initMenu();
    initSmoothNav();
    initScrollSpy();
    initForm();
    initYear();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
