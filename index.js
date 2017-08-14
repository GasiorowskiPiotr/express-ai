"use strict";
exports.__esModule = true;
var appInsights = require("applicationinsights");
var uuid = require("uuid");
var logger_1 = require("./logger");
require('es6-shim');
exports.loggers = function (app, instrumentationKey, disableAutoCollect) {
    if (disableAutoCollect === void 0) { disableAutoCollect = false; }
    var aiSetup = appInsights.setup(instrumentationKey);
    if (disableAutoCollect) {
        aiSetup = aiSetup
            .setAutoCollectPerformance(false)
            .setAutoCollectConsole(false)
            .setAutoCollectRequests(false)
            .setAutoCollectExceptions(false);
    }
    aiSetup.start();
    var ai = appInsights.client;
    var logger = new logger_1.Logger(ai);
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