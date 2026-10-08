# Einladung · Embroidered Garden

Referenz: https://www.thedigitalyes.com/demo/embroidered-garden
Tatsächliche Demo: https://embroidered-garden-template.thedigitalyes.com
Analyse am 8. Oktober 2026.

## Was die Referenz ausmacht

Der Einstieg zeigt salbeifarbenen Stoff, eine zentrale Naht und ein plastisches Elfenbeinsiegel. Die Öffnung führt zu einem textilen Garten mit Villa, Perlenvorhängen und einer floralen Begrüßung. Glyzinien, Rosen, Salbeiblätter und zwei Schwäne prägen die Bildsprache. Sichtbare Fäden, Reliefschatten und zurückhaltende Farben schaffen die Wirkung einer handgearbeiteten Einladung. Die Typografie bleibt dunkelgrün, fein und zentriert; große Freiflächen geben den Motiven Raum.

Die Demo enthält Begrüßung, Countdown, förmliche Einladung, Trauung und Empfang mit Karten- und Kalenderlinks, Dresscode, Geschichte, Tagesablauf, einen zusätzlichen Folgetag, Geschenkinformationen und ein Rückmeldeformular. Die Rückmeldung fragt Teilnahme, Ernährungswünsche, Shuttle und persönliche Nachricht ab. Diese fremden Veranstaltungsangaben werden nicht übernommen.

## Umsetzung für Marie & Simon

Die Empfehlung ist ein durchgehender, maximal 860 Pixel breiter Einladungsbogen. Er erhält die textile Wirkung der Referenz und bleibt am Desktop lesbar. Mobil füllt er den Bildschirm. Ein neu intern generierter Gartenrahmen zeigt eigene Glyzinien, Rosen, Perlen, Brunnen und Schwäne; der Text liegt als echtes HTML im freien Zentrum. Die verbesserten Scharniere, das Siegel und die weiteren bereits vorhandenen Stickmotive des aktuellen Repository-Stands bleiben erhalten.

Reihenfolge: Garten mit Namen und Datum → persönliche Einladung → Datum und Countdown → beide Orte → Fotos und Geschichte → Tagesablauf → Hinweise → Rückmeldung. Ein Folgetag und Shuttle-Zusagen werden nicht erfunden. Die zwei Locations erhalten jeweils eine vollständige Illustration und eine eigene Anfahrt. Die bestehenden Inhalte in wedding-config.js wurden nicht verändert: Namen, Datum, Orte, Texte, Fotos, Zeiten, Frist und Rückmeldelogik bleiben bestehen.

## Dateien und Herkunft

- assets/embroidered-garden.webp: neu intern erzeugtes Originalmotiv.
- assets/art/: vorhandene intern erzeugte Stickmotive aus dem aktuellen GitHub-Stand.
- assets/images/: vorhandene Bilder aus dem Repository; keine neuen Computerdateien oder Archivimporte.
- style.css: Layout und Gestaltung.
- opening.css: integrierte verbesserte Scharniere und Siegelanimation.
- Unsere-Hochzeit.html: neu gebauter eigenständiger Export mit eingebetteten Bildern und Schriften.

Die Grafiken und der Code der Referenz werden nicht als Website-Assets übernommen. Sie dient als visuelle und strukturelle Vorlage.

## Prüfung und offene Angaben

Chromium: 320, 390, 700, 1100 und 1440 Pixel ohne horizontales Überlaufen; Öffnung mit reduzierter Bewegung, Rückmeldedialog einschließlich Escape, FAQ und Kalenderdownload erfolgreich. Zusätzlich normale Siegelanimation, Desktop- und Mobilvorschau, eigenständige HTML ohne zusätzliche Netzwerkanfragen sowie Kalenderbeginn 28.08.2027 um 14:00 Uhr Europe/Berlin geprüft. Keine JavaScript-Laufzeitfehler in den Breitentests.

Zeiten, Frist und einige Hinweise sind laut bestehender Konfiguration weiterhin Beispielangaben. Exakte Adressen und Rückmelde-E-Mail fehlen weiterhin. Ohne E-Mail wird keine Antwort verschickt; es wurde kein Backend ergänzt.
