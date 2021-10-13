const
    util = require('@nrd/fua.core.util'),
    uuid = require('@nrd/fua.core.uuid'),
    //
    PASS = "PASS",
    FAIL = "FAIL"
; // const

module.exports = ({
                      root_uri = root_uri,
                      agent
                  }) => {
    const
        tc_root_urn = `urn:ts:ec:ids:tc:`,
        tc_root_uri = `${root_uri}ec/ids/tc/`
    ;
    let
        carry       = {}
    ;

    // REM : ONLY functions are iterable!!!
    Object.defineProperties(carry, {
        id:     {value: tc_root_uri, enumerable: /** REM : !!!!!!!!!!!!!!! */ false},
        INF_01: {
            value:          require(`./tc/tc.ec.ids.INF_01`)({
                tc_root_uri: tc_root_uri,
                tc_root_urn: tc_root_urn,
                agent:       agent
            }), enumerable: true
        } // portscan
    }); // Object.defineProperties(carry)

    Object.freeze(carry);
    return carry;
}

// EOF