'use strict';

const lexResponses = require('./lexResponses');

const types = ['chai', 'chai latte', 'green tea', 'jasmine tea', 'honey lemon tea'];
const sizes = ['normal', 'large'];

const buildValidationResult = (isValid, violatedSlot, messageContent) => {
  if (messageContent == null) {
      return {
          isValid,
          violatedSlot,
      };
  }
  return {
      isValid,
      violatedSlot,
      message: { contentType: 'PlainText', content: messageContent },
  };
}

const validateTeaOrder = (teaType, teaSize) => {
  if (teaType && types.indexOf(teaType) === -1) {
    return buildValidationResult(false, 'tea', `We do not have ${teaType}, would you like a different type of tea?  Our most popular tea is honey lemon tea.`);
  }

  if (teaSize && sizes.indexOf(teaSize.toLowerCase()) === -1) {
    return buildValidationResult(false, 'teaSize', `We do not have ${teaSize}, would you like a different size of tea? Our most popular size is large.`);
  }

  return buildValidationResult(true, null, null);
}

const buildFulfillmentResult = (fulfillmentState, messageContent) =>{
  return {
    fulfillmentState,
    message: {contentType: 'PlainText', content: messageContent}
  }
}


module.exports = (intentRequest, callback) => {
  const teaType = intentRequest.currentIntent.slots.tea;
  const teaSize = intentRequest.currentIntent.slots.teaSize;

  console.log('currentIntentSlots', teaType + ' ' + teaSize );

  const source = intentRequest.invocationSource;

  if (source === 'DialogCodeHook') {
    const slots = intentRequest.currentIntent.slots;
    const validationResult = validateTeaOrder(teaType, teaSize);

    if (!validationResult.isValid) { 
      slots[`${validationResult.violatedSlot}`] = null; // set violatedSlot value to be null
      // ask for the violatedSlot input again
      console.log('Input NOT valid, elicit the violated slot again')
      callback(lexResponses.elicitSlot(intentRequest.sessionAttributes, intentRequest.currentIntent.name, slots, validationResult.violatedSlot, validationResult.message));
      return;
    }

    if (teaType !== null) intentRequest.sessionAttributes['Price'] = (teaType.length / 3).toFixed(2);

    callback(lexResponses.delegate(intentRequest.sessionAttributes, intentRequest.currentIntent.slots));
    return;
  }

  if (source === 'FulfillmentCodeHook') {
    console.log('FulfillmentCodeHook');

    const {fulfillmentState, message} = buildFulfillmentResult('Fulfilled', `Your order of a ${teaType} is placed. Your total will be $${intentRequest.sessionAttributes['Price']}. Thank you!`)

    callback(lexResponses.close(intentRequest.sessionAttributes, fulfillmentState, message));
  }
}