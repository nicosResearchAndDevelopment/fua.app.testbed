const
    util               = require('../tb.ec.net.util.js'),
    testing            = require('@nrd/fua.module.testing'),
    {ExecutionProcess} = require('@nrd/fua.module.subprocess'),
    OS_WIN32           = util.OS_PLATFORM === 'win32',
    cmd_nmap           = ExecutionProcess('nmap', OS_WIN32 ? {encoding: 'cp437'} : {});

/** @type {fua.module.testing.TestMethod} */
module.exports = new testing.Method({
    '@id': 'urn:tb:ec:net:tm:portscan',
    /** @param {fua.module.testing.TestToken} token */
    async executor(token) {
        const
            output       = await cmd_nmap(token.param.host),
            [tableMatch] = output.replace(/\r/g, '').match(/PORT.*?(?=\n\n|$)/s) || [''],
            tableRows    = tableMatch.split('\n'),
            tableHeader  = tableRows.shift(),
            tableFields  = tableHeader.split(/\s+/g).map(value => value.toLowerCase()),
            tableEntries = tableRows.map(row => Object.fromEntries(row.split(/\s+/g).map((value, index) => [tableFields[index], value])));

        return {
            timestamp: util.utcDateTime(),
            entries:   tableEntries
        };
    }
});
