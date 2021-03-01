// import * as fs from 'fs';
// import * as https from 'https';
import * as WebSocket from 'ws';

import { Server } from "./server/Server";

// const server = https.createServer({
//     cert: fs.readFileSync('ssl/wsc53_fullchain.pem'),
//     key: fs.readFileSync('ssl/wsc53_privkey.pem')
// });

// const wss = new WebSocket.Server({ server });
// wss.on('connection', function connection(ws) {
//     console.log('test');

//     ws.on('message', function(message) {
//         console.log('received: %s', message);
//     })

//     ws.send('test');
// });

// server.listen(8445);

export class Program {
    static FullPath: string;

    static server: Server

    run() {
        Program.server = new Server();
        Program.server.start();
    }

    static getServer(): Server {
        return Program.server;
    }

    static getSocket(): WebSocket.Server {
        return Server.webSocket;
    }
}
