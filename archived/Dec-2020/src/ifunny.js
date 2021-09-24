const axios = require("axios");

module.exports = class ifunny {
    constructor(config={}, socks) {
        this.api = config.api || "https://api.ifunny.mobi/v4";
        this.bearer = config.bearer || null;
        this.basic = config.basic || null;
        this.socks = socks;
        this.BotEmitter = socks.BotEmitter;
    };

    async getContacts(callback, opts={}) {
        let users = [];
        const check_next = (response) => {
            if (response.users) {
                for (let index in response.users) {
                    users.push(response.users[index]);
                }
            };
            if (response.next) {
                this.listContactsPartition(
                    check_next, 
                    {
                        next: response.next,
                        limit: opts.limit,
                        query: opts.query,
                        name: opts.name
                    }
                );
            };
            if (!response.next) {
                callback(users);
            }
        };
        this.listContactsPartition(check_next, {limit: opts.limit, name: opts.name, query: opts.query});
    };

    async listContactsPartition(callback, opts={}) {
        let req_id = await this.req_id();

        let message = [
            48, 
            req_id, 
            {}, 
            "co.fun.chat.list_contacts", 
            [], 
            {},
        ];


        message[5].next = opts.next ? opts.next : null;
        message[5].limit = opts.limit ? opts.limit : null;
        message[5].query = opts.query ? opts.query : null;

        this.BotEmitter.emit(
            "websocket_send", 
            message
        );

        this.BotEmitter.emit(
            "add_event", 
            req_id, 
            async(response)=>{
                callback(response);
            },
        );
    };

    async randomint(min, max) {
        return Math.random() * (max - min) + min;
    };

    async req_id() {
        return Math.round(await this.randomint(1, 10000000))
    };

    
    async searchContacts(callback, opts={}) {
        let users = [];
        const check_next = (response) => {
            if (response.users) {
                for (let index in response.users) {
                    users.push(response.users[index]);
                }
            };
            if (response.next) {
                this.searchContactsPartition(
                    check_next, 
                    {
                        next: response.next,
                        limit: opts.limit,
                        query: opts.query,
                        name: opts.name
                    }
                );
            };
            if (!response.next) {
                callback(users);
            }
        };
        this.searchContactsPartition(check_next, {limit: opts.limit, name: opts.name, query: opts.query});
    };

    async searchContactsPartition(callback, opts={}) {
        let req_id = await this.req_id();

        let message = [
            48, 
            req_id, 
            {}, 
            "co.fun.chat.search_contacts", 
            [], 
            {},
        ];


        message[5].next = opts.next ? opts.next : null;
        message[5].limit = opts.limit ? opts.limit : null;
        message[5].query = opts.query ? opts.query : null;
        
        if (opts.name) {
            message[5].name = opts.name;
        };

        this.BotEmitter.emit(
            "websocket_send", 
            message
        );

        this.BotEmitter.emit(
            "add_event", 
            req_id, 
            async(response)=>{
                callback(response);
            },
        );
    };

    headers(opts={}) {
        return (
            opts.basic ? {
                Authorization: "Basic " + this.basic,
            } : {
                Authorization: "Bearer " + this.bearer,
            }
        );
    };

    async request(opts={}, callback) {
        opts.baseURL = this.api;
        axios(
            opts,
        )
        .then(
            async response => {
                callback(
                    response.data.data
                );
            },
        )
        .catch(
            async err => {
                console.log(err);
                callback(undefined)
            },
        );
    };

    async user_by_nick(nick, callback) {
        this.request(
            {
                url: `/users/by_nick/${nick}`,
                headers: this.headers()
            },
            async response => {
                callback(response);
            },
        );
    };

};