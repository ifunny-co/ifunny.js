const parser = require("./parser");
const api = {ifunny: require("./ifunny")}

module.exports = class client {
    constructor(config={}) {
        this.socks = new (require("./socks"))(config);
        this.bearer = config.bearer;
        this.uid = config.uid;
        this.prefix = config.prefix || "!";
        this.selfrespond = config.selfrespond || false;
        this.events = {};
        this.commands = config.commands || {};
        this.autojoin = config.autojoin || false;
        this.ifunnyapi = new api.ifunny(config, this.socks);
        this.onmessage = config.onmessage || null;
        
        this.socks.BotEmitter.on(
            "handle_message",
            async ctx => {
                try {
                    this.handle_message(ctx);
                } catch(err) {
                    //Handle errors
                    console.log(err);
                };
            },
        );

        this.socks.BotEmitter.on(
            "run_event", 
            async(req_id, response)=>{
                if (!this.events[req_id]) {
                    return;
                } else {
                    this.events[req_id](response);
                    delete this.events[req_id];
                };
            },
        );

        this.socks.BotEmitter.on(
            "add_event", 
            async (req_id, callback) => {
                this.events[req_id] = callback;
            },
        );
    };

    async command(name, callback) {
        this.commands[name] = callback;
    };

    async process_command(ctx) {
        //Handle commands here.
        let command = this.commands[ctx.command.name];
        if (command) {
            command(ctx);
        } else {
            //Add a handler for if something isnt a command.
        }
    };

    async handle_message(ctx) {
        let parsed = ctx.data.parsed;
        let raw = ctx.data.raw;
        let reqid = raw[1];
        //Handle reqid shit
        (
            async() => {
                if (reqid == "ticket") {
                    console.log("Ticket request sent...authenticating");

                    this.socks.BotEmitter.emit(
                        "websocket_send",
                        [
                            5, 
                            this.bearer, 
                            {},
                        ],
                    );

                    console.log("Authentication sent...");

                    this.socks.BotEmitter.emit(
                        "websocket_send",
                        [
                            32, 
                            1, //1 is the reqid
                            {}, 
                            `co.fun.chat.user.${this.uid}.chats`,
                        ],
                    );

                    this.socks.BotEmitter.emit(
                        "websocket_send",
                        [
                            32, 
                            2, //2 is the reqid 
                            {}, 
                            `co.fun.chat.user.${this.uid}.invites`,
                        ],
                    );

                };
            }
        )();

        // Handle parsed information

        (
            async() => {
                if (parsed) {
                    if (parsed.type == 100) {
                        //Handle message frame
                        for (let index in parsed.chats) {
                            let chat = parsed.chats[index];
                            (
                                async () => {
                                    let channel = new parser.channel(
                                        {
                                            data: chat,
                                            BotEmitter: this.socks.BotEmitter,
                                            api: this.ifunnyapi,
                                        },
                                    );
                                    let last_msg = chat.last_msg;

                                    if (!last_msg) {
                                        return
                                    }

                                    if (!last_msg.text) {
                                        return; //Message isnt a real message
                                    };

                                    //Add an event listener for users to parse own messages
                                    //send ctx and message content

                                    if (this.onmessage) {
                                        let context = {
                                            message: last_msg,
                                            channel: channel,
                                            api: {
                                                ifunny: this.ifunnyapi
                                            },
                                            source: {
                                                frame: ctx,
                                                class: this
                                            }
                                        };
                                        this.onmessage(context);
                                    };

                                    const parse = async () => {
                                        let args_list = last_msg.text.trim().split(/ +/g);
                                        let cmd = args_list[0].slice(this.prefix.length).toLowerCase();
                                        args_list.shift();
                                        let args = args_list.join(" ");

                                        let context = {
                                            command: {
                                                name: cmd,
                                                args: args,
                                                args_list: args_list,
                                                message: last_msg
                                            },
                                            channel: channel,
                                            api: {
                                                ifunny: this.ifunnyapi
                                            },
                                            source: {
                                                frame: ctx,
                                                class: this
                                            }
                                        };

                                        this.process_command(context);
                                    }

                                    if (this.selfrespond) {
                                        return parse();
                                    };

                                    if (last_msg.user.id == this.uid) {
                                        return //Same as client.
                                    };

                                    if (!last_msg.text.startsWith(this.prefix)) {
                                        return //Isnt a command, doesnt start with prefix.
                                    };
                                    return parse();
                                }
                            )();
                        };
                    } else if (parsed.type == 300){
                        //Handle invite frames
                        for (let index in parsed.chats) {
                            let chat = parsed.chats[index];
                            (
                                async () => {
                                    let channel = new parser.channel(
                                        {
                                            data: chat,
                                            BotEmitter: this.socks.BotEmitter,
                                            api: this.ifunnyapi,
                                        },
                                    );
                                    if (this.autojoin) {
                                        channel.join();
                                    } else {
                                        console.log("You were invited to a channel but autojoin is set to false.");   
                                    };
                                }
                            )();
                        }
                    };
                } else {
                    return;
                };
            }
        )();

        //Handle channel data

        (
            async() => {
                if (raw[4]) {
                    if (raw[4].members) {

                        let response = {
                            members: raw[4].members,
                        };

                        if (raw[4].next) {
                            response.next = raw[4].next;
                        };

                        this.socks.BotEmitter.emit(
                            "run_event",
                            raw[1],
                            response
                        );
                    };
                    if (raw[4].users) {
                        let response = {
                            users: raw[4].users
                        };
                        if (raw[4].next) {
                            response.next = raw[4].next;
                        };

                        this.socks.BotEmitter.emit(
                            "run_event",
                            raw[1],
                            response
                        )
                    }
                };
            }
        )();

    };
};