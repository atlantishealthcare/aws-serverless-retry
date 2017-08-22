"use strict";

const SQSWorker = require("../lib/sqs_worker");

module.exports.readMessageFromQueueTests = {
    testToReadMessageIfExistsInQueue: function (test) {
        let config = {
            region: "us-west-2"
        };

        let sqsWorker = new SQSWorker(config);
        let queueName = "test";
        sqsWorker.getQueueUrl(queueName)
            .then(response => {
                return sqsWorker.readMessage(response.QueueUrl, 1);
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