const
    path                 = require('path'),
    fs                   = require('fs/promises'),
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

    // TODO temporary, remove factory/cache
    let factory = null, cache = new Map();

    app.get('/browse/questionnaire/questionnaire', async function (request, response, next) {
        try {
            const contentType = request.accepts(rdf.contentTypes);
            if (!contentType) return next();
            if (cache.has(contentType)) {
                const result = cache.get(contentType);
                util.logText('Loaded questionnaire');
                response.type(contentType).send(result);
            } else {
                const
                    questionnaire = await agent.getQuestionnaire(),
                    result        = await rdf.serializeDataset(questionnaire, contentType);
                if (!factory) factory = questionnaire.factory; // TODO temporary, remove factory/cache
                cache.set(contentType, result);
                util.logText('Loaded questionnaire');
                response.type(contentType).send(result);
            }
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

            const
                answersTTL  = await rdf.serializeDataset(answers, 'text/turtle'),
                answerSheet = answers.match(
                    null,
                    factory.namedNode('rdf:type'),
                    factory.namedNode('ids3cm:CheckListAnswerSheet')
                ).subjects().next().value || null;

            util.logText('Submitted answers:\n' + answersTTL);

            if (answerSheet) {
                const [match, id] = /questionnaire\/(\w+)/.exec(answerSheet.value) || [];
                if (match) await fs.writeFile(path.join(__dirname, '../data/questionnaire/answers', id + '.ttl'), answersTTL)
            }

            response.sendStatus(200);
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
