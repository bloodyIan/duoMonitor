const electron = require("electron");
const log = require("electron-log");
const { desktopCapturer } = require("electron");
const utils = require("../utility/utils.js");
const constants = require("../utility/constants.js");
window.onload = function() {
    //getsource returns a promise sources that contains window amd monitor information
    desktopCapturer.getSources({ types: ["window"] }, function(error, sources) {
        for (let source of sources) {
            if (
                source.name === constants.sourceName.thirdParty &&
                source.id.charAt(source.id.length - 1) === "1"
            ) {
                log.info("Source ID: " + source.id);
                var videoElement = document.getElementById(
                    "meeting-duplication"
                );
                videoElement.controls = false;
                const consoleBounds = utils.getConsoleBounds();
                //get console window frames in order to make duplication screen
                navigator.webkitGetUserMedia(
                    {
                        audio: false,
                        video: {
                            mandatory: {
                                chromeMediaSource: "desktop",
                                chromeMediaSourceId: source.id,
                                minWidth: consoleBounds.width,
                                maxWidth: consoleBounds.width,
                                minHeight: consoleBounds.height,
                                maxHeight: consoleBounds.height
                            }
                        }
                    },
                    //set video src to duplicated meeting on console
                    stream =>
                        (document.querySelector("video").srcObject = stream),
                    e =>
                        log.error(
                            "getUserMediaError: " +
                                JSON.stringify(e, null, "---")
                        )
                );
                videoElement.minHeight = consoleBounds.height;
                videoElement.maxHeight = consoleBounds.height;
                videoElement.minWidth = consoleBounds.width;
                videoElement.maxWidth = consoleBounds.width;
            }
            break;
        }
    });
};
