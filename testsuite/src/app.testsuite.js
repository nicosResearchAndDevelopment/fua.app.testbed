const
    path                       = require('path'),
    {CloudEvent, HTTP: ceHTTP} = require('cloudevents'),
    util                       = require('./code/util.testsuite.js'),
    express                    = require('express'),
    Middleware_LDP             = require('@nrd/fua.middleware.ldp'),
    Middleware_WEB             = require('@nrd/fua.middleware.web'),
    Middleware_WEB_login       = require('@nrd/fua.middleware.web/login')
; // const

module.exports = async function TestsuiteApp(
    {
        'config': config,
        'agent':  agent
    }
) {

    const
        app    = agent.app,
        server = agent.server,
        io     = agent.io;

    //region >> WebApp
    app.use('/browse', Middleware_WEB());
    app.use('/browse', express.static(path.join(__dirname, 'code/browse')));

    app.use('/data', Middleware_LDP({
        space:      agent.space,
        rootFolder: path.join(__dirname, '../data/resource'),
        baseIRI:    agent.uri.replace(/[/#]$/, '')
    }));

    io.on('connection', (socket) => {

        // REM uncomment to enable authentication
        //if (!socket.request.session.auth) {
        //    socket.emit('error', 'not authorized');
        //    socket.disconnect(true);
        //    return;
        //}

        socket.on('subscribe', ({room}) => {
            switch (room) {
                case 'terminal':
                    socket.emit('printMessage', {
                        'prov': '[Testsuite]',
                        'msg':  'Welcome to NRD-Testsuite!'
                    });
                    socket.join('terminal');
                    break;
            }
        });
    }); // io.on('connection')
    //endregion >> WebApp

    //region >> LDN
    app.post('/inbox', express.json(), (request, response, next) => {
        // TODO
        util.logObject(request.body)
        next();
    });
    //endregion >> LDN

    //region >> Testsuite
    agent.on('data', (data) => {
        util.logObject(data);
        const cloudEvent = new CloudEvent({
            // '@context':      'https://github.com/cloudevents/spec/blob/v1.0/spec.md',
            // specversion: '1.0',
            type:   [data.type, data.method, data.step].filter(val => val).join('.'),
            id:     data.id,
            source: data.prov || serverNode.id,
            time:   data.end || data.start
            // datacontenttype: 'application/json',
            // data:            data
        });
        io.to('terminal').emit('printData', {
            // 'prov': '[Testsuite]',
            'prov': '[CloudEvent]',
            'data': cloudEvent
        });
    }); // agent.on('event')

    agent.on('error', (error) => {
        if (error) {
            util.logError(error);
            io.to('terminal').emit('printError', {
                'prov':  '[Testsuite]',
                'error': '' + (error?.stack ?? error)
            });
        }
    }); // agent.on('error')
    //endregion >> Testsuite

    app.get('/', (request, response) => response.redirect('/browse'));
    await agent.listen();
    util.logText(`testsuite app is listening at <${agent.url}>`);

}; // module.exports = TestsuiteApp
