# Simple library to retry your payload using SNS, SQS and Lambda

[![Build Status](https://travis-ci.org/atlantishealthcare/aws-serverless-retry.svg?branch=master)](https://travis-ci.org/atlantishealthcare/aws-serverless-retry)
[![Coverage Status](https://coveralls.io/repos/github/atlantishealthcare/aws-serverless-retry/badge.svg?branch=master)](https://coveralls.io/github/atlantishealthcare/aws-serverless-retry?branch=master)

Use SNS and SQS services to hook your application for retrying your message with Lambda (recommended) or NodeJS app. 

SNS service can send payload to topic (topic is decided based on configuration) which then gets delivered to queue 
(if subscribed). Configuration is fully customizable. User can specify which topic to send it to based on the 
status codes: retryStatusCodes, errorStatusCodes, successStatusCodes. 

Messages from SQS can be consumed by Lambda (scheduled with interval) using SQS service. Specify no. of messages to read, 
queue name, and destination topic and leave the rest to service to read, process, delete, and send it to destination topic 

## Installing

### In Node.js

The preferred way to install the AWS Serverless Retry  for Node.js is to use the npm package manager for Node.js.
Simply type the following into a terminal window:

```sh
npm install aws-serverless-retry
```

## Usage and Getting Started

```javascript
const ASR = require("aws-serverless-retry");
const SNS = ASR.SNS;

//Create SNSService and pass your configuration
let config = {
            region: "us-west-2",
            retryStatusCodes: [500],
            errorStatusCodes: [400],
            successStatusCodes: [200, 201],
            maxRetryAttempts: 2,
            retryTopicName: "retry-topic",
            successTopicName: "success-topic",
            errorTopicName: "error-topic"
        };
let snsService = new SNS.SNSService(config);

//Params
let statusCode = 200;
let payload = {
  "data": "Test"
};

//Now call sendToTopicByStatusCode
snsService.sendToTopicByStatusCode(statusCode, payload)
           .then(response => {
                //Success     
           })
           .catch(err => {
                //Error
           });
```

####Logging
Set DEBUG environment variable to true to enable logging

#### Actions you can perform:  
SNS:
- createTopic(topicName)

    Creates topic with the provided topic name. If topic exists it simply returns TopicArn
    ```javascript  
    let ASR = require("aws-serverless-retry");
    let SNS = ASR.SNS;
    let snsService = new SNS.SNSService(config);  
    snsService.createTopic(topicName)
               .then(response => {
                    //Success
                    //response is standard aws-sdk response
                    console.log(response.TopicArn)   
               })
               .catch(err => {
                    //Error
                    //err is standard aws-sdk error
               });
    ```
- sendToTopicByStatusCode(statusCode, payload) 

    Publishes payload to appropriate topic based on statusCodes provided in configuration. If StatusCode is not listed in configuration it is
    published to success topic by default. If topic does't exists it creates topic and then sends payload to that topic
    ```javascript
    let ASR = require("aws-serverless-retry");
    let SNS = ASR.SNS;
    let snsService = new SNS.SNSService(config);
    snsService.sendToTopicByStatusCode(statusCode, payload)
               .then(response => {
                    //Success
                    //response is standard aws-sdk response with additional topicName property
                    console.log(response.topicName)   
               })
               .catch(err => {
                    //Error
                    //err is standard aws-sdk error
               });
    ```

    
- sendToTopic(topicName, payload)

    Publishes payload to specified topic. If topic does't exists it creates topic and then sends payload to that topic
    ```javascript
    let ASR = require("aws-serverless-retry");
    let SNS = ASR.SNS;
    let snsService = new SNS.SNSService(config);
    snsService.sendToTopic(topicName, payload)
                .then(response => {
                    //Success
                    //response is standard aws-sdk response with additional topicName property
                    console.log(response.topicName)   
                })
                .catch(err => {
                    //Error
                    //err is standard aws-sdk error
                });
    ```

SQS:
- getQueueUrl(queueName)

    Gets queue url if exists else creates new queue with the provided queue name
    ```javascript
    let ASR = require("aws-serverless-retry");
    let SQS = ASR.SQS;
    let region = "us-west-2";
    let sqsService = new SNS.SQSService(region);
    sqsService.getQueueUrl(queueName)
               .then(response => {
                    //Success
                    //response is standard aws-sdk response
                    console.log(response.QueueUrl)   
               })
               .catch(err => {
                    //Error
                    //err is standard aws-sdk error
               });
    ```
- readMessage(queueUrl, maxNumberOfMessagesToRead)

    Reads message from Queue. If maxNumberOfMessagesToRead (range 1 to 10) is not valid it defaults to 10.
    ```javascript
    let ASR = require("aws-serverless-retry");
    let SQS = ASR.SQS;
    let region = "us-west-2";
    let sqsService = new SNS.SQSService(region);
    sqsService.readMessage("queueUrl", 5)
               .then(response => {
                    //Success
                    //response is standard aws-sdk response with additional property QueueUrl
                    console.log(response.QueueUrl)   
               })
               .catch(err => {
                    //Error
                    //err is standard aws-sdk error
               });
    ```
- deleteMessage(queueUrl, receiptHandle)

    Delete message from Queue.
    ```javascript
    let ASR = require("aws-serverless-retry");
    let SQS = ASR.SQS;
    let region = "us-west-2";
    let sqsService = new SNS.SQSService(region);
    sqsService.deleteMessage("queueUrl", receiptHandle)
               .then(response => {
                    //Success
                    //response is standard aws-sdk response
                    console.log(response.QueueUrl)   
               })
               .catch(err => {
                    //Error
                    //err is standard aws-sdk error
               });
    ```
- processMessage(queueName, sqsConfig)

    Reads message from Queue, Sends message to destination topic and Deletes message from Queue. 
    - This function only processes message which are of type JSON. Any failures in processing will leave the message in queue.
    - Once message maxRetryAttempt is reached, it is send to failure topic instead
    ```javascript
    let ASR = require("aws-serverless-retry");
    let SQS = ASR.SQS;
    let region = "us-west-2";    
    let sqsService = new SNS.SQSService(region);    
      
    let queueName = "queue-name"; //Required.Should be a valid queue name  
    let maxNumberOfMessagesToRead = 6; //Required. Can be any number between 1 to 10.     
    let readConfigFromMessage = false; //Accepts either true/false.
    //If false config values are retrieved from message body.
    //Example: message.asrConfig = {
    //    retryTopicName: "",
    //    failureTopicName: "",
    //    maxRetryAttempts: 2
    // }
    //If true config values are retrieved from sqsConfig which is passed as parameter
    //Example: sqsConfig : {
    //    retryTopicName: "",
    //    failureTopicName: "",
    //    maxRetryAttempts: 2
    // }
  
    
    let sqsConfig = {
                        retryTopicName: "", //required
                        failureTopicName: "", //required
                        maxRetryAttempts: 2 //optional. Defaults to 1 if not provided
                    };
    sqsService.processMessages(queueName, maxNumberOfMessagesToRead, readConfigFromMessage, sqsConfig)
               .then(response => {
                    //Success
                    //response is standard aws-sdk responses in array.                    
               })
               .catch(err => {
                    //Error
                    //err is standard aws-sdk error
               });
    ```
