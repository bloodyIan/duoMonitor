const { app, BrowserWindow, ipcMain } = require("electron");
const log = require("electron-log");
const utils = require("./utility/utils.js");
const constants = require("./utility/constants.js");
let consoleWindow, FORWindow, consoleControlWindow;
let consoleBounds,
    FORBounds,
    consoleControlBounds,
    consoleWindowHeight,
    meetingBounds;
let meetingOnConsole = true;
//setting log file location
log.transports.file.file = __dirname + "/thirdParty.log";

function createWindows() {
    log.info("Creating console, consoleControl and FOR windows");
    FORBounds = utils.getFORBounds();
    consoleBounds = utils.getConsoleBounds();
    consoleControlBounds = utils.getConsoleControlBounds(consoleBounds);
    consoleWindowHeight = Math.round(
        consoleBounds.height * constants.ratios.consoleMeetingRatio
    );

    FORWindow = new BrowserWindow({
        x: FORBounds[0].x,
        y: FORBounds[0].y,
        frame: false,
        webPreferences: { nodeIntegration: true, webSecurity: true }
    });
    FORWindow.maximize();
    FORWindow.loadURL("file://" + __dirname + "/renderer/frontOfRoom.html");

    if (FORBounds[1]) {
        log.info("2nd FOR monitor exists");
        let FOR2Window = new BrowserWindow({
            x: FORBounds[1].x,
            y: FORBounds[1].y,
            width: FORBounds[1].width,
            height: FORBounds[1].height,
            frame: false,
            webPreferences: { nodeIntegration: true }
        });
        FOR2Window.maximize();
        FOR2Window.loadURL(
            "file://" + __dirname + "/renderer/secondFrontOfRoom.html"
        );
    }

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

    log.info(`Created console window: ${utils.boundsToString(consoleBounds)}`);
    log.info(`Created FOR window: ${utils.boundsToString(FORBounds[0])}`);
    if (FORBounds[1]) {
        log.info(
            `Created 2nd FOR window: ${utils.boundsToString(FORBounds[1])}`
        );
    }
    log.info(
        `Created console control window: ${utils.boundsToString(
            consoleControlBounds
        )}`
    );
    //The proper 'closed' callback here helps to avoid future calls on destroyed object.
    consoleWindow.on("closed", function() {
        consoleWindow = null;
    });
    FORWindow.on("closed", function() {
        FORWindow = null;
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
        utils.setBounds(consoleWindow, FORBounds[0]);
        utils.setBounds(FORWindow, meetingBounds);
        FORWindow.loadURL("file://" + __dirname + "/renderer/meetingInfo.html");
    } else {
        //switch back to the state that console shows actual meeting and FOR shows duplication of the meeting
        utils.setBounds(consoleWindow, meetingBounds);
        utils.setBounds(FORWindow, FORBounds[0]);
        FORWindow.loadURL("file://" + __dirname + "/renderer/frontOfRoom.html");
    }
    meetingOnConsole = !meetingOnConsole;
    log.info(
        `After switching console bounds: ${utils.boundsToString(consoleBounds)}`
    );
    log.info(
        `After switching FOR bounds: ${utils.boundsToString(FORBounds[0])}`
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
    let electronScreen = require("electron");
    electronScreen.on("display-removed", function() {
        log.info("display removed");
    });
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
