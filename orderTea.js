'use strict';

const lexResponses = require('./lexResponses');
const { getProductInfo} = require('./dbClient');
const {buildValidationResult, buildFulfillmentResult} = require('./buildHelper');
getProductInfo('teaTypes', 'teaTypes')
const validateTeaOrder = (teaType, teaSize, types, sizes) => {
  if (teaType && types.indexOf(teaType) === -1) {
    return buildValidationResult(false, 'tea', `We do not have ${teaType}, would you like a different type of tea?  Our most popular tea is honey lemon tea.`);
  }

  if (teaSize && sizes.indexOf(teaSize.toLowerCase()) === -1) {
    return buildValidationResult(false, 'teaSize', `We do not have ${teaSize}, would you like a different size of tea? Our most popular size is large.`);
  }

  return buildValidationResult(true, null, null);
}

module.exports = async (intentRequest, callback) => {
  const teaType = intentRequest.currentIntent.slots.tea;
  const teaSize = intentRequest.currentIntent.slots.teaSize;

  console.log('currentIntentSlots', teaType + ' ' + teaSize );

  const types = await getProductInfo('teaTypes', 'teaTypes');
  const sizes = await getProductInfo('teaSizes', 'teaSizes');
  const source = intentRequest.invocationSource;

  if (source === 'DialogCodeHook') {
    const slots = intentRequest.currentIntent.slots;
    const validationResult = validateTeaOrder(teaType, teaSize, types, sizes);

    if (!validationResult.isValid) { 
      slots[`${validationResult.violatedSlot}`] = null; // set violatedSlot value to be null
      // ask for the violatedSlot input again
      console.log('Input NOT valid, elicit the violated slot again')
      callback(lexResponses.elicitSlot(intentRequest.sessionAttributes, intentRequest.currentIntent.name, slots, validationResult.violatedSlot, validationResult.message));
      return;
    }

    const price = (teaType && teaSize) ? await getProductInfo(teaType, teaSize): undefined;
    if (teaType !== null && price !== undefined) intentRequest.sessionAttributes['Price'] = price.toFixed(2);

    callback(lexResponses.delegate(intentRequest.sessionAttributes, intentRequest.currentIntent.slots));
    return;
  }

  if (source === 'FulfillmentCodeHook') {
    console.log('FulfillmentCodeHook');

    const {fulfillmentState, message} = buildFulfillmentResult('Fulfilled', `Your order of a ${teaType} is placed. Your total will be $${intentRequest.sessionAttributes['Price']}. You can continue with your request or type 'close' to close the chat.`)

    callback(lexResponses.close(intentRequest.sessionAttributes, fulfillmentState, message));
  }
}