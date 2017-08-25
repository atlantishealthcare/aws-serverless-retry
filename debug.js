"use strict";
let SQSService = require('./lib/sqsService');
let sqsService = new SQSService("us-west-2");

sqsService.processMessages("test", 10, true);