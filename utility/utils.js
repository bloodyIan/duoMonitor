//utility functions that can be used for main.js and renderer.js
const electron = require("electron");
const constants = require("./constants.js");

exports.getConsoleBounds = function() {
    return electron.screen.getPrimaryDisplay().bounds;
};

exports.getFORBounds = function() {
    var displays = electron.screen.getAllDisplays();
    var primaryDisplay = electron.screen.getPrimaryDisplay();
    for (var i in displays) {
        if (displays[i].id != primaryDisplay.id) {
            return displays[i].bounds;
        }
    }
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
