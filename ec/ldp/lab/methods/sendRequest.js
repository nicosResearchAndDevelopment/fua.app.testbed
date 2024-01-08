// REM previous version
//exports['send-request'] = async function ({url, method, headers, body}) {
//    const
//        baseUrl   = 'http://localhost:' + config.port,
//        sourceUrl = url.startsWith('/') ? baseUrl + url : (url || baseUrl + '/').replace('http://localhost/', baseUrl + '/'),
//        response  = await fetch(sourceUrl, {
//            method:  method || 'GET',
//            headers: headers,
//            body:    typeof body === 'object' ? JSON.stringify(body) : body
//        });
//
//    return {
//        status:  {
//            url:  sourceUrl.replace('localhost:' + config.port, 'localhost'),
//            ok:   response.ok,
//            code: response.status,
//            text: response.statusText
//        },
//        headers: Object.fromEntries(response.headers.entries()),
//        body:    await response.text()
//    };
//};
//
//exports['GET']     = (args) => exports['send-request']({...args, method: 'GET'});
//exports['HEAD']    = (args) => exports['send-request']({...args, method: 'HEAD'});
//exports['OPTIONS'] = (args) => exports['send-request']({...args, method: 'OPTIONS'});
//exports['POST']    = (args) => exports['send-request']({...args, method: 'POST'});
//exports['PUT']     = (args) => exports['send-request']({...args, method: 'PUT'});
//exports['PATCH']   = (args) => exports['send-request']({...args, method: 'PATCH'});
//exports['DELETE']  = (args) => exports['send-request']({...args, method: 'DELETE'});

async function sendRequest(param) {
    const result = {};
    // TODO
    return result;
} // sendRequest

module.exports = sendRequest;
