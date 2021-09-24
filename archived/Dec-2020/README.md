# WARNING, THIS LIB NO LONGER WORKS

# ifunny-bot

To install use

`npm install ifunny-chat.js`

To make a bot

```js
const client = require("ifunny-chat.js");
const bot = new client(
    {
        bearer: "your_bearer",
        uid: "your_uid",
        autojoin: true,
        prefix: ","
    }
);
```

There are a couple of ways of adding commands

```js
bot.command(
    "help",
    async ctx => {
        return ctx.channel.send("help message");
    },
);

bot.command(
    "members",
    async ctx => {
        ctx.channel.getChannelMembers(
            async response => {
                let nicks = [];
                for (let {nick} of response) {
                    nicks.push(nick);
                };
                ctx.channel.send(nicks.join("\n"));
            },
        );
    },
);
```

Orrr 

```js
bot.command(
    "help",
    function help(ctx) {
        ctx.channel.send("help message")
    }
)

bot.command(
    "members",
    function members(ctx) {
        ctx.channel.getChannelMembers(
            function callback(response) {
                let nicks = [];
                for (let {nick} of response) {
                    nicks.push(nick)
                };
                ctx.channel.send(nicks.join("\n"))
            }
        )
    }
)
```

Or even, using a more outdated method

```js
async function help(ctx) {
    return ctx.channel.send("Help message...");
};

async function onearg(ctx) {
    let arg = ctx.command.args_list[0];
    return ctx.channel.send(arg);
};

bot.command("help", help);
bot.command("onearg", onearg)
```

If you need help, please contact me at tobi@ibot.wtf

Ill push more updates soon.

# Example commands

Here are some more example commands i wrote.

```js

bot.command(
    "help",
    async ctx => {
        ctx.channel.send("Help message")
    }
);

bot.command(
    "kickme",
    async ctx => {
        ctx.channel.kick(ctx.command.message.user.id)
    },
);

bot.command(
    "search",
    async ctx => {
        ctx.channel.searchContacts(
            async response => {
                console.log(response)
            },
            {query: "tobi"}
        )
    }
)

bot.command(
    "delete",
    async ctx => ctx.channel.delete()
)

bot.command(
    "members",
    async ctx => {
        ctx.channel.getChannelMembers(
            async response => {
                let nicks = [];
                for (let {nick} of response) {
                    nicks.push(nick);
                };
                ctx.channel.send(nicks.join("\n"))
            },
        );
    },
);
```