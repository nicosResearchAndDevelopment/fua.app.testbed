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
                      agent:       agent
                  }) => {

    const
        uri = `${tc_root_uri}${name}`,
        urn = `${tc_root_urn}${name}`
    ;

    let ping = Object.defineProperties(async (token, data) => {
        try {

            token.thread.push(`${util.timestamp()} : TESTSUITE : ${urn} : called`);

            data.ec      = ec;
            data.command = name;

            //let result = await agent.test(token, data);
            await agent.test(token, data);

            //region validation
            if (!data.testResult)
                throw(new Error(``)); // TODO : better ERROR
            data.validationResult = {
                id:        `${tc_root_uri}ping/${uuid.v1()}`,
                timestamp: util.timestamp()
            };
            token.thread.push(`${util.timestamp()} : TESTSUITE : ${urn} : before : validation`);
            //data.validationnvalue = ((data.testisAlive === true) ? PASS : FAIL);

            if (!data.testResult.isAlive)
                throw(new Error(``));

            //data.validationvalue = PASS;
            //endregion validation

            token.thread.push(`${util.timestamp()} : TESTSUITE : ${urn} : before : return`);
            console.log("+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++");
            return {token: token, data: data};
        } catch (jex) {
            throw(jex); // TODO : better ERROR
        } // try
    }, {
        id:   {value: uri, enumerable: true},
        urn:  {value: urn, enumerable: true},
        name: {value: name, enumerable: true}
    });

    Object.freeze(ping);
    return ping;
};

// EOF