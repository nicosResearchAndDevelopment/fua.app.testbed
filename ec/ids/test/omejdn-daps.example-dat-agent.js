const
    fetch             = require('node-fetch'),
    net               = require('net'),
    http              = require('http'),
    tls               = require('tls'),
    https             = require('https'),
    {URLSearchParams} = require('url'),
    // SEE https://github.com/panva/jose/blob/main/docs/classes/jwt_sign.SignJWT.md#readme
    {SignJWT}         = require('jose/jwt/sign'),
    // SEE https://github.com/panva/jose/blob/main/docs/functions/util_base64url.decode.md#readme
    {decode}          = require('jose/util/base64url');

class DATSocket extends tls.TLSSocket {
    // class DATSocket extends net.Socket {

    #getAccessToken = null;
    #accessToken    = '';

    // SEE https://nodejs.org/docs/latest-v14.x/api/tls.html#tls_class_tls_tlssocket
    constructor(options, getAccessToken) {
        super(options);
        this.#getAccessToken = getAccessToken;
    } // DATSocket#constructor

    // SEE https://nodejs.org/docs/latest-v14.x/api/net.html#net_socket_connect
    // SEE https://nodejs.org/docs/latest-v14.x/api/tls.html#tls_tls_connect_options_callback
    connect(...args) {
        this.#getAccessToken()
            .then((jwt) => {
                this.#accessToken = jwt;
                super.connect(...args);
            })
            .catch((err) => this.emit('error', err));
        return this;
    } // DATSocket#connect

    addRequest(req, ...args) {
        req.setHeader('Authorization', `Bearer ${this.#accessToken}`);
        super.addRequest(req, ...args);
    } // DATSocket#addRequest

} // DATSocket

// SEE https://github.com/danielstjules/toragent/blob/5ff30591d788620c00acd05c302ff3dd86606aa3/lib/agent.js
class DATAgent extends https.Agent {
    // class DATAgent extends http.Agent {

    #basicAgent         = null;
    #dapsUrl            = '';
    #clientKeyId        = '';
    #clientPrivateKey   = null;
    #clientAssertion    = '';
    #validAssertionTime = 0;
    #accessToken        = '';
    #validAccessTime    = 0;

    constructor(options) {
        super(options);
        this.#basicAgent       = new https.Agent(options);
        // this.#basicAgent       = new http.Agent(options);
        this.#dapsUrl          = options.dapsUrl;
        this.#clientKeyId      = `${options.subjectKeyIdentifier}:${options.authorityKeyIdentifier}`;
        this.#clientPrivateKey = options.clientPrivateKey;
    } // DATAgent#constructor

    async getAccessToken() {
        const currentTime = 1e-3 * Date.now();

        if (!this.#accessToken || currentTime > this.#validAccessTime) {
            if (!this.#clientAssertion || currentTime > this.#validAssertionTime) {
                this.#validAssertionTime = currentTime + 300;
                this.#clientAssertion    = await new SignJWT({})
                    .setProtectedHeader({alg: 'RS256'})
                    .setIssuer(this.#clientKeyId)
                    .setSubject(this.#clientKeyId)
                    .setAudience('idsc:IDS_CONNECTORS_ALL')
                    .setIssuedAt(currentTime)
                    .setNotBefore(currentTime)
                    .setExpirationTime(this.#validAssertionTime)
                    .sign(this.#clientPrivateKey);
            }

            const
                dat_request  = {
                    method:  'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
                    },
                    body:    new URLSearchParams({
                        grant_type:            'client_credentials',
                        client_assertion_type: 'urn:ietf:params:oauth:client-assertion-type:jwt-bearer',
                        client_assertion:      this.#clientAssertion,
                        scope:                 'idsc:IDS_CONNECTOR_ATTRIBUTES_ALL'
                    }).toString(),
                    agent:   this.#basicAgent
                },
                dat_response = await fetch(this.#dapsUrl, dat_request),
                dat_result   = await dat_response.json();

            if (dat_result.error) {
                const err = new Error(dat_result.error_description);
                err.code  = dat_result.error;
                throw err;
            }

            const access_claims   = JSON.parse(decode(dat_result.access_token.split('.')[1]));
            this.#validAccessTime = access_claims.exp;
            this.#accessToken     = dat_result.access_token;
        }

        return this.#accessToken;
    } // DATAgent#getAccessToken

    // SEE https://nodejs.org/docs/latest-v14.x/api/net.html#net_net_createconnection
    // SEE https://nodejs.org/docs/latest-v14.x/api/http.html#http_agent_createconnection_options_callback
    // SEE https://nodejs.org/docs/latest-v14.x/api/tls.html#tls_tls_connect_options_callback
    // SEE https://nodejs.org/docs/latest-v14.x/api/https.html#https_class_https_agent
    createConnection(options, callback) {
        const socket = new DATSocket(options, this.getAccessToken.bind(this));
        socket.connect(options, callback);
        return socket;
    } // DATAgent#createConnection

} // DATAgent

module.exports = DATAgent;
