import * as https from "https";
import * as WebSocket from 'ws';

export class WebsocketServer {
    static server: WebSocket.Server;

    constructor(server: https.Server) {
        WebsocketServer.server = new WebSocket.Server({ server: server });
        WebsocketServer.server.on("connection", this.onConnection.bind(this));

        console.log("Websocket-Server started...")
    }

    protected onConnection(socket: WebSocket) {
        console.log(socket);
        console.log("Client connected.");
        socket.send("hallo");
    }
}
