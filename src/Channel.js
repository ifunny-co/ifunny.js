const Client = require("./Client")

class Channel {

    /**
     * Channel object for making api calls easier to the client and interacting with channels and channel data
     * @param {Client} client - Client object 
     * @param {Object} data - Needs typing but fml i dont want to do this right now 
     * @param {boolean} [apiCall=false] - Whether or not its an api call will decide how it parses the data
     */
    constructor(client, data, apiCall=false) {
        Object.assign(this, data)
        this.apiCall = apiCall
        this.client = client
    }

    /**
     * ID of channel in iFunny api
     * @public
     */
    get Name() {
        if (!this.apiCall) {
            return this["name"]
        } else {
            //Handle if api call
        }
    }

    /**
     * Message object for the last message sent
     * @public
     */
    get Message() {
        if (!this.apiCall) {
            return this.last_msg
        } else {
            //Handle if api call
        }
    }

    /**
     * Accepts invite for a channel
     * @public
     */
    acceptInvite() {
        this.client._acceptInvite(this.Name)
    }

    /**
     * not finished lmfaooo ADD CHANNEL MEMBERS to client
     * @param {*} callback
     * @public 
     */
    members(callback) {
        
    }

    /**
     * Adds message to queue to be sent to channel
     * @param {string} message - Message to send to the channel
     * @param {function|object|undefined} [callback=null] - Optional callback for the end of the message
     * @public
     */
    send(message, callback) {
        this.client._addToMessageQueue(this.Name, message, this.Message.user.nick, callback)
    }

    /**
     * Adds message to queue to be sent to channel in priority (first)
     * @param {string} message - Message to send to the channel
     * @param {function|object|undefined} [callback=null] - Optional callback for the end of the message
     * @public
     */
    sendPriority(message, callback=null) {
        this.client._addToPriorityMessageQueue(this.Name, message, this.Message.user.nick, callback)
    }
}

module.exports = Channel