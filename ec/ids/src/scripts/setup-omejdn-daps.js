const
    path      = require('path'),
    fs        = require('fs/promises'),
    docker    = require('../../../../src/code/docker.js'),
    git       = require('../../../../src/code/git.js'),
    ignoreErr = (promise) => new Promise((resolve, reject) => promise.then(resolve).catch((err) => resolve())),
    awaitMain = (fn, ...args) => fn.apply(null, args).then(() => process.exit(0)).catch((err) => console.error(err?.stack ?? err) || process.exit(1)),
    config    = {
        repoUrl:       'https://github.com/nicosResearchAndDevelopment/omejdn-daps.git',
        repoFolder:    path.join(__dirname, '../../omejdn-daps'),
        imageName:     'omejdn-daps',
        containerName: 'omejdn-daps'
    };

awaitMain(async function Main() {
    switch (process.argv[2]) {

        case 'install':
            await _loadRepository();
            await _createImage();
            await _createContainer();
            break;

        case 'run':
            await _runApplication();
            break;

    }
}); // Main

async function _loadRepository() {
    await git.clone(config.repoUrl, config.repoFolder);
} // _loadRepository

async function _createImage() {
    await ignoreErr(docker.rm(config.containerName));
    await ignoreErr(docker.rmi(config.imageName));
    await docker.build({
        tag: config.imageName
    }, config.repoFolder);
} // _createImage

async function _createContainer() {
    await ignoreErr(docker.rm(config.containerName));
    await docker.create({
        name:    config.containerName,
        publish: '4567:4567',
        volume:  [
            path.join(config.repoFolder, 'config') + ':/opt/config',
            path.join(config.repoFolder, 'keys') + ':/opt/keys'
        ]
    }, config.imageName);
} // _createContainer

async function _runApplication() {
    await docker.start(config.containerName);
} // _runApplication
