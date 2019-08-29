const electron = require('electron');

$(document).ready(function() {
  var videoElement = document.getElementById("duplicationVideo");
  videoElement.controls = false;
  var displays = electron.screen.getAllDisplays();
  for (var i in displays) {
    if (displays[i].bounds.x == 0 && displays[i].bounds.y == 0) {
      navigator.webkitGetUserMedia({ audio: false, video: { mandatory: {
            chromeMediaSource: 'desktop',
            chromeMediaSourceId: "screen:0:0",
            minWidth: displays[i].bounds.width,
            maxWidth: displays[i].bounds.width,
            minHeight: displays[i].bounds.height,
            maxHeight: displays[i].bounds.height
          }
        }
      },
      (stream) => document.querySelector('video').srcObject = stream,
      (e) => console.log('getUserMediaError: ' + JSON.stringify(e, null, '---')));
      videoElement.minHeight = displays[i].bounds.height
      videoElement.maxHeight = displays[i].bounds.height
      videoElement.minWidth = displays[i].bounds.width
      videoElement.maxWidth = displays[i].bounds.width
    }
  }
});
