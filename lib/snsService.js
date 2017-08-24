"use strict";

let AWS = require('aws-sdk');
let _ = require("underscore");
let Util = require("../util");

let SNSService = function (config) {
    AWS.config.update({region: config.region});
    let retryStatusCodes = config.retryStatusCodes || [];
    let failureStatusCodes = config.failureStatusCodes || [];
    let successStatusCodes = config.successStatusCodes || [];

    this.config = config;
    this.maxRetryAttempts = config.maxRetryAttempts || 1;
    this.retryTopicName = config.retryTopicName || "";
    this.successTopicName = config.successTopicName || "";
    this.failureTopicName = config.failureTopicName || "";

    this.SNS = new AWS.SNS();

    this.isRetryStatusCode = function (statusCode) {
        return _.indexOf(retryStatusCodes, statusCode) !== -1;
    };

    this.isFailureStatusCode = function (statusCode) {
        return _.indexOf(failureStatusCodes, statusCode) !== -1;
    };

    this.isSuccessStatusCode = function (statusCode) {
        return _.indexOf(successStatusCodes, statusCode) !== -1;
    };

    this.incrementRetryCount = function (obj) {
        if (obj.retryCount) {
            obj.retryCount += 1;
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

SNSService.prototype.sendToTopicByStatusCode = function (statusCode, payload) {
    Util.log("INFO", "Sending it to topic by statusCode " + statusCode);
    if (!statusCode) {
        Util.log("ERROR", "StatusCode is invalid");
        return Promise.reject({message: "StatusCode is invalid"});
    }
    if (!payload) {
        Util.log("ERROR", "Payload is empty");
        return Promise.reject({message: "PayLoad is empty"});
    }

    let message = payload;
    message.asrConfig = this.config;

    if (this.isRetryStatusCode(statusCode) && (!message.retryCount || message.retryCount <= this.maxRetryAttempts)) {
        message = this.incrementRetryCount(message);
        return this.sendToTopic(this.retryTopicName, message);
    } else if (this.isFailureStatusCode(statusCode)) {
        return this.sendToTopic(this.failureTopicName, message);
    } else if (this.isSuccessStatusCode(statusCode)) {
        return this.sendToTopic(this.successTopicName, message);
    } else {
        return this.sendToTopic(this.successTopicName, message);
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