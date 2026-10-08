# Unsere Hochzeit · Embroidered Garden

Eine eigenständig gestaltete digitale Hochzeitseinladung aus HTML, CSS und JavaScript. Florale Stickgrafiken, warme Leinenoptik, eine Brieföffnung mit Siegel und elegante, lokal mitgelieferte Schriften. Inspiriert von [Embroidered Garden](https://www.thedigitalyes.com/demo/embroidered-garden), mit eigenen Grafiken und eigenem Code.

[Desktop-Vorschau](preview-desktop.png) · [Handy-Vorschau](preview-mobile.png)

## Sofort ansehen

`Unsere-Hochzeit.html` herunterladen und im Browser öffnen. Sie enthält die komplette Gestaltung und funktioniert ohne Installation und ohne Internet. Die Brieföffnung lässt sich im Footer wiederholen.

Für den Bearbeitungsmodus `?edit=1` an die Adresse hängen, zum Beispiel:

```text
file:///…/Unsere-Hochzeit.html?edit=1
```

Im Bearbeitungsmodus lassen sich Namen, Datum, Kontaktadresse und alle vier Bilder einfügen. „HTML mit Bildern speichern“ lädt anschließend eine vollständige HTML-Datei mit eingebetteten Bildern herunter. Nichts wird dafür an einen Dienst hochgeladen. Die Datei kann wieder bearbeitet werden, indem `?edit=1` angehängt wird.

## Alle Details ändern

Die Namen „Mila & Elias“, der 19. Juni 2027, Zeiten, Rückmeldefrist und Einladungstexte sind **erfundene Beispielangaben**. Vorgegeben waren die Reformierte Kirche in Schermbeck und Mago Restaurant & Bar. Genaue Adressen wurden bewusst nicht erfunden.

Alle Texte, Orte, Zeiten, Bilder und Angaben sind in **`wedding-config.js`** gesammelt. Nach Änderungen an dieser Datei nutzt `index.html` sofort die neuen Angaben. Mit

```sh
python3 build.py
```

werden zusätzlich die einzelne HTML-Datei und die Exportvorlage neu erstellt. Python benötigt dafür keine Zusatzpakete. `scripts/create-art.py` kann die eigenen SVG-Grafiken ebenfalls ohne Zusatzpakete neu erstellen.

## Eure Bilder

Die Fotos und beiden Stickillustrationen wurden im Chat als eingebettete Bildvorschauen übergeben. Als herunterladbare Datei lag beim Erstellen nur das Referenzvideo vor. Die Originalbilder sind daher **noch nicht Bestandteil dieses Repositorys**; die vorbereiteten Plätze zeigen eigene florale Illustrationen.

Die vier Plätze sind:

| Platz | Bild |
| --- | --- |
| `couple` | Schwarzweißfoto des Paares |
| `hands` | Schwarzweißfoto der Hände mit Ring |
| `church` | Die gestickte Kirchenillustration |
| `party` | Die gestickte Mago-Illustration oder das Originalfoto |

Entweder im Bearbeitungsmodus auswählen oder in `assets/images/` speichern und die entsprechenden Pfade in `wedding-config.js` eintragen. JPG, PNG und WebP funktionieren. Die Seite schneidet Bilder ausschließlich in der Darstellung zu; Originaldateien werden nicht verändert.

## Kostenlos veröffentlichen

Die Seite braucht keinen Servercode, kein Abo, keine bezahlte API und keine externe Bildgenerierung. Grafiken und Schriften werden lokal ausgeliefert. Google Maps wird nur nach einem Klick auf einen Routenlink geöffnet.

Für GitHub Pages bei diesem öffentlichen Repository:

1. **Settings → Pages** öffnen.
2. Unter **Build and deployment** „Deploy from a branch“ wählen.
3. Branch **main**, Ordner **/(root)** auswählen und speichern.

Die vorgesehene Adresse ist dann `https://steutersimon-a11y.github.io/hochzeit/`. Pages muss erst in den Einstellungen aktiviert werden; das Erstellen des Codes aktiviert oder veröffentlicht die Seite nicht automatisch. Ein privates Repository kann je nach GitHub-Tarif andere Pages-Voraussetzungen haben.

## Rückmeldung und Kalender

Die Rückmeldung ist ohne eingetragene Kontaktadresse eine klar gekennzeichnete Vorschau. Sie speichert und verschickt keine Daten. Mit `rsvpEmail` bereitet sie eine E-Mail im E-Mail-Programm der Gäste vor; die Gäste müssen diese selbst absenden. Es gibt keine Datenbank und keine automatische Gästeliste.

Der Kalenderbutton lädt eine ICS-Datei herunter. Die Zeit wird für `Europe/Berlin` inklusive Sommerzeit berechnet. Auch Datum und Zeiten sind anpassbar.

## Gestaltung und Lizenzen

Die sieben floralen SVG-Motive und Architekturillustrationen wurden für diese Einladung neu gezeichnet. Die bezahlte Vorlage wurde nicht gekauft oder als Asset übernommen. Cormorant Garamond und Manrope sind frei nutzbare Schriften; ihre Lizenztexte liegen in `assets/fonts/`.

Die Gestaltung berücksichtigt Mobilgeräte, Tastaturbedienung, sichtbare Fokusmarkierungen, modale Dialoge und die Betriebssystemeinstellung für reduzierte Bewegung. Fotos können per Klick oder Tastatur vergrößert werden, sobald Originalbilder eingebunden sind.

Geprüft im Chromium-Browser: Brieföffnung, fünf Bildschirmbreiten von 320 bis 1440 Pixeln ohne horizontales Überlaufen, Dialog- und Tastaturbedienung, ICS-Zeiten inklusive Berliner Sommerzeit, Bildauswahl im Editor und der vollständige HTML-Export mit eingebettetem Bild. Die exportierte Einladung lädt keine weiteren Dateien nach. In diesen Prüfungen traten keine JavaScript-Fehler auf.
