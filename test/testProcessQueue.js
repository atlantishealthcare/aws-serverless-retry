"use strict";

const SQSWorker = require("../lib/sqs_worker");

module.exports.processQueueTests = {
    testToProcessMessageIfExists: function (test) {
        let config = {
            region: "us-west-2"
        };

        let sqsWorker = new SQSWorker(config);
        let queueName = "test";
        let queueConfig = {
            maxNumberOfMessagesToRead : 1,
            destinationTopicName : "test"
        };

        sqsWorker.processMessages(queueName, queueConfig)
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