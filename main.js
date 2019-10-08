const { app, BrowserWindow, ipcMain } = require("electron");
const electron = require("electron");
const log = require("electron-log");
const utils = require("./utility/utils.js");
const constants = require("./utility/constants.js");
let allSecondaryDisplays;
let consoleWindow, frontOfRoomWindow, frontOfRoom2Window, consoleControlWindow;
let consoleBounds,
    frontOfRoomBounds,
    frontOfRoom2Bounds,
    consoleControlBounds,
    consoleWindowHeight,
    meetingBounds;
let meetingOnConsole = true;
global.sharedObject = {
    prop1: process.argv
};
//setting log file location
log.transports.file.file = __dirname + "/thirdParty.log";

function createWindows() {
    log.info("Creating console, consoleControl and frontOfRoom windows");
    allSecondaryDisplays = utils.getAllSecondaryDisplays();
    frontOfRoomBounds =
        allSecondaryDisplays.length >= 1
            ? allSecondaryDisplays[0].bounds
            : null;
    frontOfRoom2Bounds =
        allSecondaryDisplays.length === 2
            ? allSecondaryDisplays[1].bounds
            : null;
    consoleBounds = utils.getConsoleBounds();
    consoleControlBounds = utils.getConsoleControlBounds(consoleBounds);
    consoleWindowHeight = Math.round(
        consoleBounds.height * constants.ratios.consoleMeetingRatio
    );
    createFrontOfRoomWindows();
    createConsoleWindow();
    createConsoleControlWindow();
    //The proper 'closed' callback here helps to avoid future calls on destroyed object.
    consoleWindow.on("closed", function() {
        consoleWindow = null;
    });
    if (frontOfRoomBounds) {
        frontOfRoomWindow.on("closed", function() {
            frontOfRoomWindow = null;
        });
    }
    if (frontOfRoom2Bounds) {
        frontOfRoom2Window.on("closed", function() {
            frontOfRoom2Window = null;
        });
    }
    consoleControlWindow.on("closed", function() {
        consoleWindow = null;
    });
    log.info("Launching app");
}

function createFrontOfRoomWindows() {
    if (frontOfRoomBounds) {
        frontOfRoomWindow = new BrowserWindow({
            x: frontOfRoomBounds.x,
            y: frontOfRoomBounds.y,
            frame: false,
            webPreferences: { nodeIntegration: true, webSecurity: true }
        });
        frontOfRoomWindow.maximize();
        frontOfRoomWindow.loadURL(
            "file://" + __dirname + "/renderer/frontOfRoom.html"
        );
        log.info(
            `Created frontOfRoom window: ${utils.boundsToString(
                frontOfRoomBounds
            )}`
        );
    }

    if (frontOfRoom2Bounds) {
        log.info("2nd frontOfRoom monitor exists");
        frontOfRoom2Window = new BrowserWindow({
            x: frontOfRoom2Bounds.x,
            y: frontOfRoom2Bounds.y,
            width: frontOfRoom2Bounds.width,
            height: frontOfRoom2Bounds.height,
            frame: false,
            webPreferences: { nodeIntegration: true }
        });
        frontOfRoom2Window.maximize();
        frontOfRoom2Window.loadURL(
            "file://" + __dirname + "/renderer/secondFrontOfRoom.html"
        );
        log.info(
            `Created 2nd frontOfRoom window: ${utils.boundsToString(
                frontOfRoom2Bounds
            )}`
        );
    }
}

function createConsoleWindow() {
    consoleWindow = new BrowserWindow({
        x: consoleBounds.x,
        y: consoleBounds.y,
        width: consoleBounds.width,
        height: consoleWindowHeight,
        frame: false,
        webPreferences: { nodeIntegration: true }
    });
    consoleWindow.loadURL("file://" + __dirname + "/renderer/console.html");
    log.info(`Created console window: ${utils.boundsToString(consoleBounds)}`);
}

