import * as WebSocket from 'ws';
import Game from './game';

export default class Player {
    static players: { [ key: string]: Player } = {};

    protected playerKey: string;
    protected socket: WebSocket;

    public gameID: string = "";
    public name: string = "";
    public lastHeartbeat: number = 0;
    public isCardCzar: boolean = false;
    public points: number = 0;
    public wordCards: string[] = [];
    public selectedCards: number[] = [];

    constructor(playerKey: string, socket: WebSocket) {
        this.playerKey = playerKey;
        this.socket = socket;
    }

    public send(type: string | null, data: { [key: string]: any } | null, operation: number = 6) {
        let requestData: { [key: string]: any } = {
            "o": operation
        }
        if (type != null && type && type.length > 0) {
            requestData["t"] = type;
        }
        if (data != null) {
            requestData["d"] = data;
        }
        if (this.socket.readyState != WebSocket.OPEN) {
            return;
        }
        this.socket.send(JSON.stringify(requestData));
    }

    static getPlayer(key: string): Player | null {
        return Player.players[key];
    }

    public getObject(): { [key: string]: any } {
        return {
            key: this.playerKey,
            gameID: this.gameID,
            name: this.name,
            points: this.points,
            isCardCzar: this.isCardCzar,
            wordCards: this.wordCards
        }
    }

    public sendChangePlayer() {
        this.send("CHANGE_PLAYER", this.getObject());
    }

    public setPlayername(name: string) {
        this.name = name;
        this.send("CHANGE_PLAYER", this.getObject());
    }

    public getGame(): Game | null {
        if (!this.gameID) {
            return null;
        }
        return Game.games[this.gameID];
    }

    public getKey(): string {
        return this.playerKey;
    }

    public getSocket(): WebSocket {
        return this.socket;
    }

    public isHost(): boolean {
        return this.playerKey == this.getGame()?.hostKey;
    }
}
