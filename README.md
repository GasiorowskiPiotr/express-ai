[![Build Status](https://travis-ci.org/GasiorowskiPiotr/express-ai.svg?branch=master)](https://travis-ci.org/GasiorowskiPiotr/express-ai)
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
var ai = require('express-ai')(app, 'YOUR_INSTRUMENTATION_KEY', true);
...
app.use(ai.logRequest);
...
app.use(ai.logErrors);
```

This setup logs every request and every unhandled exception that happens during the processing of request.
The last parameter in the first line is disabline AI autocollection feature.
In order to use custom logging inside of you route handler, you need to do the following:

```
res.locals.log.trackEvent('test', {
    val: 'my extra-important value',
    requestId: res.locals.requestId
  });
```

Keep in mind that `requestId` is not required, it is provided as a convenience to correlate logs for request.

Logging can also be done outside the context of HTTP Request. In that case please use the `app.locals.log` object, as in the following examples:

```
var app = require('../app');
...
var server = http.createServer(app);
...
server.on('error', onError);
server.on('listening', onListening);

function onError(error) {

  app.locals.log.traceError(error, 'Error while starting application');
  ...
}

function onListening() {
  var addr = server.address();
  var bind = typeof addr === 'string'
    ? 'pipe ' + addr
    : 'port ' + addr.port;
  app.locals.log.traceInfo('Listening started', { port: bind});
}
```

## Custom Logging API

For custom logging purposes, the `res.locals.log` object exposes the following functions:

```
traceInfo(message: string, properties?: {[key: string]: string}): void;
traceError(error: Error, message: string, properties?: {[key: string]: string}): void;
traceWarning(message: string, properties?: {[key: string]: string}): void;
traceVerbose(message: string, properties?: {[key: string]: string}): void;
traceCritical(message: string, properties?: {[key: string]: string});

trackEvent(name: string, properties?: {[key: string]: string}): void;
trackMetric(name: string, value: number): void;
trackRequest(req: express.Request, res: express.Response): void
```

## Plans
1. ~~Extend custom logging~~ (done as of 0.2.X)
2. ~~Support custom metrics~~ (done as of 0.2.X)
3. ~~Handle non-request related events (start of application / stop / crash)~~ (done as of 0.2.X)
4. ~~Tests with AppService~~ (it powers my blog - [blog.developin.cloud](http://blog.developin.cloud), some already found, as of 0.2.4 )
5. (Further) API improvements
