"use strict";
/*
let SQSService = require('./lib/sqsService');
let sqsService = new SQSService("us-west-2");

sqsService.processMessages("test", 10, true);*/

let SNSService = require("./lib/snsService");
let config = {
    region: "us-west-2",
    retryStatusCodes: [500],
    failureStatusCodes: [],
    successStatusCodes: [200],
    maxRetryAttempts: 2,
    retryTopicName: "retry-topic",
    successTopicName: "success-topic",
    failureTopicName: "error-topic"
};
let snsService = new SNSService(config);
snsService.sendToTopicByStatusCode(500, {
    name: "test",
    retrycount: 1,
});