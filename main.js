const { app, BrowserWindow, ipcMain } = require("electron");
const electron = require("electron");
const log = require("electron-log");
const utils = require("./utility/utils.js");
const constants = require("./utility/constants.js");
let consoleWindow, forWindow, consoleControlWindow;
let consoleBounds,
    forBounds,
    consoleControlBounds,
    consoleWindowHeight,
    meetingBounds;
let meetingOnConsole = true;
//setting log file location
log.transports.file.file = __dirname + "/thirdParty.log";

function createWindows() {
    log.info("Creating console, consoleControl and FOR windows");
    forBounds = utils.getFORBounds();
    consoleBounds = utils.getConsoleBounds();
    consoleControlBounds = utils.getConsoleControlBounds(consoleBounds);
    consoleWindowHeight = Math.round(
        consoleBounds.height * constants.ratios.consoleMeetingRatio
    );
    log.info(`created console bounds: ${utils.boundsToString(consoleBounds)}`);
    log.info(`created FOR bounds: ${utils.boundsToString(forBounds)}`);
    log.info(
        `created console control bounds: ${utils.boundsToString(
            consoleControlBounds
        )}`
    );

    forWindow = new BrowserWindow({
        x: forBounds.x,
        y: forBounds.y,
        frame: false,
        webPreferences: { nodeIntegration: true, webSecurity: true }
    });
    forWindow.maximize();
    forWindow.loadURL("file://" + __dirname + "/renderer/frontOfRoom.html");

    consoleWindow = new BrowserWindow({
        x: consoleBounds.x,
        y: consoleBounds.y,
        width: consoleBounds.width,
        height: consoleWindowHeight,
        frame: false,
        webPreferences: { nodeIntegration: true }
    });
    consoleWindow.loadURL("file://" + __dirname + "/renderer/console.html");

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

    //The proper 'closed' callback here helps to avoid future calls on destroyed object.
    consoleWindow.on("closed", function() {
        consoleWindow = null;
    });
    forWindow.on("closed", function() {
        forWindow = null;
    });
    consoleControlWindow.on("closed", function() {
        consoleWindow = null;
    });
    log.info("Launching app");
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
        //console will load meetingInfo webpage and FOR will show console window with actual meeting webview
        utils.setBounds(consoleWindow, forBounds);
        utils.setBounds(forWindow, meetingBounds);
        forWindow.loadURL("file://" + __dirname + "/renderer/meetingInfo.html");
    } else {
        //switch back to the state that console shows actual meeting and FOR shows duplication of the meeting
        utils.setBounds(consoleWindow, meetingBounds);
        utils.setBounds(forWindow, forBounds);
        forWindow.loadURL("file://" + __dirname + "/renderer/frontOfRoom.html");
    }
    meetingOnConsole = !meetingOnConsole;
    log.info(
        `after switching console bounds: ${utils.boundsToString(consoleBounds)}`
    );
    log.info(`after switching FOR bounds: ${utils.boundsToString(forBounds)}`);
    log.info(
        `after switching console control bounds: ${utils.boundsToString(
            consoleControlBounds
        )}`
    );
    log.info(
        `after switching meeting bounds: ${utils.boundsToString(meetingBounds)}`
    );
});
//electron has finished initializing
app.on("ready", function() {
    log.info("electron is ready, creating windows");
    createWindows();
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
