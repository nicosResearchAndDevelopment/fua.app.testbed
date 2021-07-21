const
    id         = "/windows-ping#",
    version    = "0-0-1",
    SubProcess = require('../../../../../src/code/SubProcess.js')
; // const

async function fn_ping(param) {
    const
        result = {},
        output = await SubProcess.execute('ping', {'n': 1}, param.address),
        parts  = output.split('\n\n');

    // TODO refine the result
    result.info      = parts[0];
    result.statistic = parts[1] || null;

    console.log(result);
    return result;
}

Object.defineProperties(fn_ping, {
    'fno:name':       {value: "ping"},
    'fno:solves':     {value: `${id}problem`},
    'fno:implements': {value: `${id}algorithm`},
    'fno:output':     {value: `${id}output`},
    'version':        {value: version}
});

module.exports = fn_ping;