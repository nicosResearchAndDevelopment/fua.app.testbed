const
    util = require("@nrd/fua.core.util"),
    uuid = require("@nrd/fua.core.uuid"),
    //
    name = "rc_refreshDAT",
    PASS = "PASS",
    FAIL = "FAIL"
; // const

module.exports = ({
                      ec:          ec = "ids",
                      tc_root_uri: tc_root_uri,
                      tc_root_urn: tc_root_urn,
                      agent:       agent
                  }) => {

    const
        uri = `${tc_root_uri}${name}/`,
        urn = `${tc_root_urn}${name}`
    ;

    //region ERROR
    const
        ERROR_CODE_ErrorTestResultIsMissing        = `${urn}:error:test-result-is-missing`,
        ERROR_CODE_ErrorOperationalResultIsMissing = `${urn}:error:operational-result-is-missing`
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

    class ErrorOperationalResultIsMissing extends Error {
        constructor() {
            super(`${urn} : operational result is missing`);
            this.id        = `${uri}error/${uuid.v1()}`;
            this.timestamp = util.utcDateTime();
            this.code      = ERROR_CODE_ErrorOperationalResultIsMissing;
            this.prov      = uri;
            Object.freeze(this);
        }
    }

    //endregion ERROR

    let rc_refreshDAT = Object.defineProperties(async (token, data) => {
        let error = null;
        try {

            token.thread.push(`${util.utcDateTime()} : TESTSUITE : ${urn} : called`);

            data.ec      = ec;
            data.command = "rc_refreshDAT";

            //let result = await agent.test(token, data);
            await agent.test(token, data);

            //region validation
            token.thread.push(`${util.utcDateTime()} : TESTSUITE : ${urn} : before : validation`);

            //error = new ErrorTestResultIsMissing(); // REM : error-testing

            if (!data.testResult)
                error = new ErrorTestResultIsMissing();

            if (!error && !result.data.testResult.operationalResult)
                error = new ErrorOperationalResultIsMissing();

            if (!error) {
                data.validationResult = {
                    id:        `${uri}/validation/result/${uuid.v1()}`,
                    timestamp: util.utcDateTime(),
                    status:     ((result.data.testResult.operationalResult['@type'] === "ids:SelfDescription") ? PASS : FAIL)
                };
            } // if ()
            //endregion validation

        } catch (jex) {
            error = jex;
        } // try

        if (error)
            console.error(error);

        token.thread.push(`${util.utcDateTime()} : TESTSUITE : ${urn} : before : return`);
        return {token: token, data: data, error: error};

    }, {
        id:   {value: uri, enumerable: true},
        urn:  {value: urn, enumerable: true},
        name: {value: name, enumerable: true}
    });

    Object.freeze(rc_refreshDAT);
    return rc_refreshDAT;
};

// EOF
