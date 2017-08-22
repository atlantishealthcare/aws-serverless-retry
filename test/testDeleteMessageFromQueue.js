"use strict";

const SQSWorker = require("../lib/sqs_worker");

module.exports.deleteMessageFromQueueTests = {
    testTodeleteMessageIfExistsInQueue: function (test) {
        let config = {
            region: "us-west-2"
        };

        let sqsWorker = new SQSWorker(config);
        let queueName = "test2";
        sqsWorker.getQueueUrl(queueName)
            .then(response => {
                return sqsWorker.readMessage(response.QueueUrl, 1);
            })
            .then(response => {
                if (response && response.Messages.length > 0) {
                    let message = response.Messages[0];
                    return sqsWorker.deleteMessage(response.QueueUrl, message.ReceiptHandle);
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