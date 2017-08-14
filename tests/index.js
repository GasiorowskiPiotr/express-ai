"use strict";
exports.__esModule = true;
var ai = require("applicationinsights");
var logger_1 = require("../logger");
var sinon = require("sinon");
var chai = require("chai");
var httpMocks = require("node-mocks-http");
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
        logger = new logger_1.Logger(ai.client);
        message = "Test";
        params = {
            a: "1",
            b: "TTT"
        };
        error = new Error("Test");
        metric = 123;
        request = {
            url: '/'
        };
        response = {
            statusCode: 200
        };
        sinon.spy(ai.client, 'trackTrace');
        sinon.spy(ai.client, 'trackException');
        sinon.spy(ai.client, 'trackEvent');
        sinon.spy(ai.client, 'trackMetric');
        sinon.spy(ai.client, 'trackRequest');
    });
    after(function () {
        ai.client.trackTrace.restore();
        ai.client.trackException.restore();
        ai.client.trackEvent.restore();
        ai.client.trackMetric.restore();
        ai.client.trackRequest.restore();
    });
    it('should call traceInfo on AI with proper parameters', function () {
        logger.traceInfo(message, params);
        chai.assert(ai.client.trackTrace.calledWithExactly(message, 1, params));
    });
    it('should call traceError on AI with proper parameters', function () {
        logger.traceError(error, message, params);
        chai.assert(ai.client.trackException.calledWithExactly(error, Object.assign({}, { message: message }, params)));
    });
    it('should call traceWarning on AI with proper parameters', function () {
        logger.traceWarning(message, params);
        chai.assert(ai.client.trackTrace.calledWithExactly(message, 2, params));
    });
    it('should call traceVerbose on AI with proper parameters', function () {
        logger.traceVerbose(message, params);
        chai.assert(ai.client.trackTrace.calledWithExactly(message, 0, params));
    });
    it('should call traceCritical on AI with proper parameters', function () {
        logger.traceCritical(message, params);
        chai.assert(ai.client.trackTrace.calledWithExactly(message, 4, params));
    });
    it('should call trackEvent on AI with proper parameters', function () {
        logger.trackEvent(message, params);
        chai.assert(ai.client.trackEvent.calledWithExactly(message, params));
    });
    it('should call trackMetric on AI with proper parameters', function () {
        logger.trackMetric(message, metric);
        chai.assert(ai.client.trackMetric.calledWithExactly(message, metric));
    });
    it('should call trackRequest on AI with proper parameters', function () {
        logger.trackRequest(request, response, params);
        chai.assert(ai.client.trackRequest.calledWithExactly(request, response, params));
    });
});
describe('Creating a middleware', function () {
    var request = {};
    var response = {};
    var app = {
        locals: {}
    };
    beforeEach(function (done) {
        request = httpMocks.createRequest({
            method: 'GET',
            url: '/',
            query: {
                test: '1'
            }
        });
        response = httpMocks.createResponse();
        sinon.spy(ai, 'setup');
        sinon.spy(ai, 'start');
        index_1.loggers(app, "dev", true);
        done();
    });
    it('should start AI', function () {
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
        request = httpMocks.createRequest({
            method: 'GET',
            url: '/',
            query: {
                test: '1'
            }
        });
        response = httpMocks.createResponse();
        response = Object.assign({}, response, { locals: {} });
        ai.setup("DEV").start();
        sinon.spy(ai.client, 'trackRequest');
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
            chai.assert(ai.client.trackRequest.calledWithExactly(request, response, {
                requestId: response.locals.requestId
            }));
            done();
        });
    });
    afterEach(function () {
        ai.client.trackRequest.restore();
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
        request = httpMocks.createRequest({
            method: 'GET',
            url: '/',
            query: {
                test: '1'
            }
        });
        response = httpMocks.createResponse();
        response = Object.assign({}, response, { locals: {} });
        ai.setup("DEV").start();
        sinon.spy(ai.client, 'trackRequest');
        sinon.spy(ai.client, 'trackException');
        var middlewares = index_1.loggers(app, "dev", true);
        aiLogMiddleware = middlewares.logRequest;
        aiErrorMiddleware = middlewares.logErrors;
    });
    it('should call trackException with correct request information', function (done) {
        aiLogMiddleware(request, response, function (error) {
            error = new Error("Test");
            aiErrorMiddleware(error, request, response, function (err) {
                chai.assert.isDefined(err);
                chai.assert(ai.client.trackException.calledWithExactly(error, {
                    requestId: response.locals.requestId,
                    message: '',
                    url: request.url
                }));
                done();
            });
        });
    });
    afterEach(function () {
        ai.client.trackRequest.restore();
        ai.client.trackException.restore();
    });
});
//# sourceMappingURL=index.js.map