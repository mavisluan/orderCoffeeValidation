'use strict';

const AWS = require('aws-sdk');
const {region, accessKeyId, secretAccessKey} = require('./config');

AWS.config.update({
  region,
  accessKeyId,
  secretAccessKey,
});
var dbClient = new AWS.DynamoDB.DocumentClient({apiVersion: '2012-08-10'});

module.exports = dbClient;