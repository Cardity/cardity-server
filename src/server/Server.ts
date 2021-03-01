import * as fs from 'fs';
import * as https from 'https';
import * as WebSocket from 'ws';
import { Config } from '../../config';
import { Global } from '../../global';

export class Server {
    static webSocket: WebSocket.Server;

    start() {
        let server = https.createServer({
            cert: fs.readFileSync(Global.programPath + '../ssl/wsc53_fullchain.pem'),
            key: fs.readFileSync(Global.programPath + '../ssl/wsc53_privkey.pem')
        });

        Server.webSocket = new WebSocket.Server({ server });
        Server.webSocket.on('connection', this.newConnection.bind(this));

        server.listen(Config.serverPort);

        console.log('Server started...');
    }

    newConnection(socket: WebSocket) {
        socket.on('message', function(data: WebSocket.Data) {
            socket.send('yippie');
        });

        setTimeout(this.sendHeartbeat.bind(this), 1000, socket);
    }

    sendHeartbeat(socket: WebSocket) {
        console.log('heartbeat');
        socket.send('heartbeat');
    }
}
