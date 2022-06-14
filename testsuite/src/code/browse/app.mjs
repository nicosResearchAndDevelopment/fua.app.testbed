import * as setup from './app.setup.mjs';
import {model, space} from './lib/module.ldp.mjs';
import io from './ext/socket.io-wrapper.mjs';
import FA from './ext/fontawesome-4.7.0.mjs';

let
    selectedNode = null,
    uploadNode   = null,
    socket       = io(),
    socketID     = socket.id;

space.events
    .on('node-update', (node) => {
        setup.terminal.printLn(`<span color="grey">fetched</span> ${node.id}`, setup.prompt);
        //setup.tree.updateLabel(node);
        switch (node.target.type) {
            case model.Resource:
                setup.tree.updateIcon(node, FA.file_o());
                break;
            case model.RDFSource:
                setup.tree.updateIcon(node, FA.file_code_o());
                break;
            case model.NonRDFSource:
                setup.tree.updateIcon(node, FA.file_text_o());
                break;
            case model.Container:
            case model.BasicContainer:
            case model.DirectContainer:
            case model.IndirectContainer:
                setup.tree.updateIcon(node, FA.folder_o(), FA.folder_open_o());
                break;
            default:
                setup.tree.updateIcon(node, FA.question_circle_o());
        }
    })
    .on('node-failure', (node, err) => {
        setup.terminal.printLn(`<span color="red">${err}</span>`, setup.prompt);
        setup.tree.updateIcon(node, FA.ban());
        if (selectedNode === node) {
            setup.viewer.reset();
            setup.inspector.reset()
                .addTitle('' + err)
                .addParagraph(err?.stack?.replace(/^.*?\n(?=[ \t]+at)/s, '') ?? '');
        }
    });

setup.tree
    .on('create', (elem, node) => {
        setup.context.watchElement(elem, node);
        if (!node.target) setup.tree.updateIcon(node, FA.question_circle_o());
    })
    .on('select', async (elem, node) => {
        try {
            if (selectedNode === node) return;
            selectedNode = node;

            const resource = node.target || await node.read();
            setup.inspector.inspectObject(resource);
            // REM inspectURL will always make a new request to the server
            setup.viewer.inspectURL(node.url);

            if (resource instanceof model.Container) {
                const childArr = resource.contains.map(space.getNode);
                setup.tree.updateChildren(node, childArr);
            }
        } catch (err) {
            console.error(err);
        }
    });

setup.context.menu
    .on('create', (elem, label) => {
        elem.querySelector('.fa:first-child')?.remove();
        switch (label.toLowerCase()) {
            case 'update':
                elem.prepend(FA.refresh());
                break;
            default:
                elem.prepend(FA.chevron_right());
        }
    })
    .addCallback('update', async (elem, node) => {
        try {
            const resource = await node.read();

            if (resource instanceof model.Container) {
                const childArr = resource.contains.map(space.getNode);
                setup.tree.updateChildren(node, childArr);
            }

            if (selectedNode === node) {
                setup.inspector.inspectObject(resource);
                // REM inspectURL will always make a new request to the server
                setup.viewer.inspectURL(node.url);
            }
        } catch (err) {
            console.error(err);
        }
    });

socket
    .on('connect', () => {
        socketID = socket.id;
        setup.terminal.printLn(
            `<span color="green">connected</span> <span color="grey">${socketID}</span>`,
            '[IO]'
        );
        socket.emit('subscribe', {room: 'terminal'});
    })
    .on('disconnect', () => {
        setup.terminal.printLn(
            `<span color="red">disconnected</span> <span color="grey">${socketID}</span>`,
            '[IO]'
        );
    })
    .on('error', (errMsg) => {
        const err = new Error(errMsg);
        setup.terminal.printLn(
            `<span color="red">${err}</span>`,
            '[IO]'
        );
    })
    .on('printMessage', (payload) => {
        const {'msg': message, 'prov': provenance} = payload;
        setup.terminal.printLn(
            `<span color="yellow">${message}</span>`,
            provenance || '[IO]'
        );
    })
    .on('printData', (payload) => {
        const {'data': data, 'prov': provenance} = payload;
        const message                            = JSON.stringify(data, null, '\t').replace(/\t/g, '&nbsp;&nbsp;&nbsp;&nbsp;').replace(/\n/g, '<br>');
        setup.terminal.printLn(
            `<span color="white">${message}</span>`,
            provenance || '[IO]'
        );
    })
    .on('printError', (payload) => {
        const {'error': error, 'prov': provenance} = payload;
        const message                              = error.replace(/ /g, '&nbsp;&nbsp;&nbsp;&nbsp;').replace(/\n/g, '<br>');
        setup.terminal.printLn(
            `<span color="red">${message}</span>`,
            provenance || '[IO]'
        );
    });

setup.tree.addRoot(space.getNode('/data/'));
setup.terminal.printLn('ready', setup.prompt);
