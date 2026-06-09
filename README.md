# Realitní makléř — webová šablona

Jednostránková, produkčně použitelná šablona pro realitní makléře.
Čisté **HTML5 + CSS3 + vanilla JS**, bez frameworků a knihoven.

## Struktura

```
index.html                 # SEO base (head), sémantická struktura, binding atributy
assets/css/styles.css      # design systém (CSS proměnné) + komponenty
assets/js/main.js          # menu, scrollspy, recenze, formulář, config binding
assets/data/site-config.js # ← OBSAH konkrétního makléře (mění se hlavně tady)
assets/img/                # placeholder SVG (nahraď reálnými assety)
_serve.mjs                 # jen lokální náhled (NEnahrávat na produkci)
```

## Jak nasadit nového makléře

1. **Obsah** → uprav `assets/data/site-config.js` (jméno, kontakt, hero, statistiky, recenze, sociální sítě).
2. **SEO** → uprav přímo v `index.html` v `<head>`:
   `<title>`, `<meta name="description">`, `<link rel="canonical">`, Open Graph / Twitter URL a obrázek, a blok **JSON-LD**.
   (Tyto hodnoty musí být staticky v HTML kvůli crawlerům — config je jen referenční zrcadlo.)
3. **Assety** → nahraď v `assets/img/`:
   - `agent-placeholder.svg` → reálná fotka makléře (doporučeno poměr 4:5, ideálně WebP/AVIF)
   - `logo-placeholder.svg` → logo kanceláře
   - `og-placeholder.svg` → OG obrázek 1200×630 (JPG/PNG pro lepší podporu sdílení)
   - doplň `favicon.ico` a `apple-touch-icon.png` (zatím placeholdery v HTML)

## Architektura — princip

- HTML obsahuje **rozumné výchozí texty** → web funguje i bez JS.
- `main.js` přečte `window.SITE_CONFIG` a naplní prvky s atributy
  `data-cfg` (text), `data-cfg-href`, `data-cfg-src`, `data-cfg-alt`.
- Recenze, statistiky, trust pilulky, sociální sítě a typy požadavku se renderují z configu.

## Recenze

`reviews.provider` v configu: `"manual" | "google" | "firmy"`.
- `manual` → zobrazí ručně zadané `items`.
- `google` / `firmy` → místo pro **oficiální widget** (žádné API klíče ani scraping ve frontendu).
- Bez recenzí → důvěryhodný fallback (nic se nerozbije).

⚠️ **AggregateRating** ve strukturovaných datech záměrně NENÍ. Přidej ho jen
s ověřitelnými, pravdivými hodnotami — viz komentář v `index.html`.

## Formulář

Strukturálně i vizuálně hotový, **zatím bez backendu**. Validace běží na frontendu,
honeypot proti spamu je připravený. Napojení: vyplň `data-endpoint` na `<form>`
a odkomentuj `fetch` blok v `main.js` (CRM / e-mail služba / serverless / webhook).
**Nikdy nedávej API klíče do frontendu.**

## Lokální náhled

```
node _serve.mjs 8123   →   http://localhost:8123
```

---

## Testovací checklist

- [ ] HTML validace (validator.w3.org)
- [ ] Žádný horizontální scroll (390/402/430/768/834/1024/1280/1366/1440/1512/1920)
- [ ] Desktop viewporty OK
- [ ] Tablet viewporty OK
- [ ] Mobilní viewporty OK
- [ ] iOS Safari (safe-area, žádné 100vh seky)
- [ ] Android Chrome
- [ ] Lighthouse 95+ (Perf / A11y / Best Practices / SEO)
- [ ] SEO meta tagy vyplněné per makléř
- [ ] Open Graph náhled (sdílení)
- [ ] JSON-LD bez falešného ratingu
- [ ] Mobilní menu (open / Escape / klik mimo / zavření po odkazu / aria-expanded)
- [ ] Anchor navigace + scrollspy + sticky header nepřekrývá nadpisy
- [ ] Formulář — struktura, validace, GDPR, honeypot
- [ ] Recenze — manual / 0 / 3 / 6 / 12 / fallback
- [ ] Chování bez obrázků (layout drží)
- [ ] Dlouhé jméno makléře nerozbije header
- [ ] Dlouhý text recenze nerozbije kartu
- [ ] Kontrast brand barvy #1CC1DD (tmavý text na CTA)
- [ ] CTA použitelné na mobilu (44×44, ne moc nízko)
