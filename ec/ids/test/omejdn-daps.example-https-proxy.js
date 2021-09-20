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
    const serviceRequest = http.request({
        hostname: config.service_host,
        port:     config.service_port,
        path:     clientRequest.url,
        method:   clientRequest.method,
        headers:  clientRequest.headers
    }, function (serviceResponse) {
        clientResponse.writeHead(serviceResponse.statusCode, serviceResponse.headers);
        serviceResponse.pipe(clientResponse, {end: true});
    });
    clientRequest.pipe(serviceRequest, {end: true});
}).listen(config.proxy_port, function () {
    console.log('listening');
});
