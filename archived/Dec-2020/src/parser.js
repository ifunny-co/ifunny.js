class channel {
    constructor(opts={}) {
        this.BotEmitter = opts.BotEmitter || null;
        this.data = opts.data || null;
        this.api = opts.api;
    };

    async randomint(min, max) {
        return Math.random() * (max - min) + min;
    };

    async req_id() {
        return Math.round(await this.randomint(1, 10000000))
    };
    
    async send(message) {
        this.BotEmitter.emit(
            "websocket_send",
            [
                16, 
                160, 
                {
                    "acknowledge": 1, 
                    "exclude_me": 0,
                }, 
                `co.fun.chat.chat.${this.data.name}`, 
                [],          
                {
                    "message_type": 1, 
                    "type": 200, 
                    "text": message
                }
            ],
        );
    };

    async join() {
        this.BotEmitter.emit(
            "websocket_send",
            [
                48, 
                282, 
                {}, 
                "co.fun.chat.invite.accept", 
                [],
                {
                    "chat_name": this.data.name,
                },
            ],
        );
    };

    async getChannelMembers(callback, opts={}) {
        let users = [];
        const check_next = (response) => {
            if (response.members) {
                for (let index in response.members) {
                    users.push(response.members[index]);
                }
            };
            if (response.next) {
                this.listChannelMemberPartition(
                    check_next, 
                    {
                        next: response.next,
                        limit: opts.limit
                    }
                );
            };
            if (!response.next) {
                callback(users);
            }
        };
        this.listChannelMemberPartition(check_next, {limit: opts.limit, name: opts.name});
    };

    async kick(userid) {
        this.BotEmitter.emit(
            "websocket_send",
            [
                48,
                36,
                {},
                "co.fun.chat.kick_member",
                [
                    this.data.name,
                    userid
                ],
                {},
            ],
        );
    };

    async partitionInvite(opts={}) {
        let user = opts.users ? opts.users : opts.user;
        let name = opts.name ? opts.name : this.data.name;
        this.BotEmitter.emit(
            "websocket_send",
            [
                48,
                31,
                {},
                "co.fun.chat.list_contacts",
                [
                    name,
                    user
                ],
                {},
            ],
        );
    };

    async invite(user, opts={}) {
        this.partitionInvite(
            {
                name: opts.name,
                user: [user],
            },
        );
    };

    async invite_many(users, opts={}) {
        this.partitionInvite(
            {
                name: opts.name,
                users: users,
            },
        );
    }

    async delete(name=null) {
        name = name ? name : this.data.name;
        this.BotEmitter.emit(
            "websocket_send",
            [
                48,
                36,
                {},
                "co.fun.chat.delete_chat",
                [this.data.name],
                {},
            ],
        );
    };

    async listChannelMemberPartition(callback, opts={}) {
        let req_id = await this.req_id();

        let message = [
            48, 
            req_id, 
            {}, 
            "co.fun.chat.list_members", 
            [], 
            {},
        ];

        message[5].next = opts.next ? opts.next : undefined;
        message[5].limit = opts.limit ? opts.limit : undefined;
        message[5].chat_name = opts.name ? opts.name : this.data.name;

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

    async getContacts(callback, opts={nick: null, limit: 10}) {
        opts.name = opts.name ? opts.name : this.data.name;
        this.api.getContacts(
            callback,
            opts,
        );
    };

    async searchContacts(callback, opts={nick: null, limit: 10}) {
        opts.name = opts.name ? opts.name : this.data.name;
        this.api.searchContacts(
            callback,
            opts,
        );
    };

};

module.exports = {
    channel: channel,
};