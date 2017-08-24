"use strict";

function tryParseJSON(jsonString) {
    try {
        let o = JSON.parse(jsonString);
        if (o && typeof o === "object") {
            return o;
        }
    }
    catch (e) {
    }

    return false;
}

function validateASRConfig(asrConfig) {
    return asrConfig && asrConfig.retryTopicName && asrConfig.failureTopicName && asrConfig.maxRetryAttempts;
}

function log(level, message, data) {
    if (process.env.DEBUG) {
        let logMessage = {
            level: level,
            message: message,
            data: data
        };
        console.log(JSON.stringify(logMessage, null, 2));
    }
}

module.exports = {
    log: log,
    validateASRConfig: validateASRConfig,
    tryParseJSON: tryParseJSON
};