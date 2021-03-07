import Deck from "./deck";
import Player from "./player";

interface IPlayer {
    key: string;
    name: string;
    isCardCzar: boolean;
    points: number;
    isHost: boolean;
}

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
    public isRunning: boolean = false;

    public questionCards: string[] = [];
    public questionCardsBurned: string[] = [];
    public wordCards: string[] = [];
    public wordCardsBurned: string[] = [];
    public activeQuestionCard: string = "";

    constructor(gameID: string, hostKey: string) {
        this.gameID = gameID;
        this.hostKey = hostKey;
    }

    public sendAll(type: string | null, data: { [key: string]: any } | null) {
        for(let key in this.clients) {
            this.clients[key].send(type, data);
        }
    }

    public sendChangeGame() {
        this.sendAll("CHANGE_GAME", this.getObject());
    }

    public getObject(): { [key: string]: any } {
        let players: { [key: string]: IPlayer } = {};
        for (let key in this.clients) {
            let client: Player = this.clients[key];
            players[client.getKey()] = {
                key: client.getKey(),
                name: client.name,
                isCardCzar: client.isCardCzar,
                points: client.points,
                isHost: client.isHost()
            };
        }

        return {
            gameID: this.gameID,
            hostKey: this.hostKey,
            password: this.password,
            maxPlayers: this.maxPlayers,
            secondsPerRound: this.secondsPerRound,
            cardDecks: this.cardDecks,
            houseRules: this.houseRules,
            players: players,
            isRunning: this.isRunning,
            activeQuestionCard: this.activeQuestionCard,
            questionCards: this.questionCards.length,
            wordCards: this.wordCards.length
        };
    }

    public addPlayer(player: Player) {
        this.clients[player.getKey()] = player;
        player.gameID = this.gameID;

        this.sendChangeGame();
    }

    public removePlayer(key: string) {
        if (this.clients[key] == null) {
            return;
        }

        delete this.clients[key];
        this.sendChangeGame();
        // TODO: wenn Host verschwindet, neuen Host bestimmen
        // TODO: wenn Raum leer ist, Raum löschen
    }

    public generateDecks() {
        let questionCards: string[] = [];
        let wordCards: string[] = [];

        console.log(this.cardDecks);
        for (let key in this.cardDecks) {
            let deckNumber: number = parseInt(this.cardDecks[key]);
            if (Deck.decks[deckNumber] == null) {
                continue;
            }

            let deck = Deck.decks[deckNumber];
            questionCards = questionCards.concat(deck.questionCards);
            wordCards = wordCards.concat(deck.wordCards);
        }

        this.questionCards = this.shuffle(questionCards);
        this.wordCards = this.shuffle(wordCards);
    }

    static getGame(gameID: string): Game | null {
        return Game.games[gameID];
    }

    protected shuffle(arr: string[]): string[] {
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    }
}
