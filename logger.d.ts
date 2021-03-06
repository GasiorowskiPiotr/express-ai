/// <reference types="express" />
import * as express from 'express';
import { TelemetryClient } from 'applicationinsights';
export interface ILogger {
    traceInfo(message: string, properties?: {
        [key: string]: string;
    }): void;
    traceError(error: Error, message: string, properties?: {
        [key: string]: string;
    }): void;
    traceWarning(message: string, properties?: {
        [key: string]: string;
    }): void;
    traceVerbose(message: string, properties?: {
        [key: string]: string;
    }): void;
    traceCritical(message: string, properties?: {
        [key: string]: string;
    }): any;
    trackEvent(name: string, properties?: {
        [key: string]: string;
    }): void;
    trackMetric(name: string, value: number): void;
    trackRequest(req: express.Request, res: express.Response): void;
}
export declare class Logger implements ILogger {
    private ai;
    constructor(ai: TelemetryClient);
    traceInfo(message: string, properties?: {
        [key: string]: string;
    }): void;
    traceError(error: Error, message: string, properties?: {
        [key: string]: string;
    }): void;
    traceWarning(message: string, properties?: {
        [key: string]: string;
    }): void;
    traceVerbose(message: string, properties?: {
        [key: string]: string;
    }): void;
    traceCritical(message: string, properties?: {
        [key: string]: string;
    }): void;
    trackEvent(name: string, properties?: {
        [key: string]: string;
    }): void;
    trackMetric(name: string, value: number): void;
    trackRequest(req: express.Request, res: express.Response, properties?: {
        [key: string]: string;
    }): void;
}
