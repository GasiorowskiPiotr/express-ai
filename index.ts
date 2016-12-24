import * as appInsights from 'applicationinsights';
import * as express from 'express';
import * as uuid from 'uuid';

interface ILogger {
    traceInfo(message: string, properties?: {[key: string]: string}): void;
    traceError(error: Error, message: string, properties?: {[key: string]: string}): void;
    traceWarning(message: string, properties?: {[key: string]: string}): void;
    traceVerbose(message: string, properties?: {[key: string]: string}): void;
    traceCritical(message: string, properties?: {[key: string]: string});

    trackEvent(name: string, properties?: {[key: string]: string}): void;
    trackMetric(name: string, value: number): void;
    trackRequest(req: express.Request, res: express.Response): void;
}

class Logger implements ILogger {

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
        this.ai.trackRequest(req, res)
    }
}

export = (app: express.Application, instrumentationKey: string, disableAutoCollect: boolean = true) => {
    var aiSetup = appInsights.setup(instrumentationKey);

    if(disableAutoCollect) {
        aiSetup = aiSetup
            .setAutoCollectRequests(false)
            .setAutoCollectExceptions(false)
    }
        
    aiSetup.start();

    const ai = appInsights.client;
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