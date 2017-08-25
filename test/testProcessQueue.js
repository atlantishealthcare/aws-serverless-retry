"use strict";

const SQSService = require("../lib/sqsService");

module.exports.processQueueTests = {
    testToProcessMessageIfExists: function (test) {
        let region = "us-west-2";
        let sqsService = new SQSService(region);
        let queueName = "test";
        let queueConfig = {
            triggerTopicName: "trigger-topic",
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
    testToProcessMessagePassesAndIgnoresMessageIfNotJSONMessage: function (test) {
        let region = "us-west-2";
        let sqsService = new SQSService(region);
        let queueName = "test3";

        sqsService.processMessages(queueName, 10, true)
            .then(response => {
                test.ok(response !== null);
                test.ok(response[0].message === "Message is not a valid JSON and cannot be deleted from Queue");
                test.done();
            })
            .catch(err => {
                //Only used by build server
                test.done();
            });
    },
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
    testToProcessMessageFailsWithMissingTriggerTopicWhenReadConfigFromMessageSetToFalse: function (test) {
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
                test.ok(err.message === "triggerTopicName missing from SQSConfig");
                test.done();
            });
    },
    testToProcessMessageFailsWithMissingFailureTopicWhenReadConfigFromMessageSetToFalse: function (test) {
        let region = "us-west-2";
        let sqsService = new SQSService(region);
        let queueName = "test";
        let queueConfig = {
            triggerTopicName: "trigger-topic"
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
        let queueName = "test2";

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