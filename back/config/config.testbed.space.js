const
    path   = require('path'),
    __root = path.join(__dirname, '../..');

exports.uri = 'https://tb.nicos-rd.com/';

exports.context = {
    ...require('@fua/resource.context'),

    'ids':  'https://w3id.org/idsa/core/',
    'idsc': 'https://w3id.org/idsa/code/',

    'fua':  'https://www.nicos-rd.com/fua#',
    'dom':  'https://www.nicos-rd.com/fua/domain#',
    'ecm':  'https://www.nicos-rd.com/fua/ecosystem#',
    'daps': 'https://www.nicos-rd.com/fua/daps#',

    'tb':  'https://tb.nicos-rd.com/',
    'tbm': 'https://www.nicos-rd.com/fua/testbed#'
};

exports.store = {
    module:  '@fua/module.persistence.filesystem',
    options: {
        defaultFile: 'file://data.ttl',
        loadFiles:   [
            {
                'dct:identifier': path.join(__root, 'data/load.json'),
                'dct:format':     'application/fua.load+json'
            },
            require('@fua/resource.ontology.core')
        ]
    }
};
