import * as https from "https";
import * as WebSocket from 'ws';
import { MessageHandler } from "../request/messageHandler";

export class WebsocketServer {
    static server: WebSocket.Server;

    constructor(server: https.Server) {
        WebsocketServer.server = new WebSocket.Server({ server: server });
        WebsocketServer.server.on("connection", this.onConnection.bind(this));

        console.log("Websocket-Server started...")
    }

    protected onConnection(socket: WebSocket) {
        socket.on("message", function(data: WebSocket.Data) {
            let messageHandler = new MessageHandler(socket, data);
            messageHandler.handle();
        });

        socket.on("close", function(code: number, reason: string) {
            console.log("client closed");
        });
    }
}
