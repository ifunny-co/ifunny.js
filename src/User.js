const Client = require("./Client")

class User {

    /**
     * User object for making api calls easier to the client and interacting with Users
     * @param {Client} client - Client object  
     * @param {Object} data - Needs typing but fml i dont want to do this right now 
     * @param {boolean} [apiCall=false] - Whether or not its an api call will decide how it parses the data
     */
    constructor(client, data, apiCall=false) {
        Object.assign(this, data)
        this.client = client
    }

    /**
     * Creates a chat with a user, needs finished.
     */
    createChat() {
        
    }
}

module.exports = User