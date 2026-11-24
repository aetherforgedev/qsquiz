# Frischewissen

Responsives deutschsprachiges Lernquiz für die Frischetheke. 60 Fragen zu Hofglück, Hackfleischsystemvertrag, Sensorik, QS, Rindfleischetikettierung und Thekenpraxis.

## Starten

Node.js 22 oder neuer; keine Installation von Abhängigkeiten nötig.

```sh
npm start
```

Die lokale Vorschau läuft unter http://127.0.0.1:4173. Veröffentlichung über GitHub Actions / GitHub Pages. Es werden ausschließlich die fünf statischen Anwendungsdateien veröffentlicht.

```sh
npm test
```

## Lernfunktionen

- Themenauswahl, zufällige Reihenfolge und zufällige Antwortpositionen
- Kurzrunde mit maximal zehn Fragen, vollständige Themenrunde und Fehlerwiederholung
- Sofortige Rückmeldung mit Lösung, Erklärung, Merksatz und zugeordneten Fachquellen
- Wiederaufnahme einer pausierten Runde, lokale Lernstatistik und Zurücksetzen
- Ergebnisübersicht mit aufklappbaren Lösungen
- Tastaturbedienung, reduzierte Bewegung und responsive Darstellung

## Inhaltliche Grundlage

Vier vom Nutzer bereitgestellte handschriftliche Seiten (IMG_6089 bis IMG_6092), gelesen am 24.11.2026. Die Originalfotos werden nicht veröffentlicht. Die Themenabdeckung ist in `CONTENT.md` dokumentiert. Ergänzende Fachquellen sind in `questions.js` und im Quellenfenster der Anwendung verlinkt.

Vertragsangaben werden ausdrücklich als Notizwissen abgefragt. Insbesondere sind 4 °C kein universeller Hackfleisch-Grenzwert und 1 Jahr keine pauschale gesetzliche Aufbewahrungsfrist. Die schwer lesbare Ausnahme beim Folgetagsverkauf wird als grobe/feine Bratwurst interpretiert und als klärungsbedürftig erklärt. „Gemischte Rindfleischprodukte ab 50 %“ wird für gemischtes Hackfleisch eingegrenzt; weitere Kennzeichnungspflichten bleiben bestehen.

Privates Lernprojekt, keine offizielle EDEKA-Schulung. Betriebliche Vorgaben müssen anhand aktueller Arbeitsanweisungen geprüft werden.

## Daten

Keine Anmeldung, kein Tracking, keine Übertragung der Antworten. Lernstand und pausierte Runde werden im Browser in `localStorage` gespeichert. Schriftarten werden von Google Fonts geladen, bei Ausfall greift eine lokale Systemschrift. Die Seite wird von GitHub Pages bereitgestellt.
