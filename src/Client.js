const Wampy  = require("wampy").Wampy
const WampyPatch = require("./WampyPatch")
const websocket = require("ws")
const Channel = require("./Channel")
const User = require("./User")
const {create, AxiosRequestConfig, AxiosInstance} = require("axios")

class Client extends require("events").EventEmitter {

    /**
     * Client for initializing the websocket (non connected state) and general client information
     * @param {Object} ClientOpts - User fed options for the client to run with
     * @param {string} ClientOpts.bearer - Bearer token for your iFunny account
     * @param {string} ClientOpts.uid - User ID for your iFunny account
     * @param {string} [ClientOpts.basic=null] - Basic token for your iFunny account
     * @param {boolean} [ClientOpts.autoAcceptInvite=true] - Set account to automatically accept invites as they come
     * @param {boolean} [ClientOpts.debugWampy=false] - Setting to turn on wampy debugging
     * @param {boolean} [ClientOpts.debug=false] - Setting to turn on logging
     */
    constructor(ClientOpts) {
        super()

        /**
         * Bearer token for iFunny WebSocket and HTTP Authorization
         * @type {string}
         * @private
         */
        this._bearer = ClientOpts.bearer

        /**
         * Basic Authorization token for iFunny HTTP Authorization (limited use-case)
         * @type {string|null}
         * @private
         */
        this._basic = ClientOpts.basic || null

        /**
         * Unique User ID Associated with bearer used for Authentication
         * @type {string}
         * @private
         */
        this._uid = ClientOpts.uid

        /**
         * WebSocket host url for iFunny chats
         * @type {string}
         * @private
         */
        this._wshost = "chat.ifunny.co"

        /**
         * Value on whether or not to log wampy dump to console
         * @type {boolean}
         * @private
         */
        this._debugWampy = ClientOpts.debugWampy || false

        /**
         * Value on whether to display general log details to console
         * @type {boolean}
         * @private
         */
        this._debug = ClientOpts.debug || false

        /**
         * Decides whether or not the WebSocket should automatically accept invites from users.
         * @type {boolean}
         * @private
         */
        this._autoAcceptInvite = ClientOpts.autoAcceptInvite || true

        /**
         * Queud messages array for message processing
         * @type {Array.<{name: string, content: string, callback: Object|function, nick: string}>}
         * @private
         */
        this._queudMessages = []

        /**
         * Queud messages array for message processing
         * @type {Array.<{name: string, content: string, callback: Object|function, nick: string}>}
         * @private
         */
        this._priorityMessages = []

        /**
         * API Host for iFunnys mobile api
         * @type {string}
         * @private
         */
        this._host = "https://api.ifunny.mobi/v4"

        /**
         * Request instance for axios for connection reuse
         * @type {AxiosInstance}
         * @private
         */
        this._axiosInstance = create({ baseURL: this._host })
        this._axiosInstance.defaults.headers.Authorization = `Bearer ${this._bearer}`
        this._axiosInstance.defaults.headers["Ifunny-Project-Id"] = "iFunny"

        /**
         * WebSocket/Wampy instance for connecting to chats, connection not in state.
         * @type {wampy}
         * @private
         */
        this._ws = new Wampy(`wss://${this._wshost}/chat`)

        this._ws.options({
            ws: websocket,
            realm: "co.fun.chat.ifunny",
            authid: this._uid,
            authmethods: ['ticket'],
            onChallenge: (method, info) =>{
                this._log("Challenge issued..")
                return this._bearer
            },
            onConnect: (info) => {
                console.log(`Logged in as ${info.attributes.nick}`)
                this.emit("connected", info)
            },
            onError: (error) => {
                console.log(error)
            },
            debug: this._debugWampy
        })
    }

    /**
     * Handles the response of HTTP requests made to the iFunny api
     * @param {function|Object} callback - Function to call after the response is wrapped
     * @returns {function} - Returns a wrapped function that handles callback
     * @private
     */
    _handleResponse(callback) {
        return function(req) {
            if (callback) {
                if (req.data) {
                    callback(req.data.data)
                } else if (req.response) {
                    callback(req.response.data)
                } else {
                    //Handle in future if not error but also not success
                }
            }
        }
    }

    /**
     * Handles getting the headers based on whether or not a basic or bearer token is needed for the request
     * @param {boolean} basic - Decides whether or not a basic is needed for the request
     * @returns {{Ifunny-Project-Id:string, Authorization: string}} - Final headers for authorization
     * @private
     */
    _headers(basic=false) {

        let baseHeaders = { "Ifunny-Project-Id": "iFunny" }

        if (basic && this._basic) {
            return { Authorization: `Basic ${this._basic}`, ...baseHeaders }
        } else return { Authorization: `Bearer ${this._bearer}`, ...baseHeaders }
    }

