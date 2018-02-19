import * as appInsights from 'applicationinsights';
import * as express from 'express';
import * as uuid from 'uuid';
import { Logger } from './logger';
require('es6-shim');

export const loggers = (app: express.Application, instrumentationKey: string, disableAutoCollect: boolean = false) => {
    var aiSetup = appInsights.setup(instrumentationKey);

    if(disableAutoCollect) {
        aiSetup = aiSetup
            .setAutoCollectPerformance(false)
            .setAutoCollectConsole(false)
            .setAutoCollectRequests(false)
            .setAutoCollectExceptions(false);
    }
        
    aiSetup.start();

    const ai = appInsights.defaultClient;
    const logger = new Logger(ai);

    app.locals.log = logger;

    return {
        logErrors: (err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
            logger.traceError(err, '', {
                url: req.url,
                requestId: res.locals.requestId
            });
            next(err);
        },
        logRequest: (req: express.Request, res: express.Response, next: express.NextFunction) => {
            res.locals.log = logger;
            res.locals.requestId = uuid.v4();

            logger.trackRequest(req, res, {
                requestId: res.locals.requestId
            });
            next();
        },
    }
};