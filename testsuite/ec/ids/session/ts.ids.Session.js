const
    fs   = require("fs"),
    path = require("path")
;

// REM: wir halten die sesshion.json so flach wie möglich, um es so performant wie möglich
// REM:     auf die Festplatte zu bekommen (und nicht eine VP).

//region fn
function timestamp() {
    return (new Date).toISOString();
}

//endregion fn

//region Error
class ErrorApplicantIsMissing extends Error {
    constructor(message) {
        super(message);
        this['timestamp'] = timestamp();
    }
}

class ErrorApplicantSessionFolderPathIsMissing extends Error {
    constructor(message) {
        super(message);
        this['timestamp'] = timestamp();
    }
}

class ErrorApplicantSessionFolderIsMissing extends Error {
    constructor(message) {
        super(message);
        this['timestamp'] = timestamp();
    }
}

class ErrorCriterionUnknown extends Error {
    constructor(message) {
        super(message);
        this['timestamp'] = timestamp();
    }
}

//endregion Error

//region fn
function write_session(file_path, session) {
    fs.writeFileSync(file_path, `${JSON.stringify(session, undefined, "\t")}`);
}

//endregion fn

class Session {

    #applicant         = "";
    #session_folder    = undefined;
    #log_file_path     = undefined;
    #session_file_path = undefined;
    #session           = undefined;
    #critera_map       = new Map();

    constructor({
                    'applicant':         applicant = undefined,
                    'session_folder':    session_folder = undefined,
                    'log_file_name':     log_file_name = "log.txt",
                    'session_file_name': session_file_name = "session.json"
                }) {

        let
            local_session_start = undefined
        ;

        if (!applicant)
            throw ErrorApplicantIsMissing(`applicant: <${applicant}>`);
        this.#applicant = applicant;

        if (!session_folder)
            throw ErrorApplicantSessionFolderPathIsMissing(`session folder path: <${session_folder}>`);
        this.#session_folder = session_folder;

        if (!fs.existsSync(this.#session_folder))
            throw new ErrorApplicantSessionPathIsMissing(`session folder: (path) <${this.#session_folder}>`);

        this.#log_file_path = path.join(this.#session_folder, log_file_name);

        this.#session_file_path = path.join(this.#session_folder, session_file_name);
        this.#session           = fs.readFileSync(this.#session_file_path, {'encoding': "utf8"}, function (err) {
            if (err)
                throw err;
        });
        this.#session           = JSON.parse(this.#session);

        local_session_start        = this.#session.sessionStart;
        local_session_start        = (local_session_start || timestamp());
        this.#session.sessionStart = (this.#session.sessionStart || local_session_start);
        this.#session.sessionEnd   = null;

        write_session(this.#session_file_path, this.#session);

        if (this.#session.criteria) {
            this.#session.criteria.map((crit) => {
                this.#critera_map.set(crit['@id'], crit);
            });
        } // if ()

        this['log']("session : start", local_session_start);
    } // constructor

    log(message, ts = undefined) {
        fs.appendFileSync(this.#log_file_path, `${(ts || timestamp())} : ${message}\n`, (err) => {
            if (err) throw err;
        });
    } // log()

    setCriterion(id, value) {
        let
            criterion = this.#critera_map.get(id),
            changed   = false
        ;
        if (criterion) {
            if (value['status'] && (value['status'] !== "undef")) {
                if ((criterion['status'] === "undef") || (criterion['status'] === "pass")) {
                    criterion['status']    = value['status'];
                    criterion['timestamp'] = timestamp();
                    changed                = true;
                } // if ()
            } // if ()
            if (changed) {
                this.#session.timestamp = timestamp();
                //fs.writeFileSync(this.#session_file_path, `${JSON.stringify(this.#session, undefined, "\t")}`);
                write_session(this.#session_file_path, this.#session);
            } // if ()
        } else {
            throw new ErrorCriterionUnknown(`session : criterion <${id}> unknown`);
        } // if ()
    } // setCriterion()

    sessionEnd() {
        this.#session.sessionEnd = timestamp();
        this['log']("session : end", this.#session.sessionEnd);
        write_session(this.#session_file_path, this.#session);
        //fs.writeFileSync(this.#session_file_path, `${JSON.stringify(this.#session, undefined, "\t")}`);
    } // sessionEnd()

    presentVerifiableCredential({
                                    'presentationProof': presentationProof = ({}) => {
                                        return "TODO_EMPTY_presentationProof";
                                    },
                                    'credentialProof':   credentialProof = ({}) => {
                                        return "TODO_EMPTY_credentialProof";
                                    },
                                    'file_name':         file_name = "verifiablePresentation.json"
                                }) {

        let
            vp        = {},
            file_path = path.join(this.#session_folder, file_name)
        ;
        vp['proof']   = presentationProof({});
        this['log'](`presentation : VerifiablePresentation : <${file_path}>`, undefined);
        fs.writeFileSync(file_path, `${JSON.stringify(vp, undefined, "\t")}`);
    } //
} // class Session

module.exports = Session;