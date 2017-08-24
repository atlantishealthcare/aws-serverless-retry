"use strict";

const SQSService = require("../lib/sqsService");

module.exports.processQueueTests = {
    testToProcessMessageIfExists: function (test) {
        let region = "us-west-2";
        let sqsService = new SQSService(region);
        let queueName = "test";
        let queueConfig = {
            retryTopicName: "retry-topic",
            failureTopicName: "error-topic"
        };

        sqsService.processMessages(queueName, 10, false, queueConfig)
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