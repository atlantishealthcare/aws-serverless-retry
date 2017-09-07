"use strict";

let AWS = require('aws-sdk');
let _ = require("underscore");
let Util = require("../util");

let SNSService = function (region) {
    AWS.config.update({region: region});
    this.SNS = new AWS.SNS();

    this.isRetryStatusCode = function (retryStatusCodes, statusCode) {
        return _.indexOf(retryStatusCodes, statusCode) !== -1;
    };

    this.isFailureStatusCode = function (failureStatusCodes, statusCode) {
        return _.indexOf(failureStatusCodes, statusCode) !== -1;
    };

    this.isSuccessStatusCode = function (failureStatusCodes, statusCode) {
        return _.indexOf(failureStatusCodes, statusCode) !== -1;
    };

    this.incrementRetryCount = function (obj) {
        let retryCount = obj.retryCount || obj.retrycount;
        if (retryCount) {
            delete obj.retryCount;
            delete obj.retrycount;
            retryCount += 1;
            obj.retryCount = retryCount;
        } else {
            obj.retryCount = 1;
        }
        return obj;
    };
};

SNSService.prototype.createTopic = function (topicName) {
    Util.log("INFO", "Creating topic");
    return new Promise((resolve, reject) => {
        let params = {
            Name: topicName
        };
        this.SNS.createTopic(params, function (err, data) {
            if (err) {
                Util.log("ERROR", "Failed to create topic", err);
                return reject(err);
            }
            Util.log("INFO", "Successfully created topic", data);
            return resolve(data);
        });
    });
};

SNSService.prototype.sendToTopicByStatusCode = function (statusCode, payload, snsConfig) {

    Util.log("INFO", "Sending it to topic by statusCode " + statusCode);
    if (!statusCode) {
        Util.log("ERROR", "StatusCode is invalid");
        return Promise.reject({message: "StatusCode is invalid"});
    }
    if (!payload) {
        Util.log("ERROR", "Payload is empty");
        return Promise.reject({message: "PayLoad is empty"});
    }

    if (!snsConfig) {
        Util.log("ERROR", "SNS config is invalid");
        return Promise.reject({message: "SNS config is invalid"});
    }

    if (!snsConfig.retryStatusCodes) snsConfig.retryStatusCodes = [];
    if (!snsConfig.failureStatusCodes) snsConfig.failureStatusCodes = [];
    if (!snsConfig.successStatusCodes) snsConfig.successStatusCodes = [];
    if (!snsConfig.maxRetryAttempts) snsConfig.maxRetryAttempts = 1;
    if (!snsConfig.retryTopicName) snsConfig.retryTopicName = "";
    if (!snsConfig.successTopicName) snsConfig.successTopicName = "";
    if (!snsConfig.failureTopicName) snsConfig.failureTopicName = "";

    let message = payload;
    message.asrConfig = snsConfig;

    let retryCount = message.retryCount || message.retrycount;
    if (this.isRetryStatusCode(snsConfig.retryStatusCodes, statusCode) && (!retryCount || retryCount <= snsConfig.maxRetryAttempts)) {
        message = this.incrementRetryCount(message);
        return this.sendToTopic(snsConfig.retryTopicName, message);
    } else if (this.isFailureStatusCode(snsConfig.failureStatusCodes, statusCode)) {
        return this.sendToTopic(snsConfig.failureTopicName, message);
    } else if (this.isSuccessStatusCode(snsConfig.successStatusCodes, statusCode)) {
        return this.sendToTopic(snsConfig.successTopicName, message);
    } else {
        return this.sendToTopic(snsConfig.failureTopicName, message);
    }
};

SNSService.prototype.sendToTopic = function (topicName, payload) {
    Util.log("INFO", "Sending to topic " + topicName);
    return this.createTopic(topicName)
        .then(response => {
            return new Promise((resolve, reject) => {
                let message = {Message: JSON.stringify(payload)};
                message.TopicArn = response.TopicArn;
                this.SNS.publish(message, function (err, data) {
                    if (err) {
                        Util.log("ERROR", "Failed to publish to topic", err);
                        return reject(err);
                    } else {
                        Util.log("INFO", "Successfully sent to topic " + topicName);
                        data.topicName = topicName;
                        return resolve(data);
                    }
                });
            });
        })
        .catch(err => {
            Util.log("ERROR", "Failed to send it to topic", err);
            return Promise.reject(err);
        });
};

module.exports = SNSService;