const
    fs   = require("fs"),
    path = require("path")
;

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

        if (!applicant)
            throw ErrorApplicantIsMissing(`applicant: <${applicant}>`);
        this.#applicant = applicant;

        if (!session_folder)
            throw ErrorApplicantSessionFolderPathIsMissing(`session folder path: <${session_folder}>`);

        if (!fs.existsSync(session_folder))
            throw new ErrorApplicantSessionPathIsMissing(`session folder: (path) <${session_folder}>`);

        this.#log_file_path = path.join(session_folder, log_file_name);

        this.#session_file_path    = path.join(session_folder, session_file_name);
        this.#session              = fs.readFileSync(this.#session_file_path, {'encoding': "utf8"}, function (err) {
            if (err)
                throw err;
        });
        this.#session              = JSON.parse(this.#session);

        this.#session.sessionStart = (this.#session.sessionStart || timestamp());
        this.#session.sessionEnd   = null;

        write_session(this.#session_file_path, this.#session);

        if (this.#session.criteria) {
            this.#session.criteria.map((crit) => {
                this.#critera_map.set(crit['@id'], crit);
            });
        } // if ()

        this['log']("session : start");
    } // constructor

    log(message) {
        fs.appendFile(this.#log_file_path, `${timestamp()} : ${message}\n`, (err) => {
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
        write_session(this.#session_file_path, this.#session);
        //fs.writeFileSync(this.#session_file_path, `${JSON.stringify(this.#session, undefined, "\t")}`);
    } // sessionEnd()

} // class Session

module.exports = Session;