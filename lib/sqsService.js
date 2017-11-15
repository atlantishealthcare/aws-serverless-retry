"use strict";

let AWS = require('aws-sdk');
let SNSService = require("./snsService");
let Util = require("../util");

let SQSService = function (region) {
    AWS.config.update({region: region});
    this.SQS = new AWS.SQS();
    this.snsService = new SNSService(region);
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
                let messagesProcessed = response.Messages.length;
                let hasPoisonMessage = false;
                let sendAndDeleteMessage = response.Messages.map(message => {
                    let parsedMessage = Util.tryParseJSON(message.Body);
                    if (parsedMessage) {
                        let parsedMessageContent = Util.tryParseJSON(parsedMessage.Message);
                        if (parsedMessageContent) {
                            let asrConfig = readConfigFromMessage ? Util.tryParseJSON(parsedMessageContent.asrConfig) : sqsConfig;
                            let isValidASRConfig = Util.validateASRConfig(asrConfig, "SQS");
                            if (isValidASRConfig) {
                                let retryCount = parsedMessageContent.retryCount || parsedMessageContent.retrycount;
                                let destinationTopicName = retryCount > asrConfig.maxRetryAttempts ? asrConfig.failureTopicName : asrConfig.triggerTopicName;
                                delete parsedMessageContent.asrConfig;
                                return this.snsService.sendToTopic(destinationTopicName, parsedMessageContent)
                                    .then(response => {
                                        return this.deleteMessage(queueUrl, message.ReceiptHandle);
                                    });
                            } else {
                                hasPoisonMessage = true;
                                Util.log("ERROR", "ASRConfig not valid. Message cannot be deleted from Queue", asrConfig);
                                return Promise.resolve({message: "ASRConfig not valid. Message cannot be deleted from Queue."});
                            }
                        } else {
                            hasPoisonMessage = true;
                            Util.log("ERROR", "Message content is not a valid JSON and cannot be deleted from Queue", parsedMessage.Message);
                            return Promise.resolve({message: "Message is not a valid JSON and cannot be deleted from Queue"});
                        }
                    } else {
                        hasPoisonMessage = true;
                        Util.log("ERROR", "Message is not a valid JSON and cannot be deleted from Queue", message.Body);
                        return Promise.resolve({message: "Message is not a valid JSON and cannot be deleted from Queue"});
                    }
                });

                return Promise.all(sendAndDeleteMessage)
                    .then(responses => {
                        Util.log("INFO", "Successfully processed all messages");
                        let response = {
                            responses: responses,
                            messagesProcessed: messagesProcessed,
                            hasPoisonMessage: hasPoisonMessage
                        };
                        return Promise.resolve(response);
                    })
                    .catch(err => {
                        Util.log("WARN", "Failed to process all messages", err);
                        return Promise.reject(err);
                    });

            } else {
                Util.log("INFO", "No messages to process");
                let response = {
                    message: "No messages to process",
                    messagesProcessed: 0,
                    hasPoisonMessage: false
                };
                return Promise.resolve(response);
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
                let messageCount = data.Messages ? data.Messages.length : 0;
                Util.log("INFO", "Successfully received message " + queueUrl + ": " + messageCount);
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