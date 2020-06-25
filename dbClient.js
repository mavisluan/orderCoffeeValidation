'use strict';

const AWS = require('aws-sdk');
const {region, accessKeyId, secretAccessKey} = require('./config');

AWS.config.update({
  region,
  accessKeyId,
  secretAccessKey,
});
var dbClient = new AWS.DynamoDB.DocumentClient({apiVersion: '2012-08-10'});

const getProductInfo = (orderKey, itemKey) => {
  const params = {
    TableName: "order-dev",
    Key: {'orderKey': orderKey}
  };
  return new Promise((resolve, reject) => {
    dbClient.get(params, (err, data) => {
      if (err) {
        reject(err);
      } else {
        console.log( orderKey, data.Item[itemKey])
        resolve(data.Item[itemKey]);
      }
    })
  })
}
module.exports = { dbClient, getProductInfo };