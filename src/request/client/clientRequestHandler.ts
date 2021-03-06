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
            case "JOIN_GAME": {
                returnData = this.joinGameHandler()
                break;
            }
            case "KICK_PLAYER": {
                this.kickPlayer();
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
            if (this.data["nickname"] != null) {
                nickname = this.data["nickname"];
            }
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

    protected kickPlayer() {
        let game: Game | null = this.player.getGame();
        if (game == null) {
            return;
        }
        if (this.player.getKey() != game.hostKey) {
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
}
