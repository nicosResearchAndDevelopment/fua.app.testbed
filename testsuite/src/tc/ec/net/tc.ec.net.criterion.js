const
    util = require('@nrd/fua.core.util'),
    uuid = require('@nrd/fua.core.uuid'),
    //
    PASS = "PASS",
    FAIL = "FAIL"
; // const

module.exports = ({
                      root_uri: root_uri,
                      root_urn: root_urn = "urn:ts:ec:net:criterion:"
                  }) => {
    const
        crit_root_urn = `${root_urn}result:`,
        crit_root_uri = `${root_uri}result/`
    ;
    let
        carry         = {}
    ;

    function factory({

                         id:          id,
                         prov:        prov,
                         testCase:    testCase,
                         description: description,
                         status:      status,
                         timestamp:   timestamp = util.utcDateTime()

                     }) {
        let result = {
            id:        id,
            prov:      prov,
            testCase:  testCase,
            status:    status,
            timestamp: timestamp
        };

        if (description)
            result.description = description;

        return result;

    } // function wrapper()

    // REM : ONLY functions are iterable!!!
    Object.defineProperties(carry, {
        id:           {value: crit_root_uri, enumerable: /** REM : !!!!!!!!!!!!!!! */ false},
        IS_ALIVE:     {
            value:         ({
                                id:          id = `${crit_root_uri}${uuid.v1()}`,
                                prov:        prov,
                                testCase:    testCase,
                                description: description,
                                status:      status,
                                timestamp:   timestamp
                            }) => {
                return factory({
                    id:          id,
                    prov:        prov,
                    testCase:    testCase,
                    description: description,
                    status:      status,
                    timestamp:   timestamp
                });
            }, enumerable: false
        }, // IS_ALIVE
        PORTS_CORRECT: {
            value:         ({
                                id:          id = `${crit_root_uri}${uuid.v1()}`,
                                prov:        prov,
                                testCase:    testCase,
                                description: description,
                                status:      status,
                                timestamp:   timestamp
                            }) => {
                return factory({
                    id:          id,
                    prov:        prov,
                    testCase:    testCase,
                    description: description,
                    status:      status,
                    timestamp:   timestamp
                });
            }, enumerable: false
        } // PORTS_CORRECT
    }); // Object.defineProperties(carry)

    Object.freeze(carry);
    return carry;

};

// EOF
