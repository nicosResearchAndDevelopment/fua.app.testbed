const
    path = require('path'),
    //
    util = require('@nrd/fua.core.util')
    //
    //{Self}   = require(path.join(util.FUA_JS_LIB, 'agent.Self/src/agent.Self.js')),
    //{Domain} = require(path.join(util.FUA_JS_LIB, 'agent.Domain/src/agent.Domain.js'))
;

//region error

class ErrorTestsuiteIdIsMissing extends Error {
    constructor(message) {
        super(`fua.agent.Testsuite: Testsuite :: ${message}`);
    }
}

//endregion error

function Testsuite({
                       'id':        id = undefined,
                       'testbed':   testbed = undefined,
                       'scheduler': scheduler = undefined,
                       'system':    system = undefined,
                       'domain':    domain = undefined
                   }) {

    let testsuite = {};

    if (new.target) {
        if (!id)
            throw new ErrorTestsuiteIdIsMissing(`id is missing on node.`)
        Object.defineProperties(testsuite, {
            'id':        {value: id, enumerable: true},
            'scheduler': {
                value: scheduler, enumerable: true
            },
            'testbed':   {
                value: testbed, enumerable: true
            }
        });
    } // if ()

    Object.freeze(testsuite);

    return testsuite;
} // Testsuite

Object.defineProperties(Testsuite, {
    'id': {value: "http://www.nicos-rd.com/fua/testbed#Testsuite", enumerable: true}
});

exports.Testsuite = Testsuite;