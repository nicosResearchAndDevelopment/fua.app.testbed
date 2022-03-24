/**
 * @module LDP
 * {@link https://www.w3.org/TR/ldp/ Linked Data Platform 1.0}
 */

import {assert, is} from '/browse/lib/core.mjs';
import * as emitter from '/browse/lib/core.emitter.mjs';
import * as method from './ldp.method.mjs';
import * as model from './ldp.model.mjs';

const
    /** @type {Map<string, ProxyNode>} */
    _nodes = new Map(),
    _emit  = (event, ...args) => emitter.trigger(events, event, ...args);

export const events = {
    on(event, callback) {
        emitter.attach(events, event, callback);
        return events;
    },
    once(event, callback) {
        emitter.attach(events, event, callback, true);
        return events;
    },
    off(event, callback) {
        emitter.detach(events, event, callback);
        return events;
    }
};

export function getNode(uri) {
    if (is.object(uri)) uri = uri['@id'];
    assert(is.string(uri), 'expected uri to be a string', TypeError);
    let node = _nodes.get(uri);
    if (!node) {
        node = new ProxyNode(uri);
        _nodes.set(node.id, node);
        _emit('node-creation', node);
    }
    return node;
}

//function _extractLabel(target) {
//    if (!target) return;
//    const labelArr = target['rdfs:label'] || target[model.ns.rdfs('label')];
//    if (!(labelArr && labelArr.length > 0)) return;
//    const labelNode = labelArr.find(({'@language': lang}) => (lang === 'en')) || labelArr[0];
//    if (!(labelNode && labelNode['@value'])) return;
//    return labelNode['@value'];
//}

class ProxyNode extends model.BaseNode {

    #target = null;
    #label  = '';

    constructor(uri) {
        assert(is.string(uri), 'expected uri to be a string', TypeError);
        super(method.resolveURI(uri));
        Object.defineProperties(this, {
            url: {value: method.resolveURL(uri)}
        });
        this.#label = /[^/]+(?=\?|#|$|\/$)/.exec(this.url)?.[0] || '-';
    }

    get target() {
        return this.#target;
    }

    get label() {
        return this.#label;
    }

    async read() {
        try {
            this.#target = await method.GET(this);
            //this.#label  = _extractLabel(this.#target) || this.#label;
            _emit('node-update', this);
            return this.#target;
        } catch (err) {
            this.#target = null;
            _emit('node-failure', this, err);
            throw err;
        }
    }

} // ProxyNode
