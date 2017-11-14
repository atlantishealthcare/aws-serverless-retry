"use strict";

const SQSService = require("../lib/sqsService");

module.exports.processQueueTests = {
    testToProcessMessageIfExists: function (test) {
        let region = "us-west-2";
        let sqsService = new SQSService(region);
        let queueName = "test3";
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
                test.ok(response.responses !== null);
                test.ok(response.responses[0].message === "Message is not a valid JSON and cannot be deleted from Queue");
                test.ok(response.hasPoisedMessage === true);
                test.done();
            })
            .catch(err => {
                //Only used by build server
                test.done();
            });
    },
    testToProcessMessageFailsWithMissingQueueName: function (test) {
        let region = "us-west-2";
        let sqsService = new SQSService(region);
        let queueName = "";

        sqsService.processMessages(queueName, 10, false)
            .then(response => {
                test.ok(response !== null);
                test.done();
            })
            .catch(err => {
                test.ok(err !== null);
                test.ok(err.message === "QueueName is empty");
                test.done();
            });
    },
    testToProcessMessageFailsWithMissingConfigWhenReadConfigFromMessageSetToFalse: function (test) {
        let region = "us-west-2";
        let sqsService = new SQSService(region);
        let queueName = "test3";

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
        let queueName = "test3";
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
        let queueName = "test3";
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
        let queueName = "test3";

        sqsService.processMessages(queueName, 10, true)
            .then(response => {
                test.ok(response !== null);
                test.ok(response.message === "No messages to process");
                test.ok(response.messagesProcessed === 0);
                test.ok(response.hasPoisedMessage === false);
                test.done();
            })
            .catch(err => {
                test.done();
            });
    }
};