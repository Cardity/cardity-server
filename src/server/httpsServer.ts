import * as config from "./../../config.json";
import * as fs from "fs";
import * as http from "http";
import * as https from "https";
import { RequestHandler } from "../request/requestHandler";

export class HTTPSServer {
    protected server: https.Server;

    constructor() {
        this.server = https.createServer({
            key: fs.readFileSync(config.sslKey),
            cert: fs.readFileSync(config.sslCert)
        }, this.handleRequest.bind(this));
    }

    start() {
        this.server.listen(config.sslPort, config.hostname, this.serverIsRunning.bind(this));
    }

    getServer(): https.Server {
        return this.server;
    }

    protected handleRequest(req: http.IncomingMessage, res: http.ServerResponse) {
        let requestHandler = new RequestHandler(req, res);
        requestHandler.handle();
    }

    protected serverIsRunning() {
        console.log("HTTPS-Server started...")
    }
}
