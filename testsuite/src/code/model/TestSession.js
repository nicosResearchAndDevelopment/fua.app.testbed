const
    util  = require('./util.js'),
    model = require('./index.js');

module.exports = class TestSession {

    // TODO evaluate if this makes sense and develop a model of the session first

    #state   = Object.create(null);
    #history = [];

    constructor(history) {
        if (history) for (let {key, value, ts} of history) {
            util.assert(util.isString(key), 'expected key to be a string', TypeError);
            util.assert(util.isNumber(ts), 'expected ts to be a number', TypeError);
            if (this.#history.length > 0) util.assert(ts > this.#history[this.#history.length - 1].ts, 'expected ts to be greater than last ts', TypeError);
            if (util.isNull(value)) {
                delete this.#state[key];
                this.#history.push({key, value: null, ts});
            } else {
                this.#state[key] = value;
                this.#history.push({key, value, ts});
            }
        }
    }

    set(key, value) {
        util.assert(util.isString(key), 'expected key to be a string', TypeError);
        const ts = util.hrt();
        if (this.#history.length > 0) util.assert(ts > this.#history[this.#history.length - 1].ts, 'expected ts to be greater than last ts', TypeError);
        if (util.isNull(value)) {
            delete this.#state[key];
            this.#history.push({key, value: null, ts});
        } else {
            this.#state[key] = value;
            this.#history.push({key, value, ts});
        }
        return this;
    }

    get(key) {
        if (!util.isString(key)) return null;
        return (key in this.#state) ? this.#state[key] : null;
    }

    has(key) {
        if (!util.isString(key)) return false;
        return key in this.#state;
    }

}; // TestSession
