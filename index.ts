import * as appInsights from 'applicationinsights';
import * as express from 'express';

export default (app: express.Application, instrumentationKey: string) => {
    appInsights.setup(instrumentationKey).start();

    app.locals.log = appInsights.client;

    return {
        logErrors: (err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
            appInsights.client.trackException(err, {
                url: req.url
            });
            next(err);
        },
        logRequest: (req: express.Request, res: express.Response, next: express.NextFunction) => {
            res.locals.log = appInsights.client;
            appInsights.client.trackRequest(req, res);
            next();
        },
        traceInfo: (message: string, properties?: {[key: string]: string}) => {
            appInsights.client.trackTrace(message, ContractsModule.SeverityLevel.Information, properties);
        },
        traceError: (error: Error, message: string, properties?: {[key: string]: string}) => {
            appInsights.client.trackException(error, Object.assign({}, { message: message }, properties));
        },
        traceWarning: (message: string, properties?: {[key: string]: string}) => {
            appInsights.client.trackTrace(message, ContractsModule.SeverityLevel.Warning, properties);
        },
        trackEvent: (name: string, properties?: {[key: string]: string}) => {
            appInsights.client.trackEvent(name, properties);
        }
    }
};