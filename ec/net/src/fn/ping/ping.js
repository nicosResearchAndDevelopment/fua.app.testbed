const
    id       = "https://w3id.org/idsa/3c/tests/getDATfromDAPS/",
    version  = "0-0-1",
    criteria = ["https://w3id.org/idsa/3c/component/COM_01"],
    //${FIR_function_documentation}
    /**
     * @param daps_endpoint
     * @param timeout
     * @returns {Promise<null>}
     */
    fn       = async function ping(endpoint, timeout) {

        //${FIR_function_solves_problem}
        //${FIR_function_implement_algorithm}

        let
            result     = {
                //'@type': ["ids3cm:TestResult", "ids3cm:getDATfromDAPS_TestResult"]
                //'@type': "ids3cm:TestResult"
                '@type': "https://w3id.org/idsa/3cm/tests/getDATfromDAPS/TestResult"
            },
            __result__ = {}
        ;
        try {
            // TODO: implementation
            //result['testResultHeader'].push({'@type': "ids3cm:TestResultHeaderElement"});
            //result['testResultHeader'].push(['Content-Type', "application/json"]);
            result['testResultHeader'] = {'Content-Type': "application/json"};
            result['testResultBody']   = JSON.stringify(__result__);
            return null;
        } catch (err) {
            throw err;
        } // try
    } // fn
; // const

Object.defineProperties(fn, {
    'fno:name':        {value: "ping"},
    'fno:solves':      {value: `${id}problem`},
    'fno:implements':  {value: `${id}algorithm`},
    'fno:output':      {value: `${id}output`},
    'version':         {value: version},
    'ids3cm:criteria': {value: criteria}
});

module.exports = fn;

// EOF