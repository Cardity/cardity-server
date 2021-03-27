import * as http from "http";
import RequestHandler from "../request/requestHandler";
import * as config from "./../../config.json";

export default class HTTPServer {
    protected server: http.Server;

    constructor() {
        this.server = http.createServer(this.handleRequest.bind(this));
    }

    start() {
        this.server.listen(config.httpPort, this.serverIsRunning.bind(this));
    }

    protected handleRequest(req: http.IncomingMessage, res: http.ServerResponse) {
        let filename: string = "/index.html";
        if (req.url != null && req.url != "/") {
            filename = req.url;
        }
        filename = filename.replace("../", "");
        const requestFile: string = config.webPath + filename;

        if (filename.startsWith("/.well-known/")) {
            let requestHandler = new RequestHandler(req, res);
            requestHandler.handle();
            return;
        }

        res.writeHead(301, {
            "Location": "https://" + config.hostname + ((config.sslPort != 443) ? ":" + config.sslPort : "") + "/"
        });
        res.end();
    }

    protected serverIsRunning() {
        console.log("HTTP-Server started...")
    }
}
