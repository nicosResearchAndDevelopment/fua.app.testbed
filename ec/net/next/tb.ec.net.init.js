const
    util   = require('./tb.ec.net.util.js'),
    ec_net = require('./tb.ec.net.js');

module.exports = async function initializeNet(agent) {
    // TODO add to testbed agent

    ec_net.on('error', (error) => {
        util.logError(error);
        debugger;
    });
};
