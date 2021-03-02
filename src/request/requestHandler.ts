import * as fs from "fs";
import * as http from "http";
import * as config from "./../../config.json";

export class RequestHandler {
    protected req: http.IncomingMessage;

    protected res: http.ServerResponse;

    static cachedFiles: { [key: string]: string } = {};

    constructor(req: http.IncomingMessage, res: http.ServerResponse) {
        this.req = req;
        this.res = res;
    }

    handle() {
        let filename: string = "/index.html";
        if (this.req.url != null && this.req.url != "/") {
            filename = this.req.url;
        }
        filename = filename.replace("../", "");

        const requestFile: string = config.webPath + filename;
        if (fs.existsSync(requestFile) && fs.lstatSync(requestFile).isFile()) {
            this.showFile(requestFile);
        } else {
            this.res.writeHead(404, {
                "Content-Type": "text/html"
            });
            this.res.end("<h1>404 Not Found</h1>");
        }
    }

    protected showFile(requestFile: string) {
        let contentType = "text/plain";
        if (requestFile.endsWith(".html")) {
            contentType = "text/html";
        } else if (requestFile.endsWith(".css")) {
            contentType = "text/css";
        } else if (requestFile.endsWith(".js")) {
            contentType = "text/javascript";
        } else if (requestFile.endsWith(".svg")) {
            contentType = "image/svg+xml";
        } else if (requestFile.endsWith(".png")) {
            contentType = "image/png";
        } else if (requestFile.endsWith(".jpg")) {
            contentType = "image/jpeg";
        }

        this.res.writeHead(200, {
            "Content-Type": contentType
        });
        let fileData: string = this.getFile(requestFile);
        fileData = this.compileFile(fileData);
        this.res.end(fileData);
    }

    protected getFile(requestFile: string): string {
        return fs.readFileSync(requestFile).toString();
        if (RequestHandler.cachedFiles[requestFile] == null) {
            RequestHandler.cachedFiles[requestFile] = fs.readFileSync(requestFile).toString();
        }
        return RequestHandler.cachedFiles[requestFile];
    }

    protected compileFile(fileData: string): string {
        fileData = fileData.replace("{WEBSOCKET_PATH}", "wss://" + config.hostname + ((config.sslPort != 443) ? ":" + config.sslPort : "") + "/");

        return fileData;
    }
}
