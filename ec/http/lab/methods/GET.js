const
    id      = "https://localhost/ec/tests/getResource/",
    version = "0-0-1",
    //${FIR_function_documentation}
    /**
     * @param endpoint
     * @returns {Promise<null>}
     */
    fn      = async function GET({
                                     'endpoint': endpoint,
                                     'timeout':  timeout
                                 }) {

        //${FIR_function_solves_problem}
        //${FIR_function_implement_algorithm}

        let
            response,
            result = {
            'ok': undefined,
            'status': undefined
        }
        ;
        try {
            let options    = {
                method:         "GET",
                mode:           "cors",
                cache:          "no-cache",
                credentials:    "same-origin",
                headers:        {},
                redirect:       "follow",
                referrerPolicy: "same-origin",
                body:           null
            };
            response = await fetch(endpoint, options);
            result['status'] = response['status'];
            result['ok'] = response['ok'];
            return result;
        } catch (err) {
            throw err;
        } // try
    } // fn
; // const

Object.defineProperties(fn, {
    'fno:name':       {value: "ping"},
    'fno:solves':     {value: `${id}problem`},
    'fno:implements': {value: `${id}algorithm`},
    'fno:output':     {value: `${id}output`},
    'version':        {value: version}
});

module.exports = fn;

// EOF
