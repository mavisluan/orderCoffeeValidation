'use strict';

const lexResponses = require('./lexResponses');
const buildFulfillmentResult = (fulfillmentState, messageContent) =>{
  return {
    fulfillmentState,
    message: {contentType: 'PlainText', content: messageContent}
  }
}

module.exports = (intentRequest, callback) => {
  const source = intentRequest.invocationSource;

  if (source === 'DialogCodeHook') {
    callback(lexResponses.delegate(intentRequest.sessionAttributes, intentRequest.currentIntent.slots));
    return;
  }

  if (source === 'FulfillmentCodeHook') {
    console.log('FulfillmentCodeHook');

    const {fulfillmentState, message} = buildFulfillmentResult('Fulfilled', 'You will be connected with a representative shortly. Please hold online. Thank you!')

    callback(lexResponses.close(intentRequest.sessionAttributes, fulfillmentState, message));
  }
}