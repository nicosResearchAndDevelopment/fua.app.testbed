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
        tc_root_urn = `urn:ids:`,
        tc_root_uri = `${root_uri}tc/ec/ids/`
    ;
    let
        carry       = {}
    ;

    // REM : ONLY functions are iterable!!!
    Object.defineProperties(carry, {
        id:     {value: tc_root_uri, enumerable: /** REM : !!!!!!!!!!!!!!! */ false},
        INF_01: {
            value:          Object.defineProperties(async (token, data) => {
                try {

                    token.thread.push(`${util.timestamp()} : TESTSUITE : agent : enforce : testcase : <tc.ids.INF_01> : called`);

                    // start : net.sniffer

                    // net.ping

                    let result = await agent.test(token, data);

                    // end : net.sniffer

                    //region validation
                    if (!data.testResult)
                        throw(new Error(``)); // TODO : better ERROR
                    if (!data.testResult.operationalResult)
                        throw(new Error(``)); // TODO : better ERROR

                    data.validationResult       = {
                        id:        `${tc_root_uri}getSelfDescription/${uuid.v1()}`,
                        timestamp: util.timestamp()
                    };
                    //debugger;
                    data.validationResult.value = ((data.testResult.operationalResult['@type'] === "ids:SelfDescription") ? PASS : FAIL);
                    //endregion validation
                    token.thread.push(`${util.timestamp()} : TESTSUITE : agent : enforce : testcase : <tc.ids.INF_01> : before : return`);

                    return result;
                } catch (jex) {
                    throw(jex); // TODO : better ERROR
                } // try
            }, {
                id:   {value: `${tc_root_uri}INF_01/`, enumerable: true},
                urn:  {value: `${tc_root_urn}INF_01`, enumerable: true},
                name: {value: `INF_01`, enumerable: true}
            }), enumerable: true
        } // INF_01
    }); // Object.defineProperties(carry)

    Object.freeze(carry);
    return carry;
}

// EOF