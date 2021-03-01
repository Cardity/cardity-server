define([], function () {
    "use strict";

    function CahClient(options) {
        this.init(options);
    }

    CahClient.prototype = {
        init: function(options) {
            this._options = options;
            this._lastHeartbeat = null;

            this.socket = new WebSocket(this._options.socketPath);
            this.socket.onopen = this._onopen.bind(this);
            this.socket.onmessage = this._onmessage.bind(this);
            this.socket.onclose = this._onclose.bind(this);
        },

        _onopen: function(event) {
            var data = {
                "o": 1
            };
            this.socket.send(JSON.stringify(data));

            setTimeout(this._checkHeartbeat.bind(this), 50000);
        },

        _onclose: function(event) {
            // TODO: Fehlermeldung anzeigen bei close
            console.log("server closed connection");
        },

        _onmessage: function(event) {
            var data = JSON.parse(event.data);
            switch (data.o) {
                case 2:
                    this._heartbeat();
                    break;
                case 4:
                    this._handleHeartbeatAck();
                    break;
            }
        },

        _heartbeat: function() {
            this._lastHeartbeat = Math.floor(Date.now() / 1000);
            setInterval(this._sendHeartbeat.bind(this), 40000);
        },

        _sendHeartbeat: function() {
            var data = {
                "o": 3
            };
            this.socket.send(JSON.stringify(data));
        },

        _handleHeartbeatAck: function() {
            this._lastHeartbeat = Math.floor(Date.now() / 1000);
        },

        _checkHeartbeat: function() {
            if (this._lastHeartbeat + 50 < Math.floor(Date.now() / 1000)) {
                this.socket.close();
                return;
            }

            setTimeout(this._checkHeartbeat.bind(this), 50000);
        }
    }

    return CahClient;
});