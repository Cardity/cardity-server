# cah

SSL-Zertifikat:

certbot certonly -d cah.testsrv.de --standalone

https://github.com/basarat/typescript-book/blob/master/docs/styleguide/styleguide.md

OP-Code | Richtung        | Beschreibung
--------|-----------------|--------------
1       | Client > Server | Hallo
2       | Client < Server | Antwort auf 1 mit Heartbeat Interval
3       | Client > Server | Heartbeat
4       | Client < Server | Heartbeat Antwort
5       | Client > Server | Anfrage an Server
6       | Client < Server | Antwort von Server auf 5
