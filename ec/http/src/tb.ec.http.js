
exports.ec     = "http";

exports['$ec'] = "http";

exports.fn = {
    'GET': require(`./fn/GET/GET.js`)
};

exports['GET'] = exports.fn['GET'];

// EOF