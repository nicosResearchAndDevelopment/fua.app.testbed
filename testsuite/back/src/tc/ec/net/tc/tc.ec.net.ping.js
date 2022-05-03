const
    util           = require("@nrd/fua.core.util"),
    uuid           = require("@nrd/fua.core.uuid"),
    //
    name           = "ping",
    PASS           = "PASS",
    FAIL           = "FAIL",
    NOT_APPLICABLE = "NOT_APPLICABLE"
; // const

module.exports = ({
                      ec:          ec = "net",
                      tc_root_uri: tc_root_uri,
                      tc_root_urn: tc_root_urn,
                      agent:       agent,
                      criterion:   criterion,
                      console_log: console_log = false
                  }) => {

    const
        uri      = `${tc_root_uri}activity/${name}/`,
        urn      = `${tc_root_urn}${name}`,
        testCase = `${tc_root_uri}${name}/`
    ;

    //region ERROR
    const
        ERROR_CODE_ErrorTestResultIsMissing = `${urn}:error:test-result-is-missing`
    ; // const

    class ErrorTestResultIsMissing extends Error {
        constructor() {
            super(`${urn} : test result is missing`);
            this.id        = `${uri}error/${uuid.v1()}`;
            this.timestamp = util.utcDateTime();
            this.code      = ERROR_CODE_ErrorTestResultIsMissing;
            this.prov      = uri;
            Object.freeze(this);
        }
    }

    //endregion ERROR

    let ping = Object.defineProperties(async (token, data) => {
        let error = null;
        try {

            token.thread.push(`${util.utcDateTime()} : TESTSUITE : ${urn} : called`);

            data.ec      = ec;
            data.command = name;

            //let result = await agent.test(token, data);
            await agent.test(token, data);

            //region validation
            token.thread.push(`${util.utcDateTime()} : TESTSUITE : ${urn} : before : validation`);
            //error = new ErrorTestResultIsMissing(); // REM : error-testing
            if (!data.testResult)
                error = new ErrorTestResultIsMissing();

            if (!error) {
                data.validationResult = {
                    id:        `${uri}validation/result/${uuid.v1()}`,
                    timestamp: util.utcDateTime(),
                    //value:     ((data.testResult.isAlive === true) ? PASS : FAIL),
                    criterion: {
                        IS_ALIVE: criterion.IS_ALIVE({
                            id:          `${uri}validation/criterion/IS_ALIVE/${uuid.v1()}`,
                            prov:        ping.id,
                            testCase:    testCase,
                            description: "SUT pinged",
                            status:      ((data.testResult.isAlive === true) ? PASS : FAIL),
                            timestamp:   util.utcDateTime()
                        })
                    }
                };
            } // if ()
            //endregion validation

        } catch (jex) {
            error = jex; // TODO : better ERROR
        } // try

        if (error)
            console.error(error);

        if (console_log) {
            console.log(`data: ${JSON.stringify(data, "", "\t")}`);
            console.log(`token: ${JSON.stringify(token, "", "\t")}`);
        } // if ()

        token.thread.push(`${util.utcDateTime()} : TESTSUITE : ${urn} : before : return`);
        return {token: token, data: data, error: error};

    }, {
        id:   {value: uri, enumerable: true},
        urn:  {value: urn, enumerable: true},
        name: {value: name, enumerable: true}
    });

    Object.freeze(ping);
    return ping;
};

// EOF
