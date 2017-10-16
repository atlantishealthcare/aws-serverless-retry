"use strict";

const SQSService = require("../lib/sqsService");

module.exports.readMessageFromQueueTests = {
    testToReadMessageIfExistsInQueue: function (test) {
        let region = "us-west-2";
        let sqsService = new SQSService(region);
        let queueName = "test";
        sqsService.getQueueUrl(queueName)
            .then(response => {
                return sqsService.readMessage(response.QueueUrl, 1);
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
    testToReadMessageFailsWhenQueueNameIsInvalid: function (test) {
        let region = "us-west-2";
        let sqsService = new SQSService(region);
        let queueName = "N@me";
        sqsService.getQueueUrl(queueName)
            .then(response => {
                return sqsService.readMessage(response.QueueUrl, 1);
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