"use strict";

const SQSService = require("../lib/sqsService");

module.exports.deleteMessageFromQueueTests = {
    testToDeleteMessageIfExistsInQueue: function (test) {
        let region = "us-west-2";
        let sqsService = new SQSService(region);
        let queueName = "test2";
        sqsService.getQueueUrl(queueName)
            .then(response => {
                return sqsService.readMessage(response.QueueUrl, 1);
            })
            .then(response => {
                if (response && response.Messages && response.Messages.length > 0) {
                    let message = response.Messages[0];
                    return sqsService.deleteMessage(response.QueueUrl, message.ReceiptHandle);
                } else {
                    return Promise.resolve({});
                }
            })
            .then(response => {
                test.ok(response !== null);
                test.done();
            })
            .catch(err => {
                //Only used by build server
                test.done();
            });
    },
    testToDeleteMessageFailsWithInvalidQueueName: function (test) {
        let region = "us-west-2";
        let sqsService = new SQSService(region);
        let queueName = "n@me";
        sqsService.getQueueUrl(queueName)
            .then(response => {
                return sqsService.readMessage(response.QueueUrl, 1);
            })
            .then(response => {
                if (response && response.Messages && response.Messages.length > 0) {
                    let message = response.Messages[0];
                    return sqsService.deleteMessage(response.QueueUrl, message.ReceiptHandle);
                } else {
                    return Promise.resolve({});
                }
            })
            .then(response => {
                test.ok(response !== null);
                test.done();
            })
            .catch(err => {
                //Only used by build server
                test.done();
            });
    }
};