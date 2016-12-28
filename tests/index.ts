import * as ai from 'applicationinsights';
import { Logger } from '../logger';
import { Request, Response, Application } from 'express';

import * as sinon from 'sinon';
import * as chai from 'chai';
import * as sinonChai from 'sinon-chai';

import * as httpMocks from 'node-mocks-http';

import {loggers} from '../index';

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
        logger = new Logger(ai.client);
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

    after(() => {
        (<any>ai.client.trackTrace).restore();
        (<any>ai.client.trackException).restore();
        (<any>ai.client.trackEvent).restore();
        (<any>ai.client.trackMetric).restore();
        (<any>ai.client.trackRequest).restore();
    });

    it('should call traceInfo on AI with proper parameters', () => {
        logger.traceInfo(message, params);

        chai.assert((<any>ai.client.trackTrace).calledWithExactly(message, 1, params));
    });

    it('should call traceError on AI with proper parameters', () => {
        logger.traceError(error, message, params);

        chai.assert((<any>ai.client.trackException).calledWithExactly(error, Object.assign({}, { message: message }, params)));
    });

    it('should call traceWarning on AI with proper parameters', () => {
        logger.traceWarning(message, params);

        chai.assert((<any>ai.client.trackTrace).calledWithExactly(message, 2, params));
    });

    it('should call traceVerbose on AI with proper parameters', () => {
        logger.traceVerbose(message, params);

        chai.assert((<any>ai.client.trackTrace).calledWithExactly(message, 0, params));
    });

    it('should call traceCritical on AI with proper parameters', () => {
        logger.traceCritical(message, params);

        chai.assert((<any>ai.client.trackTrace).calledWithExactly(message, 4, params));
    });

    it('should call trackEvent on AI with proper parameters', () => {
        logger.trackEvent(message, params);

        chai.assert((<any>ai.client.trackEvent).calledWithExactly(message, params));
    });

    it('should call trackMetric on AI with proper parameters', () => {
        logger.trackMetric(message, metric);

        chai.assert((<any>ai.client.trackMetric).calledWithExactly(message, metric));
    });

    it('should call trackRequest on AI with proper parameters', () => {
        logger.trackRequest(<Request>request, <Response>response, params);

        chai.assert((<any>ai.client.trackRequest).calledWithExactly(request, response, params));
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

        request = httpMocks.createRequest({
            method: 'GET',
            url: '/',
            query: {
                test: 1
            }
        });

        response = httpMocks.createResponse();

        sinon.spy(ai, 'setup');
        sinon.spy(ai, 'start');

        loggers(<Application>app, "dev", true);

        done();
    });

    it('should start AI', () => {
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
            request = httpMocks.createRequest({
                method: 'GET',
                url: '/',
                query: {
                    test: 1
                }
            });

            response = httpMocks.createResponse();
            response = Object.assign({}, response, { locals: {} });

            ai.setup("DEV").start();

            sinon.spy(ai.client, 'trackRequest');

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
                chai.assert((<any>ai.client.trackRequest).calledWithExactly(request, response, {
                    requestId: response.locals.requestId
                }));

                done();
            });
        });

        afterEach(() => {
            (<any>ai.client.trackRequest).restore();
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
        request = httpMocks.createRequest({
            method: 'GET',
            url: '/',
            query: {
                test: 1
            }
        });

        response = httpMocks.createResponse();
        response = Object.assign({}, response, { locals: {} });

        ai.setup("DEV").start();

        sinon.spy(ai.client, 'trackRequest');
        sinon.spy(ai.client, 'trackException');

        let middlewares = loggers(<Application>app, "dev", true);
        aiLogMiddleware = middlewares.logRequest;
        aiErrorMiddleware = middlewares.logErrors;
    });

    it('should call trackException with correct request information', (done) => {
        aiLogMiddleware(request, response, (error) => {
            error = new Error("Test");

            aiErrorMiddleware(error, request, response, (err) => {
                chai.assert.isDefined(err);
                chai.assert((<any>ai.client.trackException).calledWithExactly(error, {
                    requestId: response.locals.requestId,
                    message: '',
                    url: request.url
                }));

                done();
            });
        });
    });

    afterEach(() => {
        (<any>ai.client.trackRequest).restore();
        (<any>ai.client.trackException).restore();
    });

});