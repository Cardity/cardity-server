import * as http from "http";
import * as config from "./../../config.json";

export class HTTPServer {
    protected server: http.Server;

    constructor() {
        this.server = http.createServer(this.handleRequest.bind(this));
    }

    start() {
        this.server.listen(config.httpPort, config.hostname, this.serverIsRunning.bind(this));
    }

    protected handleRequest(req: http.IncomingMessage, res: http.ServerResponse) {
        res.writeHead(301, {
            "Location": "https://" + config.hostname + ((config.sslPort != 443) ? ":" + config.sslPort : "") + "/"
        });
        res.end();
    }

    protected serverIsRunning() {
        console.log("HTTP-Server started...")
    }
}
