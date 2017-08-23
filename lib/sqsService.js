"use strict";

let AWS = require('aws-sdk');
let _ = require("underscore");
let SNSService = require("./snsService");

let SQSService = function (region) {
    AWS.config.update({region: region});
    this.SQS = new AWS.SQS();
    let config = {
        region: region
    };
    this.snsService = new SNSService(config);
};

SQSService.prototype.getQueueUrl = function (queueName) {
    return new Promise((resolve, reject) => {
        let self = this;
        let params = {QueueName: queueName};
        self.SQS.getQueueUrl(params, function (err, data) {
            if (err || !data.QueueUrl) {
                self.SQS.createQueue(params, function (err, data) {
                    if (err) {
                        return reject(err);
                    } else {
                        return resolve(data);
                    }
                });
            } else {
                return resolve(data);
            }
        });
    });
};

SQSService.prototype.processMessages = function (queueName, sqsConfig) {

    if (!queueName) return Promise.reject({message: "QueueName is empty"});
    if (!sqsConfig) return Promise.reject({message: "Config is invalid"});
    if (sqsConfig && !sqsConfig.destinationTopicName) return Promise.reject({message: "DestinationTopicName is not specified in config"});
    if (sqsConfig && !sqsConfig.maxNumberOfMessagesToRead) sqsConfig.maxNumberOfMessagesToRead = 10;

    return this.getQueueUrl(queueName)
        .then(response => {
            return this.readMessage(response.QueueUrl, sqsConfig.maxNumberOfMessagesToRead);
        })
        .then(response => {
            if (response && response.Messages) {
                let queueUrl = response.QueueUrl;
                let sendAndDeleteMessage = response.Messages.map(message => {
                    let destinationTopicName = sqsConfig.destinationTopicName;
                    return this.snsService.sendToTopic(destinationTopicName, message.Body)
                        .then(response => {
                            return this.deleteMessage(queueUrl, message.ReceiptHandle);
                        });
                });

                return Promise.all(sendAndDeleteMessage)
                    .then(responses => {
                        return Promise.resolve(responses);
                    })
                    .catch(err => {
                        return Promise.reject(err);
                    });

            } else {
                return Promise.resolve({});
            }
        })
        .catch(err => {
            return Promise.reject(err);
        });
};

SQSService.prototype.readMessage = function (queueUrl, maxNumberOfMessagesToRead) {
    return new Promise((resolve, reject) => {
        let params = {
            QueueUrl: queueUrl,
            MaxNumberOfMessages: maxNumberOfMessagesToRead || 10
        };
        this.SQS.receiveMessage(params, function (err, data) {
            if (err) {
                return reject(err);
            } else {
                data.QueueUrl = queueUrl;
                return resolve(data);
            }
        });
    });
};

SQSService.prototype.deleteMessage = function (queueUrl, receiptHandle) {
    return new Promise((resolve, reject) => {
        let params = {
            ReceiptHandle: receiptHandle,
            QueueUrl: queueUrl
        };

        this.SQS.deleteMessage(params, function (err, data) {
            if (err) {
                return reject(err);
            }

            return resolve(data);
        });
    });
};

module.exports = SQSService;