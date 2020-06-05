'use strict'

const orderCoffee = require('./orderCoffee');
const orderTea = require('./orderTea');

module.exports = (intentRequest, callback) => {
    console.log(`dispatch userId=${intentRequest.userId}, intentName=${intentRequest.currentIntent.name}`);
    const intentName = intentRequest.currentIntent.name;
 
    if (intentName === 'CoffeeOrder') {
      console.log(intentName + ' was called');
      return orderCoffee(intentRequest, callback);
    }
 
    if (intentName === 'TeaOrder') {
      console.log(intentName + ' was called');
      return orderTea(intentRequest, callback);
    }
    throw new Error(`Intent with name ${intentName} not supported`);
  }