const
    http   = require('http'),
    https  = require('https'),
    //certs  = require('../resources/cert'),
    certs  = require('../../../cert/daps/tls-server/server.js'),
    config = {
        proxy_port:   8082,
        service_host: 'localhost',
        service_port: 4567
    };

// SEE https://stackoverflow.com/questions/20351637/how-to-create-a-simple-http-proxy-in-node-js
https.createServer({
    key:  certs.key,
    cert: certs.cert
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
