module.exports = class Channel {
    constructor(client, data, apiCall=false) {
        Object.assign(this, data)
        this.client = client
    }

    _find(index) {
        if (this.apiCall) {
            //Handle parsing for that data here
        } else if (!index) {
            throw new Error("No indexable call")
        } else return this[index]
    }

    acceptInvite() {
        this.client._acceptInvite(this._find("name"))
    }

    members(callback) {
        
    }

    /**
     * 
     * @param {string} message Message to send to the channel
     * @param {function|object|undefined} callback Optional callback for the end of the message
     */
    send(message, callback) {
        this.client._addToMessageQueue(this._find("name"), message, this.last_msg.user.nick, callback)
    }

    sendPriority(message, callback=null) {
        this.client._addToPriorityMessageQueue(this._find("name"), message, this.last_msg.user.nick, callback)
    }
}