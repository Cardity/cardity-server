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
    public selectedCards: { [key: string]: string } = {};
    public phase: number = 0;

    protected roundTimeOut: NodeJS.Timeout | null = null;

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

    public sendChangePlayer() {
        for(let key in this.clients) {
            this.clients[key].sendChangePlayer();
        }
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
            wordCards: this.wordCards.length,
            phase: this.phase,
            selectedCards: this.selectedCards
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

    public selectCardZcar() {
        let firstKey: string = "";
        let nextIsZcar: boolean = false;
        let zcarIsSet: boolean = false;
        let i = 0;
        for (let key in this.clients) {
            if (i == 0) {
                firstKey = key;
            }
            if (this.clients[key].isCardCzar) {
                this.clients[key].isCardCzar = false;
                nextIsZcar = true;
            } else if (nextIsZcar) {
                this.clients[key].isCardCzar = true;
                nextIsZcar = false;
                zcarIsSet = true;
                break;
            }

            i++;
        }
        if (!zcarIsSet && this.clients[firstKey] != null) {
            this.clients[firstKey].isCardCzar = true;
        }
    }

    public drawCards() {
        // TODO: wenn Karten leer, werden Karten aus Wegwerfstabel genommen, neu gemischt und auf Kartenstapel gelegt
        for (let key in this.clients) {
            let maxDraw = 10 - this.clients[key].wordCards.length;
            if (maxDraw) {
                let cards: string[] = this.wordCards.splice(0, maxDraw);
                this.clients[key].wordCards = this.clients[key].wordCards.concat(cards);
            }
            this.clients[key].sendChangePlayer();
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

    protected phase2TimeoutEnd() {
        // TODO: implement
        this.startPhase3();
    }

    public startPhase1() {
        this.phase = 1;
        this.selectCardZcar();
        this.drawCards();
        this.sendChangeGame();

        this.startPhase2();
    }

    public startPhase2() {
        this.phase = 2;
        this.roundTimeOut = setTimeout(this.phase2TimeoutEnd.bind(this), this.secondsPerRound * 1000);

        this.sendChangeGame();
    }

    public startPhase3() {
        if (this.roundTimeOut != null) {
            clearTimeout(this.roundTimeOut);
        }

        this.phase = 3;
        let selectedCards: { [key: string]: string } = {};
        for (let key in this.clients) {
            let client = this.clients[key];

            if (!client.selectedCards.length) {
                continue;
            }

            let cardString: string = this.activeQuestionCard;
            for (let i in client.selectedCards) {
                let playerSelectedCards = client.selectedCards[i];
                if (client.wordCards[playerSelectedCards] == null) {
                    return;
                }
                cardString = cardString.replace("___", "<span style='color: green'>" + client.wordCards[playerSelectedCards] + "</span>");
            }

            selectedCards[key] = cardString;
        }

        this.selectedCards = selectedCards;
        if (!Object.keys(this.selectedCards).length) {
            this.sendAll("PLAYER_WON", {
                name: "Niemand",
                key: ""
            })

            this.startPhase4();
            return;
        }

        this.sendChangeGame();
    }

    public startPhase4() {
        this.phase = 4;

        this.sendChangeGame();

        // TODO: aufräumen und phase 1 starten

        // cleanup question cards
        this.questionCardsBurned.push(this.activeQuestionCard);
        this.activeQuestionCard = "";

        // cleanup used cards
        for (let key in this.clients) {
            let client: Player = this.clients[key];
            if (!client.selectedCards.length) {
                continue;
            }

            for (let i in client.selectedCards) {
                let selectCardIndex: number = client.selectedCards[i];
                let selectedCardArr: string[] = client.wordCards.splice(selectCardIndex, 1);
                if (selectedCardArr.length) 
                {
                    this.wordCardsBurned.concat(selectedCardArr);
                }
            }

            client.selectedCards = [];
        }

        setTimeout(this.startPhase1.bind(this), 10000);
    }
}
