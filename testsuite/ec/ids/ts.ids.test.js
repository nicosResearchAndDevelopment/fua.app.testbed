const
    {describe, test, before, after} = require('mocha'),
    Session                         = require("./session/ts.ids.Session.js"),
    applicant                       = require("./ts.ids.applicant.json"),
    applicantGetsDATfromDAPS        = require('./ts.ids.test.getDATfromDAPS.js')
;

function ObjectPropertyFactory(name, value) {

    // TODO: array-check
    value = [value];

    async function has(item, node) {
        try {
            let result = false;
            return result;
        } catch (jex) {
            throw jex;
        } // try
    }

    async function add(item, node) {
        try {
            let result = false;
            return result;
        } catch (jex) {
            throw jex;
        } // try
    }

    class ObjectPropertyFactoryError extends Error {
        constructor(message) {
            super(message);
            this['timestamp'] = (new Date).toISOString();
        }
    } // class ObjectPropertyFactoryError

    let
        fn = async () => {
            let result = {};
            try {

            } catch (jex) {
                throw jex;
            } // try
            return result;
        } // fn
    ;
    Object.defineProperties(fn, {
        'name':   {value: name},
        'has':    {
            value: async (node) => {
                return await has(this, node);
            }
        },
        'add':    {
            value: async (node) => {
                return await add(this, node);
            }
        },
        'modify': {
            value: () => {
                throw null;
            }
        },
        'remove': {
            value: () => {
                throw null;
            }
        },
        'delete': {
            value: () => {
                throw null;
            }
        }
    });
    return fn;
} // ObjectPropertyFactory()

let session;
describe('IDS', function () {

    this.timeout(0);

    describe('applicantGetsDATfromDAPS', function () {
        applicant;
        session = new Session({
            'applicant':         applicant.name,
            'session_folder':    applicant.session_folder,
            'log_file_name':     undefined, // REM: 'log.txt'
            'session_file_name': undefined  // REM: 'session.json'
        });
        test(
            'basic test',
            () => applicantGetsDATfromDAPS.basic({
                session:       session,
                timeout:       180,
                daps_endpoint: 'http://testbed.nicos-rd.com/daps/'
            })
        ); // test
        if (session) {
            session.setCriterion("INF_01", {
                'status': "pass"
            });
            session.presentVerifiableCredential({
                'presentationProof': () => {
                    let
                        proof = `presentationProof :: aaaa.bbbb.cccc`
                    ;
                    return proof;
                },
                'credentialProof':   () => {
                    let
                        proof = `credentialProof : dddd.eeee.ffff`
                    ;
                    return proof;
                },
                'file_name':         undefined
            });
            session.sessionEnd();
        } // if ()
    }); // describe

});