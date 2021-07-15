import {assert, is} from '/browse/lib/web.lib.core.mjs';

export const ns = {
    rdf:  val => 'http://www.w3.org/1999/02/22-rdf-syntax-ns#' + val,
    rdfs: val => 'http://www.w3.org/2000/01/rdf-schema#' + val,
    owl:  val => 'http://www.w3.org/2002/07/owl#' + val,
    xsd:  val => 'http://www.w3.org/2001/XMLSchema#' + val,
    dct:  val => 'http://purl.org/dc/terms/' + val,
    ldp:  val => 'http://www.w3.org/ns/ldp#' + val
};

const _types = new Map();

/**
 * @param {{'@id' string, '@type': Array<string>}} param
 * @param {string} etag
 * @returns {Resource}
 */
export function construct(param, etag) {
    assert(is.object(param) && is.array(param['@type']), 'expected param to contain an @type array', TypeError);
    const types = param['@type'].map(type => _types.get(type)).filter(val => val);
    return new (types[0] || Resource)(param, etag);
} // function construct

export class BaseNode {

    constructor(id) {
        if (is.object(id)) id = id['@id'];
        assert(is.string(id), 'expected id to be a string', TypeError);
        Object.defineProperties(this, {
            id:   {value: id},
            type: {value: new.target}
        });
    }

} // class BaseNode

export class Resource extends BaseNode {

    constructor(param, etag = '') {
        assert(is.object(param), 'expected param to be an object', TypeError);
        assert(is.string(etag), 'expected etag to be a string', TypeError);
        super(param);
        Object.defineProperties(this, {
            etag: {value: etag}
        });
        Object.assign(this, param);
    }

    /** @type {Array<{'@id': string}>} */
    get member() {
        const predicate = ('ldp:member' in this) ? 'ldp:member' : ns.ldp('member');
        return this[predicate] || (this[predicate] = []);
    }

    set member(value) {
        const predicate = ('ldp:member' in this) ? 'ldp:member' : ns.ldp('member');
        this[predicate] = value;
    }

    // TODO
    // ldp:member
    // rdfs:label
    // dct:created
    // dct:modified
    // ldp:constrainedBy

} // class Resource

_types.set('ldp:Resource', Resource);
_types.set(ns.ldp('Resource'), Resource);

export class NonRDFSource extends Resource {

    // TODO
    // dct:identifier
    // dct:format

} // class NonRDFSource

_types.set('ldp:NonRDFSource', NonRDFSource);
_types.set(ns.ldp('NonRDFSource'), NonRDFSource);

export class RDFSource extends Resource {

    // TODO

} // class RDFSource

_types.set('ldp:RDFSource', RDFSource);
_types.set(ns.ldp('RDFSource'), RDFSource);

export class Container extends RDFSource {

    /** @type {Array<{'@id': string}>} */
    get contains() {
        const predicate = ('ldp:contains' in this) ? 'ldp:contains' : ns.ldp('contains');
        return this[predicate] || (this[predicate] = []);
    }

    set contains(value) {
        const predicate = ('ldp:contains' in this) ? 'ldp:contains' : ns.ldp('contains');
        this[predicate] = value;
    }

    // TODO
    // ldp:contains
    // ldp:hasMemberRelation
    // ldp:isMemberOfRelation
    // ldp:membershipResource
    // ldp:insertedContentRelation

} // class Container

_types.set('ldp:Container', Container);
_types.set(ns.ldp('Container'), Container);

export class BasicContainer extends Container {

    // TODO

} // class BasicContainer

_types.set('ldp:BasicContainer', BasicContainer);
_types.set(ns.ldp('BasicContainer'), BasicContainer);

export class DirectContainer extends Container {

    // TODO

} // class DirectContainer

_types.set('ldp:DirectContainer', DirectContainer);
_types.set(ns.ldp('DirectContainer'), DirectContainer);

export class IndirectContainer extends Container {

    // TODO

} // class IndirectContainer

_types.set('ldp:IndirectContainer', IndirectContainer);
_types.set(ns.ldp('IndirectContainer'), IndirectContainer);
