export default class Game {
    public static games: { [gameID: string]: Game } = {};

    static getGame(gameID: string): Game | null {
        if (Game.games[gameID] != null) {
            return Game.games[gameID];
        }
        return null;
    }
}
