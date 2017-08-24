"use strict";

let AWS = require('aws-sdk');
let _ = require("underscore");
let Util = require("../util");

let SNSService = function (config) {
    AWS.config.update({region: config.region});
    let retryStatusCodes = config.retryStatusCodes || [];
    let errorStatusCodes = config.errorStatusCodes || [];
    let successStatusCodes = config.successStatusCodes || [];

    this.maxRetryAttempts = config.maxRetryAttempts || 0;
    this.retryTopicName = config.retryTopicName || "";
    this.successTopicName = config.successTopicName || "";
    this.errorTopicName = config.errorTopicName || "";

    this.SNS = new AWS.SNS();

    this.isRetryStatusCode = function (statusCode) {
        return _.indexOf(retryStatusCodes, statusCode) !== -1;
    };

    this.isErrorStatusCode = function (statusCode) {
        return _.indexOf(errorStatusCodes, statusCode) !== -1;
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

    if (this.isRetryStatusCode(statusCode) && (!payload.retryCount || payload.retryCount <= this.maxRetryAttempts)) {
        payload = this.incrementRetryCount(payload);
        return this.sendToTopic(this.retryTopicName, payload);
    } else if (this.isErrorStatusCode(statusCode)) {
        return this.sendToTopic(this.errorTopicName, payload);
    } else if (this.isSuccessStatusCode(statusCode)) {
        return this.sendToTopic(this.successTopicName, payload);
    } else {
        return this.sendToTopic(this.successTopicName, payload);
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