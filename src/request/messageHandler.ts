import * as WebSocket from "ws";
import Player from "../game/player";
import DateUtil from "../util/dateUtil";
import ClientRequestHandler from "./client/clientRequestHandler";

export default class MessageHandler {
    protected player: Player;
    protected data: WebSocket.Data;

    constructor(player: Player, data: WebSocket.Data) {
        this.player = player;
        this.data = data;
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
            case 5: {
                this.handleRequest(data.t, data.d);
                break;
            }
        }
    }

    protected handleHello() {
        this.player.send(null, null, 2);
        this.player.lastHeartbeat = DateUtil.getCurrentTimestamp();
    }

    protected handleHeartbeat() {
        this.player.send(null, null, 4);
        this.player.lastHeartbeat = DateUtil.getCurrentTimestamp();
    }

    protected handleRequest(type: string | null, data: { [key: string]: any } | null) {
        let clientRequestHandler = new ClientRequestHandler(this.player, type, data);
        let handledData = clientRequestHandler.handle();
        this.player.send(type, handledData);
    }
}
