const
    path = require('path'),
    fs   = require('fs/promises');

async function copyCertFiles(source, target) {
    const targetDir = path.dirname(target), targetName = path.basename(target);
    await fs.mkdir(targetDir, {recursive: true});
    for (let targetFile of await fs.readdir(targetDir)) {
        if (!targetFile.startsWith(targetName + '.')) continue;
        const targetPath = path.join(targetDir, targetFile);
        await fs.rm(targetPath);
    }
    const sourceDir = path.dirname(source), sourceName = path.basename(source);
    for (let sourceFile of await fs.readdir(sourceDir)) {
        if (!sourceFile.startsWith(sourceName + '.')) continue;
        const sourcePath = path.join(sourceDir, sourceFile);
        const targetPath = path.join(targetDir, sourceFile.replace(sourceName, targetName));
        await fs.copyFile(sourcePath, targetPath);
    }
}

const
    ca_testbed       = path.join(process.env.FUA_JS_APP, 'nrd-ca', 'resources', 'nrd-testbed'),
    testbed_root     = path.join(process.env.FUA_JS_APP, 'nrd-testbed'),
    copyTestbedCerts = (source, target) => copyCertFiles(path.join(ca_testbed, source), path.join(testbed_root, target));

Promise.all([
    copyTestbedCerts('tb/tls-server/server', 'cert/tls-server/server'),
    copyTestbedCerts('ec/ids/component/daps_nrd/connector/client', 'cert/daps/connector/client'),
    copyTestbedCerts('ec/ids/component/daps_nrd/tls-server/server', 'cert/daps/tls-server/server'),
    copyTestbedCerts('ec/ids/component/alice/connector/client', 'ec/ids/cert/alice/connector/client'),
    copyTestbedCerts('ec/ids/component/alice/tls-server/server', 'ec/ids/cert/alice/tls-server/server'),
    copyTestbedCerts('ec/ids/component/bob/connector/client', 'ec/ids/cert/bob/connector/client'),
    copyTestbedCerts('ec/ids/component/bob/tls-server/server', 'ec/ids/cert/bob/tls-server/server')
]).then(() => console.log('done')).catch(console.error);
