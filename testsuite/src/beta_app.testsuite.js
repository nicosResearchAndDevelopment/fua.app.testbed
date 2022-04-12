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

    // TODO

}; // module.exports = TestsuiteApp
