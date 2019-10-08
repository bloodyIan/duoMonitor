const switchWindow = document.getElementById("switch-check");
const switchWindowConsole = document.querySelector(".switchControl");
const switchToggle = document.getElementById("show-meeting-on-console");
let switchWindowToggle = false;
let loadedLanguage;
const exitMeeting = document.querySelector(".exit-meeting-btn");
const { ipcRenderer, shell } = require("electron");
const constants = require("../utility/constants.js");
const utils = require("../utility/utils.js");
const { app } = require("electron").remote;

window.onload = function() {
    loadedLanguage = utils.getLoadedLanguage(app.getLocale());
    if (loadedLanguage) {
        localize(loadedLanguage);
    } else {
        log.console.error("Locale file does not exist");
    }
};

function localize(loadedLanguage) {
    switchToggle.innerHTML =
        loadedLanguage.strings.rigel_third_party_mirror_meeting_on_console;
    exitMeeting.innerHTML =
        loadedLanguage.strings.rigel_third_party_leave_meeting;
}
//Leave button on console control will return back to sfb app
exitMeeting.addEventListener("click", function() {
    shell.openItem(constants.shellItem.hideThirdParty);
    ipcRenderer.send(constants.events.closeApp);
});

//clicking switch on console control sends ipc message to main.js
switchWindowConsole.addEventListener("click", function() {
    switchWindow.checked = !switchWindowToggle;
    ipcRenderer.send(constants.events.switchWindow);
    switchWindowToggle = !switchWindowToggle;
});
