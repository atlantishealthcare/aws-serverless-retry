"use strict";

const util = require("../util");

module.exports.utilTests = {
    testToTryParseJSONWithValidJSON: function (test) {
        let inputJSON = { "name": "test"};
        let result = util.tryParseJSON(inputJSON);

        test.ok(result !== null);
        test.deepEqual(inputJSON, result);
        test.done();
    },
    testToTryParseJSONReturnWithInValidJSON: function (test) {
        let inputJSON = "Invalid JSON";
        let result = util.tryParseJSON(inputJSON);

        test.ok(result !== null);
        test.ok(result === false);
        test.done();
    },
    testToValidateSQSASRConfig: function (test) {
        let asrConfig = {
            triggerTopicName: "asdfad",
            failureTopicName: "asdfa",
            maxRetryAttempts: 3
        };
        let serviceType = "SQS";
        let result = util.validateASRConfig(asrConfig, serviceType);

        test.ok(result !== null);
        test.ok(result === true);
        test.done();
    },
    testToValidateSNSASRConfig: function (test) {
        let asrConfig = {
            retryTopicName: "asdfads",
            failureTopicName: "asdf",
            successTopicName: "asdf",
            maxRetryAttempts: 3
        };
        let serviceType = "SNS";
        let result = util.validateASRConfig(asrConfig, serviceType);

        test.ok(result !== null);
        test.ok(result === true);
        test.done();
    },
    testToValidateWithMissingSQSASRConfig: function (test) {
        let asrConfig = {
            failureTopicName: "asdfa",
            maxRetryAttempts: 3
        };
        let serviceType = "SQS";
        let result = util.validateASRConfig(asrConfig, serviceType);

        test.ok(result !== null);
        test.ok(result === false);
        test.done();
    },
    testToValidateWithMissingSNSASRConfig: function (test) {
        let asrConfig = {
            retryTopicName: "asdfsa",
            failureTopicName: "asdfads",
            maxRetryAttempts: 3
        };
        let serviceType = "SNS";
        let result = util.validateASRConfig(asrConfig, serviceType);

        test.ok(result !== null);
        test.ok(result === false);
        test.done();
    },
    testToValidateUnknownServiceTypeASRConfig: function (test) {
        let asrConfig = {
            retryTopicName: "",
            failureTopicName: "",
            successTopicName: "",
            maxRetryAttempts: 1
        };
        let serviceType = "API";
        let result = util.validateASRConfig(asrConfig, serviceType);

        test.ok(result !== null);
        test.ok(result === false);
        test.done();
    }
};