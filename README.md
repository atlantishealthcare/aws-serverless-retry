# Simple library to retry your payload using SNS

Use SNS service subscription functionality to hook your AWS services to create, publish and retry

Actions you can perform:  
- Create Topic
- Publish to Topic by StatusCode 

    Payload is published to appropriate topic based on statusCodes provided in configuration. If StatusCode is not listed in configuration it is
    published to success topic by default.
- Publish to Topic by Topic name

Note: All functions return promise

## Installing

### In Node.js

The preferred way to install the AWS Serverless Retry  for Node.js is to use the npm package manager for Node.js.
Simply type the following into a terminal window:

```sh
npm install aws-serverless-retry
```

##Usage and Getting Started

```javascript
import ASR = require("aws-serverless-retry");

//Create SNSNotifier and pass your configuration
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
let snsNotifier = new SNSNotifier(config);

//Params
let statusCode = 200;
let payload = {
  "data": "Test"
};

//Now call sendToTopicByStatusCode by passing your parameters above
snsNotifier.sendToTopicByStatusCode(statusCode, payload)
           .then(response => {
                //Success     
           })
           .catch(err => {
                //Error
           });

//Response
{
    topicName: "Success-Topic-Name",
    .. //Stadard object that is returned from AWS-SDK
}
```