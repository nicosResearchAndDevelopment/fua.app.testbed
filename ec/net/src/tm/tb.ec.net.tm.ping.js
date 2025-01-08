const
    util               = require('../tb.ec.net.util.js'),
    testing            = require('@fua/module.testing'),
    {ExecutionProcess} = require('@fua/module.subprocess'),
    OS_WIN32           = util.OS_PLATFORM === 'win32',
    cmd_ping           = ExecutionProcess('ping', OS_WIN32 ? {encoding: 'cp437'} : {});

/** @type {fua.module.testing.TestMethod} */
module.exports = new testing.Method({
    '@id': 'urn:tb:ec:net:tm:ping',
    /** @param {fua.module.testing.TestToken} token */
    async executor(token) {
        try {
            const output           = await cmd_ping(OS_WIN32 ? {'n': 1} : {'c': 1}, token.param.host);
            const [info, statistic = null] = output.split(/\r?\n\r?\n/);
            return {
                timestamp:    util.utcDateTime(),
                info, statistic,
                isAlive:      !!statistic,
                pingSend:     true,
                pingReceived: !!statistic
            };
        } catch (err) {
            const [info, statistic = null] = err.message.split(/\r?\n\r?\n/);
            return {
                timestamp:    util.utcDateTime(),
                info, statistic,
                isAlive:      false,
                pingSend:     !!statistic,
                pingReceived: false
            };
        }
    }
});