    /**
     * Makes a request using Basic Authorization token
     * @param {AxiosRequestConfig} opts - Request config
     * @param {{Authorization: string}} opts.headers - Headers for request config
     * @param {function|Object} callback - Callback for response
     * @private
     */
    async _basicRequest(opts, callback) { //If theres no basic token in the client, then it will use bearer by default.
        this._axiosInstance({headers: this._headers(true), ...opts}).then(this._handleResponse(callback)).catch(this._handleResponse(callback))
    }

    /**
     * Makes a request using Bearer token
     * @param {AxiosRequestConfig} opts - Request config
     * @param {{Authorization: string}} opts.headers - Headers for request config
     * @param {function|Object} callback - Callback for response
     * @private
     */
    async _request(opts, callback) {
        this._axiosInstance({headers: this._headers(false), ...opts}).then(this._handleResponse(callback)).catch(this._handleResponse(callback))
    }

    /**
     * Checks debug settings and logs to console
     * @param {*} params - Logs any arguments
     * @private
     */
    _log() {
        if (this._debug) {
            console.log(...arguments)
        }
    }

    /**
     * Creates a new Channel instance for each channel in a new chat message and sends it to the message emitter when the onOpen event happens with wampy
     * @param {Object} data - Not typing this data, but its channel data for chats and messages, will type it out in Channel.js likely.
     * @private
     */
    _handleChats (data) {
        for (let index in data.argsDict.chats) {
            let chat = data.argsDict.chats[index]
            let channel = new Channel(this, chat)
            this.emit("message", channel)
        }
    }

    /**
     * Creates a new Channel instance for each channel in the invite list and sees if it needs to autoAccept messages when the onOpen event happens with wampy
     * @param {Object} data - Not typing this data, but its channel data for chats and messages, will type it out in Channel.js likely.
     * @private
     */
    _handleInvites (data) {
        let channels = []
        for (let index in data.argsDict.chats) {
            let chat = data.argsDict.chats[index]
            let channel = new Channel(this, chat)
            channels.push(channel)
            if (this._autoAcceptInvite) {
                channel.acceptInvite()
            }
        }
        this.emit("invites", channels)
    }

    /**
     * Connects to the iFunny chat WebSocket, and subscribes to chats and invites
     * @param {function|Object} callback - adds a connection callback to the client emitter
     * @public
     */
    connect(callback) {
        if (typeof callback == "function") {
            this.on("connected", callback)
        }
        WampyPatch(this._ws)
        this._ws.connect()
        this._handleQueuedMessages()
        this._ws.subscribe(`co.fun.chat.user.${this._uid}.invites`, this._handleInvites.bind(this))
        this._ws.subscribe(`co.fun.chat.user.${this._uid}.chats`, this._handleChats.bind(this))
        this._log(this._ws)
    }

    /**
     * Accepts an invite from a channel
     * @param {string} channelName - ID of channel to accept, keyword is name in iFunnt chats.
     * @private
     */
    _acceptInvite(channelName) {
        this._ws.call("co.fun.chat.invite.accept", [channelName], {
            onSuccess: result => {
                this._log(`Joined channel ${channelName}`)
            },
            onError: err => {
                throw err
            }
        })
    }

    /**
     * Sorts queud messages and runs them into the WebSocket in order
     * @param {number} timeout - Number of miliseconds to wait before sending the next messages
     * @private 
     */
    async _handleQueuedMessages(timeout=0) {

        function _handlePriorityMessages() {
            let priorityMessages = this._priorityMessages
            for (let index in priorityMessages) {
                this._queudMessages.unshift(priorityMessages[index])
                this._priorityMessages.shift()
            }
        }

        setTimeout( function() {
            let message = this._queudMessages[0]
            let content = ""
            let contents = {}

            if (message) {

                let callbacks = []
                //Add support for speed when not rate limited.

                for (let index in this._queudMessages) {
                    let indexedQueuedMessage = this._queudMessages[index]
                    if (indexedQueuedMessage.name == message.name) {
                        let totalLength = 0
                        for (let name in contents) {
                            totalLength += name.length
                            totalLength += 2
                            totalLength += contents[name].length
                        }
                        if (contents[indexedQueuedMessage.nick]) {
                            if ((totalLength + indexedQueuedMessage.content.length + 2) < 5000) {
                                contents[indexedQueuedMessage.nick] = `${contents[indexedQueuedMessage.nick]}${indexedQueuedMessage.content}\n\n`
                                callbacks.push(indexedQueuedMessage.callback)
                                delete this._queudMessages[index]
                            }
                        } else {
                            let queudMessageLength = indexedQueuedMessage.nick.length + 2 + indexedQueuedMessage.content.length //This is to account for escape character and :
                            if (totalLength + queudMessageLength < 5000) {
                                contents[indexedQueuedMessage.nick] = `${indexedQueuedMessage.content}\n\n`
                                callbacks.push(indexedQueuedMessage.callback)
                                delete this._queudMessages[index]
                            }
                        }

                    }
                }

                for (let name in contents) {
                    content += `${name}:\n${contents[name]}\n`
                }

                this._sendMessage(message.name, content.slice(0, -3), function(data) {
                    if (data.error) {
                        if (data.error == "wamp.error.authorization_failed") {
                            this._handleQueuedMessages(1000)
                        }
                    } else {
                        this._queudMessages.shift()
                        _handlePriorityMessages.bind(this)()


                        async function handleCallback(callback) {
                            if (callback) {
                                callback(data)
                            }
                        }
                        for (let index in callbacks) {
                            handleCallback(callbacks[index])
                        }
                        this._handleQueuedMessages(3050)
                    }
                }.bind(this))
            } else {
                this._queudMessages.shift()
                _handlePriorityMessages.bind(this)()
                this._handleQueuedMessages()
            }

        }.bind(this), timeout)
    }

