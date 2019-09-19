const {
    ipcRenderer
} = require("electron");
const log = require("electron-log");
const constants = require("../utility/constants.js");
var videoEnable = false;

ipcRenderer.on(constants.events.bindEndMeeting, function (event, data) {
    log.info("Meeting type is " + data);
    switch (data) {
        case constants.meetingType.webex:
            bindWebexControls();
            break;
        case constants.meetingType.zoom:
            bindZoomControls();
            break;
        default:
            log.error("channel name is missing");
            break;
    }
});

function bindEndMeeting() {
        var endMeeting = document.querySelector(
            ".zm-btn.zm-btn-legacy.zm-btn-primary"
        );
        endMeeting.addEventListener("click", function () {
            ipcRenderer.sendToHost(constants.events.closeMeeting);
        });
    
}

// Run Zoom meeting
function bindZoomControls() {
    var meetingIdentifier = document.querySelector(
        ".footer__leave-btn.ax-outline"
    );
    var leftToolButtonIdentifier = document.querySelectorAll(".left-tool-item button")[2];
    // TODO: Cleanup timeout
    setTimeout(function () {
        if (leftToolButtonIdentifier) {
            leftToolButtonIdentifier.click();
        }

    }, constants.timer.webexPrefillingTimerInMs);
    if (meetingIdentifier) {
        meetingIdentifier.addEventListener("click", function () {
            // TODO: Cleanup timeout
            setTimeout(bindEndMeeting, constants.timer.closingAppTimerInMs);
        });
    }
}

// Run WebEx meeting
function bindWebexControls() {
    // TODO: Cleanup timeout
    setTimeout(function () {
        var crossLink = document.querySelector(
            ".pb-meeting-loader.pb-ani-home .loading-action .leave-meeting"
        );
        // TODO: Cleanup timeout
        setTimeout(function () {
            var mainContainer = document.querySelector("#pb_iframecontainer");
            var childElements = mainContainer.childNodes[0];
            if (childElements) {
                var videoButton = childElements.contentDocument.querySelectorAll(
                    ".menu-item.haspop.icon-video.item-preview.btn-52"
               )[0];
               if (videoButton){
                    videoButton.classList.remove("unavailable");
                }
                if (!videoEnable) {
                    if(videoButton) {
                        videoButton.click();
                    }
                    videoEnable = true;
                    var leaveMeetingButton = mainContainer.childNodes[0].contentDocument.querySelectorAll(".menu-item.haspop.red.icon-leave.item-leave.btn-52")[0];
                    leaveMeetingButton.click();
                    var startMeetingButton = childElements.contentDocument.querySelectorAll(
                        ".button.green.start-my-video"
                    )[0];
                    if (startMeetingButton) {
                        startMeetingButton.removeAttribute("disabled");
                        startMeetingButton.click();
                    }  
                }
                var leavingMeetingButtonItem = childElements.contentDocument.querySelectorAll(
                    ".button.leave-btn.first-item.last-item"
                );
                if (leavingMeetingButtonItem.length > 0) {
                    leavingMeetingButtonItem[0].addEventListener("click", function () {
                        ipcRenderer.sendToHost(constants.events.closeMeeting);
                    });
                }
            }
        }, constants.timer.endMeetingTimerInMs);
        if (crossLink) {
            crossLink.addEventListener("click", function () {
                ipcRenderer.sendToHost(constants.events.closeWebex);
            });
        }
    }, constants.timer.clientEndMeetingTimerInMs);
}
