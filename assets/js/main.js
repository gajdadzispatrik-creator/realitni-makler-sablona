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
    var icons = {
      facebook: '<img src="assets/img/Facebook.png" alt="" loading="lazy" />',
      instagram: '<img src="assets/img/instagram.png" alt="" loading="lazy" />',
      linkedin:
        '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><circle cx="7.5" cy="7.2" r="1.6"/><rect x="6.2" y="10.3" width="2.6" height="8.2"/><path d="M11.6 10.3h2.5v1.2c.5-.8 1.4-1.4 2.7-1.4 2 0 3.2 1.3 3.2 3.9v4.5h-2.6v-4.1c0-1.1-.4-1.9-1.5-1.9-.8 0-1.3.5-1.5 1.1-.1.2-.1.5-.1.8v4.1h-2.6z"/></svg>',
    };
    var labels = { facebook: "Facebook", instagram: "Instagram", linkedin: "LinkedIn" };
    hosts.forEach(function (host) {
      host.innerHTML = "";
      Object.keys(labels).forEach(function (key) {
        var url = cfg.social[key];
        if (!url) return;
        var li = document.createElement("li");
        var a = document.createElement("a");
        a.href = url;
        a.setAttribute("aria-label", labels[key]);
        a.innerHTML = icons[key];
        a.target = "_blank";
        a.rel = "noopener noreferrer";
        li.appendChild(a);
        host.appendChild(li);
      });
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
      // carousel: featured (3 nej) + all (zásoba) → projíždí se přes tlačítko
      var featured = Array.isArray(rv.featured) ? rv.featured : (Array.isArray(rv.items) ? rv.items : []);
      var pool = Array.isArray(rv.all) ? rv.all : [];
      var items = featured.concat(pool);
      if (!items.length) {
        host.appendChild(emptyReviews("Reference zatím připravujeme",
          "Spokojení klienti jsou pro nás prioritou. Reference doplníme brzy — mezitím se na nás neváhejte obrátit."));
      } else {
        buildReviewsCarousel(host, items);
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

  // Carousel recenzí: vždy 3 viditelné, tlačítko posune o jednu kartu doleva,
  // nová se objeví vpravo (nekonečně – první karta se po posunu přesune na konec).
  function buildReviewsCarousel(host, items) {
    host.classList.add("reviews--carousel");

    var viewport = document.createElement("div");
    viewport.className = "reviews__viewport";
    var track = document.createElement("div");
    track.className = "reviews__track";
    items.forEach(function (it) { track.appendChild(reviewCard(it)); });
    viewport.appendChild(track);
    host.appendChild(viewport);

    var nav = document.createElement("div");
    nav.className = "reviews__nav";
    var prevBtn = document.createElement("button");
    prevBtn.type = "button";
    prevBtn.className = "reviews__arrow reviews__arrow--prev";
    prevBtn.setAttribute("aria-label", "Předchozí recenze");
    prevBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 6l-6 6 6 6"/></svg>';
    var nextBtn = document.createElement("button");
    nextBtn.type = "button";
    nextBtn.className = "reviews__arrow reviews__arrow--next";
    nextBtn.setAttribute("aria-label", "Další recenze");
    nextBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 6l6 6-6 6"/></svg>';
    nav.appendChild(prevBtn);
    nav.appendChild(nextBtn);
    host.appendChild(nav);

    if (track.children.length < 2) {
      prevBtn.disabled = true;
      nextBtn.disabled = true;
    }

    var animating = false;
    function stepPx() {
      var first = track.firstElementChild;
      if (!first) return 0;
      var s = getComputedStyle(track);
      var gap = parseFloat(s.columnGap || s.gap || "0") || 0;
      return first.getBoundingClientRect().width + gap;
    }
    // transitionend-failsafe: na zaseklém/throttlovaném rendereru se transitionend
    // nemusí spustit — setTimeout jako pojistka dokončí přeskládání karet i tak.
    function finishSlide() {
      if (!animating) return;
      track.style.transition = "none";
      if (track.dataset.dir === "prev") {
        delete track.dataset.dir;
      } else {
        track.appendChild(track.firstElementChild); // první kartu na konec
      }
      track.style.transform = "translateX(0)";
      void track.offsetWidth; // reflow, aby reset neanimoval
      animating = false;
    }
    nextBtn.addEventListener("click", function () {
      if (animating || track.children.length < 2) return;
      animating = true;
      track.style.transition = "transform 0.45s ease";
      track.style.transform = "translateX(" + (-stepPx()) + "px)";
      window.setTimeout(finishSlide, 500);
    });
    prevBtn.addEventListener("click", function () {
      if (animating || track.children.length < 2) return;
      animating = true;
      track.dataset.dir = "prev";
      var last = track.lastElementChild;
      track.style.transition = "none";
      track.insertBefore(last, track.firstElementChild); // poslední kartu dopředu
      var w = stepPx();
      track.style.transform = "translateX(" + (-w) + "px)"; // stejný vizuální stav jako předtím
      void track.offsetWidth; // reflow, aby se posun neanimoval
      track.style.transition = "transform 0.45s ease";
      track.style.transform = "translateX(0)"; // odjede doprava, odhalí přidanou kartu
      window.setTimeout(finishSlide, 500);
    });
    track.addEventListener("transitionend", function (e) {
      if (e.propertyName !== "transform") return;
      finishSlide();
    });
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
    // Zdroje jako klikací odkazy (skryjí se, když není URL) — napříč celou
    // stránkou, ať to sdílí rating box i patička.
    function srcLink(sel, url) {
      $all(sel).forEach(function (el) {
        if (url && url !== "#") { el.href = url; }
        else { el.removeAttribute("href"); }
      });
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

    var success = $("[data-form-success]");

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

      // Telefon i e-mail jsou teď povinné oba.
      if (!email) {
        setError("email", "Vyplňte prosím e-mail.");
        ok = false;
      } else if (!validEmail(email)) {
        setError("email", "Zadejte platný e-mail.");
        ok = false;
      } else {
        setError("email", "");
      }

      if (!phone) {
        setError("phone", "Vyplňte prosím telefon.");
        ok = false;
      } else if (!validPhone(phone)) {
        setError("phone", "Zadejte platné telefonní číslo.");
        ok = false;
      } else {
        setError("phone", "");
      }

      setError("gdpr", gdpr ? "" : "Bez souhlasu nelze zprávu odeslat.");
      if (!gdpr) ok = false;

      return ok;
    }

    var generalError = $("[data-form-general-error]", form);
    var submitBtn = $(".lead-form__submit", form);
    var submitBtnLabel = submitBtn ? submitBtn.textContent : "";

    function showSuccess() {
      if (!success) return;
      form.hidden = true;
      success.hidden = false;
    }

    function showGeneralError(msg) {
      if (!generalError) return;
      generalError.textContent = msg;
      generalError.hidden = !msg;
    }

    function setSubmitting(isSubmitting) {
      if (!submitBtn) return;
      submitBtn.disabled = isSubmitting;
      submitBtn.textContent = isSubmitting ? "Odesílám…" : submitBtnLabel;
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();

      // Honeypot: když je vyplněný, tváříme se jako úspěch a nic neodesíláme.
      if (form.elements.company && form.elements.company.value) {
        showSuccess();
        return;
      }

      showGeneralError("");

      if (!validate()) {
        var firstInvalid = $('[aria-invalid="true"]', form);
        if (firstInvalid) firstInvalid.focus();
        return;
      }

      var endpoint = form.getAttribute("data-endpoint");
      if (!endpoint) {
        showSuccess();
        return;
      }

      setSubmitting(true);
      fetch(endpoint, {
        method: "POST",
        body: new FormData(form),
        headers: { "X-Requested-With": "XMLHttpRequest" },
      })
        .then(function (res) {
          return res.json().catch(function () { return { ok: res.ok }; });
        })
        .then(function (data) {
          setSubmitting(false);
          if (data && data.ok) {
            showSuccess();
          } else {
            showGeneralError((data && data.message) || "Odeslání se nezdařilo, zkuste to prosím znovu.");
          }
        })
        .catch(function () {
          setSubmitting(false);
          showGeneralError("Odeslání se nezdařilo — zkontrolujte prosím připojení a zkuste to znovu.");
        });
    });

    // Fallback bez JS: send-form.php po zpracování přesměruje zpět s ?sent=1/0.
    var sentParam = new URLSearchParams(window.location.search).get("sent");
    if (sentParam === "1") {
      showSuccess();
    } else if (sentParam === "0") {
      showGeneralError("Odeslání se nezdařilo, zkuste to prosím znovu nebo nám rovnou zavolejte.");
    }

    // Vyčisti chybu při psaní
    $all("input, textarea", form).forEach(function (el) {
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

  /* Služby jako taby (Prodej / Pronájem / Odhad ceny).
     - klik na tab přepne panel + zapíše hash (#prodej…)
     - klik na nav/CTA odkaz mířící na tab: scroll na sekci + aktivace tabu
     - přímé načtení /#pronajem otevře správný tab
     - aktivní tab se promítá do navigace, když je sekce ve výřezu
     Bezpečné: bez JS zůstanou viditelné všechny panely (žádný se neskryje). */
  function initServiceTabs() {
    var KEYS = ["prodej", "pronajem", "odhad-ceny"];
    var tablist = $(".svc__tabs");
    var tabs = $all(".svc__tab");
    var panels = $all(".svc__panel");
    if (!tabs.length || !panels.length) return;
    var section = document.getElementById("sluzby");
    var navLinks = $all(".nav__link");
    var servicesInView = false;

    function currentKey() {
      for (var i = 0; i < tabs.length; i++) {
        if (tabs[i].getAttribute("aria-selected") === "true") return tabs[i].getAttribute("data-tab");
      }
      return KEYS[0];
    }
    function highlightNav(key) {
      navLinks.forEach(function (l) {
        var h = l.getAttribute("href") || "";
        if (KEYS.indexOf(h.slice(1)) !== -1) l.classList.toggle("is-active", h === "#" + key);
      });
    }
    function activate(key, focusTab) {
      if (KEYS.indexOf(key) === -1) key = KEYS[0];
      tabs.forEach(function (t) {
        var on = t.getAttribute("data-tab") === key;
        t.setAttribute("aria-selected", on ? "true" : "false");
        t.tabIndex = on ? 0 : -1;
        if (on && focusTab) t.focus();
      });
      panels.forEach(function (p) { p.hidden = p.getAttribute("data-panel") !== key; });
      if (servicesInView) highlightNav(key);
    }
    function setHash(key) {
      if (history.replaceState) history.replaceState(null, "", "#" + key);
    }

    tabs.forEach(function (t) {
      t.addEventListener("click", function () {
        var key = t.getAttribute("data-tab");
        activate(key);
        setHash(key);
      });
    });

    if (tablist) {
      tablist.addEventListener("keydown", function (e) {
        var idx = tabs.indexOf(document.activeElement);
        if (idx === -1) return;
        var ni = -1;
        if (e.key === "ArrowRight" || e.key === "ArrowDown") ni = (idx + 1) % tabs.length;
        else if (e.key === "ArrowLeft" || e.key === "ArrowUp") ni = (idx - 1 + tabs.length) % tabs.length;
        else if (e.key === "Home") ni = 0;
        else if (e.key === "End") ni = tabs.length - 1;
        if (ni !== -1) {
          e.preventDefault();
          var key = tabs[ni].getAttribute("data-tab");
          activate(key, true);
          setHash(key);
        }
      });
    }

    var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var behavior = reduce ? "auto" : "smooth";
    $all('a[href="#prodej"], a[href="#pronajem"], a[href="#odhad-ceny"]').forEach(function (link) {
      link.addEventListener("click", function (e) {
        e.preventDefault();
        var key = link.getAttribute("href").slice(1);
        activate(key);
        if (section) section.scrollIntoView({ behavior: behavior, block: "start" });
        setHash(key);
      });
    });

    if (section && "IntersectionObserver" in window) {
      new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          servicesInView = en.isIntersecting;
          if (en.isIntersecting) highlightNav(currentKey());
          else navLinks.forEach(function (l) {
            if (KEYS.indexOf((l.getAttribute("href") || "").slice(1)) !== -1) l.classList.remove("is-active");
          });
        });
      }, { rootMargin: "-45% 0px -50% 0px", threshold: 0 }).observe(section);
    }

    var initial = (location.hash || "").slice(1);
    if (KEYS.indexOf(initial) !== -1) {
      activate(initial);
      if (section) requestAnimationFrame(function () { section.scrollIntoView({ block: "start" }); });
    } else {
      activate(KEYS[0]);
    }
  }

  /* CTA u služeb předvyplní vybranou dlaždici v poli „S čím vám můžu pomoct?"
     (a smooth-scroll řeší initSmoothNav). */
  function initInquiryPrefill() {
    var radios = $all('input[name="sluzba"]');
    if (!radios.length) return;
    $all("a[data-inquiry]").forEach(function (link) {
      link.addEventListener("click", function () {
        var val = link.getAttribute("data-inquiry");
        var match = radios.filter(function (r) { return r.value === val; })[0];
        if (match) match.checked = true;
      });
    });
  }

  /* Rozbalitelný „příběh" v sekci O mně — plynulá výška, bez knihovny.
     Bez JS zůstane celý text viditelný (tlačítko je v HTML hidden). */
  function initAboutStory() {
    var btn = $(".about__reveal");
    var story = document.getElementById("about-story");
    if (!btn || !story) return;
    var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var label = $(".about__reveal-label", btn);

    // zapni JS chování: ukaž tlačítko a sbal příběh
    btn.hidden = false;
    btn.setAttribute("aria-expanded", "false");
    story.style.height = "0px";

    function expand() {
      btn.setAttribute("aria-expanded", "true");
      if (label) label.textContent = "Skrýt příběh";
      if (reduce) { story.style.height = "auto"; return; }
      story.style.height = story.scrollHeight + "px";
      var done = function (e) {
        if (e.target === story && e.propertyName === "height") {
          story.style.height = "auto";
          story.removeEventListener("transitionend", done);
        }
      };
      story.addEventListener("transitionend", done);
    }
    function collapse() {
      btn.setAttribute("aria-expanded", "false");
      if (label) label.textContent = "Přečíst celý příběh";
      if (reduce) { story.style.height = "0px"; return; }
      story.style.height = story.scrollHeight + "px"; // z auto na px
      void story.offsetHeight;                        // vynuť reflow
      story.style.height = "0px";
    }
    btn.addEventListener("click", function () {
      if (btn.getAttribute("aria-expanded") === "true") collapse();
      else expand();
    });
  }

  /* FAQ akordeon (pravý sloupec sekce #faq) — single-open, max-height animace,
     aria-expanded/aria-controls; první položka je staticky otevřená (progressive
     enhancement — viz .faq__item.is-open v CSS). */
  function initFaqAccordion() {
    var items = $all(".faq__item");
    if (!items.length) return;
    var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    function openItem(item) {
      var btn = $(".faq__btn", item);
      var panel = $(".faq__panel", item);
      item.classList.add("is-open");
      btn.setAttribute("aria-expanded", "true");
      if (reduce) { panel.style.maxHeight = "none"; return; }
      panel.style.maxHeight = panel.scrollHeight + "px";
      var done = function (e) {
        if (e.target === panel && e.propertyName === "max-height") {
          if (item.classList.contains("is-open")) panel.style.maxHeight = "none";
          panel.removeEventListener("transitionend", done);
        }
      };
      panel.addEventListener("transitionend", done);
    }

    function closeItem(item) {
      var btn = $(".faq__btn", item);
      var panel = $(".faq__panel", item);
      // z "none" na konkrétní px, aby šlo zavření plynule animovat
      panel.style.maxHeight = panel.scrollHeight + "px";
      void panel.offsetHeight; // vynuť reflow
      item.classList.remove("is-open");
      btn.setAttribute("aria-expanded", "false");
      panel.style.maxHeight = "0px";
    }

    items.forEach(function (item) {
      var btn = $(".faq__btn", item);
      var panel = $(".faq__panel", item);
      if (item.classList.contains("is-open")) {
        panel.style.maxHeight = reduce ? "none" : panel.scrollHeight + "px";
      }
      btn.addEventListener("click", function () {
        if (item.classList.contains("is-open")) {
          closeItem(item);
          return;
        }
        items.forEach(function (other) {
          if (other !== item && other.classList.contains("is-open")) closeItem(other);
        });
        openItem(item);
      });
    });
  }

  /* ---------------------------------------------------------------------------
     Cookie consent — lišta dole (první návštěva) + panel nastavení kategorií.
     Volba se ukládá do localStorage["cookieConsent"] = {necessary, analytics}.
     Nezobrazí se znovu, dokud uživatel volbu neresetuje (mazání localStorage)
     nebo dokud ji sám nezmění přes odkaz „Nastavení cookies" v patičce.
     ------------------------------------------------------------------------ */
  function initCookieConsent() {
    var STORAGE_KEY = "cookieConsent";
    var bar = document.getElementById("cookie-consent");
    var panel = document.getElementById("cookie-settings");
    if (!bar || !panel) return;

    var analyticsToggle = document.getElementById("cookie-toggle-analytics");
    var HIDE_DELAY = 320;

    function readConsent() {
      try {
        var raw = window.localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : null;
      } catch (e) {
        return null;
      }
    }
    function saveConsent(consent) {
      try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(consent)); } catch (e) {}
    }
    // Mapa (Google embed) v Kontaktu — Google Maps nastavuje vlastní cookies,
    // proto ji načítáme teprve když uživatel povolí Analytické cookies (stejná
    // volba jako pro budoucí analytiku typu GA4), ne hned při vstupu na web.
    var mapWrap = $("[data-map-wrap]");
    var mapPlaceholder = mapWrap ? $("[data-map-placeholder]", mapWrap) : null;
    function loadMap() {
      if (!mapWrap || !mapPlaceholder) return;
      var src = mapWrap.getAttribute("data-map-src");
      if (!src) return;
      var iframe = document.createElement("iframe");
      iframe.className = "kontakt-card__iframe";
      iframe.title = "Mapa – kancelář " + ((cfg.office && cfg.office.name) || "");
      iframe.src = src;
      iframe.loading = "lazy";
      iframe.referrerPolicy = "no-referrer-when-downgrade";
      mapWrap.insertBefore(iframe, mapPlaceholder);
      mapPlaceholder.remove();
    }

    function applyConsent(consent) {
      // Místo pro budoucí načtení analytiky (GA4 apod.) při consent.analytics === true.
      document.documentElement.setAttribute("data-analytics-consent", consent && consent.analytics ? "granted" : "denied");
      if (consent && consent.analytics) loadMap();
    }

    // rAF-failsafe: na zaseklém/throttlovaném rendereru se requestAnimationFrame
    // nemusí spustit — setTimeout jako pojistka zajistí, že obsah nezůstane navždy skrytý.
    function revealWithTransition(el) {
      var applied = false;
      function apply() {
        if (applied) return;
        applied = true;
        el.classList.add("is-visible");
        el.setAttribute("aria-hidden", "false");
      }
      requestAnimationFrame(apply);
      window.setTimeout(apply, 60);
    }

    function showBar() {
      bar.hidden = false;
      revealWithTransition(bar);
    }
    function hideBar() {
      bar.classList.remove("is-visible");
      bar.setAttribute("aria-hidden", "true");
      window.setTimeout(function () { bar.hidden = true; }, HIDE_DELAY);
    }
    function showSettings() {
      var current = readConsent();
      // Bez uloženého souhlasu ukaž oba přepínače jako zapnuté (Nezbytné je vždy
      // zamčené zapnuté) — uživatel je pak může explicitně vypnout a uložit.
      if (analyticsToggle) analyticsToggle.checked = current ? !!current.analytics : true;
      panel.hidden = false;
      revealWithTransition(panel);
      var focusTarget = $(".cookie-settings__panel .cookie-btn, .cookie-settings__panel input:not([disabled])", panel);
      if (focusTarget) focusTarget.focus();
    }
    function hideSettings() {
      panel.classList.remove("is-visible");
      panel.setAttribute("aria-hidden", "true");
      window.setTimeout(function () { panel.hidden = true; }, HIDE_DELAY);
    }

    var existing = readConsent();
    if (existing) applyConsent(existing); else showBar();

    var openSettingsBtn = $("[data-cookie-open-settings]", bar);
    var acceptBtn = $("[data-cookie-accept]", bar);
    var closeSettingsEls = $all("[data-cookie-close-settings]", panel);
    var saveSettingsBtn = $("[data-cookie-save-settings]", panel);

    if (acceptBtn) acceptBtn.addEventListener("click", function () {
      var consent = { necessary: true, analytics: true };
      saveConsent(consent);
      applyConsent(consent);
      hideBar();
    });
    if (openSettingsBtn) openSettingsBtn.addEventListener("click", function () {
      hideBar();
      showSettings();
    });
    closeSettingsEls.forEach(function (el) {
      el.addEventListener("click", function () {
        hideSettings();
        if (!readConsent()) showBar();
      });
    });
    if (saveSettingsBtn) saveSettingsBtn.addEventListener("click", function () {
      var consent = { necessary: true, analytics: !!(analyticsToggle && analyticsToggle.checked) };
      saveConsent(consent);
      applyConsent(consent);
      hideSettings();
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && panel.classList.contains("is-visible")) {
        hideSettings();
        if (!readConsent()) showBar();
      }
    });

    $all("[data-cookie-settings-reopen]").forEach(function (link) {
      link.addEventListener("click", function (e) {
        e.preventDefault();
        showSettings();
      });
    });
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
    renderReviews();
    renderRating();
    applyBindings(); // až po renderech, ať přepíše i vygenerovaný obsah
    initMenu();
    initSmoothNav();
    initScrollSpy();
    initForm();
    initYear();
    initServiceTabs();
    initInquiryPrefill();
    initAboutStory();
    initFaqAccordion();
    initCookieConsent();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
