"use strict";

let AWS = require('aws-sdk');
let _ = require("underscore");
let SNSService = require("./snsService");
let Util = require("../util");

let SQSService = function (region) {
    AWS.config.update({region: region});
    this.SQS = new AWS.SQS();
    let config = {
        region: region
    };
    this.snsService = new SNSService(config);
};

SQSService.prototype.getQueueUrl = function (queueName) {
    Util.log("INFO", "Getting queue url");
    return new Promise((resolve, reject) => {
        let self = this;
        let params = {QueueName: queueName};
        self.SQS.getQueueUrl(params, function (err, data) {
            if (err || !data.QueueUrl) {
                Util.log("WARN", "Failed to locate queue " + queueName, err);
                self.SQS.createQueue(params, function (err, data) {
                    if (err) {
                        Util.log("ERROR", "Failed to create queue " + params.QueueName, err);
                        return reject(err);
                    } else {
                        Util.log("INFO", "Successfully created queue", data);
                        return resolve(data);
                    }
                });
            } else {
                Util.log("INFO", "Successfully retrieved queue url", data);
                return resolve(data);
            }
        });
    });
};

SQSService.prototype.processMessages = function (queueName, maxNumberOfMessagesToRead, readConfigFromMessage, sqsConfig) {
    Util.log("INFO", "Processing messages");
    if (!queueName) {
        Util.log("ERROR", "QueueName is empty");
        return Promise.reject({message: "QueueName is empty"});
    }
    if (readConfigFromMessage === false) {
        if (!sqsConfig) {
            Util.log("ERROR", "SQS Config is invalid");
            return Promise.reject({message: "SQS Config is invalid"});
        }
        if (!sqsConfig.triggerTopicName) {
            Util.log("ERROR", "triggerTopicName missing from SQSConfig");
            return Promise.reject({message: "triggerTopicName missing from SQSConfig"});
        }
        if (!sqsConfig.failureTopicName) {
            Util.log("ERROR", "failureTopicName missing from SQSConfig");
            return Promise.reject({message: "failureTopicName missing from SQSConfig"});
        }
        if (!sqsConfig.maxRetryAttempts) {
            sqsConfig.maxRetryAttempts = 1;
        }
    }

    return this.getQueueUrl(queueName)
        .then(response => {
            return this.readMessage(response.QueueUrl, maxNumberOfMessagesToRead);
        })
        .then(response => {
            if (response && response.Messages) {
                let queueUrl = response.QueueUrl;
                let sendAndDeleteMessage = response.Messages.map(message => {
                    let parsedMessage = Util.tryParseJSON(message.Body);
                    if (parsedMessage) {
                        let asrConfig = sqsConfig;
                        if (readConfigFromMessage) {
                            let parsedMessageContent  = Util.tryParseJSON(parsedMessage.Message);
                            if (parsedMessageContent) asrConfig = Util.tryParseJSON(parsedMessageContent.asrConfig);
                        }

                        let isValidASRConfig = Util.validateASRConfig(asrConfig, "SQS");
                        if (isValidASRConfig) {
                            let destinationTopicName = parsedMessage.retryCount > asrConfig.maxRetryAttempts ? asrConfig.failureTopicName : asrConfig.triggerTopicName;
                            delete parsedMessage.asrConfig;
                            return this.snsService.sendToTopic(destinationTopicName, parsedMessage)
                                .then(response => {
                                    return this.deleteMessage(queueUrl, message.ReceiptHandle);
                                });
                        } else {
                            Util.log("ERROR", "ASRConfig not valid. Message cannot be deleted from Queue", parsedMessage.asrConfig);
                            return Promise.resolve({message: "ASRConfig not valid. Message cannot be deleted from Queue."});
                        }
                    } else {
                        Util.log("ERROR", "Message is not a valid JSON and cannot be deleted from Queue", message.Body);
                        return Promise.resolve({message: "Message is not a valid JSON and cannot be deleted from Queue"});
                    }
                });

                return Promise.all(sendAndDeleteMessage)
                    .then(responses => {
                        Util.log("INFO", "Successfully processed all messages");
                        return Promise.resolve(responses);
                    })
                    .catch(err => {
                        Util.log("WARN", "Failed to process all messages", err);
                        return Promise.reject(err);
                    });

            } else {
                Util.log("INFO", "No messages to process");
                return Promise.resolve({message: "No messages to process"});
            }
        })
        .catch(err => {
            return Promise.reject(err);
        });
};

SQSService.prototype.readMessage = function (queueUrl, maxNumberOfMessagesToRead) {
    Util.log("INFO", "Reading messages");
    return new Promise((resolve, reject) => {
        let params = {
            QueueUrl: queueUrl,
            MaxNumberOfMessages: maxNumberOfMessagesToRead || 10
        };
        this.SQS.receiveMessage(params, function (err, data) {
            if (err) {
                Util.log("ERROR", "Failed to receive message");
                return reject(err);
            } else {
                Util.log("INFO", "Successfully received message " + queueUrl);
                data.QueueUrl = queueUrl;
                return resolve(data);
            }
        });
    });
};

SQSService.prototype.deleteMessage = function (queueUrl, receiptHandle) {
    Util.log("INFO", "Deleting message");
    return new Promise((resolve, reject) => {
        let params = {
            ReceiptHandle: receiptHandle,
            QueueUrl: queueUrl
        };

        this.SQS.deleteMessage(params, function (err, data) {
            if (err) {
                Util.log("ERROR", "Failed to delete message", err);
                return reject(err);
            }

            Util.log("INFO", "Successfully deleted message from queue " + queueUrl, data);
            return resolve(data);
        });
    });
};

module.exports = SQSService;