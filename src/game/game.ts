import Player from "./player";

export default class Game {
    public static games: { [gameID: string]: Game } = {};

    public gameID: string;
    public hostKey: string;
    public clients: { [key: string]: Player } = {};
    public password: string = "";
    public maxPlayers: number = 10;
    public secondsPerRound: number = 90;
    public cardDecks: string[] = ["1"];
    public houseRules: number = 1;

    constructor(gameID: string, hostKey: string) {
        this.gameID = gameID;
        this.hostKey = hostKey;
    }

    protected sendAll(type: string | null, data: { [key: string]: any } | null) {
        for(let key in this.clients) {
            this.clients[key].send(type, data);
        }
    }

    public getObject(): { [key: string]: any } {
        let players: { [key: string]: string } = {};
        for (let key in this.clients) {
            let client: Player = this.clients[key];
            players[client.getKey()] = client.name;
        }

        return {
            gameID: this.gameID,
            hostKey: this.hostKey,
            password: this.password,
            maxPlayers: this.maxPlayers,
            secondsPerRound: this.secondsPerRound,
            cardDecks: this.cardDecks,
            houseRules: this.houseRules,
            players: players
        };
    }

    public addPlayer(player: Player) {
        this.clients[player.getKey()] = player;

        this.sendAll("CHANGE_GAME", this.getObject());
    }

    static getGame(gameID: string): Game | null {
        return Game.games[gameID];
    }
}
