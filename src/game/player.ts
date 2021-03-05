import * as WebSocket from 'ws';

export default class Player {
    static players: { [ key: string]: Player } = {};

    protected playerKey: string;
    protected socket: WebSocket;

    public gameID: string = "";
    public name: string = "";
    public lastHeartbeat: number = 0;

    constructor(playerKey: string, socket: WebSocket) {
        this.playerKey = playerKey;
        this.socket = socket;
    }

    static getPlayer(key: string): Player | null {
        if (this.players[key] != null) {
            return this.players[key];
        }
        return null;
    }

    public getGame() {
        // TODO: implement
    }

    public getKey(): string {
        return this.playerKey;
    }

    public getSocket(): WebSocket {
        return this.socket;
    }
}
