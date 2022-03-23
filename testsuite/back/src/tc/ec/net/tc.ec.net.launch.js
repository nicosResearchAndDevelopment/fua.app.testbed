const
    util = require('@nrd/fua.core.util'),
    uuid = require('@nrd/fua.core.uuid'),
    //
    PASS = "PASS",
    FAIL = "FAIL"
; // const

module.exports = ({
                      root_uri:    root_uri,
                      root_urn:    root_urn = "urn:ts:",
                      agent:       agent,
                      console_log: console_log = false
                  }) => {
    const
        tc_root_urn = `${root_urn}ec:net:tc:`,
        tc_root_uri = `${root_uri}ec/net/tc/`,
        criterion   = require(`./tc.ec.net.criterion`)({
            root_uri: `${tc_root_uri}criterion/`,
            root_urn: `${tc_root_urn}criterion:`
        })
    ;
    let
        carry       = {}
    ;

    function wrapper({

                         tc_root_uri: tc_root_uri,
                         tc_root_urn: tc_root_urn,
                         agent:       agent,
                         criterion:   criterion,
                         fn:          fn,
                         console_log: console_log = false
                     }) {
        const
            _fn_ = fn({
                tc_root_uri: tc_root_uri,
                tc_root_urn: tc_root_urn,
                agent:       agent,
                criterion:   criterion,
                console_log: console_log
            })
        ;

        return async (token, data, session) => {
            let result = await _fn_(token, data);
            if (session) {
                let node = {
                    testcase: _fn_.name,
                    token:    result.token,
                    data:     result.data
                };
                if (result.error)
                    node.error = {
                        id:        result.error.id,
                        timestamp: result.error.timestamp,
                        code:      result.error.code,
                        prov:      result.error.prov,
                        message:   result.error.message
                    };
                await session.write(node);
            } // if ()
            if (result.error)
                throw(result.error);
            return result;
        };
    } // function wrapper()

    // REM : ONLY functions are iterable!!!
    Object.defineProperties(carry, {
        id:        {value: tc_root_uri, enumerable: /** REM : !!!!!!!!!!!!!!! */ false},
        criterion: {value: criterion, enumerable: false},
        ping:      {
            value:          wrapper({
                tc_root_uri: tc_root_uri,
                tc_root_urn: tc_root_urn,
                agent:       agent,
                criterion:   criterion,
                fn:          require(`./tc/tc.ec.net.ping.js`),
                console_log: console_log
            }), enumerable: false
        }, // ping
        portscan:  {
            value:          wrapper({
                tc_root_uri: tc_root_uri,
                tc_root_urn: tc_root_urn,
                agent:       agent,
                criterion:   criterion,
                fn:          require(`./tc/tc.ec.net.portscan.js`),
                console_log: console_log
            }), enumerable: false
        } // portscan
    }); // Object.defineProperties(carry)

    Object.freeze(carry);
    return carry;
};

// EOF