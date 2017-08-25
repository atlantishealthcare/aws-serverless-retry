"use strict";

function tryParseJSON(jsonString) {
    try {
        if (jsonString && typeof jsonString === "object") return jsonString;

        let o = JSON.parse(jsonString);
        if (o && typeof o === "object") {
            return o;
        }

    }
    catch (e) {
    }

    return false;
}

function validateASRConfig(asrConfig, serviceType) {
    if (serviceType === "SQS") {
        return asrConfig && asrConfig.triggerTopicName && asrConfig.failureTopicName && asrConfig.maxRetryAttempts;
    } else if (serviceType === "SNS") {
        return asrConfig && asrConfig.retryTopicName && asrConfig.failureTopicName && asrConfig.successTopicName && asrConfig.maxRetryAttempts;
    }
    return false;
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