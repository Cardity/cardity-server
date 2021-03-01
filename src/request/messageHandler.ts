import * as WebSocket from "ws";

export class MessageHandler {
    protected socket: WebSocket;
    protected data: WebSocket.Data;

    constructor(socket: WebSocket, data: WebSocket.Data) {
        this.socket = socket;
        this.data = data;
    }

    handle() {
        let data = JSON.parse(this.data.toString());
        console.log(data);
    }
}
