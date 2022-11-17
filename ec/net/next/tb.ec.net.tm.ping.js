const
    util               = require('./tb.ec.net.util.js'),
    {TestMethod}       = require('@nrd/fua.module.testing/model'),
    {ExecutionProcess} = require('@nrd/fua.module.subprocess'),
    cmd_ping           = ExecutionProcess('ping', {encoding: 'cp437'});

/** @type {fua.module.testing.TestMethod} */
module.exports = new TestMethod({
    '@id': 'urn:tb:ec:net:tm:ping',
    /** @param {fua.module.testing.TestToken} token */
    async executor(token) {
        const
            output = await cmd_ping({'n': 1}, token.param.host),
            parts  = output.split(/\r?\n\r?\n/);

        token.data.result = {
            timestamp: util.utcDateTime(),
            info:      parts[0],
            statistic: parts[1] || null,
            isAlive:   !!parts[1]
        };
    }
});
