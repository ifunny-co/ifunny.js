/**
 * Wampy patch to work with wamp.json instead of wamp.2.json <3
 */

const path = require("path")
var _constantsPath = path.join(path.dirname(require.resolve("wampy")), "/constants.js")
let _constants = require(_constantsPath)

module.exports = function(wampyClient) {
    wampyClient._wsOnOpen = function() {
        var options = this._merge(this._options.helloCustomDetails, this._wamp_features),
        serverProtocol = "json";

    if (this._options.authid) {
      options.authmethods = this._options.authmethods;
      options.authid = this._options.authid;
    }

    this._log('[wampy] websocket connected');

    if (this._options.serializer.protocol !== serverProtocol) {
      // Server have chosen not our preferred protocol
      // Falling back to json if possible
      //FIXME Temp hack for React Native Environment.
      // Due to bug (facebook/react-native#24796), it doesn't provide selected subprotocol.
      // Remove when ^^^ bug will be fixed.
      if (serverProtocol === 'json' || typeof navigator != 'undefined' && navigator.product === 'ReactNative' && typeof this._ws.protocol === 'undefined') {
        this._options.serializer = new _JsonSerializer.JsonSerializer();
      } else {
        this._cache.opStatus = _constants.WAMP_ERROR_MSG.NO_SERIALIZER_AVAILABLE;
        return this;
      }
    }

    if (this._options.serializer.isBinary) {
      this._ws.binaryType = 'arraybuffer';
    } // WAMP SPEC: [HELLO, Realm|uri, Details|dict]
    // Sending directly 'cause it's a hello msg and no sessionId check is needed


    this._ws.send(this._encode([_constants.WAMP_MSG_SPEC.HELLO, this._options.realm, options]));
    }.bind(wampyClient)

    wampyClient._protocols = ["wamp.json"]
}