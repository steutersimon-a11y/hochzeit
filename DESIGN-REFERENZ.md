# Marie & Simon · Ein gestickter Garten

Die Live-Vorlage von [The Digital Yes](https://www.thedigitalyes.com/demo/embroidered-garden) und ihre [tatsächliche Demo](https://embroidered-garden-template.thedigitalyes.com) waren am 8. Oktober 2026 erreichbar (HTTP 200). Die gesamte Seite und die Öffnungssequenz wurden erneut in Chromium geprüft.

## Gestaltung

Die Vorlage lebt von salbeifarbenen Leinenflügeln, einem Elfenbeinmedaillon, räumlicher Stickerei, Perlen, Glyzinien, Rosen und einer großzügigen cremefarbenen Textfläche. Ihr Opener enthält einen Film; die fertige Szene ist bereits unmittelbar hinter den Türen vorhanden. Danach folgen Begrüßung, Countdown, förmliche Einladung, Orte, Dresscode, Geschichte, Ablauf, Folgetag, Geschenke und RSVP.

Für Marie & Simon wurde die gesamte Präsentation neu aufgebaut. Neue, intern erzeugte Gartenillustrationen für Desktop und Handy bilden eine zusammenhängende Bildwelt mit Villa, Brunnen, Rosen, Glyzinien und Schwänen. Das Hochformat ist eigens komponiert und keine verzerrte Querformatkopie. Neue transparente Blütenornamente und eine passende Girlande verbinden die Abschnitte. Kalligraphische Namen, dunkelgrüne Serifentexte, zurückhaltendes Rosé und goldene Details bilden die Typografie.

Das Paarfoto wird breiter gezeigt, damit mehr vom Original sichtbar bleibt. Die Location-Illustrationen werden vollständig in ihren natürlichen Proportionen dargestellt. Datum und Countdown erhalten leichte Medaillons; der Ablauf folgt einer gestickten Linie. Die Hinweise und Rückmeldung sind Teil derselben Gestaltung.

Sanfte Lichtbewegung, kleine Lichtpunkte, eine leichte Reaktion des Gartenbilds auf den Mauszeiger, bewegte Blüten und ruhige Scroll-Einblendungen machen die Einladung lebendig. Die Texte bleiben dabei stabil. Bei reduzierter Bewegung entfallen diese Effekte.

## Die behobenen Fehler

Zuvor verdeckte eine deckende Fläche über der eigentlichen Seite den Opener bis zum Ende der Türanimation. Außerdem begann die Szene unterhalb einer Navigation und passte räumlich nicht zu den Kartenflügeln. Jetzt beginnt sie bei y=0; die Navigation folgt nach dem Opener. Die Kartenflügel geben unmittelbar die fertige Szene frei. Vor der Öffnung wartet die Anwendung auf das dekodierte Gartenbild und geladene Schriften.

Mehrere Dekorationen hatten feste HTML-Höhen, während CSS ihre Breite änderte: Quadratgrafiken erschienen beispielsweise mit 100×300 Pixeln. Alle Schmuckbilder haben jetzt natürliche Abmessungen und `height:auto`; bewusst gesetzte Fotoflächen verwenden `object-fit`. Auch die Leinentextur wird proportional gekachelt. Die alten, mehrfach überschriebenen CSS-Schichten wurden vollständig ersetzt.

## Inhalte und Bildherkunft

`wedding-config.js` bleibt unverändert: Marie & Simon, 28. August 2027, Schermbeck, Reformierte Kirche und Mago Restaurant & Bar sowie alle bestehenden Texte, Zeiten und offenen Angaben. Die Fotos und Location-Illustrationen stammen ausschließlich aus dem vorhandenen Repository. Es wurden keine Dateien vom Computer des Nutzers abgerufen. Fremde Veranstaltungsangaben wie Folgetag oder Shuttle-Zusage wurden nicht übernommen.

Neue Originalmotive unter `assets/art/`:

- `garden-new-landscape.webp` – Garten für Desktop.
- `garden-new-portrait.webp` – eigenständige mobile Komposition.
- `rose-new.webp` – transparentes Blütenornament.
- `garland-new.webp` – passende florale Girlande.

Die Live-Vorlage diente der Analyse; ihr Code, ihre Grafiken und ihr Film werden nicht als Produktassets übernommen. Das vorhandene Elfenbeinsiegel und die eigenen Leinenmotive bleiben erhalten.

## Prüfung

`scripts/visual-check.cjs` prüft die Breiten 320, 390, 700, 1100 und 1440 Pixel: Bildproportionen, horizontales Überlaufen, Garten während der Öffnung, Tastatur-Fokus im Cover, FAQ, Rückmelde- und Fotodialoge, erneute Öffnung und reduzierte Bewegung.

`scripts/export-check.cjs` prüft den eigenständigen HTML-Export ohne zusätzliche Netzwerkanfragen, einen bearbeiteten HTML-Export mit eingebetteten Bildern sowie den Kalenderbeginn 28.08.2027 um 14:00 Uhr Europe/Berlin (12:00 UTC). Die normalen Animationen und die endgültigen Bildkompositionen werden zusätzlich visuell geprüft.

Zeitangaben, Rückmeldefrist und einige Hinweise sind weiterhin die vorhandenen Beispielangaben. Exakte Adressen und die Rückmelde-E-Mail sind noch offen. Ohne eingetragene E-Mail wird keine Antwort verschickt; es wurde kein Backend ergänzt.
