# Marie & Simon · Embroidered Garden

Die digitale Hochzeitseinladung liegt auf einem durchgehenden Leinentuch. Unter einem marineblauen Samtvorhang mit Schleife und Perlen stehen Namen und Hochzeitsdatum. Es folgen eine schmale Begrüßungsborte, offene Stickranken, passende Ortsillustrationen und sechs Ablaufmotive. Die beiden Schwäne bilden ganz unten den Abschied. Eine Doppellinie in Nacht- und Rauchblau tritt unter den Vorhangsäumen hervor und schließt unten mit zwei Perlen ab. Ein ovales M&S-Siegel aus champagnerfarbenem Wachs öffnet die nachtblauen Leinenflügel direkt auf den Auftakt mit Namen und Datum. Die Gestaltung mit eigenen Grafiken und eigenem Code ist vom Bildaufbau der Referenz inspiriert. [The Digital Yes](https://www.thedigitalyes.com/demo/embroidered-garden)

[Auftakt](preview-opener.png) · [Handy-Vorschau](preview-mobile.png) · [Desktop-Vorschau](preview-desktop.png) · [Die Locations](preview-locations.png) · [Eure Fotos](preview-fotos.png)

[Rückmeldung und Abschied](preview-abschied.png) · [Siegel](preview-siegel-mobile.png) · [Während der Öffnung](preview-ouverture.png) · [Öffnung als Video](preview-oeffnung.mp4)

## Neue Gestaltung

Die öffentliche Referenz und ihre vollständige Live-Einladung wurden erneut geöffnet und visuell untersucht. Die nachtblaue Schrift verbindet den Umschlag mit dem hellen Leinen im Inneren. Rauchblaue Details setzen Akzente in der Stickerei zwischen Salbei, Mauve und Elfenbein. Eine einzige gekachelte Leinentextur läuft hinter der gesamten Einladung durch. Die Stickmotive sind transparente Auflagen ohne eigene rechteckige Leinenfläche. Die Illustrationen im Ortsabschnitt basieren auf der eigenen Kirchen- und Restaurantillustration. Der Ablauf zeigt Kirche, Ringe, Sektgläser, Cocktail, Dinner und Discokugel.

Eine kleine Stickborte leitet den Willkommensgruß ein. Ein einzelnes nachtblaues Medaillon zeigt die verbleibenden Kalendertage bis zur Hochzeit. Ortsangaben und Illustrationen stehen zusammen. Eine gestickte Ranke leitet die Ortsansicht ein, eine kleine Perlenschleife begleitet den Geschenkhinweis. Die Geschichte und ihre beiden Fotos teilen sich auf großen Bildschirmen eine Zeile. Die Beschriftungen bleiben auf kleinen Displays frei. Eine durchgehende Stichlinie verbindet die sechs Stationen des Tagesablaufs.

Die hochgeladene nachtblaue Aquarellschleife rahmt die Rückmeldung mit großzügigem Abstand zum Text ein. Die Aquarellschwäne mit Datum und Initialen bilden etwas kleiner gesetzt den Abschluss.

Die Sachangaben stehen in `wedding-config.js`. Die angefragten neuen Fotos fehlen noch. Aktuell zeigt die Einladung das vorhandene Paar- und Ringfoto. [Analyse und Umsetzung](DESIGN-REFERENZ.md) · [Neue Bildserie](assets/loom/README.md).

## Einladung ansehen

[Unsere-Hochzeit.html herunterladen](https://github.com/steutersimon-a11y/hochzeit/raw/refs/heads/main/Unsere-Hochzeit.html), als `.html` speichern und in einem Browser öffnen. Falls der Browser Quelltext anzeigt, den Link mit „Link speichern unter …“ herunterladen. Die einzelne Datei enthält Bilder, Schriften und Gestaltung und funktioniert ohne Installation und ohne weitere Netzwerkanfragen.

Auf dem Umschlag ist das M&S-Siegel der einzige sichtbare Inhalt. Zum Öffnen auf das Siegel klicken oder es per Tab anwählen und mit Enter öffnen. Im Footer lässt sich die Öffnung wiederholen. Die Kartenöffnung dauert etwa 3,15 Sekunden; bei reduzierter Bewegung erscheint die Einladung sofort. Tastaturbedienung, modale Dialoge und sichtbare Fokusmarkierungen sind vorhanden.

Der Bearbeitungsmodus wird mit `?edit=1` an der Adresse geöffnet. Dort können Namen, Datum, Kontaktadresse und die vier Bildplätze angepasst werden. Der Auftakt und die Aquarellschwäne zeigen die personalisierten Angaben für Marie und Simon am 28. August 2027. Bei anderen Namen oder einem anderen Datum erscheinen die bearbeiteten Angaben als Text, begleitet von einem zeitlosen Schwanenmotiv. „HTML mit Bildern speichern“ erzeugt eine neue vollständige Datei. Die Bearbeitung erfolgt im Browser.

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
| `church` | Freigestellte eigene Kirchenstickerei |
| `party` | Freigestellte Mago-Stickerei |

Die Originalbilder liegen unverändert in `assets/images/`. Fotoflächen verwenden einen bewussten Ausschnitt; Locationbilder werden vollständig dargestellt. Neue JPG-, PNG- oder WebP-Dateien können im Editor gewählt oder über Bildpfade in der Konfiguration eingebunden werden.

## Veröffentlichung und Rückmeldung

Die Seite ist statisch und braucht keinen Servercode, kein Abo und keine laufende Bildgenerierungs-API. Bilder und Schriften werden lokal ausgeliefert. Google Maps öffnet erst nach einem Klick auf einen Routenlink.

Für GitHub Pages im öffentlichen Repository unter **Settings → Pages** „Deploy from a branch“, Branch **main**, Ordner **/(root)** wählen. Die vorgesehene Adresse lautet `https://steutersimon-a11y.github.io/hochzeit/`. Pages muss in den Repository-Einstellungen aktiviert sein.

Sobald `rsvpEmail` eingetragen ist, bereitet das Formular eine E-Mail im E-Mail-Programm der Gäste vor. Die Gäste senden sie dort selbst ab. Bis zur Freigabe zeigt die Einladung den Status der Rückmeldung. Der Kalenderbutton lädt bei vorläufigen Uhrzeiten einen ganztägigen Eintrag. Nach Bestätigung der Zeiten `scheduleConfirmed` auf `true` setzen. Der Kalenderexport berücksichtigt dann `Europe/Berlin` samt Sommerzeit.

## Herkunft und Prüfung

Die neuen Grafiken wurden intern erzeugt. Als Quellen wurden die öffentliche Referenz und eigene Repository-Bilder verwendet; weitere Daten vom Computer des Nutzers wurden nicht abgerufen. Grafikdateien, Film und Code der Referenzwebsite werden nicht als Produktassets übernommen. Cormorant Garamond und Manrope sind frei nutzbare Schriften mit Lizenztexten in `assets/fonts/`.

Die Prüfungen starten bei Bedarf einen eigenen lokalen Server. Mit `INVITATION_QA_URL` lässt sich ein bestehender Server angeben.

```sh
node scripts/visual-check.cjs
node scripts/export-check.cjs
```

Die Prüfungen benötigen Playwright und Chromium. Sie erfassen fünf Breiten von 320 bis 1440 Pixeln, Bildproportionen, Textpositionen, durchgehende Leinenfläche, gleiche Breiten, Schwäne nur am Abschied, fehlenden Dresscode, eindeutige Dekorationen, erhaltene Angaben und horizontales Überlaufen, Öffnung, Tastatur, Dialoge, Kalender und reduzierte Bewegung. Beide HTML-Exportvarianten werden auf vollständige Bildeinbettung ohne weitere Netzwerkanfragen geprüft. Zusätzlich werden die endgültigen Screenshots visuell beurteilt.
