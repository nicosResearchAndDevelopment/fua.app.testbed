const
    config                       = require('./setup-config.js'),
    {awaitMain, ignoreErr}       = require('./setup-util.js'),
    {mkdir, readFile, writeFile} = require('fs/promises'),
    subprocess                   = require('@nrd/fua.module.subprocess'),
    git                          = subprocess.ExecutionProcess('git', {
        cwd:     config.ec_ids_folder,
        verbose: true
    }),
    openssl                      = subprocess.ExecutionProcess('openssl', {
        cwd:     config.metadata_broker.cert_folder,
        verbose: true
    }),
    dockerCompose                = subprocess.ExecutionProcess('docker-compose', {
        cwd:     config.metadata_broker.docker_compose_folder,
        verbose: true
    });

awaitMain(async function Main() {
    const {param, args: [exe, script, ...args]} = subprocess.parseArgv();

    switch (args.shift()) {

        case 'install':
            await _loadRepository();
            await _createTlsCertificate();
            await _modifyDockerCompose();
            await _createContainer();
            break;

        case 'launch':
            await _runApplication();
            break;

    }
}); // Main

async function _loadRepository() {
    await git('clone', config.metadata_broker.repo_url, config.metadata_broker.repo_folder);
} // _loadRepository

async function _createTlsCertificate() {
    await mkdir(config.metadata_broker.cert_folder, {recursive: true});
    await openssl('req', {
        x509:   true,
        newkey: 'rsa:4096',
        keyout: 'key.pem',
        out:    'cert.pem',
        days:   365,
        nodes:  true,
        batch:  true
    });
    await openssl('x509', {
        in:  'cert.pem',
        out: 'server.crt'
    });
    await openssl('rsa', {
        in:  'key.pem',
        out: 'server.key'
    });
} // _createTlsCertificate

async function _modifyDockerCompose() {
    const
        dockerComposeFile = await readFile(config.metadata_broker.docker_compose_file, 'utf-8'),
        editedComposeFile = dockerComposeFile
            .replace(
                /- \/etc\/idscert\/localhost:\/etc\/cert\//g,
                `- ${config.metadata_broker.cert_folder.replace(/\\/g, '/')}:/etc/cert/`
            )
            .replace(/- "443:443"/g, '- "8443:443"')
            .replace(/- "80:80"/g, '- "8480:80"');
    await writeFile(config.metadata_broker.docker_compose_file, editedComposeFile);
} // _modifyDockerCompose

async function _createContainer() {
    await dockerCompose('pull');
} // _createContainer

async function _runApplication() {
    await dockerCompose('up', {detach: true});
} // _runApplication
