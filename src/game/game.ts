import Deck from "./deck";
import Program from "../program";
import WebsocketServer from "../server/websocketServer";
import Player from "./player";

interface IPlayer {
    key: string;
    name: string;
    isCardCzar: boolean;
    points: number;
    isHost: boolean;
}

interface IEndWinner {
    place: number,
    name: string,
    points: number,
    isHost: boolean
}

export default class Game {
    public gameID: string;
    public hostKey: string;
    public players: string[] = [];
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
    public selectedCards: { [key: string]: string } = {};
    public phase: number = 0;

    public endWinner: IEndWinner[] = [];

    protected roundTimeOut: NodeJS.Timeout | null = null;

    constructor(gameID: string, hostKey: string = "") {
        this.gameID = gameID;
        this.hostKey = hostKey;
    }

    public async saveData(): Promise<void> {
        let data = {
            gameID: this.gameID,
            hostKey: this.hostKey,
            players: this.players,
            password: this.password,
            maxPlayers: this.maxPlayers,
            secondsPerRound: this.secondsPerRound,
            cardDecks: this.cardDecks,
            houseRules: this.houseRules,
            isRunning: this.isRunning,
            questionCards: this.questionCards,
            questionCardsBurned: this.questionCardsBurned,
            wordCards: this.wordCards,
            wordCardsBurned: this.wordCardsBurned,
            activeQuestionCard: this.activeQuestionCard,
            selectedCards: this.selectedCards,
            phase: this.phase
        }
        await Program.getRedis().setAsync("game" + this.gameID, JSON.stringify(data));
    }

    public static async getGame(gameID: string): Promise<Game> {
        let game = new Game(gameID);
        await game.updateLocalData();
        return game;
    }

    public static async gameExists(gameID: string): Promise<boolean> {
        let gameJson = await Program.getRedis().getAsync("game" + gameID);
        return (gameJson != null);
    }

    public async updateLocalData(): Promise<void> {
        let gameJson = await Program.getRedis().getAsync("game" + this.gameID);
        if (gameJson == null) {
            await this.saveData();
            return;
        }
        let gameData = JSON.parse(gameJson);
        for (let key in gameData) {
            switch (key) {
                case "hostKey": {
                    this.hostKey = gameData[key];
                    break;
                }
                case "players": {
                    this.players = gameData[key];
                    break;
                }
                case "password": {
                    this.password = gameData[key];
                    break;
                }
                case "maxPlayers": {
                    this.maxPlayers = gameData[key];
                    break;
                }
                case "secondsPerRound": {
                    this.secondsPerRound = gameData[key];
                    break;
                }
                case "cardDecks": {
                    this.cardDecks = gameData[key];
                    break;
                }
                case "houseRules": {
                    this.houseRules = gameData[key];
                    break;
                }
                case "isRunning": {
                    this.isRunning = gameData[key];
                    break;
                }
                case "questionCards": {
                    this.questionCards = gameData[key];
                    break;
                }
                case "questionCardsBurned": {
                    this.questionCardsBurned = gameData[key];
                    break;
                }
                case "wordCards": {
                    this.wordCards = gameData[key];
                    break;
                }
                case "wordCardsBurned": {
                    this.wordCardsBurned = gameData[key];
                    break;
                }
                case "activeQuestionCard": {
                    this.activeQuestionCard = gameData[key];
                    break;
                }
                case "selectedCards": {
                    this.selectedCards = gameData[key];
                    break;
                }
                case "phase": {
                    this.phase = gameData[key];
                    break;
                }
            }
        }
    }

    public sendAll(type: string | null, data: { [key: string]: any } | null) {
        let responseData: { [key: string]: any } = {}
        if (type != null && type && type.length > 0) {
            responseData["t"] = type;
        }
        if (data != null) {
            responseData["d"] = data;
        }
        WebsocketServer.server.to("game" + this.gameID).emit("message", responseData);
    }

