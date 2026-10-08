# Marie & Simon · Embroidered Garden

Eine digitale Hochzeitseinladung mit einer zusammenhängenden Stickserie: eigene Kirche unter Perlenvorhängen, Glyzinien und Schwäne, individuelle Blütenrahmen, neue Mago-Illustration und sechs passende Ablaufmotive. Salbeifarbene Leinenflügel öffnen direkt auf die fertige Kirchenszene. Inspiriert vom tatsächlichen Bildaufbau von [The Digital Yes](https://www.thedigitalyes.com/demo/embroidered-garden), mit eigenen Grafiken und eigenem Code.

[Neuer Auftakt](preview-opener.png) · [Handy-Vorschau](preview-mobile.png) · [Desktop-Vorschau](preview-desktop.png) · [Die Locations](preview-locations.png) · [Eure Fotos](preview-fotos.png)

[Siegel](preview-siegel-mobile.png) · [Während der Öffnung](preview-ouverture.png) · [Öffnung als Video](preview-oeffnung.mp4)

## Neue Gestaltung

Die öffentliche Referenz und ihre vollständige Live-Einladung wurden erneut geöffnet und visuell untersucht. Acht neu erzeugte Bilddateien übernehmen die gemeinsame Materialwelt aus hellem Leinen, Salbeigrün, Mauve, Perlen und Stickstichen. Der Opener wurde anhand der eigenen Kirchenillustration gestaltet; das neue Mago-Bild anhand der eigenen Restaurantillustration. Der Ablauf zeigt Kirche, Ringe, Sektgläser, Cocktail, Dinner und Discokugel.

Jede große dekorative Szene erscheint einmal. Die alten mehrfach eingesetzten Rosen und Girlanden sind entfernt. Bilder behalten ihre Proportionen, Text bleibt in den freien Bildbereichen. Dresscode und Geschenkhinweis werden jeweils einmal gezeigt. Ruhige Einblendungen verbinden die Abschnitte beim Scrollen.

Alle vorhandenen Texte und Sachangaben in `wedding-config.js` sind erhalten. Nur der Mago-Bildpfad verweist jetzt auf die neue Illustration. Paarfoto und Ringfoto bleiben unverändert. [Analyse und Umsetzung](DESIGN-REFERENZ.md) · [Neue Bildserie](assets/loom/README.md).

## Einladung ansehen

[Unsere-Hochzeit.html herunterladen](https://github.com/steutersimon-a11y/hochzeit/raw/refs/heads/main/Unsere-Hochzeit.html), als `.html` speichern und in einem Browser öffnen. Falls der Browser Quelltext anzeigt, den Link mit „Link speichern unter …“ herunterladen. Die einzelne Datei enthält Bilder, Schriften und Gestaltung und funktioniert ohne Installation und ohne weitere Netzwerkanfragen.

Auf das Siegel oder „Zum Öffnen berühren“ klicken, anschließend durch die Einladung scrollen. Im Footer lässt sich die Öffnung wiederholen. Die Kartenöffnung dauert etwa 3,15 Sekunden; bei reduzierter Bewegung erscheint die Einladung sofort. Tastaturbedienung, modale Dialoge und sichtbare Fokusmarkierungen sind vorhanden.

Der Bearbeitungsmodus wird mit `?edit=1` an der Adresse geöffnet. Dort können Namen, Datum, Kontaktadresse und die vier Bildplätze angepasst werden. „HTML mit Bildern speichern“ erzeugt eine neue vollständige Datei. Die Bearbeitung erfolgt im Browser.

## Angaben und Build

Die Einladung ist für **Marie & Simon am Samstag, 28. August 2027** eingerichtet, mit Reformierter Kirche und Mago Restaurant & Bar in Schermbeck. Die bereits vorhandenen Zeiten, Rückmeldefrist und weitere Hinweise sind weiterhin Beispielangaben. Exakte Adressen und eine Rückmelde-E-Mail sind noch offen.

Alle Angaben stehen in `wedding-config.js`. `index.html` nutzt Änderungen sofort. Anschließend erstellt

```sh
python3 build.py
```

die eigenständige `Unsere-Hochzeit.html` und `export-template.js` neu. Python benötigt keine Zusatzpakete. `style.css` enthält die Seitengestaltung, `opening.css` die Kartenöffnung. Die aktuelle Bildserie liegt in `assets/loom/`. Frühere Designvarianten bleiben im Repository und sind nicht eingebunden.

Die vier bearbeitbaren Bildplätze:

| Platz | Aktuelles Bild |
| --- | --- |
| `couple` | Eigenes Schwarzweißfoto des Paares |
| `hands` | Eigenes Schwarzweißfoto der Hände mit Ring |
| `church` | Vorhandene Kirchenstickerei |
| `party` | Neu erzeugte Mago-Stickerei |

Die Originalbilder liegen unverändert in `assets/images/`. Fotoflächen verwenden einen bewussten Ausschnitt; Locationbilder werden vollständig dargestellt. Neue JPG-, PNG- oder WebP-Dateien können im Editor gewählt oder über Bildpfade in der Konfiguration eingebunden werden.

## Veröffentlichung und Rückmeldung

Die Seite ist statisch und braucht keinen Servercode, kein Abo und keine laufende Bildgenerierungs-API. Bilder und Schriften werden lokal ausgeliefert. Google Maps öffnet erst nach einem Klick auf einen Routenlink.

Für GitHub Pages im öffentlichen Repository unter **Settings → Pages** „Deploy from a branch“, Branch **main**, Ordner **/(root)** wählen. Die vorgesehene Adresse lautet `https://steutersimon-a11y.github.io/hochzeit/`. Pages muss in den Repository-Einstellungen aktiviert sein.

Ohne `rsvpEmail` ist die Rückmeldung eine Vorschau und verschickt nichts. Mit Kontaktadresse bereitet sie eine E-Mail im E-Mail-Programm der Gäste vor; die Gäste senden sie selbst ab. Der Kalenderbutton lädt eine ICS-Datei und berücksichtigt `Europe/Berlin` samt Sommerzeit.

## Herkunft und Prüfung

Die neuen Grafiken wurden intern erzeugt. Als Quellen wurden die öffentliche Referenz und eigene Repository-Bilder verwendet; weitere Daten vom Computer des Nutzers wurden nicht abgerufen. Grafikdateien, Film und Code der Referenzwebsite werden nicht als Produktassets übernommen. Cormorant Garamond und Manrope sind frei nutzbare Schriften mit Lizenztexten in `assets/fonts/`.

Mit laufender Seite unter `http://localhost:8000`:

```sh
node scripts/visual-check.cjs
node scripts/export-check.cjs
```

Die Prüfungen benötigen Playwright und Chromium. Sie erfassen fünf Breiten von 320 bis 1440 Pixeln, Bildproportionen, Textpositionen, eindeutige Dekorationen, erhaltene Angaben, horizontales Überlaufen, Öffnung, Tastatur, Dialoge, Kalender und reduzierte Bewegung. Beide HTML-Exportvarianten werden auf vollständige Bildeinbettung ohne weitere Netzwerkanfragen geprüft. Zusätzlich werden die endgültigen Screenshots visuell beurteilt.
