const
    util           = require("@nrd/fua.core.util"),
    uuid           = require("@nrd/fua.core.uuid"),
    //
    name           = "portscan",
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
        ERROR_CODE_ErrorTestResultIsMissing = `${urn}:error:test-result-is-missing`,
        ERROR_CODE_ErrorBadPort             = `${urn}:error:ports-bad`,
        ERROR_CODE_ErrorPortsNeededNotFound = `${urn}:error:ports-needed-not-found`
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

    class ErrorBadPort extends Error {
        constructor(bad) {
            super(`${urn} : bad port <${bad}>`);
            this.id        = `${uri}error/${uuid.v1()}`;
            this.timestamp = util.utcDateTime();
            this.code      = ERROR_CODE_ErrorBadPort;
            this.prov      = uri;
            Object.freeze(this);
        }
    }

    class ErrorPortsNeededNotFound extends Error {
        constructor(not_found) {
            super(`${urn} : ports needed, NOT found <${not_found}>`);
            this.id        = `${uri}error/${uuid.v1()}`;
            this.timestamp = util.utcDateTime();
            this.code      = ERROR_CODE_ErrorPortsNeededNotFound;
            this.prov      = uri;
            Object.freeze(this);
        }
    }

    //endregion ERROR

    let portscan = Object.defineProperties(async (token, data) => {
                let
                    status = PASS,
                    error  = null
                ;
                try {
                    token.thread.push(`${util.utcDateTime()} : TESTSUITE : ${urn} : called`);

                    data.ec      = ec;
                    data.command = name;

                    //let result = await agent.test(token, data);
                    await agent.test(token, data);

                    //region validation

                    token.thread.push(`${util.utcDateTime()} : TESTSUITE : ${urn} : before : validation`);

                    if (!data.testResult)
                        error = new ErrorTestResultIsMissing();

                    if (!error) {
                        data.validationResult = {
                            id:        `${uri}portscan/validation/result/${uuid.v1()}`,
                            timestamp: util.utcDateTime(),
                            //testCase:              urn,
                            //testCriterion:         undefined,
                            //testCaseSpecification: undefined,
                            ports: {},
                            //value:                 PASS // REM: sub-failings will set to 'FAIL',
                            criterion: {}
                        };
                        let
                            ports_found       = [],
                            ports_NOT_found   = []
                        ;
                        if (!error && data.param.ports.needed) {
                            token.thread.push(`${util.utcDateTime()} : TESTSUITE : ${urn} : validation : ports : needed`);
                            ports_found     = [];
                            ports_NOT_found = [];
                            for (const [protocol, ports] of Object.entries(data.param.ports.needed)) {
                                ports.forEach((p) => {
                                    if (data.testResult.operationalResult[protocol][p]) {
                                        let node = {
                                            protocol: protocol,
                                            port:     p
                                        };
                                        if (data.testResult.operationalResult[protocol][p].service)
                                            node.service = data.testResult.operationalResult[protocol][p].service;
                                        if (data.testResult.operationalResult[protocol][p].state)
                                            node.state = data.testResult.operationalResult[protocol][p].state;
                                        ports_found.push(node);
                                    } else {
                                        ports_NOT_found.push(p);
                                    } // if ()
                                });
                            } // for ([protocol, ports])

                            if (ports_NOT_found.length > 0) {
                                data.validationResult.ports.needed = {
                                    status: FAIL
                                };
                                status                             = FAIL;
                                error                              = new ErrorPortsNeededNotFound(JSON.stringify(ports_NOT_found));
                            } else {
                                data.validationResult.ports.needed = {
                                    status: PASS
                                };
                            } // if ()

                        } else {
                            data.validationResult.ports.needed = {
                                value: NOT_APPLICABLE
                            };
                        } // if (data.param.ports.needed)

                        if (!error && data.param.ports.bad) {
                            token.thread.push(`${util.utcDateTime()} : TESTSUITE : ${urn} : validation : ports : NOT_bad`);
                            ports_found = [];
                            for (const [protocol, ports] of Object.entries(data.param.ports.bad)) {
                                ports.forEach((p) => {
                                    if (data.testResult.operationalResult[protocol][p]) {
                                        let node = {
                                            protocol: protocol,
                                            port:     p
                                        };
                                        if (data.testResult.operationalResult[protocol][p].service)
                                            node.service = data.testResult.operationalResult[protocol][p].service;
                                        if (data.testResult.operationalResult[protocol][p].state)
                                            node.state = data.testResult.operationalResult[protocol][p].state;
                                        ports_found.push(node);
                                    } // if ()
                                });
                            } // for ([protocol, ports])

                            if (ports_found.length > 0) {
                                data.validationResult.ports.NOT_bad = {
                                    status: FAIL
                                };
                                status                              = FAIL;
                                error                               = new ErrorBadPort(JSON.stringify(ports_found));
                            } else {
                                data.validationResult.ports.NOT_bad = {
                                    status: PASS
                                };
                            } // if ()

                        } else {
                            data.validationResult.ports.NOT_bad = {
                                status: NOT_APPLICABLE
                            };
                            status                              = FAIL;
                        } // if (data.param.ports.bad)
                        data.validationResult.criterion.PORTS_CORRECT = criterion.PORTS_CORRECT({
                            id:          `${uri}validation/criterion/PORTS_CORRECT/${uuid.v1()}`,
                            prov:        portscan.id,
                            testCase:    testCase,
                            description: "SUT answers on portscan",
                            status:      status,
                            timestamp:   util.utcDateTime()
                        });
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

            },
            {
                id:   {value: uri, enumerable: true},
                urn:  {value: urn, enumerable: true},
                name: {value: name, enumerable: true}
            }
        )
    ;

    Object.freeze(portscan);
    return portscan;
}
;

// EOF
