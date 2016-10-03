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

function compresscss(code) {
    return code
        .replace(/ +/g, " ")
        .replace(/\r\n/g, "")
        .replace(/\s*\{\s*/g, "{")
        .replace(/\s*\:\s*/g, ":")
        .replace(/\s*\;\s*/g, ";")
        .replace(/\s*\,\s*/g, ",");
}

function compressjs(code) {
    var map1 = new Array();
    var map2 = new Array();
    var k1 = 0;
    var k2 = 0;
    var m;
    while ((m = code.match(/".*(?<!\\)"/m))) {
        code = code.replace(/".*(?<!\\)"/m, "{%" + k1 + "%}");
        map1[k1++] = m;
    }
    while ((m = code.match(/'.*(?<!\\)'/m))) {
        code = code.replace(/'.*(?<!\\)'/m, "{%" + k2 + "%}");
        map2[k2++] = m;
    }
    code = code
        .replace(/\/\/.*/mg, "")
        .replace(/ +/g, " ")
        .replace(/\r\n/g, "")
        .replace(/\s*\{\s*/g, "{")
        .replace(/\s*\:\s*/g, ":")
        .replace(/\s*\;\s*/g, ";")
        .replace(/\s*\,\s*/g, ",");
    for (var i = 0; i < k2; i++) {
        code = code.replace("{%" + i + "%}", map2[i]);
    }
    for (var i = 0; i < k1; i++) {
        code = code.replace("{%" + i + "%}", map1[i]);
    }
    return code;
}

function minify() {
    var buffer = atom.workspace.getActiveTextEditor().buffer;
    var css = buffer.getText();
    var bl = css.length;
    css = compresscss(css);
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
    var code = buffer.getText();
    var bl = code.length;
    if (info.ext == ".css") {
        code = compresscss(code);
    } else if (info.ext == ".js") {
        code = compressjs(code);
    } else {
        return;
    }
    var al = code.length;
    var cp = parseInt(al / bl * 1000) / 10;
    atom.notifications.addSuccess(
        "# Minify success, " + cp + "%\nFrom" + bl + " to " + al + " Bytes, " + (bl - al) + " Bytes saved.\n"
    );
    fs.writeFile(info.dir + "/" + info.name + ".min" + info.ext, code, (err) => {
        if (err) {
            throw err;
        }
        console.log("It's saved!");
    });
}