    /**
     * Adds message to the queue list to be sent in order
     * @param {string} channelName - Channel ID (name is key in iFunny chats) for sending message
     * @param {string} message - Content of message to add to the queue
     * @param {string} nick - Name of the user to add to the queue
     * @param {function|Object} [callback=undefined] - Callback of message to add
     * @private
     */
    _addToMessageQueue(channelName, message, nick, callback)  {
        this._queudMessages.push({
            name: channelName,
            content: message,
            callback: callback,
            nick: nick
        })
    }

    /**
     * Adds message to the queue list to be sent in priority (to the front of the queue)
     * @param {string} channelName - Channel ID (name is key in iFunny chats) for sending message
     * @param {string} message - Content of message to add to the queue
     * @param {string} nick - Name of the user to add to the queue
     * @param {function|Object} [callback=undefined] - Callback of message to add
     * @private
     */
    _addToPriorityMessageQueue(channelName, message, nick, callback) {
        this._priorityMessages.push({
            name: channelName,
            content: message,
            callback: callback,
            nick: nick
        })
    }

    /**
     * Sends message to the WebSocket of iFunny Chats
     * @param {string} channelName - Channel id (name is key in iFunny chats) for sending message
     * @param {string} message - Content of message to send
     * @param {function|Object} [callback=null] - Callback to run after the message is sent. 
     */
    _sendMessage(channelName, message, callback=null) {
        this._ws.publish(`co.fun.chat.chat.${channelName}`, [200, 1, message], {
            onSuccess: result => {
                if (callback) {
                    callback({ timestamp: (new Date()).getTime(), ...result })
                }
            },
            onError: callback
        })
    }

    /**
     * Function for listing contacts for chats
     * @param {Object} opts - Options for listing contacts
     * @param {string} opts.chat_name - Chat name is the variable but based on UI I believe this is actually nickname
     * @param {number} opts.limit - Limit of users to return
     * @param {function|Object} callback - Function for sending user list or error
     */
    listContacts(opts={}, callback) {
        let users = []

        this._ws.call("co.fun.chat.list_contacts", { chat_name: opts.chat_name || null, limit: opts.limit || 100 }, {
            onSuccess: function(data) {
                for (let index in data.argsDict.users) {
                    users.push(new User(this, data.argsDict.users[index]))
                }
                callback(users)
            }.bind(this),
            onError: data => callback(data)
        })
    }

    /**
     * Function for searching through contacts for chats (Not working needs fixed apparently? Probably more options need added)
     * @param {Object} opts - Options for listing contacts
     * @param {string} opts.chat_name - Chat name is the variable but based on UI I believe this is actually nickname
     * @param {number} opts.limit - Limit of users to return
     * @param {string} opts.query - Query to search through contacts
     * @param {function|Object} callback - Function for sending user list or error
     * @public
     */
    searchContacts(opts, callback) {
        let users = []

        this._ws.call("co.fun.chat.search_contacts", { chat_name: opts.chat_name || null, limit: opts.limit || 100, query: opts.query }, {
            onSuccess: function(data) {
                for (let index in data.argsDict.users) {
                    users.push(new User(this, data.argsDict.users[index]))
                }
                callback(users)
            }.bind(this),
            onError: callback
        })
    }

    /**
     * Returns a user object by querying a nickname
     * @param {Object} opts - Options object
     * @param {string} opts.nick - nickname of user to be queried
     * @param {function|Object} callback - Callback for response
     * @public
     */
    userByNick(opts={}, callback) {
        this._request({ url: `/users/by_nick/${opts.nick}` }, function(response) {
            if (!response.error) {
                callback(new User(this, response, true))
            } else if (response.error == "not_found") {
                callback(response)
            } else { } //Handle response elsewhere
        }.bind(this))
    }

    /**
     * Returns a user object by querying an id
     * @param {Object} opts - Options object
     * @param {string} opts.id - id of user to be queried
     * @param {function|Object} callback - Callback for response
     * @public
     */
    userById(opts={}, callback) {
        this._request({ url: `/users/${opts.id}` }, function(response) {
            if (!response.error) {
                callback(new User(this, response, true))
            } else if (response.error == "not_found") {
                callback(response)
            } else { } //Handle response elsewhere
        }.bind(this))
    }
}

module.exports = Client