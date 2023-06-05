const
    util               = require('../tb.ec.net.util.js'),
    testing            = require('@nrd/fua.module.testing'),
    {ExecutionProcess} = require('@nrd/fua.module.subprocess'),
    cmd_nmap           = ExecutionProcess('nmap', {encoding: 'cp437'});

/** @type {fua.module.testing.TestMethod} */
module.exports = new testing.Method({
    '@id': 'urn:tb:ec:net:tm:portscan',
    /** @param {fua.module.testing.TestToken} token */
    async executor(token) {
        const
            output = await cmd_nmap({'n': 1}, token.param.host),
            parts  = output.split(/\r?\n\r?\n/);

        util.assertTodo();

        return {
            timestamp: util.utcDateTime()
            // TODO
        };
    }
});
