import * as express from 'express';
import { TelemetryClient } from 'applicationinsights';
require('es6-shim');

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

    constructor(private ai: TelemetryClient) { }

    traceInfo(message: string, properties?: {[key: string]: string}) {
        this.ai.trackTrace({ message, severity: 1, properties});
    }
    traceError(error: Error, message: string, properties?: {[key: string]: string}) {
        this.ai.trackException({ exception: error, properties: { ...properties, message } });
    }
    traceWarning(message: string, properties?: {[key: string]: string}) {
        this.ai.trackTrace({ message, severity: 2, properties });
    }
    traceVerbose(message: string, properties?: {[key: string]: string}) {
        this.ai.trackTrace({ message, severity: 0, properties });
    }
    traceCritical(message: string, properties?: {[key: string]: string}) {
        this.ai.trackTrace({ message, severity: 4, properties });
    }
    trackEvent(name: string, properties?: {[key: string]: string}) {
        this.ai.trackEvent({ name, properties });
    }
    trackMetric(name: string, value: number) {
        this.ai.trackMetric({ name, value});
    }
    trackRequest(req: express.Request, res: express.Response, properties?: {[key: string]: string}) {
        this.ai.trackRequest({ 
            name: `${req.method} ${req.path}`,
            url: req.url,
            duration: parseInt(res.get('X-Response-Time'), 10),
            source: req.ip,
            resultCode: (res.statusCode || 200).toString(),
            success: true,
            properties
        });
    }
}