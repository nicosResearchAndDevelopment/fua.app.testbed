const
    util       = require('@nrd/fua.core.util'),
    uuid       = require('@nrd/fua.core.uuid'),
    //
    PASS       = "PASS",
    FAIL       = "FAIL"
; // const
module.exports = ({
                      root_uri = root_uri,
                      agent
                  }) => {
    const
        tc_root_urn = `urn:ts:ec:net:tc:`,
        tc_root_uri = `${root_uri}ec/net/tc/`
    ;
    let
        carry       = {}
    ;

    // REM : ONLY functions are iterable!!!
    Object.defineProperties(carry, {
        id: {value: tc_root_uri, enumerable: /** REM : !!!!!!!!!!!!!!! */ false},
        ping: {
            value:          require(`./tc/tc.ec.net.ping`)({
                tc_root_uri: tc_root_uri,
                tc_root_urn: tc_root_urn,
                agent:       agent
            }), enumerable: true
        }, // ping
        portscan: {
            value:          require(`./tc/tc.ec.net.portscan`)({
                tc_root_uri: tc_root_uri,
                tc_root_urn: tc_root_urn,
                agent:       agent
            }), enumerable: true
        } // portscan
    }); // Object.defineProperties(carry)

    Object.freeze(carry);
    return carry;
};

// EOF