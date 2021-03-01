requirejs(["client/cahClient"], function (CahClient) {
    new CahClient({
        "socketPath": "{WEBSOCKET_PATH}",
        "sessionID": "{SESSION_ID}"
    });
});
