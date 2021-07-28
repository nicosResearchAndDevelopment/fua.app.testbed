const
    {describe, test, before, after} = require('mocha'),
    Session                         = require("./session/ts.ids.Session.js"),
    applicant                       = require("./ts.ids.applicant.json"),
    applicantGetsDATfromDAPS        = require('./ts.ids.test.getDATfromDAPS.js')
;
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
                daps_endpoint: 'http://localhost:8080/'
            })
        ); // test
        if (session) {
            session.setCriterion("INF_01", {
                'status': "pass"
            });
            session.sessionEnd();
        } // if ()
    }); // describe

});