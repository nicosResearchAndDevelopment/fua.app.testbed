import {assert, is} from '/browse/lib/core.mjs';
import * as model from './ldp.model.mjs';

const
    _context           = {
        'rdfs': 'http://www.w3.org/2000/01/rdf-schema#',
        'ldp':  'http://www.w3.org/ns/ldp#'
    },
    _baseURL           = (({protocol, host}) => protocol + '//' + host + '/')(new URL(document.baseURI)),
    _baseURI           = (({protocol, hostname}) => protocol + '//' + hostname + '/')(new URL(document.baseURI)),
    _StringValidator   = (re) => (str) => is.string(str) && re.test(str),
    _isApplicationJSON = _StringValidator(/application\/(?:ld\+)?json/);

export function resolveURL(url) {
    const [prefix] = /^[a-z][a-z0-9+\-._]*(?=:)/i.exec(url) ?? [];
    if (prefix && _context[prefix]) url = _context[prefix] + url.substr(prefix.length + 1);
    if (url.startsWith(_baseURI)) url = url.substr(_baseURI.length);
    return new URL(url, _baseURL).toString();
}

export function resolveURI(url) {
    if (url.startsWith(_baseURL)) url = url.substr(_baseURL.length);
    let uri = new URL(url, _baseURI).toString(), matched_prefix = '', matched_iri = '';
    for (let [prefix, iri] of Object.entries(_context)) {
        if (url.startsWith(iri) && iri.length > matched_iri.length) {
            matched_prefix = prefix;
            matched_iri    = iri;
        }
    }
    if (matched_prefix) uri = matched_prefix + ':' + uri.substr(matched_iri.length);
    return uri;
}

export async function GET(uri) {
    if (uri instanceof model.BaseNode) uri = uri.id;
    else assert(is.string(uri), 'expected uri to be a string', TypeError);

    const
        targetURL = resolveURL(uri),
        response  = await fetch(targetURL, {
            method:  'GET',
            cache:   'no-store',
            headers: {
                'Accept': 'application/ld+json'
            }
        });

    assert(response.ok, `${response.url} [${response.status}]: ${response.statusText}`);
    assert(response.headers.has('ETag'), 'expected headers to contain ETag');
    assert(_isApplicationJSON(response.headers.get('Content-Type')),
        'expected headers to contain Content-Type of application/[ld+]json');

    const {'@graph': graph, '@context': context} = await response.json();
    assert(is.array(graph), 'expected response to include an @graph array ', TypeError);
    if (context) {
        assert(is.object(context) && Object.values(context).every(iri => is.string(iri)),
            'expected @context to be an object of strings', TypeError);
        Object.assign(_context, context);
    }

    const nodes = new Map();
    for (let node of graph) {
        assert(is.object(node) && is.string(node['@id']), 'expected @graph to only contain json-ld nodes', TypeError);
        assert(!nodes.has(node['@id']), 'expected @graph to not contain duplicate nodes');
        nodes.set(node['@id'], node);
    }

    const
        targetURI = resolveURI(uri);

    assert(nodes.has(targetURI), 'expected @graph to contain the requested uri');
    const targetNode = (function _nonCircularMeshing(node, blacklist) {
        for (let [key, prop] of Object.entries(node)) {
            if (!key.startsWith('@') && Array.isArray(prop)) {
                node[key] = prop.map(function (child) {
                    if (!(child['@id'] && nodes.has(child['@id']))) return child;
                    if (blacklist.includes(child['@id'])) return child;
                    return _nonCircularMeshing(nodes.get(child['@id']), [...blacklist, child['@id']]);
                });
            }
        }
        return node;
    })(nodes.get(targetURI), [targetURI]);

    return model.construct(targetNode, response.headers.get('ETag'));
} // function GET

export async function HEAD() {
    // TODO
} // function HEAD

export async function OPTION() {
    // TODO
} // function OPTION

export async function POST() {
    // TODO
} // function POST

export async function PUT() {
    // TODO
} // function PUT

export async function PATCH() {
    // TODO
} // function PATCH

export async function DELETE() {
    // TODO
} // function DELETE
