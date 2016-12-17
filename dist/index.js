"use strict";
var appInsights = require("applicationinsights");
var uuid = require("uuid");
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
        this.ai.trackRequest(req, res);
    };
    return Logger;
}());
module.exports = function (app, instrumentationKey) {
    appInsights.setup(instrumentationKey)
        .setAutoCollectRequests(false)
        .setAutoCollectExceptions(false).start();
    var ai = appInsights.client;
    var logger = new Logger(ai);
    app.locals.log = logger;
    return {
        logErrors: function (err, req, res, next) {
            logger.traceError(err, '', {
                url: req.url,
                requestId: res.locals.requestId
            });
            next(err);
        },
        logRequest: function (req, res, next) {
            res.locals.log = logger;
            res.locals.requestId = uuid.v4();
            logger.trackRequest(req, res, {
                requestId: res.locals.requestId
            });
            next();
        }
    };
};
//# sourceMappingURL=index.js.map