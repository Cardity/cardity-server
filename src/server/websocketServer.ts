import { IncomingMessage } from "http";
import * as https from "https";
import * as WebSocket from 'ws';
import Player from "../game/player";
import MessageHandler from "../request/messageHandler";
import DateUtil from "../util/dateUtil";

export default class WebsocketServer {
    static server: WebSocket.Server;

    constructor(server: https.Server) {
        WebsocketServer.server = new WebSocket.Server({ server: server });
        WebsocketServer.server.on("connection", this.onConnection.bind(this));

        console.log("Websocket-Server started...")
    }

    protected onConnection(socket: WebSocket, req: IncomingMessage) {
        if (typeof req.headers["sec-websocket-key"] !== "string") {
            socket.close();
            return;
        }
        
        let key: string = req.headers["sec-websocket-key"];
        Player.players[key] = new Player(key, socket);

        socket.on("message", function(data: WebSocket.Data) {
            try {
                let messageHandler = new MessageHandler(Player.players[key], data);
                messageHandler.handle();
            } catch (e: unknown) {
                if (typeof e === "string") {
                    console.log(e);
                } else if (e instanceof Error) {
                    console.log(e.message);
                }
            }
        });

        socket.on("close", function(code: number, reason: string) {
            console.log("client closed: (" + code + ") " + reason);
            if (Player.players[key] != null) {
                delete Player.players[key];
            }
        });

        setTimeout(this.heartbeatCheck.bind(this), 50000, socket, key);
    }

    protected heartbeatCheck(socket: WebSocket, key: string) {
        if (socket.readyState != WebSocket.OPEN) {
            if (Player.players[key] != null) {
                delete Player.players[key];
            }
            return;
        }

        if (Player.players[key] == null) {
            socket.close();
            return;
        }

        if (Player.players[key].lastHeartbeat + 50 < DateUtil.getCurrentTimestamp()) {
            socket.close();
            delete Player.players[key];
            return;
        }

        setTimeout(this.heartbeatCheck.bind(this), 50000, socket, key);
    }
}
