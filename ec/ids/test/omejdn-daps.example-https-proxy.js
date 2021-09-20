const
    http   = require('http'),
    https  = require('https'),
    certs  = require('../resources/cert'),
    config = {
        proxy_port:   8081,
        service_host: 'localhost',
        service_port: 4567
    };

https.createServer({
    key:  certs.daps.private,
    cert: certs.daps.cert
}, function (clientRequest, clientResponse) {
    logRequest(clientRequest);
    const serviceRequest = http.request({
        hostname: config.service_host,
        port:     config.service_port,
        path:     clientRequest.url,
        method:   clientRequest.method,
        headers:  clientRequest.headers
    }, function (serviceResponse) {
        logResponse(serviceResponse);
        clientResponse.writeHead(serviceResponse.statusCode, serviceResponse.headers);
        serviceResponse.pipe(clientResponse, {end: true});
    });
    clientRequest.pipe(serviceRequest, {end: true});
}).listen(config.proxy_port, function () {
    console.log('listening on port ' + config.proxy_port);
});

function logRequest(request) {
    const rows = [];
    rows.push(`${request.method} ${request.url} HTTP/1.1`);
    for (let [key, value] of Object.entries(request.headers)) {
        rows.push(`${key}: ${value}`);
    }
    console.log('\n' + rows.join('\n'));
}

function logResponse(response) {
    const rows = [];
    rows.push(`HTTP/1.1 ${response.statusCode} ${response.statusMessage}`);
    for (let [key, value] of Object.entries(response.headers)) {
        rows.push(`${key}: ${value}`);
    }
    console.log('\n' + rows.join('\n'));
}
