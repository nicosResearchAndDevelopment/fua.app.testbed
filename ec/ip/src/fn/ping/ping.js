const
    id                 = "/windows-ping#",
    version            = "0-0-2",
    {ExecutionProcess} = require('@nrd/fua.module.subprocess'),
    cmd_ping           = ExecutionProcess('ping', {encoding: 'cp437'})
; // const

async function fn_ping(param) {
    const
        result = {
            isAlive: false
        },
        output = await cmd_ping({'n': 1}, param.host),
        parts  = output.split('\n\n');

    // TODO refine the result

    result.info      = parts[0];
    result.statistic = parts[1] || null;

    if (result.statistic !== null)
        result.isAlive = true;

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
