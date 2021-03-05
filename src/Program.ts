import HTTPServer from "./server/httpServer";
import HTTPSServer from "./server/httpsServer";
import WebsocketServer from "./server/websocketServer";

export default class Program {
    run() {
        this.startHttpServer();
        this.startHttpsServer();
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
