const util = require("@nrd/fua.core.util");

module.exports = ({
                      root:    root,
                      endExit: endExit = (token, data) => {
                      }
                  }) => {

    root      = `${root}testsuite/`;
    //debugger;
    let
        //id    = {
        //
        //    id:     `${root}`,
        //    pool:   {
        //        id:                `${root}pool/`,
        //        swimlane_executor: {
        //            id:       `${root}pool/executor/`,
        //            activity: {
        //                decide_ec: {
        //                    id:   `${root}pool/executor/activity/decide_ec/`,
        //                    exec: async (token, data) => {
        //                        try {
        //                            let result = undefined;
        //                            return {token: token, data: data};
        //                        } catch (jex) {
        //                            debugger;
        //                            throw(new Error(``)); // TODO : better ERROR
        //                        } // try
        //                    },
        //                    exit: `${root}launch/end/`
        //                } // request
        //            } // activity
        //        }
        //    }
        //}, // root
        graph = [
            {
                id:       `${root}pool/`,
                type:     "bpmn:Pool",
                name:     "ts.pool",
                swimLane: []
            },
            {
                id:         `${root}pool/executor/`,
                type:       "bpmn:SwimLane",
                name:       "ts.pool.executor",
                start:      {
                    id:   `${root}pool/executor/start/`,
                    name: "ts.pool.executor.start",
                    exit: `${root}pool/executor/activity/decide_ec/`
                }, // start
                activity:   [
                    {
                        id:   `${root}pool/executor/activity/decide_ec/`,
                        type: "bpmn:Activity",
                        name: "ts.pool.executor.activity.decide_ec",
                        exec: async (token, data) => {
                            try {
                                return {token: token, data: data};
                            } catch (jex) {
                                throw(jex); // TODO : better ERROR
                            } // try
                        },
                        exit: `${root}pool/executor/gateway/gwe_decide_ec/`
                    }
                ], // activity
                gateway:    [
                    {
                        id:   `${root}pool/executor/gateway/gwe_decide_ec/`,
                        type: "bpmn:ExclusiveGateway",
                        name: "ts.pool.executor.gateway.gwe_decide_ec",
                        exec: async (token, data) => {
                            try {
                                debugger;
                                switch (data.ec) {
                                    case "ids":
                                        break; // ids
                                    case "net":
                                        break; // net
                                    default:
                                        // TODO ERROR
                                        break; // default
                                } // switch()
                                return {token: token, data: data};
                            } catch (jex) {
                                throw(jex); // TODO : better ERROR
                            } // try
                        },
                        exit: [
                            `${root}pool/executor/subprocess/tc_ids_subProcess/`,
                            `${root}pool/executor/subprocess/tc_net_subProcess/`
                        ]
                    },
                    {
                        id:   `${root}pool/executor/gateway/gwp_to_submit/`,
                        type: "bpmn:ParallelGateway",
                        name: "ts.pool.executor.gateway.gwp_to_submit",
                        exit: `${root}pool/executor/activity/submit/`
                    }
                ],
                subprocess: [
                    {
                        id:    `${root}pool/executor/subprocess/tc_ids_subprocess/`,
                        type:  "bpmn:SubProcess",
                        name:  "ts.pool.executor.subprocess.tc_ids_subprocess",
                        start: {
                            id:   `${root}pool/executor/subprocess/tc_ids_subprocess/start/`,
                            name: "ts.pool.executor.subprocess.tc_ids_subprocess.start",
                            exit: `${root}pool/executor/subprocess/tc_ids_subprocess/decide_tc/`
                        }, // start
                        end:   {
                            id:   `${root}pool/executor/subprocess/tc_ids_subprocess/end/`,
                            name: "ts.pool.executor.subprocess.tc_ids_subprocess.end",
                            exit: endExit
                        }
                    } // pool/executor/subprocess/tc_ids_subprocess/
                ], // subprocess
                end:        {
                    id:   `${root}pool/executor/end/`,
                    name: "ts.pool.executor.end",
                    exit: endExit
                }
            } // pool/executor

        ]
    ; // let

    return {
        root:  root,
        graph: graph
    };

};

// EOF
