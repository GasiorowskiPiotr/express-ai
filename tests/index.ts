import * as ai from 'applicationinsights';
import { Logger } from '../logger';
import { Request, Response, Application } from 'express';

import * as sinon from 'sinon';
import * as chai from 'chai';
import * as sinonChai from 'sinon-chai';
import { mockReq, mockRes } from 'sinon-express-mock'

import {loggers} from '../index';

require('es6-shim');

describe('Using Logger', () => {

    let logger: Logger;
    let message: string;
    let params: any;
    let error: Error;
    let metric: number; 
    let request: any;
    let response: any;

    before(() => {
        ai.setup("DEV").start();
        logger = new Logger(ai.defaultClient);
        message = "Test";
        params = {
            a: "1",
            b: "TTT"
        };
        error = new Error("Test");
        metric = 123;
        request = mockReq({ method: 'GET', path: '/', url: '/', ip: '127.0.0.1' });
        response = mockRes({ statusCode: 200 });

        sinon.spy(ai.defaultClient, 'trackTrace');
        sinon.spy(ai.defaultClient, 'trackException');
        sinon.spy(ai.defaultClient, 'trackEvent');
        sinon.spy(ai.defaultClient, 'trackMetric');
        sinon.spy(ai.defaultClient, 'trackRequest');
    });

    after(() => {
        (<any>ai.defaultClient.trackTrace).restore();
        (<any>ai.defaultClient.trackException).restore();
        (<any>ai.defaultClient.trackEvent).restore();
        (<any>ai.defaultClient.trackMetric).restore();
        (<any>ai.defaultClient.trackRequest).restore();
    });

    it('should call traceInfo on AI with proper parameters', () => {
        logger.traceInfo(message, params);

        chai.assert((<any>ai.defaultClient.trackTrace).calledWithExactly({ message, severity: 1, properties: params }));
    });

    it('should call traceError on AI with proper parameters', () => {
        logger.traceError(error, message, params);

        chai.assert((<any>ai.defaultClient.trackException).calledWithExactly({ exception: error, properties: Object.assign({}, params, { message: message }) }));
    });

    it('should call traceWarning on AI with proper parameters', () => {
        logger.traceWarning(message, params);

        chai.assert((<any>ai.defaultClient.trackTrace).calledWithExactly({ message, severity: 2, properties: params }));
    });

    it('should call traceVerbose on AI with proper parameters', () => {
        logger.traceVerbose(message, params);

        chai.assert((<any>ai.defaultClient.trackTrace).calledWithExactly({ message, severity: 0, properties: params }));
    });

    it('should call traceCritical on AI with proper parameters', () => {
        logger.traceCritical(message, params);

        chai.assert((<any>ai.defaultClient.trackTrace).calledWithExactly({ message, severity: 4, properties: params }));
    });

    it('should call trackEvent on AI with proper parameters', () => {
        logger.trackEvent(message, params);

        chai.assert((<any>ai.defaultClient.trackEvent).calledWithExactly({ name: message, properties: params }));
    });

    it('should call trackMetric on AI with proper parameters', () => {
        logger.trackMetric(message, metric);

        chai.assert((<any>ai.defaultClient.trackMetric).calledWithExactly({ name: message, value: metric }));
    });

    it('should call trackRequest on AI with proper parameters', () => {
        logger.trackRequest(<Request>request, <Response>response, params);

        chai.assert((<any>ai.defaultClient.trackRequest).calledWithExactly({ 
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

describe('Creating a middleware', () => {

    let request = {};
    let response = {};
    let app = {
        locals: {

        }
    }
    beforeEach((done) => {
        request = mockReq({ method: 'GET', path: '/', url: '/', ip: '127.0.0.1' });
        response = mockRes({ statusCode: 200 });

        sinon.spy(ai, 'setup');
        sinon.spy(ai, 'start');

        loggers(<Application>app, "dev", true);

        done();
    });

    it('should start AI', () => {
        console.log((<any>ai.start).calledOnce);
        chai.assert((<any>ai.setup).calledOnce);
        chai.assert((<any>ai.start).calledOnce);
    });

    it('should assign log to app.locals', () => {
        chai.assert.isDefined((<any>app.locals).log);
    });

    afterEach(() => {
        (<any>ai.setup).restore();
        (<any>ai.start).restore();
    });
});

describe('Using logRequest middleware', () => {
    
        let request;
        let response;
        let app = {
            locals: {

            }
        }

        let aiLogMiddleware;

        beforeEach(() => {
            request = mockReq({ method: 'GET', path: '/', url: '/', ip: '127.0.0.1' });
            response = mockRes({ statusCode: 200 });

            ai.setup("DEV").start();

            sinon.spy(ai.defaultClient, 'trackRequest');

            let middlewares = loggers(<Application>app, "dev", true);
            aiLogMiddleware = middlewares.logRequest;
        });

        it('should assign log to response.locals', (done) => {
            aiLogMiddleware(request, response, (err) => {

                chai.assert.isUndefined(err);
                chai.assert.isDefined(response.locals.log);

                done();
            });
        });

        it('should assign requestId', (done) => {
            aiLogMiddleware(request, response, (err) => {

                chai.assert.isUndefined(err);
                chai.assert.isDefined(response.locals.requestId);

                done();
            });
        });

        it('should call trackRequest', (done) => {
            aiLogMiddleware(request, response, (err) => {

                chai.assert.isUndefined(err);
                chai.assert((<any>ai.defaultClient.trackRequest).calledWithExactly({ 
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

        afterEach(() => {
            (<any>ai.defaultClient.trackRequest).restore();
        });
});

describe('Using logError middleware', () => {
    let request;
    let response;
    let app = {
        locals: {

        }
    }

    let aiLogMiddleware;
    let aiErrorMiddleware;

    beforeEach(() => {
        request = mockReq({ method: 'GET', path: '/', url: '/', ip: '127.0.0.1' });
        response = mockRes({ statusCode: 200 });

        ai.setup("DEV").start();

        sinon.spy(ai.defaultClient, 'trackRequest');
        sinon.spy(ai.defaultClient, 'trackException');

        let middlewares = loggers(<Application>app, "dev", true);
        aiLogMiddleware = middlewares.logRequest;
        aiErrorMiddleware = middlewares.logErrors;
    });

    it('should call trackException with correct request information', (done) => {
        aiLogMiddleware(request, response, (error) => {
            error = new Error("Test");

            aiErrorMiddleware(error, request, response, (err) => {
                chai.assert.isDefined(err);
                chai.assert((<any>ai.defaultClient.trackException).calledWithExactly({
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

    afterEach(() => {
        (<any>ai.defaultClient.trackRequest).restore();
        (<any>ai.defaultClient.trackException).restore();
    });

});