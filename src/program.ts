import * as config from "../config.json";
import Deck from "./game/deck";
import HTTPServer from "./server/httpServer";
import HTTPSServer from "./server/httpsServer";
import WebsocketServer from "./server/websocketServer";
import Redis from "./util/redis";

export default class Program {
    static redisClient: Redis;

    run() {
        this.initializeDecks();
        this.startHttpServer();
        this.startHttpsServer();
    }

    protected initializeDecks() {
        Deck.initialize();
    }

    public static getRedis(): Redis {
        if (Program.redisClient == null) {
            Program.redisClient = new Redis({
                host: config.redisHost,
                port: config.redisPort
            });
        }
        return Program.redisClient;
    }

    protected startHttpServer() {
        let httpServer = new HTTPServer();
        httpServer.start();
    }

    protected startHttpsServer() {
        let httpsServer = new HTTPSServer();
        httpsServer.start();

        let secureServer = httpsServer.getServer();
        new WebsocketServer(secureServer);
    }
}
