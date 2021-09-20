const
    http    = require('http'),
    express = require('express'),
    config  = {
        inbox_port: 8080
    };

(async function Main() {

    const
        app    = express(),
        server = http.createServer(app);

    app.use(express.json());
    app.use(express.urlencoded({extended: false}));

    app.use(function (request, response) {
        logRequest(request);
        response.end();
    });

    await new Promise(resolve => server.listen(config.inbox_port, resolve));
    console.log('listening on port ' + config.inbox_port);

})().catch(console.error);

function logRequest(request) {
    const rows = [];
    rows.push(`${request.method} ${request.url} HTTP/1.1`);
    for (let [key, value] of Object.entries(request.headers)) {
        rows.push(`${key}: ${value}`);
    }
    console.log('\n' + rows.join('\n'));
}
