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
    //let _parts = parts[1].split(/\r\n/);
    for (const line of parts[1].split(/\r\n/)) {
        console.log(line);
        let line_ = line.replace(/   /g, ' ');
        line_     = line_.replace(/ /g, ' ');
        line_ = line_.split(' ');
        result.operationalResult[line_[0]] = {state: line_[1], service: line_[2]};
    } // for

    return result;
}

Object.defineProperties(fn_portscan, {
    id:       {value: id},
    _parser_: {value: _parser_}
});

module.exports = fn_portscan;
