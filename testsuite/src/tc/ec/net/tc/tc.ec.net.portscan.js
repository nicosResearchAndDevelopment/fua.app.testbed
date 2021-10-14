const
    util = require("@nrd/fua.core.util"),
    uuid = require("@nrd/fua.core.uuid"),
    //
    name = "portscan",
    PASS = "PASS",
    FAIL = "FAIL"
; // const

module.exports = ({
                      ec:          ec = "net",
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
        ERROR_CODE_ErrorTestResultIsMissing = `${urn}:error:test-result-is-missing`,
        ERROR_CODE_ErrorBadPort             = `${urn}:error:bad-ports`
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

    class ErrorBadPort extends Error {
        constructor(bad) {
            super(`${urn} : bad port <${bad}>`);
            this.id        = `${uri}error/${uuid.v1()}`;
            this.timestamp = util.timestamp();
            this.code      = ERROR_CODE_ErrorBadPort;
            this.prov      = uri;
            Object.freeze(this);
        }
    }

    //endregion ERROR

    let portscan = Object.defineProperties(async (token, data) => {
        let error = null;
        try {
            token.thread.push(`${util.timestamp()} : TESTSUITE : ${urn} : called`);

            data.ec      = ec;
            data.command = name;

            //let result = await agent.test(token, data);
            await agent.test(token, data);

            //region validation
            token.thread.push(`${util.timestamp()} : TESTSUITE : ${urn} : before : validation`);
            if (!data.testResult)
                error = new ErrorTestResultIsMissing();

            if (!error) {
                data.validationResult = {
                    id:        `${uri}portscan/validation/result/${uuid.v1()}`,
                    timestamp: util.timestamp()
                };
                let
                    found_bad_ports   = []
                ;
                for (const [protocol, ports] of Object.entries(data.param.bad)) {
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
                            found_bad_ports.push(node);
                        } // if ()
                    });
                } // for
                data.validationResult.value = ((found_bad_ports.length === 0) ? PASS : FAIL);
                if (found_bad_ports.length > 0)
                    error = new ErrorBadPort(JSON.stringify(found_bad_ports));
            } // if ()

            //endregion validation

        } catch (jex) {
            error = jex;
        } // try

        if (error)
            console.error(error);

        token.thread.push(`${util.timestamp()} : TESTSUITE : ${urn} : before : return`);
        return {token: token, data: data, error: error};

    }, {
        id:   {value: uri, enumerable: true},
        urn:  {value: urn, enumerable: true},
        name: {value: name, enumerable: true}
    });

    Object.freeze(portscan);
    return portscan;
};

// EOF