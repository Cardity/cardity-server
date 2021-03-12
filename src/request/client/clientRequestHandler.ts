import { Socket as SocketIOSocket } from "socket.io";
import Game from "../../game/game";
import Player from "../../game/player";
import WebsocketServer from "../../server/websocketServer";
import CryptoUtil from "../../util/cryptoUtil";

export default class ClientRequestHandler {
    protected player: Player;
    protected type: string | null;
    protected data: { [key: string]: any } | null; 

    constructor(player: Player, type: string | null, data: { [key: string]: any } | null) {
        this.player = player;
        this.type = type;
        this.data = data;
    }

    public handle() {
        switch (this.type) {
            case "CREATE_GAME": {
                this.createGameHandler()
                break;
            }
            case "GAME_UPDATE": {
                this.gameUpdateHandler()
                break;
            }
            case "JOIN_GAME": {
                this.joinGameHandler()
                break;
            }
            case "KICK_PLAYER": {
                this.kickPlayerHandler();
                break;
            }
            case "SEND_CHAT": {
                this.sendChatHandler();
                break;
            }
            case "GAME_START": {
                this.startGameHandler();
                break;
            }
            case "SELECT_CARDS": {
                this.selectCardsHandler();
                break;
            }
            case "SELECT_CARD_GROUP": {
                this.selectCardGroup();
                break;
            }
        }
    }

    protected async createGameHandler() {
        let gameID: string = CryptoUtil.createRandomString();
        // TODO: check if game not exists
        let game: Game = new Game(gameID, this.player.playerKey);
        let nickname: string = CryptoUtil.createRandomString(8);
        if (this.data != null) {
            for(let key in this.data) {
                switch (key) {
                    case "nickname": {
                        nickname = this.data[key];
                        break;
                    }
                    case "password": {
                        game.password = this.data[key];
                        break;
                    }
                    case "maxPlayers": {
                        game.maxPlayers = this.data[key];
                        break;
                    }
                    case "secondsPerRound": {
                        game.secondsPerRound = this.data[key];
                        break;
                    }
                    case "cardDecks": {
                        game.cardDecks = this.data[key];
                        break;
                    }
                    case "houseRules": {
                        game.houseRules = this.data[key];
                        break;
                    }
                }
            }
        }
        this.player.name = nickname;
        this.player.isHost = true;
        this.player.gameID = gameID;
        await this.player.saveData();

        game.addPlayer(this.player, false);
        await game.saveData();

        this.player.sendChangePlayer();
        game.getObject().then((data: { [key: string]: any }) => {
            this.player.send("CREATE_GAME", data);
        });
    }

    protected async joinGameHandler() {
        let nickname: string = CryptoUtil.createRandomString(8);
        let gameID: string = "";
        let password: string = "";

        if (this.data != null) {
            for(let key in this.data) {
                switch (key) {
                    case "nickname": {
                        nickname = this.data[key];
                        break;
                    }
                    case "gameID": {
                        gameID = this.data[key];
                        break;
                    }
                    case "password": {
                        password = this.data[key];
                        break;
                    }
                }
            }
        }

        if (!(await Game.gameExists(gameID))) {
            this.player.send("JOIN_GAME", {
                errorField: "gameID",
                errorMessage: "Es existiert kein Spiel mit diesem Code."
            });
            return;
        }
        // TODO: checke ob Raum bereits voll ist
        let game = await Game.getGame(gameID);
        if (game.password && game.password !== password) {
            this.player.send("JOIN_GAME", {
                errorField: "password",
                errorMessage: "Das eingegebene Passwort ist falsch."
            });
            return;
        }
        this.player.name = nickname;
        this.player.gameID = gameID;
        await this.player.saveData();

        game.addPlayer(this.player);
        this.player.sendChangePlayer();
        this.player.send("JOIN_GAME", await game.getObject());
    }

    protected async kickPlayerHandler() {
        let game: Game | null = await this.player.getGame();
        if (game == null) {
            return;
        }
        if (!this.player.isHost) {
            return;
        }

        let removeKey: string = "";
        if (this.data != null && this.data["key"] != null) {
            removeKey = this.data["key"];
        }
        if (!removeKey) {
            return;
        }

        if (!game.players.includes(removeKey)) {
            return;
        }

        WebsocketServer.server.to(removeKey).sockets.sockets.forEach((socket: SocketIOSocket, key: string) => {
            if (key == removeKey) {
                console.log("should disconnect")
                socket.disconnect();
            }
        });
    }

    protected sendChatHandler() {
        let message: string = "";
        if (this.data != null && this.data["message"] != null) {
            message = this.data["message"];
        }
        if (!message) {
            return;
        }

        this.player.sendToRoom("CHAT_MESSAGE", {
            isHost: this.player.isHost,
            name: this.player.name,
            message: message
        });
    }

    protected async gameUpdateHandler() {
        let game: Game | null = await this.player.getGame();
        if (game == null) {
            return;
        }
        if (!this.player.isHost) {
            return;
        }

        if (this.data != null) {
            for(let key in this.data) {
                switch (key) {
                    case "maxPlayers": {
                        game.maxPlayers = this.data[key];
                        break;
                    }
                    case "secondsPerRound": {
                        game.secondsPerRound = this.data[key];
                        break;
                    }
                    case "cardDecks": {
                        game.cardDecks = this.data[key];
                        break;
                    }
                    case "houseRules": {
                        game.houseRules = this.data[key];
                        break;
                    }
                }
            }
        }
        await game.saveData();
        game.sendChangeGame();
    }

    protected async startGameHandler() {
        let game = await this.player.getGame();
        if (game == null) {
            return;
        }

        game.sendAll("START_GAME", null);
        
        game.isRunning = true;
        await game.generateDecks();
        game.startPhase1();
    }

    protected async selectCardsHandler() {
        if (this.data == null || this.data["selectedCards"] == null) {
            return;
        }
        await this.player.updateLocalData();
        
        let game = await this.player.getGame();
        if (game == null) {
            return;
        }
        if (game.phase != 2) {
            return;
        }

        this.player.selectedCards = this.data["selectedCards"];
        await this.player.saveData();

        let allSelected = true;
        for (let key in game.players) {
            if (key == this.player.playerKey) {
                continue;
            }

            let player: Player = await Player.getPlayer(game.players[key]);
            if (player.isCardCzar) {
                continue;
            }

            if (player.selectedCards.length == 0) {
                allSelected = false;
            }
        }

        if (allSelected) {
            game.startPhase3();
        }
    }

    protected async selectCardGroup() {
        if (this.data == null || this.data["selectedCardGroup"] == null) {
            return;
        }

        let game = await this.player.getGame();
        if (game == null) {
            return;
        }
        if (game.phase != 3) {
            return;
        }

        let winnerKey = this.data["selectedCardGroup"];
        if (!game.players.includes(winnerKey)) {
            game.sendAll("PLAYER_WON", {
                name: "Niemand",
                key: ""
            })

            game.startPhase4();
            return;
        }

        let winner: Player = await Player.getPlayer(winnerKey);
        winner.points++;
        await winner.saveData();

        game.sendAll("PLAYER_WON", {
            name: winner.name,
            key: winner.playerKey
        })
        // TODO: anzeigen wer gewonnen hat
        game.startPhase4();
    }
}
