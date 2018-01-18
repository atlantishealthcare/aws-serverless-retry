# Simple library to retry or poll your payload using SNS, SQS and Lambda

[![Build Status](https://travis-ci.org/atlantishealthcare/aws-serverless-retry.svg?branch=master)](https://travis-ci.org/atlantishealthcare/aws-serverless-retry)
[![codecov](https://codecov.io/gh/atlantishealthcare/aws-serverless-retry/branch/master/graph/badge.svg)](https://codecov.io/gh/atlantishealthcare/aws-serverless-retry)

[![NPM](https://nodei.co/npm/aws-serverless-retry.png?downloads=true)](https://nodei.co/npm-dl/aws-serverless-retry/)

Use SNS and SQS services to hook your application for retrying your message with Lambda (recommended) or NodeJS app. 

SNS service can send payload to topic (topic is decided based on configuration) which then gets delivered to queue 
(if subscribed). Configuration is fully customizable. User can specify which topic to send it to based on the 
status codes: retryStatusCodes, failureStatusCodes, successStatusCodes. 

Messages from SQS can be consumed by Lambda (scheduled with interval) using SQS service. Specify no. of messages to read, 
queue name, and destination topic and leave the rest to service to read, process, delete, and send it to destination topic 

If you are also looking for aws promise libraries? this library will nicely integrate with your code...

### Example solution diagram of how you can use this library to retry or poll your message

![alt tag](docs/Serverless%20Retry%20Solution%20Diagram.jpg "ASR solution reference diagram")

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
const SNSService = ASR.SNS;

//Create SNSService
let region = "us-west-2";
let snsService = new SNSService(region);

//Params
let statusCode = 200;
let payload = {
  "data": "Test"
};
let snsConfig = {    
    retryStatusCodes: [500],
    failureStatusCodes: [400],
    successStatusCodes: [200, 201],
    maxRetryAttempts: 2,            
    retryTopicName: "retry-topic",
    successTopicName: "success-topic",
    failureTopicName: "failure-topic"
};

//Now call sendToTopicByStatusCode
snsService.sendToTopicByStatusCode(statusCode, payload, snsConfig, subject)
           .then(response => {
                //Success     
           })
           .catch(err => {
                //Error
           });
```

#### Logging
Set DEBUG environment variable to true to enable logging

#### Actions you can perform:  
SNS Service:
- createTopic(topicName)

    Creates topic with the provided topic name. If topic exists it simply returns promise response with TopicArn
    
    Response: Promise aws-sdk standard response
    ```javascript  
    let ASR = require("aws-serverless-retry");
    let SNSService = ASR.SNS;    
    let snsService = new SNSService("us-west-2");  
    //Params
    //topicName: string value.    
    snsService.createTopic("topicName")
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
- sendToTopicByStatusCode(statusCode, payload, snsConfig, subject) 

    Publishes payload to appropriate topic (success/failure/retry) based on statusCodes provided in configuration. If passed in StatusCode is not listed in configuration it is
    published to failure topic by default. If topic does't exists it creates topic and then sends payload to that topic.
    
    Response: Promise aws-sdk standard publishTopic response with additional topicName property
    ```javascript
    let ASR = require("aws-serverless-retry");
    let SNSService = ASR.SNS;
    let snsService = new SNSService("us-west-2");
    //Params
    //statusCode: integer value
    //payload: JSON object only
    //snsConfig: JSON object only
    //subject: Optional parameter to be used as the "Subject" line when the message is delivered to email endpoints.
    // Subjects must be ASCII text that begins with a letter, number, or punctuation mark; must not include line breaks 
    // or control characters; and must be less than 100 characters long 
    let snsConfig = {                    
                    retryStatusCodes: [500], //optional
                    failureStatusCodes: [400], //optional
                    successStatusCodes: [200, 201], //optional
                    maxRetryAttempts: 2, //optional, defaults to 1 is not provided
                    retryTopicName: "retry-topic", //required
                    successTopicName: "success-topic", //required
                    failureTopicName: "failure-topic" //required                
                };
    snsService.sendToTopicByStatusCode(statusCode, payload, snsConfig, subject)
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

    
- sendToTopic(topicName, payload, subject, phoneNumber, attributes)

    Publishes payload to specified topic. If topic doesn't exists it creates topic and then sends payload to that topic
    
    Response: Promise aws-sdk standard publishTopic response with additional topicName property
    ```javascript
    let ASR = require("aws-serverless-retry");
    let SNSService = ASR.SNS;
    let snsService = new SNSService("us-west-2");
    //Params
    //topicName: string value
    //payload: JSON object only
    //subject: Optional parameter to be used as the "Subject" line when the message is delivered to email endpoints.
    // Subjects must be ASCII text that begins with a letter, number, or punctuation mark; must not include line breaks 
    // or control characters; and must be less than 100 characters long
    //phoneNumber: Optional parameter. The phone number to which you want to deliver an SMS message
    //attributes: Optional parameter. JSON object only. Sets the message attributes of the message so that the messages can be filtered by the attribute.
    //    example, attributes: { "subscriberEmail": "subscriber1@email.com" }. If the topic subscriber assigns filter policy for 'subscriberEmail' attribute and
    //    the attribute matches, then the subscriber receives the message.

    snsService.sendToTopic("topicName", payload, subject, phoneNumber, attributes)
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

SQS Service:
- getQueueUrl(queueName)

    Gets queue url if exists else creates new queue with the provided queue name
    
    Response: Promise aws-sdk standard response
    ```javascript
    let ASR = require("aws-serverless-retry");
    let SQSService = ASR.SQS;
    let region = "us-west-2";
    let sqsService = new SQSService(region);
    sqsService.getQueueUrl("queueName")
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
    
    Response: Promise aws-sdk standard response with additional QueueUrl property
    ```javascript
    let ASR = require("aws-serverless-retry");
    let SQSService = ASR.SQS;
    let region = "us-west-2";
    let sqsService = new SQSService(region);
    sqsService.readMessage("your-queueUrl", 5)
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
    
    Response: Promise aws-sdk standard response
    ```javascript
    let ASR = require("aws-serverless-retry");
    let SQSService = ASR.SQS;
    let region = "us-west-2";
    let sqsService = new SQSService(region);
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

    Reads message from Queue, Sends message to destination topic, Deletes message from Queue and returns delete message response 
    - Any failures in processing will leave the message in queue for safety and should be manually fixed.
    - Once message maxRetryAttempt is reached, it will be sent to failure topic instead of trigger topic (destination topic)
    
    Response: Promise delete SQS message aws-sdk standard response in array.  
    
    Note: 
    - Messages can only be processed if it is send to queue using SNS service. 
    - And the message payload format is of type JSON.    
    
    ```javascript
    let ASR = require("aws-serverless-retry");
    let SQSService = ASR.SQS;
    let region = "us-west-2";    
    let sqsService = new SQSService(region);    
      
    let queueName = "queue-name"; //Required. Should be a valid queue name  
    let maxNumberOfMessagesToRead = 6; //Required. Can be any number between 1 to 10.     
    let readConfigFromMessage = true; //Accepts either true/false.
    //If true, config values are retrieved from message body. It is assumed that asrConfig (as below) will get sent in message.
    //Example: message.asrConfig = {
    //    triggerTopicName: "trigger-topic-name",
    //    failureTopicName: "failure-topic-name",
    //    maxRetryAttempts: 2
    // }
    //If false, config values are retrieved from sqsConfig which is passed as parameter
    //Example: sqsConfig : {
    //    triggerTopicName: "trigger-topic-name",
    //    failureTopicName: "failure-topic-name",
    //    maxRetryAttempts: 2
    // }  
    
    let sqsConfig = {
                        triggerTopicName: "trigger-topic-name", //required
                        failureTopicName: "failure-topic-name", //required
                        maxRetryAttempts: 2 //optional. Defaults to 1 if not provided
                    };
    sqsService.processMessages(queueName, maxNumberOfMessagesToRead, readConfigFromMessage, sqsConfig)
               .then(response => {
                    //Success
                    //response is standard aws-sdk responses (SQS delete message) in array with additional properties
                    // as below  
                    //response.hasPoisonMessage = <true/false>
                    //response.messagesProcessed = <integer>                    
               })
               .catch(err => {
                    //Error
                    //err is standard aws-sdk error
               });
    ```
