const
    fetch                  = require('node-fetch'),
    http                   = require('http'),
    https                  = require('https'),
    {URL, URLSearchParams} = require('url'),
    // SEE https://github.com/panva/jose/blob/main/docs/classes/jwt_sign.SignJWT.md#readme
    {SignJWT}              = require('jose/jwt/sign'),
    // SEE https://github.com/panva/jose/blob/main/docs/functions/util_base64url.decode.md#readme
    {decode}               = require('jose/util/base64url');

// SEE https://github.com/danielstjules/toragent/blob/5ff30591d788620c00acd05c302ff3dd86606aa3/lib/agent.js
class DATAgent extends http.Agent {
    // class DATAgent extends https.Agent {

    #httpAgent           = null;
    #httpsAgent          = null;
    #dapsUrl             = '';
    #clientKeyId         = '';
    #clientPrivateKey    = null;
    #clientAssertion     = '';
    #validAssertionTime  = 0;
    #expireAssertionTime = 300;
    #accessToken         = '';
    #validAccessTime     = 0;
    #validTimeBuffer     = 60;
    #accessAudience      = 'http://localhost:4567'; // 'idsc:IDS_CONNECTORS_ALL';

    constructor(options) {
        super(options);
        this.#httpAgent        = new http.Agent(options);
        this.#httpsAgent       = new https.Agent(options);
        this.#dapsUrl          = options.dapsUrl;
        this.#clientKeyId      = `${options.subjectKeyIdentifier}:${options.authorityKeyIdentifier}`;
        this.#clientPrivateKey = options.clientPrivateKey;
    } // DATAgent#constructor

    async getAccessToken() {
        const currentTime = 1e-3 * Date.now();

        if (!this.#accessToken || currentTime + this.#validTimeBuffer > this.#validAccessTime) {
            if (!this.#clientAssertion || currentTime + this.#validTimeBuffer > this.#validAssertionTime) {
                this.#validAssertionTime = currentTime + this.#expireAssertionTime;
                this.#clientAssertion    = await new SignJWT({})
                    .setProtectedHeader({alg: 'RS256'})
                    .setIssuer(this.#clientKeyId)
                    .setSubject(this.#clientKeyId)
                    .setAudience(this.#accessAudience)
                    .setIssuedAt(currentTime)
                    .setNotBefore(currentTime)
                    .setExpirationTime(this.#validAssertionTime)
                    .sign(this.#clientPrivateKey);
            }

            const
                dat_url      = new URL('/token', this.#dapsUrl).toString(),
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
                    agent:   this.#dapsUrl.startsWith('https') ? this.#httpsAgent : this.#httpAgent
                },
                dat_response = await fetch(dat_url, dat_request),
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

    addRequest(req, ...args) {
        this.getAccessToken()
            .then((accessToken) => {
                req.setHeader('Authorization', `Bearer ${accessToken}`);
                super.addRequest(req, ...args);
            })
            .catch((err) => req.destroy(err));
    } // DATAgent#addRequest

} // DATAgent

module.exports = DATAgent;
