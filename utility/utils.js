//utility functions that can be used for main.js and renderer.js
const electron = require("electron");
const constants = require("./constants.js");
const log = require("electron-log");

exports.getConsoleBounds = function() {
    return electron.screen.getPrimaryDisplay().bounds;
};

exports.getFORBounds = function() {
    var sortedDisplays = electron.screen.getAllDisplays().sort((a, b) => {
        if (a.bounds.x !== b.bounds.x) {
            return a.bounds.x - b.bounds.x;
        } else {
            return a.bounds.y - b.bounds.y;
        }
    });
    var primaryDisplay = electron.screen.getPrimaryDisplay();
    var FORbounds = [];
    for (var i in sortedDisplays) {
        if (sortedDisplays[i].id != primaryDisplay.id) {
            FORbounds.push(sortedDisplays[i].bounds);
        }
    }
    return FORbounds;
};

exports.getConsoleControlBounds = function(consoleBounds) {
    let consoleControlBounds = JSON.parse(JSON.stringify(consoleBounds));
    let consoleWindowHeight = Math.round(
        consoleBounds.height * constants.ratios.consoleMeetingRatio
    );
    consoleControlBounds.y = consoleBounds.y + consoleWindowHeight;
    consoleControlBounds.height = consoleBounds.height - consoleWindowHeight;
    return consoleControlBounds;
};

exports.setBounds = function(window, bounds) {
    window.setBounds(bounds);
    window.setBounds(bounds);
};

exports.boundsToString = function(bounds) {
    return `(x, y) = (${bounds.x}, ${bounds.y}) and (width, height) = (${bounds.width} ,${bounds.height})`;
};
