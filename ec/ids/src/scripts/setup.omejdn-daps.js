const
    config                 = require('./setup-config.js'),
    {awaitMain, ignoreErr} = require('./setup-util.js'),
    git                    = require('../../../../src/code/subprocess/git.js')(config.ec_ids_folder),
    docker                 = require('../../../../src/code/subprocess/docker.js')(config.omejdn_daps.repo_folder);

awaitMain(async function Main() {
    switch (process.argv[2]) {

        case 'install':
            await _loadRepository();
            await _createImage();
            await _createContainer();
            break;

        case 'launch':
            await _runApplication();
            break;

    }
}); // Main

async function _loadRepository() {
    await git.clone(config.omejdn_daps.repo_url, config.omejdn_daps.repo_folder);
} // _loadRepository

async function _createImage() {
    await ignoreErr(docker.rm(config.omejdn_daps.container_name));
    await ignoreErr(docker.rmi(config.omejdn_daps.image_name));
    await docker.build({
        tag: config.omejdn_daps.image_name
    }, config.omejdn_daps.repo_folder);
} // _createImage

async function _createContainer() {
    await ignoreErr(docker.rm(config.omejdn_daps.container_name));
    await docker.create({
        name:    config.omejdn_daps.container_name,
        publish: '4567:4567',
        volume:  [
            config.omejdn_daps.config_folder + ':/opt/config',
            config.omejdn_daps.keys_folder + ':/opt/keys'
        ]
    }, config.omejdn_daps.image_name);
} // _createContainer

async function _runApplication() {
    await docker.start(config.omejdn_daps.container_name);
} // _runApplication
