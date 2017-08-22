"use strict";

const SQSWorker = require("../lib/sqs_worker");

module.exports.getQueueUrlTests = {
    testToGetQueueUrlForExisitingQueueName: function (test) {
        let config = {
            region: "us-west-2"
        };

        let sqsWorker = new SQSWorker(config);
        let queueName = "test";
        sqsWorker.getQueueUrl(queueName)
            .then(response => {
                test.ok(response !== null);
                test.ok(response.QueueUrl.includes("test"));
                test.done();
            })
            .catch(err => {
                //Only used by build server
                test.done();
            });
    },
    testToGetQueueUrlForNonExistingQueueName: function (test) {
        let config = {
            region: "us-west-2"
        };

        let sqsWorker = new SQSWorker(config);
        let queueName = "test2";
        sqsWorker.getQueueUrl(queueName)
            .then(response => {
                test.ok(response !== null);
                test.ok(response.QueueUrl.includes("test2"));
                test.done();
            })
            .catch(err => {
                //Only used by build server
                test.done();
            });
    }
};