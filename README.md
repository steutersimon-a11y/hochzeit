## Aktuelle Gestaltung: Embroidered Garden

Die Einladung wurde erneut anhand der Live-Demo analysiert und als ruhiger, zentrierter Einladungsbogen umgesetzt. Eure Konfiguration bleibt unverändert. Details zur Referenz, Bildherkunft und Prüfung stehen in [DESIGN-REFERENZ.md](DESIGN-REFERENZ.md). Die neueste Siegelanimation aus GitHub ist integriert. `opening.css` ergänzt `style.css`; beide werden beim Build in die eigenständige HTML-Datei eingebettet. Die aktuellen Vorschauen sind `preview-desktop.png` und `preview-mobile.png`.

# Unsere Hochzeit · Embroidered Garden

Eine eigenständig gestaltete digitale Hochzeitseinladung aus HTML, CSS und JavaScript. Fotorealistische Stickmotive mit Seidenrosen und Perlensäumen, zwei auf Handy und Desktop abgestimmte Leinenhüllen, eine räumliche Öffnung mit überstehendem Elfenbeinsiegel und lokal eingebettete Kalligrafie. Inspiriert von [Embroidered Garden](https://www.thedigitalyes.com/demo/embroidered-garden), mit eigenen Grafiken und eigenem Code.

[Desktop-Vorschau](preview-desktop.png) · [Handy-Vorschau](preview-mobile.png) · [Eure Fotos](preview-fotos.png) · [Die Locations](preview-locations.png)

[Das M-&-S-Siegel](preview-siegel-mobile.png) · [Öffnung der Leinenflügel](preview-ouverture.png) · [Animation als Video](preview-oeffnung.mp4)

## Sofort ansehen

1. [Unsere-Hochzeit.html herunterladen](https://github.com/steutersimon-a11y/hochzeit/raw/refs/heads/main/Unsere-Hochzeit.html) und auf dem Computer speichern. Wenn der Browser Quelltext zeigt: den Link mit der rechten Maustaste anklicken und „Link speichern unter …“ wählen. Der Dateiname muss auf `.html` enden.
2. Die gespeicherte Datei mit Chrome, Edge, Firefox oder Safari öffnen, zum Beispiel per Rechtsklick → „Öffnen mit“ → Browser.
3. Auf das Siegel oder „Zum Öffnen berühren“ klicken. Danach durch die gesamte Seite scrollen. Die Brieföffnung lässt sich im Footer wiederholen.

Die einzelne HTML-Datei enthält die komplette Gestaltung und funktioniert ohne Installation und ohne Internet. Die Dateivorschau von GitHub oder eine Handy-Dateivorschau kann stattdessen Code anzeigen oder die Animationen nicht ausführen. Am Handy ist die veröffentlichte GitHub-Pages-Adresse deshalb der einfachste Weg; die Aktivierung steht weiter unten.

Das plastische Elfenbein-Siegel mit euren Initialen ragt vor beiden Leinenflügeln über die Mittelkante hinaus. Seine eigene Trägerebene bewegt sich mit dem rechten Flügel. Dieser öffnet etwas früher als der linke, damit das Siegel frei mitgenommen wird. Nach einem Klick schwenken beide Flügel räumlich nach außen und enthüllen die Karte. Die Öffnung dauert etwa 4,3 Sekunden. Bei aktivierter Einstellung für reduzierte Bewegung erscheint die Karte sofort. Die Öffnung lässt sich per Tastatur bedienen und am Seitenende wiederholen.

Für den Bearbeitungsmodus `?edit=1` an die Adresse hängen, zum Beispiel:

```text
file:///…/Unsere-Hochzeit.html?edit=1
```

Im Bearbeitungsmodus lassen sich Namen, Datum, Kontaktadresse und alle vier Bilder einfügen. „HTML mit Bildern speichern“ lädt anschließend eine vollständige HTML-Datei mit eingebetteten Bildern herunter. Nichts wird dafür an einen Dienst hochgeladen. Die Datei kann wieder bearbeitet werden, indem `?edit=1` angehängt wird.

## Alle Details ändern

Die Einladung ist für **Marie & Simon am Samstag, 28. August 2027** eingerichtet. Vorgegeben sind außerdem die Reformierte Kirche in Schermbeck und Mago Restaurant & Bar. Zeiten, Rückmeldefrist und weitere Details sind weiterhin **erfundene Beispielangaben**. Genaue Adressen wurden bewusst nicht erfunden.

Alle Texte, Orte, Zeiten, Bilder und Angaben sind in **`wedding-config.js`** gesammelt. Nach Änderungen an dieser Datei nutzt `index.html` sofort die neuen Angaben. Mit

```sh
python3 build.py
```

werden zusätzlich die einzelne HTML-Datei und die Exportvorlage neu erstellt. Python benötigt dafür keine Zusatzpakete. `scripts/create-art.py` kann die ursprünglichen SVG-Ersatzmotive ohne Zusatzpakete neu erstellen. Die sieben aktuellen Couture-Motive liegen als fertige WebP-Grafiken in `assets/art/`; ihre Hintergrundtransparenz und ursprüngliche Auflösung bleiben erhalten. Die Gestaltung der überarbeiteten Variante steht in `atelier.css`.

## Eure Bilder

Euer Paarfoto, das Ringfoto und die beiden Stickillustrationen aus `Hochzeit.rar` sind eingebunden. Die Originaldateien liegen in `assets/images/`; die einzelne HTML-Datei enthält zusätzlich alle vier Bilder direkt und benötigt deshalb keinen separaten Bildordner. Die Dateien wurden unverändert aus dem Archiv übernommen.

Die vier Plätze sind:

| Platz | Bild |
| --- | --- |
| `couple` | Schwarzweißfoto des Paares |
| `hands` | Schwarzweißfoto der Hände mit Ring |
| `church` | Die gestickte Kirchenillustration |
| `party` | Die gestickte Mago-Illustration oder das Originalfoto |

Zum Austauschen neue Bilder im Bearbeitungsmodus auswählen oder in `assets/images/` speichern und die entsprechenden Pfade in `wedding-config.js` eintragen. JPG, PNG und WebP funktionieren. Die Fotoflächen schneiden ausschließlich in der Darstellung zu; Originaldateien werden nicht verändert. Die beiden Location-Illustrationen werden vollständig angezeigt.

## Kostenlos veröffentlichen

Die fertige Seite braucht keinen Servercode, kein zusätzliches Abo und keine bezahlte API. Grafiken und Schriften werden lokal ausgeliefert. Google Maps wird nur nach einem Klick auf einen Routenlink geöffnet.

Für GitHub Pages bei diesem öffentlichen Repository:

1. **Settings → Pages** öffnen.
2. Unter **Build and deployment** „Deploy from a branch“ wählen.
3. Branch **main**, Ordner **/(root)** auswählen und speichern.

Die vorgesehene Adresse ist dann `https://steutersimon-a11y.github.io/hochzeit/`. Pages muss erst in den Einstellungen aktiviert werden; das Erstellen des Codes aktiviert oder veröffentlicht die Seite nicht automatisch. Ein privates Repository kann je nach GitHub-Tarif andere Pages-Voraussetzungen haben.

## Rückmeldung und Kalender

Die Rückmeldung ist ohne eingetragene Kontaktadresse eine klar gekennzeichnete Vorschau. Sie speichert und verschickt keine Daten. Mit `rsvpEmail` bereitet sie eine E-Mail im E-Mail-Programm der Gäste vor; die Gäste müssen diese selbst absenden. Es gibt keine Datenbank und keine automatische Gästeliste.

Der Kalenderbutton lädt eine ICS-Datei herunter. Die Zeit wird für `Europe/Berlin` inklusive Sommerzeit berechnet. Auch Datum und Zeiten sind anpassbar.

## Gestaltung und Lizenzen

Sieben neue Materialgrafiken wurden mit der integrierten ChatGPT-Bilderstellung für diese Einladung erstellt: Gartenrahmen für Handy und Desktop, Leinenhülle für Handy und Desktop, Elfenbeinsiegel, Blütengirlande und Rosenspray. Namen, Initialen und Datum bleiben bearbeitbarer HTML-Text. Die ursprünglichen SVG-Ersatzmotive sind ebenfalls eigene Zeichnungen. Die bezahlte Vorlage wurde nicht gekauft oder als Asset übernommen. Pinyon Script, Cormorant Garamond und Manrope sind frei nutzbare Schriften; ihre Lizenztexte liegen in `assets/fonts/`. Die fertige Seite benötigt keine Bildgenerierungs-API oder andere laufende Design-Dienste.

Die Gestaltung berücksichtigt Mobilgeräte, Tastaturbedienung, sichtbare Fokusmarkierungen, modale Dialoge und die Betriebssystemeinstellung für reduzierte Bewegung. Fotos können per Klick oder Tastatur vergrößert werden, sobald Originalbilder eingebunden sind.

Geprüft im Chromium-Browser: sechs Bildschirmbreiten von 320 bis 1440 Pixeln ohne horizontales Überlaufen; echte Überdeckung des linken Flügels durch das Siegel während der Öffnung, synchroner rechter Scharnierverlauf, Tastaturbedienung, wiederholte Öffnung und reduzierte Bewegung; erhaltene Bildproportionen; Editor-Export mit allen vier Fotos, neuen Couture-Motiven und Schriften. Die exportierte Datei lädt keine weiteren Dateien nach. In diesen Prüfungen traten keine JavaScript-Fehler auf. Die Berliner Kalenderzeiten einschließlich Sommerzeit und die Rückmeldedialoge wurden zuvor geprüft und sind unverändert.
