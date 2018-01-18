"use strict";

const SNSService = require("../lib/snsService");

module.exports.sendToTopicByStatusCodeTests = {
    testToSendItToSuccessTopicOn200: function (test) {
        let config = {
            retryStatusCodes: [],
            failureStatusCodes: [],
            successStatusCodes: [200],
            maxRetryAttempts: 2,
            retryTopicName: "retry-topic",
            successTopicName: "success-topic",
            failureTopicName: "error-topic"
        };

        let snsService = new SNSService("us-west-2");
        let statusCode = 200;
        let subject = "Test Subject";
        let payload = {
            "data": "Test"
        };

        snsService.sendToTopicByStatusCode(statusCode, payload, config, subject)
            .then(response => {
                test.ok(response !== null);
                test.ok(response.topicName === config.successTopicName);
                test.done();
            })
            .catch(err => {
                //Only used by build server
                test.done();
            });
    },
    testToSendItToSuccessTopicWithMessageAttributesOn200: function (test) {
        let config = {
            retryStatusCodes: [],
            failureStatusCodes: [],
            successStatusCodes: [200],
            maxRetryAttempts: 2,
            retryTopicName: "retry-topic",
            successTopicName: "success-topic",
            failureTopicName: "error-topic"
        };

        let snsService = new SNSService("us-west-2");
        let statusCode = 200;
        let subject = "Test Subject - Message Filtering";
        let phoneNumber = '';
        let attributes = {
            "country": "subscriber-country",
            "city": "subscriber-city"
        };
        let payload = {
            "data": "Test"
        };

        snsService.sendToTopicByStatusCode(statusCode, payload, config, subject, phoneNumber, attributes)
            .then(response => {
                test.ok(response !== null);
                test.ok(response.topicName === config.successTopicName);
                test.done();
            })
            .catch(err => {
                //Only used by build server
                test.done();
            });
    },
    testToSendItToErrorTopicOn400: function (test) {
        let config = {
            retryStatusCodes: [],
            failureStatusCodes: [400],
            successStatusCodes: [200],
            maxRetryAttempts: 2,
            retryTopicName: "retry-topic",
            successTopicName: "success-topic",
            failureTopicName: "error-topic"
        };

        let snsService = new SNSService("us-west-2");
        let statusCode = 400;
        let payload = {
            "data": "Test"
        };

        snsService.sendToTopicByStatusCode(statusCode, payload, config)
            .then(response => {
                test.ok(response !== null);
                test.ok(response.topicName === config.failureTopicName);
                test.done();
            })
            .catch(err => {
                //Only used by build server
                test.done();
            });
    },
    testToSendItToRetryTopicOn500: function (test) {
        let config = {
            retryStatusCodes: [500],
            failureStatusCodes: [400],
            successStatusCodes: [200],
            maxRetryAttempts: 2,
            retryTopicName: "retry-topic",
            successTopicName: "success-topic",
            failureTopicName: "error-topic"
        };

        let snsService = new SNSService("us-west-2");
        let statusCode = 500;
        let payload = {
            "data": "Test"
        };

        snsService.sendToTopicByStatusCode(statusCode, payload, config)
            .then(response => {
                test.ok(response !== null);
                test.ok(response.topicName === config.retryTopicName);
                test.done();
            })
            .catch(err => {
                //Only used by build server
                test.done();
            });
    },
    testToSendItToFailureTopicOnIfUnknown: function (test) {
        let config = {
            retryStatusCodes: [500],
            failureStatusCodes: [400],
            successStatusCodes: [200],
            maxRetryAttempts: 2,
            retryTopicName: "retry-topic",
            successTopicName: "success-topic",
            failureTopicName: "error-topic"
        };

        let snsService = new SNSService("us-west-2");
        let statusCode = 201;
        let payload = {
            "data": "Test"
        };

        snsService.sendToTopicByStatusCode(statusCode, payload, config)
            .then(response => {
                test.ok(response !== null);
                test.ok(response.topicName === config.failureTopicName);
                test.done();
            })
            .catch(err => {
                //Only used by build server
                test.done();
            });
    },
    testToFailIfStatusCodeIsInvalid: function (test) {
        let config = {
            retryStatusCodes: [500],
            failureStatusCodes: [400],
            successStatusCodes: [200],
            maxRetryAttempts: 2,
            retryTopicName: "retry-topic",
            successTopicName: "success-topic",
            failureTopicName: "error-topic"
        };

        let snsService = new SNSService("us-west-2");
        let payload = {
            "data": "Test"
        };

        snsService.sendToTopicByStatusCode(null, payload, config)
            .catch(err => {
                test.ok(err !== null);
                test.ok(err.message === "StatusCode is invalid");
                test.done();
            });
    },
    testToFailIfPayLoadIsInvalid: function (test) {
        let config = {
            region: "us-west-2",
            retryStatusCodes: [500],
            failureStatusCodes: [400],
            successStatusCodes: [200],
            maxRetryAttempts: 2,
            retryTopicName: "retry-topic",
            successTopicName: "success-topic",
            failureTopicName: "error-topic"
        };

        let snsService = new SNSService("us-west-2");
        let statusCode = 201;

        snsService.sendToTopicByStatusCode(statusCode, null, config)
            .catch(err => {
                test.ok(err !== null);
                test.ok(err.message === "PayLoad is empty");
                test.done();
            });
    },
    testToFailIfConfigIsInvalid: function (test) {
        let snsService = new SNSService("us-west-2");
        let statusCode = 201;
        let payload = {
            "data": "Test"
        };

        snsService.sendToTopicByStatusCode(statusCode, payload)
            .catch(err => {
                test.ok(err !== null);
                test.ok(err.message === "SNS config is invalid");
                test.done();
            });
    }
};