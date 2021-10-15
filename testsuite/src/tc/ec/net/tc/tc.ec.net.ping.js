const
    util = require("@nrd/fua.core.util"),
    uuid = require("@nrd/fua.core.uuid"),
    //
    name = "ping",
    PASS = "PASS",
    FAIL = "FAIL"
; // const

module.exports = ({
                      ec:          ec = "net",
                      tc_root_uri: tc_root_uri,
                      tc_root_urn: tc_root_urn,
                      agent:       agent,
                      console_log: console_log = false
                  }) => {

    const
        uri = `${tc_root_uri}${name}/`,
        urn = `${tc_root_urn}${name}`
    ;

    //region ERROR
    const
        ERROR_CODE_ErrorTestResultIsMissing = `${urn}:error:test-result-is-missing`
    ; // const

    class ErrorTestResultIsMissing extends Error {
        constructor() {
            super(`${urn} : test result is missing`);
            this.id        = `${uri}error/${uuid.v1()}`;
            this.timestamp = util.timestamp();
            this.code      = ERROR_CODE_ErrorTestResultIsMissing;
            this.prov      = uri;
            Object.freeze(this);
        }
    }

    //endregion ERROR

    let ping = Object.defineProperties(async (token, data) => {
        let error = null;
        try {

            token.thread.push(`${util.timestamp()} : TESTSUITE : ${urn} : called`);

            data.ec      = ec;
            data.command = name;

            //let result = await agent.test(token, data);
            await agent.test(token, data);

            //region validation
            token.thread.push(`${util.timestamp()} : TESTSUITE : ${urn} : before : validation`);
            //error = new ErrorTestResultIsMissing(); // REM : error-testing
            if (!data.testResult)
                error = new ErrorTestResultIsMissing();

            if (!error)
                data.validationResult = {
                    id:        `${uri}/validation/result/${uuid.v1()}`,
                    timestamp: util.timestamp(),
                    value:     ((data.testResult.isAlive === true) ? PASS : FAIL)
                };
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

        token.thread.push(`${util.timestamp()} : TESTSUITE : ${urn} : before : return`);
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