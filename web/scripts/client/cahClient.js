define([], function () {
    "use strict";

    function CahClient(options) {
        this.init(options);
    }

    CahClient.prototype = {
        init: function(options) {
            this._options = options;

            this.socket = new WebSocket(this._options.socketPath);
            this.socket.onopen = this._onopen.bind(this);
            this.socket.onmessage = this._onmessage.bind(this);
        },

        _onopen: function(event) {
            var data = {
                "o": 1,
                "d": this._options.sessionID
            };
            this.socket.send(JSON.stringify(data));
        },

        _onmessage: function(event) {
            console.log(event.data);
        }
    }

    return CahClient;
});