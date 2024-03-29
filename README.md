# Cardity

## installiete Pakete

- `@types/socket.io`
- `@types/node`
- `@types/redis`
- `socket.io`
- `socket.io-redis`
- `bufferutil`
- `typescript`
- `utf-8-validate`
- `redis`

## SSL-Zertifikat:

certbot certonly -d cah.testsrv.de --standalone

https://github.com/basarat/typescript-book/blob/master/docs/styleguide/styleguide.md

## Status-Codes

OP-Code | Richtung        | Beschreibung
--------|-----------------|--------------
1       | Client > Server | Hallo
2       | Client < Server | Antwort auf 1 mit Heartbeat Interval
3       | Client > Server | Heartbeat
4       | Client < Server | Heartbeat Antwort
5       | Client > Server | Anfrage an Server
6       | Client < Server | Antwort von Server auf 5


## Spielphasen
1. Kartenzar wird gewählt und  Karten werden gezogen (eine Frage Karte und so viele Karten bis jeder 10 auf der Hand hat)
    - wenn Karten leer, werden Karten aus Wegwerfstabel genommen, neu gemischt und auf Kartenstapel gelegt
2. Spieler, die nicht Kartenzar sind, wählen Karten
3. Kartenzar wählt welche Karte am besten passt, restlichen werden auf Wegwerfstabel geleggt
4. Punkt wird an gewählte Person verteilt
    - wenn keine schwarzen Karten mehr, Spiel beenden und Gewinner erklären
5. Phase 1 beginnt

## Production
`npm install pm2@latest -g`

`pm2 start ecosystem.config.json`

`pm2 stop ecosystem.config.json`

`pm2 monitor ecosystem.config.json`

https://pm2.keymetrics.io/docs/usage/quick-start/
