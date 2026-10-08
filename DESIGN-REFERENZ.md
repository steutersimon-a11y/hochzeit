# Marie & Simon · Eine zusammenhängende Stickerei

Die [Referenzseite von The Digital Yes](https://www.thedigitalyes.com/demo/embroidered-garden) und die [eigentliche Einladung](https://embroidered-garden-template.thedigitalyes.com) waren am 8. Oktober 2026 erreichbar. Beide wurden erneut in Chromium geöffnet. Die Öffnung und alle Abschnitte der Einladung wurden anhand tatsächlicher Bildschirmaufnahmen visuell untersucht.

## Was die Vorlage wirklich zeigt

Auf salbeifarbene Leinenflügel mit Elfenbeinsiegel folgt eine helle Szene mit seitlichen Perlenvorhängen, gesticktem Gebäude und übereinander gesetzten Serifennamen. Die separate Begrüßung zeigt hängende Glyzinien, Seidenrosen und zwei einander zugewandte Schwäne. Weitere Motive sind Perlenmedaillons für den Countdown, ein rechteckiger Blütenrahmen für die Einladung, ein ovaler Rahmen für die Geschichte, kleine gestickte Ablaufmotive und ein Schleifenrahmen für Geschenke.

Die vorherige Gestaltung traf diesen Aufbau zu wenig: Ihre Gartenlandschaft und Schreibschrift wirkten anders als die Vorlage. Außerdem wurde dasselbe Rosenornament fünfmal und dieselbe Girlande zweimal gezeigt. Diese Dekorationen sind vollständig aus der aktuellen Seite entfernt.

## Die neue Gestaltung

Die acht neuen Bilddateien in [assets/loom](assets/loom/README.md) bilden eine gemeinsame Materialwelt: elfenbeinfarbenes Leinen, Salbeigrün, gedämpftes Mauve, Perlen und sichtbare Stickstiche. Jede große dekorative Szene hat genau einen Platz. Nur die drei Countdown-Medaillons wiederholen sich bewusst als zusammengehörige Anzeigen.

Der Opener zeigt die eigene Kirche aus dem Repository: heller polygonaler Baukörper, rotes Dach und dunkler Dachreiter. Perlenvorhänge rahmen die Namen ein. Die Szene ist schon geladen, bevor die Kartenflügel öffnen. Ihre natürlichen Bildkoordinaten bestimmen die Textposition; Datum und Ortsangabe bleiben oberhalb des Turms.

Beim Weiterscrollen folgen die Begrüßung mit Schwänen, Countdown, gemeinsamer Trauungs- und Feierrahmen und die beiden Orte. Die neue Mago-Illustration übernimmt die Architektur, Fenster, Dach und Terrasse des eigenen Repository-Bildes. Die vorhandene Kirchenillustration wird im Ortsabschnitt vollständig dargestellt. Beide Orte behalten ihre Proportionen.

Dresscode, Geschichte, eigene Fotos, Tagesablauf, Hinweise, Geschenke und Rückmeldung schließen die Einladung ab. Der Ablauf zeigt sechs verschiedene Stickmotive: Kirche für Ankunft, Ringe für Trauung, Sektgläser für Anstoßen, Cocktail für Aperitif, Teller und Besteck für Dinner sowie Discokugel für Tanz. Die Motive stehen an einer feinen gepunkteten Linie. Dresscode und Geschenkhinweis erscheinen jeweils einmal; sie werden im FAQ nicht wiederholt.

Cormorant Garamond trägt Namen, Überschriften und Fließtext. Kleine Beschriftungen und Bedienfelder verwenden Manrope. Kartenöffnung und ruhige Scroll-Einblendungen unterstützen den Verlauf. Die Einstellung für reduzierte Bewegung wird berücksichtigt.

## Eigene Inhalte und Herkunft

Namen, Datum, Orte, Texte, Zeiten, Rückmeldefrist und sämtliche sonstigen Angaben in `wedding-config.js` bleiben erhalten. Ausschließlich der Bildpfad für Mago verweist jetzt auf die neu erzeugte Illustration. Paarfoto und Ringfoto sind unverändert.

Verwendet wurden die öffentliche Referenzwebsite, vorhandene Repository-Bilder und interne Bilderstellung. Es wurden keine weiteren Daten vom Computer des Nutzers gelesen. Die neuen Stickmotive sind eigene Bildgenerierungen; Referenzgrafiken, Referenzcode und Referenzfilm werden nicht als Produktdateien eingebunden. Frühere eigene Designvarianten bleiben im Repository, werden aber nicht mehr auf der Seite angezeigt.

## Prüfung

`scripts/visual-check.cjs` prüft 320, 390, 700, 1100 und 1440 Pixel, Bildproportionen, horizontales Überlaufen, Textpositionen in den Rahmen, eindeutige Dekorationen und erhaltene Konfigurationsangaben. Hinzu kommen Öffnung, Tastatur-Fokus, FAQ, Rückmelde- und Fotodialoge, erneute Öffnung, Kalender und reduzierte Bewegung. Die endgültigen Ansichten werden zusätzlich visuell beurteilt.

`scripts/export-check.cjs` prüft den eigenständigen HTML-Export und den bearbeiteten Export ohne weitere Netzwerkanfragen. Der Kalenderbeginn am 28. August 2027 um 14:00 Uhr Europe/Berlin wird als 12:00 UTC exportiert.

Die bereits vorhandenen Beispielzeiten und offenen Kontaktdaten wurden nicht ergänzt oder erfunden. Ohne Rückmelde-E-Mail bleibt das Formular eine Vorschau und verschickt keine Antwort.
