const
    path                 = require('path'),
    util                 = require('./code/util.testsuite.js'),
    express              = require('express'),
    Middleware_LDP       = require('@nrd/fua.middleware.ldp'),
    Middleware_WEB       = require('@nrd/fua.middleware.web'),
    Middleware_WEB_login = require('@nrd/fua.middleware.web/login'),
    rdf                  = require('@nrd/fua.module.rdf'),
    {Dataset}            = require('@nrd/fua.module.persistence')
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

    // TODO temporary, remove factory
    let factory = null;

    app.get('/browse/questionnaire/questionnaire', async function (request, response, next) {
        try {
            const
                questionnaire = await agent.getQuestionnaire(),
                contentType   = request.accepts(rdf.contentTypes);
            if (!contentType) return next();
            factory      = questionnaire.factory; // TODO temporary, remove factory
            const result = await rdf.serializeDataset(questionnaire, contentType);
            util.logText('Loaded questionnaire');
            response.type(contentType).send(result);
        } catch (err) {
            util.logError(err);
            next(err);
        }
    });

    app.post('/browse/questionnaire/answers', async function (request, response, next) {
        try {
            const contentType = request.is(rdf.contentTypes);
            if (!contentType) return next();
            const
                answers    = new Dataset(null, factory), // TODO temporary, remove factory
                quadStream = rdf.parseStream(request, contentType, answers.factory);
            await answers.addStream(quadStream);
            // TODO do something with the answers
            util.logText('Submitted answers:\n' + await rdf.serializeDataset(answers, 'text/turtle'));
            response.sendStatus(200);
            // response.redirect('/browse/questionnaire');
        } catch (err) {
            util.logError(err);
            next(err);
        }
    });

    app.use('/browse', Middleware_WEB({
        lib: true,
        ext: true,
        res: {pattern: '/nicos-rd/*'}
    }));

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
    agent.on('event', (event) => {
        // util.logObject(event);
        io.to('terminal').emit('printData', {
            'prov': '[Testsuite]',
            'data': event
        });
    }); // agent.on('event')

    agent.on('error', (error) => {
        util.logError(error);
        io.to('terminal').emit('printError', {
            'prov':  '[Testsuite]',
            'error': '' + (error?.stack ?? error)
        });
    }); // agent.on('error')
    //endregion >> Testsuite

    app.get('/', (request, response) => response.redirect('/browse'));

    await agent.listen();
    util.logText(`testsuite app is listening at <${agent.url}>`);
    agent.once('closed', () => util.logText('testsuite app has closed'));

}; // module.exports = TestsuiteApp
