const
    util               = require('@nrd/fua.core.util'),
    {ExecutionProcess} = require('@nrd/fua.module.subprocess'),
    //
    id                 = "/windows-ping#",
    version            = "0-0-2",
    cmd_ping           = ExecutionProcess('ping', {encoding: 'cp437'})
; // const

function _parser_(message, search) {
    let result = false;
    result     = (message.indexOf(search) > -1);
    return result;
}

async function fn_ping(param) {
    const
        result  = {
            timestamp: util.utcDateTime(),
            isAlive:   false
        },
        output  = await cmd_ping({'n': 1}, param.host),
        //parts  = output.split('\n\n');
        parts   = output.split(/\r?\n\r?\n/)
    ;
    let
        isAlive = false
    ;

    //let isAlive = _parser_(output, "Empfangen = 1");
    // TODO refine the result

    result.info      = parts[0];
    result.statistic = parts[1] || null;

    if (result.statistic !== null)
        isAlive = true;

    result.isAlive = isAlive;

    return result;
}

Object.defineProperties(fn_ping, {
    id:       {value: id},
    _parser_: {value: _parser_}
});

module.exports = fn_ping;
