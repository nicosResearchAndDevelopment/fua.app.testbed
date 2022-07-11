const
    path                    = require('path'),
    fs                      = require('fs'),
    __root                  = path.join(__dirname, '../..'),
    default_context         = require('@nrd/fua.resource.data/context'),
    server_tls_certificates = require('../../cert/tls-server/server.js');

exports.context = {
    ...default_context,
    'fno':  'https://w3id.org/function/ontology#',
    'foaf': 'http://xmlns.com/foaf/0.1/',
    'dc':   'http://purl.org/dc/elements/1.1/',
    'dct':  'http://purl.org/dc/terms/',
    'ldp':  'http://www.w3.org/ns/ldp#',
    'owl':  'http://www.w3.org/2002/07/owl#',
    'odrl': 'http://www.w3.org/ns/odrl/2/',
    'org':  'http://www.w3.org/ns/org#',
    'rdf':  'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
    'rdfs': 'http://www.w3.org/2000/01/rdf-schema#',
    'skos': 'http://www.w3.org/2004/02/skos/core#',
    'time': 'http://www.w3.org/2006/time#',
    'vann': "http://purl.org/vocab/vann/",
    // region verifiable credentials
    'vc': "https://www.w3.org/2018/credentials/v1",
    //#@prefix cred:        <https://www.w3.org/2018/credentials#> .
    //#@prefix sec:         <https://w3id.org/security#> .
    // endregion verifiable credentials
    'voaf': "http://purl.org/vocommons/voaf#",
    'xsd':  'http://www.w3.org/2001/XMLSchema#',

    'ids':  "https://w3id.org/idsa/core/",
    'idsc': "https://w3id.org/idsa/code/",

    // 'ids3cm': 'http://localhost/data/ids3cm/',
    //'ids3c-co': 'http://localhost/data/ids3c-co/',
    // @prefix ids3c-co:    <https://w3id.org/ids3c-component/> .
    // @prefix ids3cm:      <https://w3id.org/ids3cm/> .
    'ids3cm':   'https://w3id.org/ids3cm/',
    'ids3c-co': 'https://w3id.org/ids3c-component/',

    'fua':        'https://www.nicos-rd.com/fua#',
    'dom':        'https://www.nicos-rd.com/fua/domain#',
    'ecm':        'https://www.nicos-rd.com/fua/ecosystem#',
    'idsecm':     'https://www.internationaldataspaces.org/IDS-IM/ecosystem#',
    'tb':         'https://testbed.nicos-rd.com/',
    'tbm':        'https://www.nicos-rd.com/fua/testbed#',
    'fua-lang':   'http://localhost/data/language/',
    'fua-nation': 'http://localhost/data/nation/',
    'currency':   'http://localhost/data/currency/',

    'qudt':    'http://qudt.org/schema/qudt/',
    'unit':    'http://qudt.org/vocab/unit/',
    'soma':    'http://sweetontology.net/matr/',
    'sorelch': 'http://sweetontology.net/relaChemical/',

    'chem-elem': 'http://localhost/data/chemical_element/',

    'dapsm': 'https://www.nicos-rd.com/model/daps#',
    'gbxm':  'http://localhost/model/',
    'gbxc':  'http://localhost/config/',

    'bo-time': 'http://localhost/data/bo/time/',

    //                 @prefix ids:      <https://w3id.org/idsa/core/> .
    //@prefix ids3cm:   <https://w3id.org/idsa/3cm/> .
    //@prefix idsa:     <https://w3id.org/idsa/> .
    //@prefix ids3c-co: <http://localhost/data/ids3c-co/> .
    //@prefix iec:      <https://www.iecee.org/> .
    //@prefix ht2p:     <http://www.w3.org/2011/http#> .
    //
    //

    //@prefix gbxm:      <http://localhost/model/> .
    //@prefix gbx:       <http://localhost/> .

    //'dct':  "http://purl.org/dc/terms/",
    //'fno':  "https://w3id.org/function/ontology#",
    //'foaf': "http://xmlns.com/foaf/0.1/",
    //'org':  "http://www.w3.org/ns/org#",
    //'owl':  "http://www.w3.org/2002/07/owl#",
    //'rdf':  "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
    //'rdfs': "http://www.w3.org/2000/01/rdf-schema#",
    //'time': "http://www.w3.org/2006/time#",
    //// region verifiable credentials
    //'vc': "https://www.w3.org/2018/credentials/v1",
    ////#@prefix cred:        <https://www.w3.org/2018/credentials#> .
    ////#@prefix sec:         <https://w3id.org/security#> .
    //// endregion verifiable credentials
    //'vann': "http://purl.org/vocab/vann/",
    //'voaf': "http://purl.org/vocommons/voaf#",
    //'xsd':  "http://www.w3.org/2001/XMLSchema#"
    ////
    //,
    ////'ht2p': "https://large-bad.internet.com/ontology#",
    //'ht2p': "http://www.w3.org/2011/http#",
    //
    //'ids': "https://w3id.org/idsa/core/",
    ////'idsa':     "https://www.internationaldataspaces.org",
    //'idsa':     "https://w3id.org/idsa/",
    //'idsm':     "https://w3id.org/idsa/metamodel/",
    //'ids3cm':   "https://w3id.org/idsa/3cm/",
    //'ids3c-co': "https://w3id.org/idsa/3c/component/",
    //'iec':      "https://www.iecee.org/"
};

exports.rdf = {
    'context': exports.context
};

exports.persistence = {
    module:  '@nrd/fua.module.persistence.filesystem',
    options: {
        defaultFile: 'file://ts.data.ttl',
        loadFiles:   [
            {
                '@id':             'file://ts.data.ttl',
                'dct:identifier':  path.join(__root, 'data/ts.data.ttl'),
                'dct:format':      'text/turtle',
                'dct:title':       'data.ttl',
                'dct:alternative': 'Testsuite Data'
            },
            // require('@nrd/fua.resource.ontology'),
            // require('@nrd/fua.resource.universe'),
            require('@nrd/fua.resource.ontology.ids/ids3cm'),
            require('@nrd/fua.resource.ontology.ids/ids3c-co'),
            //
            // {'dct:identifier': path.join(__root, 'data/model/tsm.ttl'), 'dct:format': 'text/turtle'},
            {'dct:identifier': path.join(__root, 'data/ts.ttl'), 'dct:format': 'text/turtle'}
            //region domain
            //region domain : users
            // {'dct:identifier': path.join(__root, 'data/domain/user/ts.users.ttl'), 'dct:format': 'text/turtle'},
            //endregion domain : users
            //endregion domain
        ]
    }
};

exports.space = {
    context:   exports.rdf.context,
    datastore: exports.persistence
};

exports.server = {
    id:      'https://testsuite.nicos-rd.com/',
    url:     'https://testsuite.nicos-rd.com/',
    port:    8081,
    options: {
        key:                server_tls_certificates.key,
        cert:               server_tls_certificates.cert,
        ca:                 server_tls_certificates.ca,
        requestCert:        false,
        rejectUnauthorized: false
    }
};

exports.testbed = {
    schema:  'https',
    host:    'testbed.nicos-rd.com',
    port:    8080,
    auth:    {
        user:     'testsuite',
        password: 'marzipan'
    },
    options: exports.server.options
};
