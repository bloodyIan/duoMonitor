const { ipcRenderer } = require("electron");
const log = require("electron-log");
const constants = require("../utility/constants.js");
window.onload = function() {
    log.info("Application statred");
    document.querySelector(".webview-container").setAttribute('src', constants.meetingUrl.zoom);
};


