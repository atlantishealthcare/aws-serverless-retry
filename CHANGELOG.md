# Changelog for aws-serverless-retry
<!--LATEST=3.0.1-->
<!--ENTRYINSERT-->

## 3.0.1
* docs: Updated README usage instructions.

## 3.0.0
* feature: SNSService.sendToTopicByStatusCode --> Removed config parameter from constructor and added it to relevant function  
* docs: Updated README usage instructions.

## 2.1.5
* feature: SNSService.sendToTopicByStatusCode --> publish to failure topic instead of success topic when passed in successCode is unknown (not from configuration list) 
* docs: Updated README usage instructions.

## 2.1.4
* bugfix: SQSService.processMessages --> retryCount getting ignored (due to wrong property name) resulting message to send it to trigger topic all times

## 2.1.3
* bugfix: SQSService.processMessages --> retryCount getting ignored (due to case sensitive issue) resulting message to send it to trigger topic all times

## 2.1.2
* bugfix: SNSService.sendToTopicByStatusCode --> retryCount not getting updated when incoming message property is in lowercase
* bugfix: SQSService.readMessage --> MessageCount log entry fails when there are no messages in the queue

## 2.1.1
* docs: Updated README usage instructions.

## 2.1.0
* feature: SQSService.processMessages --> Added functionality to remove asrConfig from original before it gets sent to trigger topic (Destination topic)

## 2.0.0
* bugfix: Fixed issue with asrConfig invalid validation error when SQSService.processMessages is called  with readConfigFromMessage=true
* bugfix: Fixed issue with SQSService sending it to retryTopic topic instead of trigger topic.
* feature: Added ability to validate asrConfig from SQS retrieved message 
* docs: Updated README usage instructions

## 1.0.2
* bugfix: Fixed issue with sqsConfig missing validation error when SQSService.processMessages is called with readConfigFromMessage=true
* docs: Updated README usage instructions 

## 1.0.1
* docs: Updated README usage instructions