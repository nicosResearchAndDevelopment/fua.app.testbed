const
    config                 = require('./setup-config.js'),
    {awaitMain, ignoreErr} = require('./setup-util.js'),
    git                    = require('../../../../src/code/subprocess/git.js')(config.ec_ids_folder),
    dockerCompose          = require('../../../../src/code/subprocess/docker-compose.js')(config.metadata_broker.docker_compose_file);

awaitMain(async function Main() {
    switch (process.argv[2]) {

        case 'install':
            await _loadRepository();
            // await _createImage();
            // await _createContainer();
            break;

        case 'launch':
            // await _runApplication();
            break;

    }
}); // Main

async function _loadRepository() {
    await git.clone(config.metadata_broker.repo_url, config.metadata_broker.repo_folder);
} // _loadRepository
