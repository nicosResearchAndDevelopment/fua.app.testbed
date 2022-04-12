const
    path             = require('path'),
    util             = require('./util.testsuite.js'),
    ServerAgent      = require('@nrd/fua.agent.server'),
    socket_io_client = require('socket.io-client');

class TestsuiteAgent extends ServerAgent {

    // TODO

} // TestsuiteAgent

module.exports = TestsuiteAgent;
