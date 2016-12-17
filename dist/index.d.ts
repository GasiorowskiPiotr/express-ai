/// <reference types="express" />
import * as express from 'express';
declare var _default: (app: express.Application, instrumentationKey: string) => {
    logErrors: (err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => void;
    logRequest: (req: express.Request, res: express.Response, next: express.NextFunction) => void;
};
export = _default;
