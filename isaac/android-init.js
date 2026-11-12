function androidGeolocationInit() {
    let positionSuccessCallback = null;

    window.AndroidGeolocation.onmessage = function(event) {
        const message = event.data;
        console.log("AndroidGeolocation message:", message);
        const reply = JSON.parse(message);
        switch (reply.id) {
            case "getCurrentPosition":
                if (reply.result) {
                    const position = reply.result;
                    positionSuccessCallback(position);
                } else {
                    console.log("AndroidGeoLocation error:", reply.error);
                }
                break;
            default:
                console.log("AndroidGeoLocation unrecognized method:", reply.method);
        }
    }

    const androidGeolocation = {
        getCurrentPosition: (successCallback, errorCallback, options) => {
            const payload = {
                method: "getCurrentPosition",
                params: options
            };
            window.AndroidGeolocation.postMessage(JSON.stringify(payload));
            positionSuccessCallback = successCallback;
        },

        watchPosition: (successCallback, errorCallback, options) => {
            const fetchLocation = () => {
                androidGeolocation.getCurrentPosition(successCallback, errorCallback, options);
            };
            fetchLocation();
            const intervalId = setInterval(fetchLocation, 1000);
            return intervalId;
        },

        clearWatch: (watchId) => {
            clearInterval(watchId);
        }
    };

    // Override navigator.geolocation object
    Object.defineProperty(navigator, 'geolocation', {
        value: androidGeolocation,
        configurable: true,
        writable: false
    });
}

function androidSpeechSynthesisInit() {
    // Create an Utterance constructor
    window.SpeechSynthesisUtterance = class {
        constructor(text) {
            this.text = text || "";
            this.lang = "en-US";
            this.pitch = 1.0;
            this.rate = 1.0;
            this.volume = 1.0;
        }
    };

    // Overwrite window.speechSynthesis object
    Object.defineProperty(window, 'speechSynthesis', {
        value: {
            speaking: false,
            pending: false,
            paused: false,

            speak: function(utterance) {
                if (!utterance || !utterance.text) return;
                const payload = {
                    method: "speak",
                    params: utterance
                };
                window.AndroidSpeechSynthesis.postMessage(JSON.stringify(payload));
            },

            cancel: function() {
                const payload = {
                    method: "cancel"
                };
                window.AndroidSpeechSynthesis.postMessage(JSON.stringify(payload));
            },

            pause: function() { /* Optional: implement in Android */ },
            resume: function() { /* Optional: implement in Android */ },
            getVoices: function() {
                // Return a mock voice list
                return [{ name: 'Android System Voice', lang: 'en-US', default: true }];
            }
        },
        configurable: true,
        writable: true
    });
}


// Main
if (window.AndroidSpeechSynthesis) {
    console.log("Initializing AndroidSpeechSynthesis");
    androidSpeechSynthesisInit();
    setTimeout(() => {
        const utterance = new SpeechSynthesisUtterance("Android speech");
        window.speechSynthesis.speak(utterance);
    }, 1000);
} else {
    console.log("No AndroidSpeechSynthesis")
}

if (window.AndroidGeolocation) {
    console.log("Initializing AndroidGeolocation");
    androidGeolocationInit()
} else {
    console.log("No AndroidGeolocation")
}
