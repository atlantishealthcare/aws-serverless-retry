# Changelog for aws-serverless-retry
<!--LATEST=2.1.0-->
<!--ENTRYINSERT-->

## 2.1.0
* feature: SQSService.processMessages --> Added functionality to remove asrConfig from original before it gets sent to trigger topic (Destination topic)

## 2.0.0
* bugfix: Fixed issue with asrConfig invalid validation error when SQSService.processMessages is called  with readConfigFromMessage=true
* bugfix: Fixed issue with SQSService sending it to retryTopic topic instead of trigger topic.
* feature: Added ability to validate asrConfig from SQS retrieved message 
* fix: Updated README usage instructions

## 1.0.2
* bugfix: Fixed issue with sqsConfig missing validation error when SQSService.processMessages is called with readConfigFromMessage=true
* fix: Updated README usage instructions 

## 1.0.1
* fix: Updated README usage instructions