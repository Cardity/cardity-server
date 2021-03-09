import { Socket as SocketIOSocket } from "socket.io";
import Game from './game';
import Program from "../program";
import WebsocketServer from "../server/websocketServer";

export default class Player {
    public playerKey: string;
    public socket: SocketIOSocket | null = null;

    public gameID: string = "";
    public name: string = "";
    public isCardCzar: boolean = false;
    public points: number = 0;
    public wordCards: string[] = [];
    public selectedCards: number[] = [];
    public isHost: boolean = false;

    constructor(playerKey: string, save: boolean = true) {
        this.playerKey = playerKey;

        if (save) {
            this.saveData();
        }
    }

    public async saveData(): Promise<void> {
        let data = {
            key: this.playerKey,
            gameID: this.gameID,
            name: this.name,
            isCardCzar: this.isCardCzar,
            points: this.points,
            wordCards: this.wordCards,
            selectedCards: this.selectedCards,
            isHost: this.isHost
        }
        await Program.getRedis().setAsync("player" + this.playerKey, JSON.stringify(data));
    }

    static async getPlayer(key: string): Promise<Player> {
        let player = new Player(key, false);
        await player.updateLocalData();
        return player;
    }

    public async updateLocalData(): Promise<void> {
        let playerJson = await Program.getRedis().getAsync("player" + this.playerKey);
        if (playerJson == null) {
            await this.saveData();
            return;
        }
        let playerData = JSON.parse(playerJson);
        for (let key in playerData) {
            switch (key) {
                case "key": {
                    this.playerKey = playerData[key];
                    break;
                }
                case "gameID": {
                    this.gameID = playerData[key];
                    break;
                }
                case "gameID": {
                    this.gameID = playerData[key];
                    break;
                }
                case "name": {
                    this.name = playerData[key];
                    break;
                }
                case "isCardCzar": {
                    this.isCardCzar = playerData[key];
                    break;
                }
                case "points": {
                    this.points = playerData[key];
                    break;
                }
                case "wordCards": {
                    this.wordCards = playerData[key];
                    break;
                }
                case "selectedCards": {
                    this.selectedCards = playerData[key];
                    break;
                }
                case "isHost": {
                    this.isHost = playerData[key];
                    break;
                }
            }
        }
    }

    public async remove() {
        let game = await this.getGame();
        await game?.removePlayer(this.playerKey);
        this.socket?.leave("game" + this.gameID);
        Program.getRedis().del("player" + this.playerKey);
    }

    public send(type: string | null, data: { [key: string]: any } | null, operation: string = "message") {
        let responseData: { [key: string]: any } = {}
        if (type != null && type && type.length > 0) {
            responseData["t"] = type;
        }
        if (data != null) {
            responseData["d"] = data;
        }
        if (this.socket != null) {
            this.socket.emit(operation, responseData);
        } else {
            WebsocketServer.server.to(this.playerKey).emit(operation, responseData);
        }
    }

    public sendToRoom(type: string | null, data: { [key: string]: any } | null, operation: string = "message") {
        let responseData: { [key: string]: any } = {}
        if (type != null && type && type.length > 0) {
            responseData["t"] = type;
        }
        if (data != null) {
            responseData["d"] = data;
        }
        WebsocketServer.server.to("game" + this.gameID).emit(operation, responseData);
    }

//     public send(type: string | null, data: { [key: string]: any } | null, operation: number = 6) {
//         let requestData: { [key: string]: any } = {
//             "o": operation
//         }
//         if (type != null && type && type.length > 0) {
//             requestData["t"] = type;
//         }
//         if (data != null) {
//             requestData["d"] = data;
//         }
//         if (this.socket.readyState != WebSocket.OPEN) {
//             return;
//         }
//         this.socket.send(JSON.stringify(requestData));
//     }

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

    public async getGame(): Promise<Game | null> {
        if (!this.gameID) {
            return null;
        }
        return await Game.getGame(this.gameID);
    }

//     public getSocket(): WebSocket {
//         return this.socket;
//     }
}
