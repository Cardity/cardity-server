import * as WebSocket from "ws";
import { WebsocketServer } from "../server/websocketServer";
import { DateUtil } from "../util/dateUtil";

export class MessageHandler {
    protected socket: WebSocket;
    protected data: WebSocket.Data;
    protected key: string;

    constructor(socket: WebSocket, data: WebSocket.Data, key: string) {
        this.socket = socket;
        this.data = data;
        this.key = key;
    }

    handle() {
        let data = JSON.parse(this.data.toString());
        console.log(data); // TODO: auskommentieren

        switch (data.o) {
            case 1: {
                this.handleHello();
                break;
            }
            case 3: {
                this.handleHeartbeat();
                break;
            }
        }
    }

    protected handleHello() {
        let data = {
            "o": 2
        };
        this.socket.send(JSON.stringify(data));

        WebsocketServer.heartbeatClients[this.key] = DateUtil.getCurrentTimestamp();
    }

    protected handleHeartbeat() {
        let data = {
            "o": 4
        };
        this.socket.send(JSON.stringify(data));

        WebsocketServer.heartbeatClients[this.key] = DateUtil.getCurrentTimestamp();
    }
}
