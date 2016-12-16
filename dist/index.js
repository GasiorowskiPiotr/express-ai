"use strict";
var appInsights = require("applicationinsights");
module.exports = function (app, instrumentationKey) {
    appInsights.setup(instrumentationKey).start();
    app.locals.log = appInsights.client;
    return {
        logErrors: function (err, req, res, next) {
            appInsights.client.trackException(err, {
                url: req.url
            });
            next(err);
        },
        logRequest: function (req, res, next) {
            res.locals.log = appInsights.client;
            appInsights.client.trackRequest(req, res);
            next();
        },
        traceInfo: function (message, properties) {
            appInsights.client.trackTrace(message, ContractsModule.SeverityLevel.Information, properties);
        },
        traceError: function (error, message, properties) {
            appInsights.client.trackException(error, Object.assign({}, { message: message }, properties));
        },
        traceWarning: function (message, properties) {
            appInsights.client.trackTrace(message, ContractsModule.SeverityLevel.Warning, properties);
        },
        trackEvent: function (name, properties) {
            appInsights.client.trackEvent(name, properties);
        }
    };
};
