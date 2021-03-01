requirejs(["client/cahClient"], function (CahClient) {
    new CahClient({
        "socketPath": "{WEBSOCKET_PATH}"
    });
});
