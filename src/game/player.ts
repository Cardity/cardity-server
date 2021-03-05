import * as WebSocket from 'ws';

export default class Player {
    protected playerKey: string;
    protected socket: WebSocket;

    protected gameID: string = "";
    protected name: string = "";

    constructor(playerKey: string, socket: WebSocket) {
        this.playerKey = playerKey;
        this.socket = socket;
    }

    public setName(name: string) {
        this.name = name;
    }

    public getName(): string {
        return this.name;
    }

    public setGameID(gameID: string) {
        this.gameID = gameID;
    }

    public getGameID(): string {
        return this.gameID;
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
