"use strict";
var Logger = (function () {
    function Logger(ai) {
        this.ai = ai;
    }
    Logger.prototype.traceInfo = function (message, properties) {
        this.ai.trackTrace(message, 1, properties);
    };
    Logger.prototype.traceError = function (error, message, properties) {
        this.ai.trackException(error, Object.assign({}, { message: message }, properties));
    };
    Logger.prototype.traceWarning = function (message, properties) {
        this.ai.trackTrace(message, 2, properties);
    };
    Logger.prototype.traceVerbose = function (message, properties) {
        this.ai.trackTrace(message, 0, properties);
    };
    Logger.prototype.traceCritical = function (message, properties) {
        this.ai.trackTrace(message, 4, properties);
    };
    Logger.prototype.trackEvent = function (name, properties) {
        this.ai.trackEvent(name, properties);
    };
    Logger.prototype.trackMetric = function (name, value) {
        this.ai.trackMetric(name, value);
    };
    Logger.prototype.trackRequest = function (req, res, properties) {
        this.ai.trackRequest(req, res, properties);
    };
    return Logger;
}());
exports.Logger = Logger;
//# sourceMappingURL=logger.js.map