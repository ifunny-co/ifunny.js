var Client = require("./Client")

module.exports = {
    default: Client,
    Client: Client,
    CommandInstance: require("./CommandInstance"),
    Channel: require("./Channel")
}