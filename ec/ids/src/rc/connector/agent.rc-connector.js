const
    util        = require('../../tb.ec.ids.util.js'),
    ServerAgent = require('@nrd/fua.agent.server');

class RCConnectorAgent extends ServerAgent {

    async initialize(options = {}) {
        await super.initialize(options);

        // TODO

        return this;
    } // RCConnectorAgent#initialize

} // RCConnectorAgent

module.exports = RCConnectorAgent;