    public async sendChangeGame() {
        let data = await this.getObject();
        this.sendAll("CHANGE_GAME", data);
    }

    public async getObject(): Promise<{ [key: string]: any }> {
        let players: { [key: string]: IPlayer } = {};
        for (let key in this.players) {
            let playerKey: string = this.players[key];
            let player = await Player.getPlayer(playerKey);
            players[player.playerKey] = {
                key: player.playerKey,
                name: player.name,
                isCardCzar: player.isCardCzar,
                points: player.points,
                isHost: player.isHost
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
            wordCards: this.wordCards.length,
            phase: this.phase,
            selectedCards: this.selectedCards,
            endWinner: this.endWinner
        };
    }

    public async addPlayer(player: Player, send: boolean = true) {
        this.players.push(player.playerKey);
        player.gameID = this.gameID;

        player.socket?.join("game" + this.gameID);

        // TODO: was wenn Spiel schon läuft?

        if (send) {
            await this.saveData();
            await this.sendChangeGame();
        }
    }

    public async removePlayer(key: string) {
        if (!this.players.includes(key)) {
            return;
        }

        let isHost = false;
        if (key == this.hostKey) {
            isHost = true;
        }

        let i = this.players.indexOf(key);
        if (i > -1) {
            this.players.splice(i, 1);
        }

        if (isHost) {
            let hostKey: string | undefined = this.players.find((value: string) => true);
            if (hostKey != null) {
                let player: Player = await Player.getPlayer(hostKey);
                player.isHost = true;
                await player.saveData();
                player.sendChangePlayer();

                this.hostKey = hostKey;
            }
        }

        await this.saveData();

        await this.sendChangeGame();
        // TODO: wenn Raum leer ist, Raum löschen
        // TODO: was wenn Kartenzar Raum verlässt, während er Karten auswählt?
        // TODO: Karten wieder in Deck einfügen wenn Spieler raus ist
        // TODO: bei jeder Spielphase testen was passiert wenn Host, Zar oder normaler Spieler disconnected
    }

    public generateDecks() {
        let questionCards: string[] = [];
        let wordCards: string[] = [];

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

        this.saveData();
    }

    public async selectCardZcar() {
        let firstPlayer: Player | null = null;
        let nextIsZcar: boolean = false;
        let zcarIsSet: boolean = false;
        let i = 0;
        for (let key in this.players) {
            let player = await Player.getPlayer(this.players[key]);
            if (i == 0) {
                firstPlayer = player;
            }
            if (player.isCardCzar) {
                player.isCardCzar = false;
                nextIsZcar = true;
                await player.saveData();
                player.sendChangePlayer();
            } else if (nextIsZcar) {
                player.isCardCzar = true;
                nextIsZcar = false;
                zcarIsSet = true;
                await player.saveData();
                player.sendChangePlayer();
                break;
            }

            i++;
        }
        if (!zcarIsSet && firstPlayer != null) {
            firstPlayer.isCardCzar = true;
            await firstPlayer.saveData();
            firstPlayer.sendChangePlayer();
        }
    }

    public async drawCards() {
        // TODO: wenn Karten leer, werden Karten aus Wegwerfstabel genommen, neu gemischt und auf Kartenstapel gelegt
        for (let key in this.players) {
            let player: Player = await Player.getPlayer(this.players[key]);
            let maxDraw = 10 - player.wordCards.length;
            if (maxDraw) {
                let cards: string[] = this.wordCards.splice(0, maxDraw);
                player.wordCards = player.wordCards.concat(cards);
            }
            await player.saveData();
            player.sendChangePlayer();
        }

        if (this.activeQuestionCard.length > 0) {
            this.questionCardsBurned.push(this.activeQuestionCard);
        }
        while (true) {
            let questionCard = this.questionCards.splice(0, 1).find((value: string) => true);
            if (questionCard != null) {
                let length: number = (questionCard.match(/\_\_\_/g) || []).length;
                this.activeQuestionCard = questionCard;
                if (length >= 1 || length <= 2) {
                    break;
                }
            } else {
                break;
            }
        }
    }

    protected shuffle(arr: string[]): string[] {
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    }

    protected async phase2TimeoutEnd() {
        await this.updateLocalData();
        if (this.phase != 2) {
            return;
        }

        // TODO: implement
        this.startPhase3();
    }

    public async startPhase1() {
        this.phase = 1;
        await this.selectCardZcar();
        await this.drawCards();

        await this.saveData();
        await this.sendChangeGame();

        this.startPhase2();
    }

    public async startPhase2() {
        this.phase = 2;
        this.roundTimeOut = setTimeout(this.phase2TimeoutEnd.bind(this), this.secondsPerRound * 1000);

        await this.saveData();
        await this.sendChangeGame();
    }

    public async startPhase3() {
        this.phase = 3;
        let selectedCards: { [key: string]: string } = {};
        for (let key in this.players) {
            let player: Player = await Player.getPlayer(this.players[key]);

            if (!player.selectedCards.length) {
                continue;
            }

            let cardString: string = this.activeQuestionCard;
            for (let i in player.selectedCards) {
                let playerSelectedCards = player.selectedCards[i];
                if (player.wordCards[playerSelectedCards] == null) {
                    continue;
                }
                cardString = cardString.replace("___", "<span style='color: green'>" + player.wordCards[playerSelectedCards] + "</span>");
            }

            selectedCards[this.players[key]] = cardString;
        }

        let keys: string[] = Object.keys(selectedCards);
        keys = this.shuffle(keys);

        let selectedCardsNew: { [key: string]: string } = {};
        for (let i in keys) {
            selectedCardsNew[keys[i]] = selectedCards[keys[i]];
        }

        this.selectedCards = selectedCardsNew;
        if (!Object.keys(this.selectedCards).length) {
            this.sendAll("PLAYER_WON", {
                name: "Niemand",
                key: ""
            })

            this.startPhase4();
            return;
        }

        await this.saveData();
        await this.sendChangeGame();
    }

    public async startPhase4() {
        this.phase = 4;

        await this.sendChangeGame();

        // cleanup question cards
        this.questionCardsBurned.push(this.activeQuestionCard);
        this.activeQuestionCard = "";

        // cleanup used cards
        for (let key in this.players) {
            let player: Player = await Player.getPlayer(this.players[key]);
            if (!player.selectedCards.length) {
                continue;
            }

            for (let i in player.selectedCards) {
                let selectCardIndex: number = player.selectedCards[i];
                let selectedCardArr: string[] = player.wordCards.splice(selectCardIndex, 1);
                if (selectedCardArr.length) 
                {
                    this.wordCardsBurned.concat(selectedCardArr);
                }
            }

            player.selectedCards = [];
            await player.saveData();
            player.sendChangePlayer();
        }

        await this.saveData();

        if (this.questionCards.length == 0) {
            setTimeout(this.startEndPhase.bind(this), 10000);
        } else {
            setTimeout(this.startPhase1.bind(this), 10000);
        }
    }

    public async startEndPhase() {
        this.phase = 5;

        let endWinner: IEndWinner[] = [];
        for (let key in this.players) {
            let playerKey: string = this.players[key];
            let player = await Player.getPlayer(playerKey);
            endWinner.push({
                place: 0,
                name: player.name,
                points: player.points,
                isHost: player.isHost
            });
        }
        endWinner = endWinner.sort((a: IEndWinner, b: IEndWinner) => a.points > b.points ? -1 : a.points < b.points ? 1 : 0);
        let i = 1;
        for (let key in endWinner) {
            endWinner[key].place = i;
            i++;
        }

        this.endWinner = endWinner;
        this.isRunning = false;

        await this.saveData();

        await this.sendChangeGame();
    }
}
