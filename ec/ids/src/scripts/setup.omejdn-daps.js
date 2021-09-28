const
    config     = require('./setup-config.js'),
    util       = require('./setup-util.js'),
    fs         = require('fs/promises'),
    subprocess = require('@nrd/fua.module.subprocess'),
    git        = subprocess.ExecutionProcess('git', {
        cwd:     config.ec_ids_folder,
        verbose: true
    }),
    docker     = subprocess.ExecutionProcess('docker', {
        cwd:     config.omejdn_daps.repo_folder,
        verbose: true
    }),
    openssl    = subprocess.ExecutionProcess('openssl', {
        cwd:     config.omejdn_daps.keys_folder,
        verbose: true
    });

util.awaitMain(async function Main() {
    const {param, args: [exe, script, ...args]} = subprocess.parseArgv();

    switch (args.shift()) {

        case 'install':
            await _loadRepository();
            await _createImage();
            await _createContainer();
            break;

        case 'launch':
            await _runApplication();
            break;

        case 'add-client':
            await _addClientCertificate(param, ...args);
            break;

    }
}); // Main

async function _loadRepository() {
    await git('clone', config.omejdn_daps.repo_url, config.omejdn_daps.repo_folder);
} // _loadRepository

async function _createImage() {
    await util.ignoreErr(docker('rm', config.omejdn_daps.container_name));
    await util.ignoreErr(docker('rmi', config.omejdn_daps.image_name));
    await docker('build', {
        tag: config.omejdn_daps.image_name
    }, config.omejdn_daps.repo_folder);
} // _createImage

async function _createContainer() {
    await util.ignoreErr(docker('rm', config.omejdn_daps.container_name));
    await docker('create', {
        name:    config.omejdn_daps.container_name,
        publish: '4567:4567',
        volume:  [
            config.omejdn_daps.config_folder + ':/opt/config',
            config.omejdn_daps.keys_folder + ':/opt/keys'
        ]
    }, config.omejdn_daps.image_name);
} // _createContainer

async function _runApplication() {
    await docker('start', config.omejdn_daps.container_name);
} // _runApplication

async function _addClientCertificate(param, ...args) {
    util.assert(util.isString(param.privateKey), 'missing --privateKey');
    util.assert(util.isString(param.SKI), 'missing --SKI');
    util.assert(util.isString(param.AKI), 'missing --AKI');
    util.assert(util.isString(param.redirectUri), 'missing --redirectUri');
    // SEE https://github.com/International-Data-Spaces-Association/IDS-G/blob/main/Components/IdentityProvider/DAPS/README.md
    // TODO add option for scopes and attributes
    const
        clientId    = `${param.SKI}:${param.AKI}`,
        certFile    = Buffer.from(clientId).toString('base64') + '.cert',
        clientEntry = `- client_id: ${clientId}\n` +
            '  allowed_scopes:\n' +
            '    - omejdn:api\n' +
            `  redirect_uri: ${param.redirectUri}\n` +
            '  attributes: []\n' +
            `  certfile: ${certFile}`;

    await openssl('req', {
        new:   null,
        x509:  null,
        nodes: null,
        batch: null,
        days:  param.days || 365,
        key:   param.privateKey,
        out:   certFile
    });

    await fs.appendFile(config.omejdn_daps.clients_file, '\n' + clientEntry);
} // _addClientCertificate
