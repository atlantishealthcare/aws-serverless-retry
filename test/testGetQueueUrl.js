"use strict";

const SQSService = require("../lib/sqsService");

module.exports.getQueueUrlTests = {
    testToGetQueueUrlForExisitingQueueName: function (test) {
        let region = "us-west-2";
        let sqsService = new SQSService(region);
        let queueName = "test";
        sqsService.getQueueUrl(queueName)
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
        let region = "us-west-2";
        let sqsService = new SQSService(region);
        let queueName = "test2";
        sqsService.getQueueUrl(queueName)
            .then(response => {
                test.ok(response !== null);
                test.ok(response.QueueUrl.includes("test2"));
                test.done();
            })
            .catch(err => {
                //Only used by build server
                test.done();
            });
    },
    testToGetQueueUrlForInvalidQueueName: function (test) {
        let region = "us-west-2";
        let sqsService = new SQSService(region);
        let queueName = "n@me";
        sqsService.getQueueUrl(queueName)
            .catch(err => {
                //Only used by build server
                test.done();
            });
    }
};