Die vier Bilder aus dem bereitgestellten Archiv `Hochzeit.rar` sind hier unverändert gespeichert:

- `paar.jpg` – Schwarzweißfoto von Marie und Simon
- `haende.jpg` – Schwarzweißfoto der Hände
- `kirche-stickerei.jpg` – gestickte Illustration der Reformierten Kirche
- `mago.jpg` – gestickte Illustration von Mago Restaurant & Bar

`wedding-config.js` ordnet Paarfoto, Ringfoto und Kirchenillustration ihren Plätzen in der Einladung zu. Die neue Mago-Illustration liegt in `../loom/mago-location.webp`; `mago.jpg` bleibt die Originalvorlage. Auch die neue Opener-Kirche wurde anhand der vorhandenen Kirchenillustration gestaltet. `python3 build.py` bettet die jeweils verwendeten Bilder in die eigenständige Datei `Unsere-Hochzeit.html` und ihre Exportvorlage ein. Die Bilder können im kostenlosen Bearbeitungsmodus mit `?edit=1` ersetzt werden.
