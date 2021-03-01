import { IncomingMessage } from "http";
import * as https from "https";
import * as WebSocket from 'ws';
import { MessageHandler } from "../request/messageHandler";
import { DateUtil } from "../util/dateUtil";

export class WebsocketServer {
    static server: WebSocket.Server;

    static heartbeatClients: { [key: string]: number } = {};

    constructor(server: https.Server) {
        WebsocketServer.server = new WebSocket.Server({ server: server });
        WebsocketServer.server.on("connection", this.onConnection.bind(this));

        console.log("Websocket-Server started...")
    }

    protected onConnection(socket: WebSocket, req: IncomingMessage) {
        let key: string = req.headers["sec-websocket-key"]!;

        socket.on("message", function(data: WebSocket.Data) {
            let messageHandler = new MessageHandler(socket, data, key);
            messageHandler.handle();
        });

        socket.on("close", function(code: number, reason: string) {
            console.log("client closed");
            if (WebsocketServer.heartbeatClients[key] != null) {
                delete WebsocketServer.heartbeatClients[key];
            }
        });

        setTimeout(this.heartbeatCheck.bind(this), 50000, socket, key);
    }

    protected heartbeatCheck(socket: WebSocket, key: string) {
        if (socket.readyState != WebSocket.OPEN) {
            if (WebsocketServer.heartbeatClients[key] != null) {
                delete WebsocketServer.heartbeatClients[key];
            }
            return;
        }

        if (WebsocketServer.heartbeatClients[key] == null) {
            socket.close();
            return;
        }

        if (WebsocketServer.heartbeatClients[key] + 50 < DateUtil.getCurrentTimestamp()) {
            socket.close();
            delete WebsocketServer.heartbeatClients[key];
            return;
        }

        setTimeout(this.heartbeatCheck.bind(this), 50000, socket, key);
    }
}
