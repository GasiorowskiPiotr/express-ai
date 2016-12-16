/// <reference types="express" />
import * as express from 'express';
declare var _default: (app: express.Application, instrumentationKey: string) => {
    logErrors: (err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => void;
    logRequest: (req: express.Request, res: express.Response, next: express.NextFunction) => void;
    traceInfo: (message: string, properties?: {
        [key: string]: string;
    }) => void;
    traceError: (error: Error, message: string, properties?: {
        [key: string]: string;
    }) => void;
    traceWarning: (message: string, properties?: {
        [key: string]: string;
    }) => void;
    trackEvent: (name: string, properties?: {
        [key: string]: string;
    }) => void;
};
export = _default;
