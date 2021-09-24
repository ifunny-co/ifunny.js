module.exports = class User {
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

    createChat() {
        
    }
}