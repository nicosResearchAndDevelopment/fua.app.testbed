import Layout from '/browse/lib/gui.layout.mjs';
import Terminal from '/browse/lib/gui.terminal.mjs';
import Tree from '/browse/lib/gui.tree.mjs';
import Inspector from '/browse/lib/gui.inspector.mjs';
import Popup from '/browse/lib/gui.popup.mjs';
import ContextMenu from '/browse/lib/gui.contextmenu.mjs';
import FilePicker from '/browse/lib/gui.filepicker.mjs';
import Menu from '/browse/lib/gui.menu.mjs';

import FA from '/browse/ext/fontawesome-4.7.0.mjs';

export const prompt = '[App]';

export const popup = new Popup({
    "width":     "60vw",
    "height":    "60vh",
    "title":     "GAIAboX",
    "controls":  ["maximize", "close"],
    "draggable": true,
    "resizable": true
});

export const layout = new Layout(document.body);

export const menu = new Menu(layout.createCell(0, 0, 1, 3), {
    align:   "center",
    justify: "flex-end"
});

export const tree = new Tree(layout.createCell(1, 0, 2, 1), {
    identificator: 'id',
    labelkey:      'label'
});

export const context = new ContextMenu();

export const filePicker = new FilePicker(popup.content, {
    multiSelect: false
});

export const inspector = new Inspector(layout.createCell(1, 1, 1, 1));

export const viewer = new Inspector(layout.createCell(1, 2, 1, 1));

export const terminal = new Terminal(layout.createCell(2, 1, 1, 2));

layout.defineLayout(
    /* rows: */[10, 150, 40],
    /* columns: */[20, 50, 30]
);

menu
    .addLink('Home', '/browse')
    .addLink('Logout', '/login/logout');

export const faListStyles = {
    ['.' + FA.class]: {
        'margin-right': '5px',
        'color':        '#666'
    }
};

tree.style(faListStyles);
context.style(faListStyles);

export function htmlSafeString(str) {
    return str
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/\r?\n/g, '<br>')
        .replace(/\t/g, '    ')
        .replace(/ (?= )/g, '&nbsp;');
}

terminal.defineCmd('fetch', async (url = '', ...args) => {
    // REM this is just an example for a terminal command
    try {
        const headers = {}, options = ['accept'];
        for (let arg of args) {
            for (let header of options) {
                if (arg.startsWith('--' + header + '='))
                    headers[header] = arg.substr(header.length + 3)
            }
        }
        const response = await fetch(url, {method: 'GET', cache: 'no-store', headers});
        if (response.ok) {
            const bodyText = await response.text();
            terminal.printLn(`<span color="grey">${htmlSafeString(bodyText)}</span>`);
        } else {
            terminal.printLn(`<span color="red">[${response.status}]: ${response.statusText}</span>`);
        }
    } catch (err) {
        terminal.printLn(`<span color="red">${err}</span>`);
    }
}, 'Fetch content from an url with a GET request.');
