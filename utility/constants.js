module.exports = {
    events: {
        //event for switching window after switch window toggle changed in console control
        switchWindow: "switch-window",
        //event for closing application
        closeApp: "close-app",
        //event for closing meeting using console control
        closeMeeting: "close-meeting",
        //event for closing webex meeting using webex web client
        closeWebex: "close-webex",
        bindEndMeeting: "bind-end-meeting"
    },
    shellItem: {
        //skype command that hides third party app
        hideThirdParty: "skype-mrx://hidethirdparty"
    },
    sourceName: {
        //consoleWindow source name
        thirdParty: "ThirdParty"
    },
    timer: {
        webexPrefillingTimerInMs: 10000,
        endMeetingTimerInMs: 5000,
        clientEndMeetingTimerInMs: 1000,
        closingAppTimerInMs: 500
    },
    meetingType: {
        webex: "webex",
        zoom: "zoom"
    },
    ratios: {
        consoleMeetingRatio: 0.833
    },
    meetingUrl: {
        zoom: "https://zoom.us/wc/4507475950/join?prefer=1/un=TXIuUmlnZWw="
    }
};
