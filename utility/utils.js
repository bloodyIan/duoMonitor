//utility functions that can be used for main.js and renderer.js
const electron = require("electron");
const constants = require("./constants.js");
const fs = require("fs");
const path = require("path");

exports.getConsoleBounds = function() {
    return electron.screen.getPrimaryDisplay().bounds;
};

exports.getAllSecondaryDisplays = function() {
    var sortedDisplays = electron.screen.getAllDisplays().sort((a, b) => {
        if (a.bounds.x !== b.bounds.x) {
            return a.bounds.x - b.bounds.x;
        } else {
            return a.bounds.y - b.bounds.y;
        }
    });
    var primaryDisplay = electron.screen.getPrimaryDisplay();
    var frontOfRooms = [];
    for (var i in sortedDisplays) {
        if (sortedDisplays[i].id != primaryDisplay.id) {
            frontOfRooms.push(sortedDisplays[i]);
        }
    }
    return frontOfRooms;
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

exports.getLoadedLanguage = function(locale) {
    //final locale files path is not set yet
    var LocaleFilePath = path.join(__dirname, "locale-" + locale + ".json");
    if (fs.existsSync(LocaleFilePath)) {
        return JSON.parse(fs.readFileSync(LocaleFilePath, "utf8"));
    } else if (fs.existsSync(path.join(__dirname, "locale-en-us.json"))) {
        return JSON.parse(
            fs.readFileSync(path.join(__dirname, "locale-en-us.json"), "utf8")
        );
    } else {
        return null;
    }
};
