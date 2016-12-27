import * as ai from 'applicationinsights';
import { Logger } from '../logger';
import { Request, Response } from 'express';

import * as sinon from 'sinon';
import * as chai from 'chai';
import * as sinonChai from 'sinon-chai';

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
})