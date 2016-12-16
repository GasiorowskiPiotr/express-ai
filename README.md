# express-ai

The middleware for ExpressJS that enables developers to use Microsoft Azure Application Insights

## Installation

```
npm install express-ai@latest
```

## Usage

Express-AI logs the request information as well as the errors that happened during the handling of a request.

In order to use express-ai, you should do the following ( inside your `app.js` or wherever you apply middlewares ):

```
var ai = require('express-ai')(app, 'YOUR_INSTRUMENTATION_KEY');
...
app.use(ai.logRequest);
...
app.use(ai.logErrors);
```

This setup logs every request and every unhandled exception that happens during the processing of request.
In order to use custom logging inside of you route handler, you need to do the following:

```
res.locals.log.trackEvent('test', {
    val: 'my extra-important value',
    requestId: res.locals.requestId
  });
```

Keep in mind that `requestId` is not required, it is provided as a convenience to correlate logs for request.

## Custom Logging API

For custom logging purposes, the `res.locals.log` object exposes the following functions:

```
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
```

Be advised the above is the TypeScript (d.ts) declaration.

## Plans
1. Extend custom logging
2. Support custom metrics
3. API improvements
