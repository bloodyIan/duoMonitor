const switchWindow = document.getElementById("switch-check");
const switchWindowConsole = document.querySelector(".switchControl");
let switchWindowToggle = false;
const exitMeeting = document.querySelector(".exit-meeting-btn");
const { ipcRenderer, shell } = require("electron");
const constants = require("../utility/constants.js");

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
