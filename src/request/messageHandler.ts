import * as WebSocket from "ws";
import Player from "../game/player";
import DateUtil from "../util/dateUtil";

export default class MessageHandler {
    protected player: Player | null;
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

    protected send(type: string | null, data: { [key: string]: any } | null, operation: number = 5) {
        let requestData: { [key: string]: any } = {
            "o": operation
        }
        if (type != null && type && type.length > 0) {
            requestData["t"] = type;
        }
        if (data != null) {
            requestData["d"] = data;
        }
        if (this.player?.getSocket().readyState != WebSocket.OPEN) {
            return;
        }
        this.player?.getSocket().send(JSON.stringify(requestData));
    }

    protected handleHello() {
        this.send(null, null, 2)

        if (this.player != null) {
            this.player.lastHeartbeat = DateUtil.getCurrentTimestamp();
        }
    }

    protected handleHeartbeat() {
        this.send(null, null, 4)

        if (this.player != null) {
            this.player.lastHeartbeat = DateUtil.getCurrentTimestamp();
        }
    }

    protected handleRequest(type: string | null, data: any | null) {

    }
}
