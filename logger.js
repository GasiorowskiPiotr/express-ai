"use strict";
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
exports.__esModule = true;
require('es6-shim');
var Logger = /** @class */ (function () {
    function Logger(ai) {
        this.ai = ai;
    }
    Logger.prototype.traceInfo = function (message, properties) {
        this.ai.trackTrace({ message: message, severity: 1, properties: properties });
    };
    Logger.prototype.traceError = function (error, message, properties) {
        this.ai.trackException({ exception: error, properties: __assign({}, properties, { message: message }) });
    };
    Logger.prototype.traceWarning = function (message, properties) {
        this.ai.trackTrace({ message: message, severity: 2, properties: properties });
    };
    Logger.prototype.traceVerbose = function (message, properties) {
        this.ai.trackTrace({ message: message, severity: 0, properties: properties });
    };
    Logger.prototype.traceCritical = function (message, properties) {
        this.ai.trackTrace({ message: message, severity: 4, properties: properties });
    };
    Logger.prototype.trackEvent = function (name, properties) {
        this.ai.trackEvent({ name: name, properties: properties });
    };
    Logger.prototype.trackMetric = function (name, value) {
        this.ai.trackMetric({ name: name, value: value });
    };
    Logger.prototype.trackRequest = function (req, res, properties) {
        this.ai.trackRequest({
            name: req.method + " " + req.path,
            url: req.url,
            duration: parseInt(res.get('X-Response-Time'), 10),
            source: req.ip,
            resultCode: req.statusCode.toString(),
            success: true,
            properties: properties
        });
    };
    return Logger;
}());
exports.Logger = Logger;
//# sourceMappingURL=logger.js.map