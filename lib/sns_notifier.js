"use strict";

let AWS = require('aws-sdk');
let _ = require("underscore");

let SNSNotifier = function (config) {
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

    this.incrementRetryCount = function (payload) {
        if (payload.retryCount) {
            payload.retryCount += 1;
        } else {
            payload.retryCount = 1;
        }
        return payload;
    };
};

SNSNotifier.prototype.createTopic = function (topicName) {
    return new Promise((resolve, reject) => {
        let params = {
            Name: topicName
        };
        this.SNS.createTopic(params, function (err, data) {
            if (err) {
                return reject(err);
            }
            return resolve(data);
        });
    });
};

SNSNotifier.prototype.sendToTopicByStatusCode = function (statusCode, payload) {
    if (!statusCode) return Promise.reject({message: "StatusCode is invalid"});
    if (!payload) return Promise.reject({message: "PayLoad is empty"});

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

SNSNotifier.prototype.sendToTopic = function (topicName, payload) {
    return this.createTopic(topicName)
        .then(response => {
            return new Promise((resolve, reject) => {
                let message = {Message: JSON.stringify(payload)};
                message.TopicArn = response.TopicArn;
                this.SNS.publish(message, function (err, data) {
                    if (err) {
                        return reject(err);
                    } else {
                        data.topicName = topicName;
                        return resolve(data);
                    }
                });
            });
        })
        .catch(err => {
            return Promise.reject(err);
        });
};

module.exports = SNSNotifier;