const
    util       = require('@nrd/fua.core.util'),
    uuid       = require('@nrd/fua.core.uuid'),
    //
    PASS = "PASS",
    FAIL = "FAIL"
; // const
module.exports = ({
                      root_uri = root_uri,
                      agent
                  }) => {
    const
        tc_root_urn = `urn:net:`,
        tc_root_uri = `${root_uri}tc/ec/net/`
    ;
    let
        carry       = {}
    ;

    // REM : ONLY functions are iterable!!!
    Object.defineProperties(carry, {
        id:   {value: tc_root_uri, enumerable: /** REM : !!!!!!!!!!!!!!! */ false},
        ping: {
            value:          Object.defineProperties(async (token, data) => {
                try {
                    token.thread.push(`${util.timestamp()} : TESTSUITE : agent : enforce : testcase : <tc.net.ping> : called`);
                    let result = await agent.test(token, data);
                    //region validation
                    if (!data.testResult)
                        throw(new Error(``)); // TODO : better ERROR
                    data.validationResult       = {
                        id:        `${tc_root_uri}ping/${uuid.v1()}`,
                        timestamp: util.timestamp()
                    };
                    data.validationResult.value = ((data.testResult.isAlive === true) ? PASS : FAIL);
                    //endregion validation
                    token.thread.push(`${util.timestamp()} : TESTSUITE : agent : enforce : testcase : <tc.net.ping> : before : return`);
                    return result;
                } catch (jex) {
                    throw(jex); // TODO : better ERROR
                } // try
            }, {
                id:   {value: `${tc_root_uri}ping/`, enumerable: true},
                urn:  {value: `${tc_root_urn}ping`, enumerable: true},
                name: {value: `ping`, enumerable: true}
            }), enumerable: true
        } // ping
    }); // Object.defineProperties(carry)

    Object.freeze(carry);
    return carry;
}

// EOF