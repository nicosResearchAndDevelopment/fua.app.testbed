const
    util = require("@nrd/fua.core.util"),
    uuid = require("@nrd/fua.core.uuid"),
    //
    name = "SUT_provides_self_description",
    PASS = "PASS",
    FAIL = "FAIL"
; // const

module.exports = ({
                      ec:          ec = "ids",
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

    let SUT_provides_self_description = Object.defineProperties(async (token, data) => {
        let status,
            error = null
        ;
        try {

            token.thread.push(`${util.utcDateTime()} : TESTSUITE : ${urn} : called`);

            data.ec      = ec;
            data.command = "requestApplicantsSelfDescription";

            //let result = await agent.test(token, data);
            let result = await agent.test(token, data);

            //region validation
            token.thread.push(`${util.utcDateTime()} : TESTSUITE : ${urn} : before : validation`);

            //error = new ErrorTestResultIsMissing(); // REM : error-testing

            if (!result.data.testResult)
                error = new ErrorTestResultIsMissing();

            if (!error && !result.data.testResult.operationalResult)
                error = new ErrorOperationalResultIsMissing();

            if (!error) {
                data.validationResult = {
                    id:        `${uri}/validation/result/${uuid.v1()}`,
                    timestamp: util.utcDateTime(),
                    value:     ((result.data.testResult.operationalResult['@type'] === "ids:SelfDescription") ? PASS : FAIL),
                    criterion: {}
                };

                //region INF_01
                status                                 = ((result.data.testResult.operationalResult['@type'] === "ids:SelfDescription") ? PASS : FAIL);
                data.validationResult.criterion.INF_01 = criterion.INF_01({
                    id:          `${uri}validation/criterion/INF_01/${uuid.v1()}`,
                    prov:        SUT_provides_self_description.id,
                    testCase:    testCase,
                    description: "SUT provides correct Self Description",
                    status:      status,
                    timestamp:   util.utcDateTime()
                });
                //endregion INF_01

                //region INF_05
                status                                 = FAIL;
                data.validationResult.criterion.INF_05 = criterion.INF_05({
                    id:          `${uri}validation/criterion/INF_01/${uuid.v1()}`,
                    prov:        SUT_provides_self_description.id,
                    testCase:    testCase,
                    description: "SUT provides correct DAT",
                    status:      status,
                    timestamp:   util.utcDateTime()
                });
                //endregion INF_05

            } // if ()
            //endregion validation

        } catch (jex) {
            error = jex;
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

    Object.freeze(SUT_provides_self_description);
    return SUT_provides_self_description;
};

// EOF
