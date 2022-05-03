const
    util = require('@nrd/fua.core.util'),
    uuid = require('@nrd/fua.core.uuid'),
    //
    PASS = "PASS",
    FAIL = "FAIL"
; // const

module.exports = ({
                      root_uri: root_uri,
                      root_urn: root_urn = "urn:ts:ec:ids:criterion:"
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
                         criterion:   criterion,
                         prov:        prov,
                         testCase:    testCase,
                         description: description,
                         status:      status,
                         timestamp:   timestamp = util.utcDateTime()

                     }) {
        let result = {
            id:        id,
            criterion:   criterion,
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
        id:     {value: crit_root_uri, enumerable: /** REM : !!!!!!!!!!!!!!! */ false},
        INF_01: {
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
                    criterion:   "https://w3id.org/ids3c-component/INF_01",
                    prov:        prov,
                    testCase:    testCase,
                    description: description,
                    status:      status,
                    timestamp:   timestamp
                });
            }, enumerable: false
        }, // INF_01
        INF_02: {
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
                    criterion:   "https://w3id.org/ids3c-component/INF_02",
                    prov:        prov,
                    testCase:    testCase,
                    description: description,
                    status:      status,
                    timestamp:   timestamp
                });
            }, enumerable: false
        }, // INF_02
        INF_03: {
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
                    criterion:   "https://w3id.org/ids3c-component/INF_03",
                    prov:        prov,
                    testCase:    testCase,
                    description: description,
                    status:      status,
                    timestamp:   timestamp
                });
            }, enumerable: false
        }, // INF_03
        INF_04: {
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
                    criterion:   "https://w3id.org/ids3c-component/INF_04",
                    prov:        prov,
                    testCase:    testCase,
                    description: description,
                    status:      status,
                    timestamp:   timestamp
                });
            }, enumerable: false
        }, // INF_04
        INF_05: {
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
                    criterion:   "https://w3id.org/ids3c-component/INF_05",
                    prov:        prov,
                    testCase:    testCase,
                    description: description,
                    status:      status,
                    timestamp:   timestamp
                });
            }, enumerable: false
        } // INF_05
    }); // Object.defineProperties(carry)

    Object.freeze(carry);
    return carry;

};

// EOF
