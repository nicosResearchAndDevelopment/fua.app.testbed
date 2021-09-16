const
    http    = require('http'),
    express = require('express');

(async function Main() {

    const
        app    = express(),
        server = http.createServer(app);

    app.use(express.json());
    app.use(express.urlencoded({extended: false}));

    app.use('/inbox', function (request, response) {
        // console.log(request.body);
        response.end();
    });

    app.use('/test', function (request, response) {
        console.log(request.headers);
        response.end();
    });

    await new Promise(resolve => server.listen(8080, resolve));
    console.log('listening');

})().catch(console.error);
