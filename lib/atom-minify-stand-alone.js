/* global atom */
"use strict";

const CompositeDisposable = require("atom").CompositeDisposable;
const path = require("path");
const fs = require("fs");

module.exports = {
    activate: () => {
        this.subscriptions = new CompositeDisposable();
        this.subscriptions.add(
            atom.commands.add("atom-text-editor", "Minify stand alone: minify", minify)
        );
        this.subscriptions.add(
            atom.commands.add("atom-text-editor", "Minify stand alone: generate", generate)
        );
    },
    deactivate: () => {
        this.subscriptions.dispose();
    },
    config: {
        disable_notifications: {
            title: "Disable notifications of success",
            description: "Disable notifications of saving and running",
            type: "boolean",
            default: false
        },
        disable_notifications_on_fail: {
            title: "Disable notifications of failure",
            description: "Disable notifications of extension name does not match",
            type: "boolean",
            default: false
        }
    },
    subscriptions: null
};

function compress(css) {
    return css
        .replace(/ +/g, " ")
        .replace(/\r\n/g, "")
        .replace(/\s*\{\s*/g, "{")
        .replace(/\s*\:\s*/g, ":")
        .replace(/\s*\;\s*/g, ";")
        .replace(/\s*\,\s*/g, ",");
}

function minify() {
    var buffer = atom.workspace.getActiveTextEditor().buffer;
    var css = buffer.getText();
    var bl = css.length;
    css = compress(css);
    var al = css.length;
    var cp = parseInt(al / bl * 1000) / 10;
    buffer.setText(css);
    atom.notifications.addInfo("Minify success " + bl + " => " + al + "bytes, " + cp + "%");
}

function generate() {
    var buffer = atom.workspace.getActiveTextEditor().buffer;
    var file = buffer.getPath();
    if (!file) {
        atom.notifications.add("warning", "You have to create the file first.");
        return;
    }
    var info = path.parse(file);
    if (info.ext != ".css") {

    }
    var css = buffer.getText();
    var bl = css.length;
    css = compress(css);
    var al = css.length;
    var cp = parseInt(al / bl * 1000) / 10;
    atom.notifications.addInfo("Minify success " + bl + " => " + al + "bytes, " + cp + "%");
    fs.writeFile(info.dir + '/' + info.name + '.min' + info.ext, css, (err) => {
        if (err) throw err;
        console.log('It\'s saved!');
    });
}
