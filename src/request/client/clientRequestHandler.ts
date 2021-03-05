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
}
