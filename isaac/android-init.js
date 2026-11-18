function androidGeolocationInit() {
    let callbackIdCounter = 1;
    const activeCallbacks = {};

    window.AndroidGeolocation.onmessage = function(event) {
        const message = event.data;
        const reply = JSON.parse(message);
        const callback = activeCallbacks[reply.id];
        if (!callback) return;

        if (reply.result) {
            const position = reply.result;
            callback.success(position);
        } else {
            const positionError = {
                code: message.code,
                message: message.message || "Unknown native location error"
            };
            callback.error(positionError)
        }

        if (!callback.isWatch) {
            delete activeCallbacks[id];
        }
    }

    const androidGeolocation = {
        getCurrentPosition: (successCallback, errorCallback, options) => {
            const id = callbackIdCounter++;
            activeCallbacks[id] = { success: successCallback, error: errorCallback };

            const payload = {
                method: "getCurrentPosition",
                params: options || {},
                id: id
            };
            window.AndroidGeolocation.postMessage(JSON.stringify(payload));
        },

        watchPosition: (successCallback, errorCallback, options) => {
            const id = callbackIdCounter++;
            activeCallbacks[id] = { success: successCallback, error: errorCallback, isWatch: true };

            const payload = {
                method: "watchPosition",
                params: options || {},
                id: id
            };
            window.AndroidGeolocation.postMessage(JSON.stringify(payload));
            return id;
        },

        clearWatch: (watchId) => {
            delete activeCallbacks[watchId];
            const payload = {
                method: "clearWatch",
                params: {},
                id: id
            };
            window.AndroidGeolocation.postMessage(JSON.stringify(payload));
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
