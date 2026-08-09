# Glowé — Website

Statische Website für die iOS-App **Glowé** (Hautanalyse + 14-Tage-Routine).
Kein Build-Schritt, kein Framework, keine externen Requests zur Laufzeit.

```
index.html          Landingpage
support.html        Hilfe-Center (Konto, Abo, Scans, Daten, Technik)
impressum.html      Anbieterkennzeichnung § 5 DDG
datenschutz.html    Datenschutzerklärung (DSGVO)
agb.html            AGB inkl. Widerrufsbelehrung
robots.txt          Crawler-Freigabe + Sitemap-Verweis
sitemap.xml         Alle fünf Seiten
assets/css          Ein Stylesheet mit dem kompletten Design-System
assets/js           Interaktion (~4 KB, ohne Abhängigkeiten)
assets/fonts        Plus Jakarta Sans, Variable, self-hosted
assets/img          Offizieller Apple-App-Store-Badge
```

## Lokal starten

```bash
python3 -m http.server 8000
```

Danach <http://localhost:8000> öffnen. Deployen heißt: die Dateien so wie sie
sind auf einen beliebigen Static Host legen.

## Vor dem Live-Gang ausfüllen

Die Rechtsseiten sind vollständig strukturiert, enthalten aber Platzhalter in
`[eckigen Klammern]` — Firmenname, Anschrift, Registerdaten, USt-IdNr.,
Aufsichtsbehörde, Auftragsverarbeiter, Speicherfristen und Stand-Datum.
Auf jeder Rechtsseite steht dazu ein sichtbarer Hinweiskasten. Die Texte sind
eine sorgfältige Vorlage, keine Rechtsberatung — vor Veröffentlichung
anwaltlich prüfen lassen.

Ebenfalls anzupassen:

- Domain `glowe.app` in Canonicals, Open Graph, `robots.txt` und `sitemap.xml`
- E-Mail-Adressen (`support@`, `privacy@`, `press@`, `widerruf@`, `hello@`)
- Kennzahlen im Hero und im Finale (120k+, 4.8, 100k) durch echte Werte ersetzen
- Testimonials durch echte, freigegebene App-Store-Reviews ersetzen

Der App-Store-Link zeigt auf <https://apps.apple.com/app/id6787454842>.

## Design-System

Alles läuft über Tokens in `:root` — eine Violett-Rampe, ein Neutral-System,
eine fluide Typo-Skala, ein Spacing-Rhythmus, vier Radien, eine Schattenfamilie.
Kontraste sind gegen WCAG 2.1 AA geprüft: Primärviolett `#7c57c8` liegt bei
5.18:1 auf Weiß, `--muted` bei 5.37:1 auf dem Seitenhintergrund. Der Header
wird ab Scroll > 0 opak, damit Logo und Navigation über hellen wie dunklen
Sektionen lesbar bleiben.

## iPhone-Mockups

Beide Telefone sind vollständig in HTML und CSS gebaut — kein Screenshot, kein
Bild. Alle Innenmaße sind `em`-basiert (`1em = Gerätebreite / 33`), das Gerät
skaliert dadurch als Ganzes. Beide sind funktionsfähig:

- **Hautanalyse:** Der Umschalter *Now / In 14 days* wechselt alle acht Werte,
  die Zahlen zählen hoch, die Balken animieren. Pfeiltasten funktionieren.
- **Routine:** Schritte sind anklickbar; Blockzähler, Tagesfortschritt und
  Balken rechnen live mit. Die Tagesauswahl ist umschaltbar.

## Barrierefreiheit & Motion

Sichtbarer Fokus-Ring auf allen interaktiven Elementen, Skip-Link, echtes
Tab-Pattern mit Pfeiltasten-Navigation, native `<details>` für FAQ und
`aria-pressed` für die Routine-Schritte. Das Fade-in beim Scrollen läuft über
IntersectionObserver und wird bei `prefers-reduced-motion: reduce` vollständig
abgeschaltet — ohne JavaScript ist der Inhalt trotzdem sichtbar.
