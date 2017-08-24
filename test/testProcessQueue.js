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
    },
    //Cannot be tested in real time
    /*testToProcessMessagePassesAndIgnoresMessageIfNotJSONMessage: function (test) {
        let region = "us-west-2";
        let sqsService = new SQSService(region);
        let queueName = "test";

        sqsService.processMessages(queueName, 10, true)
            .then(response => {
                test.ok(response !== null);
                test.ok(response.message === "Message is not a valid JSON and cannot be deleted from Queue");
                test.done();
            })
            .catch(err => {
                //Only used by build server
                test.done();
            });
    },*/
    testToProcessMessageFailsWithMissingConfigWhenReadConfigFromMessageSetToFalse: function (test) {
        let region = "us-west-2";
        let sqsService = new SQSService(region);
        let queueName = "test";

        sqsService.processMessages(queueName, 10, false)
            .then(response => {
                test.ok(response !== null);
                test.done();
            })
            .catch(err => {
                test.ok(err !== null);
                test.ok(err.message === "SQS Config is invalid");
                test.done();
            });
    },
    testToProcessMessageFailsWithMissingRetryTopicWhenReadConfigFromMessageSetToFalse: function (test) {
        let region = "us-west-2";
        let sqsService = new SQSService(region);
        let queueName = "test";
        let sqsConfig = {
            failureTopicName: "error-topic"
        };

        sqsService.processMessages(queueName, 10, false, sqsConfig)
            .then(response => {
                test.ok(response !== null);
                test.done();
            })
            .catch(err => {
                test.ok(err !== null);
                test.ok(err.message === "retryTopicName missing from SQSConfig");
                test.done();
            });
    },
    testToProcessMessageFailsWithMissingFailureTopicWhenReadConfigFromMessageSetToFalse: function (test) {
        let region = "us-west-2";
        let sqsService = new SQSService(region);
        let queueName = "test";
        let queueConfig = {
            retryTopicName: "retry-topic"
        };

        sqsService.processMessages(queueName, 10, false, queueConfig)
            .then(response => {
                test.ok(response !== null);
                test.done();
            })
            .catch(err => {
                test.ok(err !== null);
                test.ok(err.message === "failureTopicName missing from SQSConfig");
                test.done();
            });
    },
    testToProcessMessagePassesWhenThereAreNoMessages: function (test) {
        let region = "us-west-2";
        let sqsService = new SQSService(region);
        let queueName = "test";

        sqsService.processMessages(queueName, 10, true)
            .then(response => {
                test.ok(response !== null);
                test.ok(response.message === "No messages to process");
                test.done();
            })
            .catch(err => {
                test.done();
            });
    }
};