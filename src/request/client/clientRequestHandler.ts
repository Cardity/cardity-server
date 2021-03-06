import Game from "../../game/game";
import Player from "../../game/player";
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

    public handle(): { [key: string]: any } | null {
        let returnData: { [key: string]: any } | null = null; 
        switch (this.type) {
            case "CREATE_GAME": {
                returnData = this.createGameHandler()
                break;
            }
            case "GAME_UPDATE": {
                returnData = this.gameUpdateHandler()
                break;
            }
            case "JOIN_GAME": {
                returnData = this.joinGameHandler()
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
        }
        return returnData;
    }

    protected createGameHandler(): { [key: string]: any } {
        let gameID: string = CryptoUtil.createRandomString();
        let game: Game = new Game(gameID, this.player.getKey());
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
        this.player.setPlayername(nickname);
        game.addPlayer(this.player);

        Game.games[gameID] = game;
        return game.getObject();
    }

    protected joinGameHandler(): { [key: string]: any } {
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

        if (Game.games[gameID] == null) {
            return {
                errorField: "gameID",
                errorMessage: "Es existiert kein Spiel mit diesem Code."
            }
        }
        // TODO: checke ob Raum bereits voll ist
        if (Game.games[gameID].password && Game.games[gameID].password !== password) {
            return {
                errorField: "password",
                errorMessage: "Das eingegebene Passwort ist falsch."
            }
        }
        this.player.setPlayername(nickname);

        Game.games[gameID].addPlayer(this.player);
        return Game.games[gameID].getObject();
    }

    protected kickPlayerHandler() {
        let game: Game | null = this.player.getGame();
        if (game == null) {
            return;
        }
        if (!this.player.isHost()) {
            return;
        }

        let removeKey: string = "";
        if (this.data != null && this.data["key"] != null) {
            removeKey = this.data["key"];
        }
        if (!removeKey) {
            return;
        }

        if (game.clients[removeKey] == null) {
            return;
        }
        game.clients[removeKey].getSocket().close();
    }

    protected sendChatHandler() {
        let message: string = "";
        if (this.data != null && this.data["message"] != null) {
            message = this.data["message"];
        }
        if (!message) {
            return;
        }

        this.player.getGame()?.sendAll("CHAT_MESSAGE", {
            isHost: this.player.isHost(),
            name: this.player.name,
            message: message
        });
    }

    protected gameUpdateHandler(): { [key: string]: any } {
        let game: Game | null = this.player.getGame();
        if (game == null) {
            return {};
        }
        if (!this.player.isHost()) {
            return {};
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

        game.sendChangeGame();

        return game.getObject();
    }
}
