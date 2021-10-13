const
    util               = require('@nrd/fua.core.util'),
    {ExecutionProcess} = require('@nrd/fua.module.subprocess'),
    //
    id                 = "/nmap#",
    version            = "0-0-2",
    cmd_nmap           = ExecutionProcess('nmap', {encoding: 'cp437'})
; // const

function _parser_(message, search) {
    let result = false;
    result     = (message.indexOf(search) > -1);
    return result;
}

async function fn_portscan(param) {
    const
        result = {
            timestamp:         util.timestamp(),
            operationalResult: {}
        },
        output = await cmd_nmap({'n': 1}, param.host),
        parts  = output.split(/\r?\n\r?\n/)
    ;
    let lines = parts[1].split(/\r\n/);
    lines.shift(); // REM : drop header
    for (const line of lines) {
        console.log(line);
        let line_         = line.replace(/\s+/g, ' ');
        line_             = line_.split(' ');
        let port_protocol = line_[0].split('/');
        if (!result.operationalResult[port_protocol[1]])
            result.operationalResult[port_protocol[1]] = {};
        result.operationalResult[port_protocol[1]][port_protocol[0]] = {};
        if (line_[1] !== "unknown")
            result.operationalResult[port_protocol[1]][port_protocol[0]].state = line_[1];
        if (line_[2] !== "unknown")
            result.operationalResult[port_protocol[1]][port_protocol[0]].service = line_[2];
    } // for

    return result;
}

Object.defineProperties(fn_portscan, {
    id:       {value: id},
    _parser_: {value: _parser_}
});

module.exports = fn_portscan;
