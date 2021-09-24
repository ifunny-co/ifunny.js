const ws = require("ws");
const BotEmitter = new (class eventEmitter extends require("events"){})();

module.exports = class socks {
    constructor(config={}) {
        this.wslink = config.websocurl || "wss://chat.ifunny.co/chat";
        this.header = config.header || ["wamp.json",];
        this.reset_connection = config.reset_connection || true;
        this.BotEmitter = BotEmitter;

        BotEmitter.on(
            "reset_connection",
            async () => {
                if (this.reset_connection) {
                    console.log("Connection resetting..."), this.connect();
                } else {
                    console.log("A request to reset connection was sent, but ignored since reset_connection was set to false.")
                };
            },   
        );

        BotEmitter.on(
            "websocket_send",
            async data => {
                this.connection.send(
                    JSON.stringify(
                        data,
                    ),
                );
            },
        );

        this.connect();
    };

    async connect() {
        this.connection = new ws(this.wslink, this.header),
            this.connection.onopen = this.onopen,
            this.connection.onclose = this.onclose,
            this.connection.onerror = this.onerror,
            this.connection.onmessage = this.onmessage;
        return this;
    };

    async onmessage(message) {
        let parsed;
        let data = JSON.parse(message.data);

        if (typeof(data.slice(-1)[0]) == "object") {
            parsed = data.slice(-1)[0];
        };

        BotEmitter.emit(
            "handle_message",
            {
                data: {
                    raw: data,
                    parsed: parsed || null,
                },
                frame: {
                    connection: this.connection,
                    message: message,
                },
            },
        );
    };

    async onopen() {
        console.log("Succefully connected to the websocket...");
        BotEmitter.emit(
            "websocket_send",
            [
                1, 
                "co.fun.chat.ifunny", 
                {"authmethods": 
                    ["ticket"], 
                    "roles": {
                        "publisher": {}, 
                        "subscriber": {}
                    }
                }
            ]
        );
    };

    async onerror(err) {
        console.log("Encountered an error in the websocket, refreshing connection...", err.message);
        BotEmitter.emit("reset_connection");
    };

    async onclose(test) {
        console.log("websocket connection closed...");
    };
    
};