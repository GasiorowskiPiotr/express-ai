import * as express from 'express';

export interface ILogger {
    traceInfo(message: string, properties?: {[key: string]: string}): void;
    traceError(error: Error, message: string, properties?: {[key: string]: string}): void;
    traceWarning(message: string, properties?: {[key: string]: string}): void;
    traceVerbose(message: string, properties?: {[key: string]: string}): void;
    traceCritical(message: string, properties?: {[key: string]: string});

    trackEvent(name: string, properties?: {[key: string]: string}): void;
    trackMetric(name: string, value: number): void;
    trackRequest(req: express.Request, res: express.Response): void;
}

export class Logger implements ILogger {

    constructor(private ai: Client) { }

    traceInfo(message: string, properties?: {[key: string]: string}) {
        this.ai.trackTrace(message, 1, properties);
    }
    traceError(error: Error, message: string, properties?: {[key: string]: string}) {
        this.ai.trackException(error, Object.assign({}, { message: message }, properties));
    }
    traceWarning(message: string, properties?: {[key: string]: string}) {
        this.ai.trackTrace(message, 2, properties);   
    }
    traceVerbose(message: string, properties?: {[key: string]: string}) {
        this.ai.trackTrace(message, 0, properties);   
    }
    traceCritical(message: string, properties?: {[key: string]: string}) {
        this.ai.trackTrace(message, 4, properties);   
    }
    trackEvent(name: string, properties?: {[key: string]: string}) {
        this.ai.trackEvent(name, properties);
    }
    trackMetric(name: string, value: number) {
        this.ai.trackMetric(name, value);
    }
    trackRequest(req: express.Request, res: express.Response, properties?: {[key: string]: string}) {
        this.ai.trackRequest(req, res, properties);
    }
}