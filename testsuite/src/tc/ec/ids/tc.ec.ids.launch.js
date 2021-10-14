const
    util       = require('@nrd/fua.core.util'),
    uuid       = require('@nrd/fua.core.uuid'),
    //
    PASS       = "PASS",
    FAIL       = "FAIL"
; // const
module.exports = ({
                      root_uri = root_uri,
                      root_urn = root_urn = "urn:ts:",
                      agent
                  }) => {
    const
        tc_root_urn = `${root_urn}ec:ids:tc:`,
        tc_root_uri = `${root_uri}ec/ids/tc/`
    ;
    let
        carry       = {}
    ;

    function wrapper({
                         tc_root_uri: tc_root_uri,
                         tc_root_urn: tc_root_urn,
                         agent:       agent,
                         fn:          fn
                     }) {
        const
            _fn_ = fn({
                tc_root_uri: tc_root_uri,
                tc_root_urn: tc_root_urn,
                agent:       agent
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

    Object.defineProperties(carry, {
        id:     {value: tc_root_uri, enumerable: /** REM : !!!!!!!!!!!!!!! */ false},
        INF_01: {
            value:          wrapper({
                tc_root_uri: tc_root_uri,
                tc_root_urn: tc_root_urn,
                agent:       agent,
                fn:          require(`./tc/tc.ec.ids.INF_01`)
            }), enumerable: false
        } // INF_01
    }); // Object.defineProperties(carry)

    Object.freeze(carry);
    return carry;
};

// EOF