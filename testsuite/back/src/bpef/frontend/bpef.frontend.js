const util = require("@nrd/fua.core.util");

module.exports = ({
                      root:        root,
                      testsuiteRoot: testsuiteRoot,
                      endExit:     endExit = (token, data) => {
                      }
                  }) => {

    root          = `${root}testsuite/frontend/`;
    //debugger;
    let
        testsuite = {
            pool: {
                id:       "",
                swimlane: {
                    executor: {
                        id: testsuiteRoot
                    }
                }
            }
        },
        id        = {

            id:     `${root}`,
            launch: {
                id:       `${root}launch/`,
                start:    {
                    id:   `${root}launch/start/`,
                    exit: `${root}launch/request/`
                },
                activity: {
                    request: {
                        id:   `${root}launch/request/`,
                        exec: async (token, data) => {
                            try {
                                let result = undefined;
                                return {token: token, data: data};
                            } catch (jex) {
                                debugger;
                                throw(new Error(``)); // TODO : bettere ERROR
                            } // try
                        },
                        exit: `${root}launch/end/`
                    } // request
                }, // activity
                end:      {
                    id:   `${root}launch/end/`,
                    exit: endExit
                }
            } // launch
        }, // root
        graph     = [
            {
                id:       id.id,
                type:     "bpmn:Pool",
                name:     "ts.frontend",
                swimLane: []
            },
            {
                id:       id.launch.id,
                type:     "bpmn:SwimLane",
                name:     "ts.launch",
                start:    {
                    id:   id.launch.start.id,
                    name: "ts.launch.start",
                    exit: id.launch.activity.request.id
                }, // start
                activity: [
                    {
                        id:   id.launch.activity.request.id,
                        type: "bpmn:Activity",
                        name: "ts.launch.request",
                        exec: id.launch.activity.request.exec,
                        exit: id.launch.end.id
                    }
                ], // activity
                end:      {
                    id:   id.launch.end.id,
                    name: "ts.launch.end",
                    exit: id.launch.end.exit
                }
            }
        ]
    ; // let

    return {graph: graph};

};

// EOF
