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
    console.log(`done`);
}); // Main

async function _loadRepository() {
    await git('clone', config.omejdn_daps.repo_url, config.omejdn_daps.repo_folder);
    console.log(`cloned omejdn-daps repository`);
} // _loadRepository

async function _createImage() {
    await util.ignoreErr(docker('rm', config.omejdn_daps.container_name));
    await util.ignoreErr(docker('rmi', config.omejdn_daps.image_name));
    await docker('build', {
        tag: config.omejdn_daps.image_name
    }, config.omejdn_daps.repo_folder);
    console.log(`created omejdn-daps image`);
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
    console.log(`created omejdn-daps container`);
} // _createContainer

async function _runApplication() {
    await docker('start', config.omejdn_daps.container_name);
    console.log(`started omejdn-daps application`);
} // _runApplication

async function _addClientCertificate(param) {
    util.assert(util.isString(param.load), 'missing --load');
    // SEE https://github.com/International-Data-Spaces-Association/IDS-G/blob/main/Components/IdentityProvider/DAPS/README.md
    // TODO add option for scopes and attributes
    const
        client      = require(param.load),
        clientId    = `${client.meta.SKI}:${client.meta.AKI}`,
        certFile    = Buffer.from(clientId).toString('base64') + '.cert',
        clientEntry = `- client_id: ${clientId}\n` +
            '  allowed_scopes:\n' +
            '    - omejdn:api\n' +
            '  attributes: []\n' +
            `  certfile: ${certFile}`;
    await fs.writeFile(util.joinPath(config.omejdn_daps.keys_folder, certFile), client.cert, {flag: 'wx'});
    await fs.appendFile(config.omejdn_daps.clients_file, '\n' + clientEntry);
    console.log(`added certificate for ${clientId}`);
} // _addClientCertificate
