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
        cwd:     config.dataspace_connector.repo_folder,
        verbose: true
    });

util.awaitMain(async function Main() {
    const {param, args: [exe, script, method, ...args]} = subprocess.parseArgv();

    switch (method) {

        case 'install':
            // await _loadRepository();
            await _createContainer();
            break;

        case 'launch':
            await _runApplication();
            break;

    }
    console.log(`done`);
}); // Main

async function _loadRepository() {
    await git('clone', config.dataspace_connector.repo_url, config.dataspace_connector.repo_folder);
    console.log(`cloned dataspace-connector repository`);
} // _loadRepository

async function _createContainer() {
    await util.ignoreErr(docker('rm', config.dataspace_connector.container_name));
    await docker('create', {
        name:    config.dataspace_connector.container_name,
        publish: config.dataspace_connector.exposed_port + ':8080'
    }, config.dataspace_connector.image_name);
    console.log(`created dataspace-connector container`);
} // _createContainer

async function _runApplication() {
    await docker('start', config.dataspace_connector.container_name);
    console.log(`started dataspace-connector application`);
} // _runApplication
