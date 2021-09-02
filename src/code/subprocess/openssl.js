const SubProcess = require('./subprocess.js');

module.exports = function OpenSSL(cwd = process.cwd()) {
    const openssl = SubProcess(cwd, 'openssl');

    openssl.req  = (...args) => openssl('req', ...args);
    openssl.x509 = (...args) => openssl('x509', ...args);
    openssl.rsa  = (...args) => openssl('rsa', ...args);

    return openssl;
};
