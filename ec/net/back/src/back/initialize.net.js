const
    util         = require('../../../src/code/util.testbed.js'),
    TestbedAgent = require('../../../src/code/agent.testbed.js'),
    EC_net       = require('./tb.ec.net.js'),
    EC_NAME      = 'net';

module.exports = async function initializeNet(
    {
        'agent': agent
    } = {}
) {
    util.assert(agent instanceof TestbedAgent, 'expected agent to be a TestbedAgent');
    util.assert(!agent.ecosystems[EC_NAME], 'expected ecosystem ' + EC_NAME + ' not to be initialized already');

    agent.ecosystems[EC_NAME] = 'initializing';

    const ec_net = EC_net.net;

    ec_net.uri = `${agent.uri}ec/net/`;

    // TODO the (error, result) pattern should only be used in acknowledge callbacks, not in events
    ec_net.on('event', (error, data) => {
        if (error) util.logError(error);
        else util.logObject(data);
        // agent.emit('event', error, data);
        debugger;
    });
    ec_net.on('error', (error) => {
        util.logError(error);
        // agent.emit('error', error);
        debugger;
    });

    agent.ecosystems[EC_NAME] = Object.freeze(ec_net);
    util.lockProp(agent.ecosystems, EC_NAME);
    return ec_net;
}; // module.exports = async function initializeNet
