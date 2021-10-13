const
    util = require("@nrd/fua.core.util"),
    uuid = require("@nrd/fua.core.uuid"),
    //
    name = "INF_01",
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
        uri = `${tc_root_uri}${name}`,
        urn = `${tc_root_urn}${name}`
    ;

    let INF_01 = Object.defineProperties(async (token, data) => {
        try {


            token.thread.push(`${util.timestamp()} : TESTSUITE : ${urn} : called`);

            // start : net.sniffer

            // net.ping

            data.ec      = ec;
            data.command = "requestApplicantsSelfDescription";

            let result = await agent.test(token, data.param);


            // end : net.sniffer

            //region validation
            if (!result.data.testResult)
                throw(new Error(``)); // TODO : better ERROR
            if (!result.data.testResult.operationalResult)
                throw(new Error(``)); // TODO : better ERROR

            result.data.validationResult = {
                id:        `${tc_root_uri}getSelfDescription/${uuid.v1()}`,
                timestamp: util.timestamp()
            };
            token.thread.push(`${util.timestamp()} : TESTSUITE : ${urn} : before : validation`);
            result.data.validationResult.value = ((result.data.testResult.operationalResult['@type'] === "ids:SelfDescription") ? PASS : FAIL);
            //endregion validation

            token.thread.push(`${util.timestamp()} : TESTSUITE : ${urn} : before : return`);

            return result;
        } catch (jex) {
            throw(jex); // TODO : better ERROR
        } // try
    }, {
        id:   {value: uri, enumerable: true},
        urn:  {value: urn, enumerable: true},
        name: {value: name, enumerable: true}
    });

    Object.freeze(INF_01);
    return INF_01;
};

// EOF