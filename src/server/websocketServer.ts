import { IncomingMessage } from "http";
import * as https from "https";
import { Server as SocketIOServer, Socket as SocketIOSocket } from "socket.io";
import { createAdapter } from "socket.io-redis";
import Player from "../game/player";
// import Player from "../game/player";
import Program from "../program";
import MessageHandler from "../request/messageHandler";
import DateUtil from "../util/dateUtil";

export default class WebsocketServer {
    static server: SocketIOServer;

    constructor(server: https.Server) {
        let redisClient1 = Program.getRedis();
        let redisClient2 = redisClient1.duplicate();

        WebsocketServer.server = new SocketIOServer(server, {
            adapter: createAdapter({
                pubClient: redisClient1,
                subClient: redisClient2
            })
        });
        WebsocketServer.server.on("connection", this.onConnection.bind(this));

        console.log("Websocket-Server started...")
    }

    protected async onConnection(socket: SocketIOSocket) {        
        let key: string = socket.id;

        let player: Player = new Player(key);
        player.socket = socket;

        console.log("socket with id " + key + " connected");

        socket.on("message", function(data: any) {
            try {
                let messageHandler = new MessageHandler(player, data);
                messageHandler.handle();
            } catch (e: unknown) {
                if (typeof e === "string") {
                    console.log(e);
                } else if (e instanceof Error) {
                    console.log(e.message);
                }
            }
        });

        socket.on("disconnecting", function(reason: string) {
            console.log("client closed: " + reason);
            player.remove();
        //     if (Player.players[key] != null) {
        //         Player.players[key].getGame()?.removePlayer(key);
        //         delete Player.players[key];
        //     }
        });
    }
}
