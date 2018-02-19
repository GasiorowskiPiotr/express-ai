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
var ai = require("applicationinsights");
var logger_1 = require("../logger");
var sinon = require("sinon");
var chai = require("chai");
var sinon_express_mock_1 = require("sinon-express-mock");
var index_1 = require("../index");
require('es6-shim');
describe('Using Logger', function () {
    var logger;
    var message;
    var params;
    var error;
    var metric;
    var request;
    var response;
    before(function () {
        ai.setup("DEV").start();
        logger = new logger_1.Logger(ai.defaultClient);
        message = "Test";
        params = {
            a: "1",
            b: "TTT"
        };
        error = new Error("Test");
        metric = 123;
        request = sinon_express_mock_1.mockReq({ method: 'GET', path: '/', url: '/', ip: '127.0.0.1' });
        response = sinon_express_mock_1.mockRes({ statusCode: 200 });
        sinon.spy(ai.defaultClient, 'trackTrace');
        sinon.spy(ai.defaultClient, 'trackException');
        sinon.spy(ai.defaultClient, 'trackEvent');
        sinon.spy(ai.defaultClient, 'trackMetric');
        sinon.spy(ai.defaultClient, 'trackRequest');
    });
    after(function () {
        ai.defaultClient.trackTrace.restore();
        ai.defaultClient.trackException.restore();
        ai.defaultClient.trackEvent.restore();
        ai.defaultClient.trackMetric.restore();
        ai.defaultClient.trackRequest.restore();
    });
    it('should call traceInfo on AI with proper parameters', function () {
        logger.traceInfo(message, params);
        chai.assert(ai.defaultClient.trackTrace.calledWithExactly({ message: message, severity: 1, properties: params }));
    });
    it('should call traceError on AI with proper parameters', function () {
        logger.traceError(error, message, params);
        chai.assert(ai.defaultClient.trackException.calledWithExactly({ exception: error, properties: __assign({}, params, { message: message }) }));
    });
    it('should call traceWarning on AI with proper parameters', function () {
        logger.traceWarning(message, params);
        chai.assert(ai.defaultClient.trackTrace.calledWithExactly({ message: message, severity: 2, properties: params }));
    });
    it('should call traceVerbose on AI with proper parameters', function () {
        logger.traceVerbose(message, params);
        chai.assert(ai.defaultClient.trackTrace.calledWithExactly({ message: message, severity: 0, properties: params }));
    });
    it('should call traceCritical on AI with proper parameters', function () {
        logger.traceCritical(message, params);
        chai.assert(ai.defaultClient.trackTrace.calledWithExactly({ message: message, severity: 4, properties: params }));
    });
    it('should call trackEvent on AI with proper parameters', function () {
        logger.trackEvent(message, params);
        chai.assert(ai.defaultClient.trackEvent.calledWithExactly({ name: message, properties: params }));
    });
    it('should call trackMetric on AI with proper parameters', function () {
        logger.trackMetric(message, metric);
        chai.assert(ai.defaultClient.trackMetric.calledWithExactly({ name: message, value: metric }));
    });
    it('should call trackRequest on AI with proper parameters', function () {
        logger.trackRequest(request, response, params);
        chai.assert(ai.defaultClient.trackRequest.calledWithExactly({
            name: 'GET /',
            url: '/',
            duration: NaN,
            source: '127.0.0.1',
            resultCode: "200",
            success: true,
            properties: params
        }));
    });
});
describe('Creating a middleware', function () {
    var request = {};
    var response = {};
    var app = {
        locals: {}
    };
    beforeEach(function (done) {
        request = sinon_express_mock_1.mockReq({ method: 'GET', path: '/', url: '/', ip: '127.0.0.1' });
        response = sinon_express_mock_1.mockRes({ statusCode: 200 });
        sinon.spy(ai, 'setup');
        sinon.spy(ai, 'start');
        index_1.loggers(app, "dev", true);
        done();
    });
    it('should start AI', function () {
        console.log(ai.start.calledOnce);
        chai.assert(ai.setup.calledOnce);
        chai.assert(ai.start.calledOnce);
    });
    it('should assign log to app.locals', function () {
        chai.assert.isDefined(app.locals.log);
    });
    afterEach(function () {
        ai.setup.restore();
        ai.start.restore();
    });
});
describe('Using logRequest middleware', function () {
    var request;
    var response;
    var app = {
        locals: {}
    };
    var aiLogMiddleware;
    beforeEach(function () {
        request = sinon_express_mock_1.mockReq({ method: 'GET', path: '/', url: '/', ip: '127.0.0.1' });
        response = sinon_express_mock_1.mockRes({ statusCode: 200 });
        ai.setup("DEV").start();
        sinon.spy(ai.defaultClient, 'trackRequest');
        var middlewares = index_1.loggers(app, "dev", true);
        aiLogMiddleware = middlewares.logRequest;
    });
    it('should assign log to response.locals', function (done) {
        aiLogMiddleware(request, response, function (err) {
            chai.assert.isUndefined(err);
            chai.assert.isDefined(response.locals.log);
            done();
        });
    });
    it('should assign requestId', function (done) {
        aiLogMiddleware(request, response, function (err) {
            chai.assert.isUndefined(err);
            chai.assert.isDefined(response.locals.requestId);
            done();
        });
    });
    it('should call trackRequest', function (done) {
        aiLogMiddleware(request, response, function (err) {
            chai.assert.isUndefined(err);
            chai.assert(ai.defaultClient.trackRequest.calledWithExactly({
                name: 'GET /',
                url: '/',
                duration: NaN,
                source: '127.0.0.1',
                resultCode: "200",
                success: true,
                properties: {
                    requestId: response.locals.requestId
                }
            }));
            done();
        });
    });
    afterEach(function () {
        ai.defaultClient.trackRequest.restore();
    });
});
describe('Using logError middleware', function () {
    var request;
    var response;
    var app = {
        locals: {}
    };
    var aiLogMiddleware;
    var aiErrorMiddleware;
    beforeEach(function () {
        request = sinon_express_mock_1.mockReq({ method: 'GET', path: '/', url: '/', ip: '127.0.0.1' });
        response = sinon_express_mock_1.mockRes({ statusCode: 200 });
        ai.setup("DEV").start();
        sinon.spy(ai.defaultClient, 'trackRequest');
        sinon.spy(ai.defaultClient, 'trackException');
        var middlewares = index_1.loggers(app, "dev", true);
        aiLogMiddleware = middlewares.logRequest;
        aiErrorMiddleware = middlewares.logErrors;
    });
    it('should call trackException with correct request information', function (done) {
        aiLogMiddleware(request, response, function (error) {
            error = new Error("Test");
            aiErrorMiddleware(error, request, response, function (err) {
                chai.assert.isDefined(err);
                chai.assert(ai.defaultClient.trackException.calledWithExactly({
                    exception: error,
                    properties: {
                        requestId: response.locals.requestId,
                        message: '',
                        url: request.url
                    }
                }));
                done();
            });
        });
    });
    afterEach(function () {
        ai.defaultClient.trackRequest.restore();
        ai.defaultClient.trackException.restore();
    });
});
//# sourceMappingURL=index.js.map