'use strict';

const AWS = require('aws-sdk');
const {region, accessKeyId, secretAccessKey} = require('./config');
const { v4: uuidv4 } = require('uuid');

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

const saveOrderToDB = ({type='', size='', price='', userId='', crust=''}) => {
  const orderId = "order-" + uuidv4();
  const item = {
    orderKey: orderId,
    name: type,
    size,
    price, 
    userId,
    crust
  };
 
  console.log('item', item)
  const params = {
    TableName: "order-dev",
    Item: item
  };

  return new Promise((resolve, reject) => {
    dbClient.put(params, (err, data) => {
      if (err) {
        reject(err);
      } else {
        console.log( 'save the item', item)
        resolve(item);
      }
    })
  })
}

module.exports = { dbClient, getProductInfo, saveOrderToDB };