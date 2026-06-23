/* =============================================================================
   SITE CONFIG — centrální místo pro obsah konkrétního makléře
   -----------------------------------------------------------------------------
   Tady se mění OBSAH. Layout (HTML/CSS) zůstává nedotčený.

   Jak to funguje:
   - Prvky v index.html mají atributy data-cfg / data-cfg-href / data-cfg-src,
     které main.js naplní hodnotami odsud (progresivní vylepšení).
   - HTML zároveň obsahuje rozumné výchozí texty, takže web funguje i bez JS.

   DŮLEŽITÉ pro SEO:
   - <title>, <meta description>, canonical, Open Graph a JSON-LD jsou kvůli
     crawlerům napsané PŘÍMO v <head> index.html. Při nasazení pro nového
     makléře je MUSÍŠ upravit i tam (ne jen tady). Hodnoty v sekci `seo` níže
     slouží jako jeden referenční zdroj pravdy / kontrola konzistence.
   ============================================================================= */

window.SITE_CONFIG = {
  /* --- Makléř ------------------------------------------------------------- */
  agent: {
    name: "Radim Vrána",
    position: "Realitní makléř pro Ostravu a okolí", // podpis v hero kartě
    role: "Realitní makléř · Ostrava",             // drobný řádek v hlavičce
    locality: "Ostrava a okolí",
    phone: "+420 722 792 287",        // zobrazená podoba
    phoneHref: "+420722792287",       // tel: odkaz bez mezer
    email: "radim@mintreality.cz",
    photo: "assets/img/radim-vrana.webp", // portrét na výšku, ideálně poměr 4:5
    photoAlt: "Radim Vrána — realitní makléř Ostrava",
  },

  /* --- Realitní kancelář -------------------------------------------------- */
  office: {
    name: "MINT reality & finance",
    logo: "assets/img/logo.png",
    ico: "",          // nepovinné — když prázdné, řádek v patičce se skryje
    address: "17. listopadu 599/30, Ostrava-Poruba",
  },

  /* --- Doména / brand ----------------------------------------------------- */
  brand: {
    siteName: "Jan Novák — Realitní makléř",
    domain: "https://www.vas-makler.cz", // bez koncového lomítka
  },

  /* --- CTA texty ---------------------------------------------------------- */
  cta: {
    primary: "Zjistit cenu nemovitosti",
    secondary: "Jak probíhá prodej",
  },

  /* --- Footer ------------------------------------------------------------- */
  footer: {
    claim: "Uvažujete o prodeji nebo koupi nemovitosti? Napište mi nebo zavolejte — nezávazně to probereme.",
  },

  /* --- Hero --------------------------------------------------------------- */
  hero: {
    localBadge: "Specialista na Ostravu a okolí",
    // \n = řízený zlom řádku (H1 má white-space: pre-line)
    title: "Realitní makléř Ostrava",
    subtitle:
      "Postarám se o nacenění, prezentaci, prohlídky i právní stránku obchodu. Od prvního setkání až po předání klíčů budete vědět, co se děje a proč.",
    // Tři konkrétní důvody důvěry (ne obecné fráze)
    reasons: [
      "Profesionální prezentace",
      "Reálné nacenění podle lokality a aktuální poptávky",
      "Bezpečný obchod s právním servisem až do předání",
    ],
  },

  /* --- Statistiky --------------------------------------------------------- */
  /* Piš jen ověřitelné údaje. value je velké číslo/štítek, label popisek. */
  stats: [
    // value = velké číslo, suffix = menší přípona (+, mil., týdny…)
    { value: "10", suffix: " let", label: "zkušeností v realitách" },
    { value: "260", suffix: "+", label: "prodaných nemovitostí" },
    { value: "500", suffix: "+ mil. Kč", label: "v hodnotě obchodů" },
  ],

  /* --- Sociální sítě ------------------------------------------------------ */
  /* Prázdný řetězec = odkaz se nezobrazí. */
  social: {
    facebook: "",
    instagram: "",
    linkedin: "",
  },

  /* --- SEO (referenční zdroj — synchronizuj s <head> v index.html) ------- */
  seo: {
    title: "Realitní makléř Ostrava | Prodej bytu, domu a odhad ceny",
    description:
      "Pomohu vám s prodejem bytu, domu nebo pozemku v Ostravě. Odhad ceny, prezentace, prohlídky, právní servis a bezpečný průběh obchodu.",
    canonical: "https://www.vas-makler.cz/",
    ogImage: "assets/img/og-placeholder.svg", // doporučeno 1200×630
  },

  /* --- Recenze ------------------------------------------------------------ */
  /* provider:
       "manual" → zobrazí ručně zadané `items` níže
       "google" → zobrazí CTA na Google + místo pro budoucí widget (žádné API klíče ve frontendu!)
       "firmy"  → zobrazí CTA na Firmy.cz/Mapy.com + místo pro oficiální widget
     Pozn.: AggregateRating ve strukturovaných datech ZÁMĚRNĚ nepřidáváme
     automaticky — viz komentář v index.html. */
  reviews: {
    provider: "manual",
    // Souhrnné hodnocení (vyplň reálné hodnoty; prázdné value = box se skryje).
    // Pozor: AggregateRating do strukturovaných dat NEpřidáváme bez ověřeného počtu recenzí.
    rating: {
      value: "5,0",
      outOf: "5",
      label: "hodnocení klientů",
    },
    googleUrl: "https://share.google/W3YBz1OBqKsrEErHm",
    firmyUrl: "https://www.firmy.cz/detail/13327292-radim-vrana-realitni-makler-ostrava-poruba.html",
    writeUrl: "",

    // `featured` = recenze zobrazené na homepage (3). `all` = zásoba pro budoucí použití.
    // Reálné recenze, ručně převzaté z veřejných profilů Google a Firmy.cz (žádný scraping / auto-napojení).
    // Featured je záměrně MIX: něco z Google, něco z Firmy.cz.
    featured: [
      {
        name: "Lenka Firtová",
        source: "Google",
        badge: "Google recenze",
        rating: 5,
        text: "Pan Vrána zařídil prodej mého bytu v Ostravě. Vše probíhalo hladce a bez problémů. Protože v Ostravě nebydlím, předala jsem mu klíče a o pár týdnů později jen dorazila na podpis kupní smlouvy.",
      },
      {
        name: "Silvana Urbanová",
        source: "Firmy.cz",
        badge: "Firmy.cz recenze",
        rating: 5,
        text: "Makléře p. Vránu budu všem doporučovat! Překonal má očekávání. Z prodeje bytu po otci jsem měla velkou obavu, p. Vrána mi velmi pomohl. Poradil mi, co v bytě udělat, aby se dobře prodal, další vyřizoval už sám. Byl precizní, spolehlivý, empatický a vstřícný a byt prodal za velmi krátkou dobu.",
      },
      {
        name: "Petr Sehnálek",
        source: "Google",
        badge: "Google recenze",
        rating: 5,
        text: "Bez váhání jsem vybral služby pana Radima Vrány. Připravil cenovou kalkulaci, prezentaci a vysvětlil celý proces prodeje. Vše zařídil bez mojí přítomnosti a po celou dobu byl k dispozici.",
      },
    ],

    all: [
      { name: "Petr Prosický", source: "Google", badge: "Google recenze", rating: 5, text: "Děkujeme panu Radimu Vránovi za zprostředkování prodeje bytu v Ostravě-Hrabůvce. Kvalitní kompletní servis, vstřícný přístup a rychlé jednání nám celý prodej výrazně usnadnily." },
      { name: "Pavel Cada", source: "Firmy.cz", badge: "Firmy.cz recenze", rating: 5, text: "Dlouho jsme měli byt volný, nepodařilo se nám ho nikomu pronajmout – stačilo se spojit s panem Vránou a do týdne byl byt obsazen novým nájemníkem. Skvělá, rychlá práce makléře, jen vřele doporučuji. O nic jsme se nestarali, vše precizně zařídil p. Vrána. Je velmi lidský, přátelský a hlavně profesionální." },
      { name: "Tomas Gajda", source: "Firmy.cz", badge: "Firmy.cz recenze", rating: 5, text: "Chtěl bych poděkovat panu Radimovi Vránovi za ochotu a pomoc při prodeji zahrádky. Jednání s ním bylo na profesionální úrovni, všechno nám vysvětlil a poradil. Tímto bych pana Vránu doporučil a ještě jednou děkuju za zcela ochotný přístup. Bylo potěšením s ním spolupracovat." },
      { name: "Radana Bartošová", source: "Google", badge: "Google recenze", rating: 5, text: "Makléř pan Radim Vrána mi byl doporučen a jeho služeb jsem využila při pronájmu bytu. Je spolehlivý, komunikativní, pečlivý, vstřícný a ochotný. Profesionál s lidským přístupem, který naslouchá požadavkům klienta. Vřele doporučuji." },
      { name: "Anežka Šustková", source: "Google", badge: "Google recenze", rating: 5, text: "S panem Vránou máme pozitivní zkušenost. Nákup nemovitosti proběhl hladce. Oceňujeme férové jednání, pozitivní přístup a spolupráci s naším hypotečním specialistou. Pokud bude příležitost, služby pana Vrány rádi využijeme." },
      { name: "Alex Varha", source: "Google", badge: "Google recenze", rating: 5, text: "Rád bych doporučil pana Radima Vránu za profesionální přístup při koupi nemovitosti, výbornou komunikaci a bezproblémovou spolupráci." },
      { name: "Tomas Gajda", source: "Google", badge: "Google recenze", rating: 5, text: "Chtěl bych poděkovat panu Radimovi Vránovi za ochotu a pomoc při prodeji zahrádky. Jednání bylo na profesionální úrovni, všechno nám vysvětlil a poradil. Bylo potěšením s ním spolupracovat." },
      { name: "Karel Valenta", source: "Google", badge: "Google recenze", rating: 5, text: "S panem Vránou jsme se setkali při nákupu pozemku. Velice jsme ocenili množství informací a přístup, s jakým se nám celou dobu věnoval. Doporučil bych jej každému, kdo zvažuje prodej nemovitosti." },
      { name: "Petra Žákovská", source: "Google", badge: "Google recenze", rating: 5, text: "Děkuji panu Vránovi za lidský přístup a ochotu pomoci se vším ohledně koupě bytu. Je to profesionál s příjemným vystupováním, který své práci rozumí a klient je pro něj na prvním místě." },
      { name: "Darina Freisler", source: "Google", badge: "Google recenze", rating: 5, text: "Děkuji panu Vránovi za profesionální a spolehlivý přístup u prodeje bytu. Byt převzal po konkurenci, která ho neuměla prodat, a velmi rychle ho prodal. Opravdu perfektní profesionální přístup." },
      { name: "Lucie Maňáková", source: "Google", badge: "Google recenze", rating: 5, text: "Díky panu Radimovi se nám podařilo prodat byt bez sebemenších problémů. Vše vysvětlil, se vším pomohl a nic jsme nemuseli řešit. Skvělý člověk a ještě lepší realitní makléř." },
      { name: "Michaela Petříková", source: "Google", badge: "Google recenze", rating: 5, text: "Služby pana Radima Vrány jsme využili již poněkolikáté a pokaždé jsme byli velmi spokojeni. Je spolehlivý, přátelský a v nečekaných situacích pohotový a přizpůsobivý." },
      { name: "Kristýna Bučková", source: "Google", badge: "Google recenze", rating: 5, text: "Děkuji panu Vránovi za skvělou spolupráci při pronájmu nemovitosti. Vstřícný, férový a ochotný člověk. Skvělá komunikace a stoprocentní spolehlivost." },
      { name: "Petr Trojan", source: "Google", badge: "Google recenze", rating: 5, text: "Bylo mi potěšením spolupracovat s panem Radimem Vránou. Realitní makléř na svém místě, pro kterého neexistovala žádná překážka ani problém." },
      { name: "Dalibor Kresta", source: "Google", badge: "Google recenze", rating: 5, text: "Děkuji za profesionální přístup při prodeji naší nemovitosti. Pan Radim Vrána je jeden z mála makléřů, který si stojí za tím, co řekne. Rychlost, kvalita, profesionální vystupování a ochota." },
      { name: "Hana Glocarová", source: "Google", badge: "Google recenze", rating: 5, text: "Pan Radim Vrána je skvělý makléř a stejně tak i člověk. Moc milé, rychlé a profesionální jednání. Bylo mi potěšením potkat právě Vás." },
      { name: "Radim Adámek", source: "Google", badge: "Google recenze", rating: 5, text: "Jestli hledáte makléře, vřele doporučuji pana Radima Vránu. Sympatický člověk na svém místě, milý přístup, ochotně poradil a rychle vyřídil prodej mého bytu k mé spokojenosti." },
      { name: "Jan Glista", source: "Google", badge: "Google recenze", rating: 5, text: "S panem Vránou mám výbornou zkušenost. Profesionální, vstřícné a ochotné jednání. Byl jsem mile překvapen." },
      { name: "Vojtěch Palkovič", source: "Google", badge: "Google recenze", rating: 5, text: "Naprosto profesionální přístup. O vše bylo postaráno a byli jsme o všech krocích předem transparentně informováni." },
      { name: "Monika Sedláková", source: "Google", badge: "Google recenze", rating: 5, text: "Moc děkuji panu Radimovi Vránovi za úspěšný prodej pozemku, který nebyl vůbec jednoduchý. Velice oceňuji skvělou komunikaci, milé jednání, vstřícnost a ochotu. Vřele doporučuji." },
      { name: "Tomáš Sedloň", source: "Google", badge: "Google recenze", rating: 5, text: "Děkuji panu Vránovi za jeho bezpochyby profesionální služby při prodeji mého družstevního bytu 3+1. Je velmi ochotný, příjemný a znalý problematiky realit. Ke klientům přistupuje citlivě a umí pomoct s jakýmkoliv problémem." },
      { name: "Tomáš Vysekal", source: "Google", badge: "Google recenze", rating: 5, text: "Výborná zkušenost. Příjemné, rychlé a vstřícné jednání. Doporučuji." },
      { name: "Radek Očadlý", source: "Google", badge: "Google recenze", rating: 5, text: "Ve spolupráci s panem Vránou jsem řešil koupi nového bytu. Mohu jej jednoznačně doporučit — vše, na čem jsme se domluvili, platilo. Velmi oceňuji profesionální, férové a zároveň lidské jednání." },
      { name: "Štěpán Svoboda", source: "Google", badge: "Google recenze", rating: 5, text: "Radim řídil prodej mého bytu v Karviné. Bydlím v Praze, pan Vrána se postaral o všechno. Bylo mi potěšením s ním spolupracovat." },
    ],
  },

  /* --- Formulář — typy požadavku ----------------------------------------- */
  inquiryTypes: [
    "Prodej nemovitosti",
    "Odhad ceny",
    "Koupě nemovitosti",
    "Pronájem",
    "Chci se poradit",
    "Jiné",
  ],
};