function createConsoleControlWindow() {
    consoleControlWindow = new BrowserWindow({
        x: consoleControlBounds.x,
        y: consoleControlBounds.y,
        width: consoleControlBounds.width,
        height: consoleControlBounds.height,
        frame: false,
        parent: consoleWindow
    });
    consoleControlWindow.loadURL(
        "file://" + __dirname + "/renderer/consoleControl.html"
    );
    log.info(
        `Created console control window: ${utils.boundsToString(
            consoleControlBounds
        )}`
    );
}

function handleDisplayRemoved(event, display) {
    allSecondaryDisplays = utils.getAllSecondaryDisplays();
    if (display.id == allSecondaryDisplays[0].id) {
        log.warn("frontOfRoom1 removed");
        if (allSecondaryDisplays[1]) {
            utils.setBounds(frontOfRoomWindow, frontOfRoom2Bounds);
        } else {
            frontOfRoomWindow.hide();
        }
    } else {
        log.warn("frontOfRoom2 removed");
        frontOfRoom2Window.hide();
    }
}

function handleDisplayAdded(event, display) {
    allSecondaryDisplays = utils.getAllSecondaryDisplays();
    if (display.id == allSecondaryDisplays[0].id) {
        log.warn("frontOfRoom1 added");
        if (allSecondaryDisplays[1]) {
            utils.setBounds(frontOfRoomWindow, frontOfRoomBounds);
            frontOfRoom2Window.show();
        } else {
            frontOfRoomWindow.show();
            utils.setBounds(frontOfRoomWindow, frontOfRoomBounds);
        }
    } else {
        log.warn("frontOfRoom2 added");
        frontOfRoom2Window.show();
        utils.setBounds(frontOfRoom2Window, frontOfRoom2Bounds);
    }
}

ipcMain.on(constants.events.closeApp, (evt, arg) => {
    log.info("Closing app");
    app.quit();
});
//receiving message from consoleControl.js and switch window
ipcMain.on(constants.events.switchWindow, (event, args) => {
    meetingBounds = {
        x: consoleBounds.x,
        y: consoleBounds.y,
        width: consoleBounds.width,
        height: consoleWindowHeight
    };
    if (meetingOnConsole === true) {
        utils.setBounds(consoleWindow, frontOfRoomBounds);
        utils.setBounds(frontOfRoomWindow, meetingBounds);
        frontOfRoomWindow.loadURL(
            "file://" + __dirname + "/renderer/meetingInfo.html"
        );
        log.info(
            "Switching window: Console will load meetingInfo webpage and frontOfRoom will show console window with meeting webview"
        );
    } else {
        utils.setBounds(consoleWindow, meetingBounds);
        utils.setBounds(frontOfRoomWindow, frontOfRoomBounds);
        frontOfRoomWindow.loadURL(
            "file://" + __dirname + "/renderer/frontOfRoom.html"
        );
        log.info(
            "Switching window:: Console will show meeting webview and frontOfRoom will show duplication of the meeting"
        );
    }
    meetingOnConsole = !meetingOnConsole;
    log.info(
        `After switching console bounds: ${utils.boundsToString(consoleBounds)}`
    );
    log.info(
        `After switching frontOfRoom bounds: ${utils.boundsToString(
            frontOfRoomBounds
        )}`
    );
    log.info(
        `After switching console control bounds: ${utils.boundsToString(
            consoleControlBounds
        )}`
    );
    log.info(
        `After switching meeting bounds: ${utils.boundsToString(meetingBounds)}`
    );
});
//electron has finished initializing
app.on("ready", function() {
    log.info("Electron is ready, creating windows");
    createWindows();
    const { screen } = require("electron");
    screen.on("display-removed", handleDisplayRemoved);
    screen.on("display-added", handleDisplayAdded);
});

app.on("window-all-closed", function() {
    log.info("Closing app");
    app.quit();
});
//launching the application for the first time, attempting to re-launch the application when it's already running, or clicking on the application's dock or taskbar icon
app.on("activate", function() {
    log.info("App activated, creating windows");
    if (consoleWindow === null) {
        createWindows();
    }
});
