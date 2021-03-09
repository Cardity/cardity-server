// import Player from "../game/player";
import Player from "../game/player";
import WebsocketServer from "../server/websocketServer";
import DateUtil from "../util/dateUtil";
import ClientRequestHandler from "./client/clientRequestHandler";

export default class MessageHandler {
    protected player: Player;
    protected data: any;

    constructor(player: Player, data: any) {
        this.player = player;
        this.data = data;
    }

    public handle() {
        console.log(this.data);
        let clientRequestHandler = new ClientRequestHandler(this.player, this.data.t, this.data.d);
        let handledData = clientRequestHandler.handle();

        // this.player.send(type, handledData);
        // WebsocketServer.server.to(this.clientKey).emit("message", "test");
    }
}
