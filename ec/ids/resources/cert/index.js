const
    { readFileSync } = require('fs'),
    { join: joinPath } = require('path'),
    load = (filename) => readFileSync(joinPath(__dirname, filename));

exports.server = {
    private: load('server.key'),
    public: load('server.key.pub')
};

exports.server_tls = {
    private: load('server_tls.key'),
    public: load('server_tls.key.pub')
};

exports.client = {
    private: load('client.key'),
    public: load('client.key.pub')
};

exports.client_tls = {
    private: load('client_tls.key'),
    public: load('client_tls.key.pub')
};
