'use strict';
const lexResponses = require('./lexResponses');
const { getProductInfo, saveOrderToDB} = require('./dbClient');
const { buildValidationResult, buildFulfillmentResult } = require('./buildHelper');

const validateCoffeeOrder = (coffeeType, coffeeSize, types, sizes) => {
  if (coffeeType && types.indexOf(coffeeType.toLowerCase()) === -1) {
    return buildValidationResult(false, 'coffee', `We do not have ${coffeeType}, would you like a different type of coffee?  Our most popular coffee is americano.`);
  }

  if (coffeeSize && sizes.indexOf(coffeeSize.toLowerCase()) === -1) {
    return buildValidationResult(false, 'size', `We do not have ${coffeeSize}, would you like a different size of coffee? Our most popular size is normal.`);
  }

  if (coffeeType && coffeeSize) {
    //Latte and cappuccino can be normal or large
    if ((coffeeType.toLowerCase() === 'cappuccino' || coffeeType.toLowerCase() === 'latte')
        && !(coffeeSize.toLowerCase() === 'normal' || coffeeSize.toLowerCase() === 'large')) {
      return buildValidationResult(false, 'size', `We do not have ${coffeeType} in that size. Normal or large are the available sizes for that drink.`);
    }

    //espresso can be normal or double
    if ((coffeeType.toLowerCase() === 'espresso')
        && !(coffeeSize.toLowerCase() === 'normal' || coffeeSize.toLowerCase() === 'double')) {
      return buildValidationResult(false, 'size', `We do not have ${coffeeType} in that size. Normal or double are the available sizes for that drink.`);
    }

    //Americano is always normal
    if ((coffeeType.toLowerCase() === 'americano') && (coffeeSize.toLowerCase() !== 'normal')) {
      return buildValidationResult(false, 'size', `We do not have ${coffeeType} in that size. Normal is the available sizes for that drink.`);
    }
  }

  return buildValidationResult(true, null, null);
}

module.exports = async (intentRequest, callback) => {
  console.log('sessionAttributes', intentRequest.sessionAttributes)
  const coffeeType = intentRequest.currentIntent.slots.coffee;
  const coffeeSize = intentRequest.currentIntent.slots.size;
  console.log('currentIntentSlots', coffeeType + ' ' + coffeeSize);
  
  const types = await getProductInfo('coffeeTypes', 'coffeeTypes');
  const sizes = await getProductInfo('coffeeSizes', 'coffeeSizes');

  const source = intentRequest.invocationSource;

  if (source === 'DialogCodeHook') {
    const slots = intentRequest.currentIntent.slots;
    const validationResult = validateCoffeeOrder(coffeeType, coffeeSize, types, sizes);

    if (!validationResult.isValid) { 
      slots[`${validationResult.violatedSlot}`] = null; // set violatedSlot value to be null
      // ask for the violatedSlot input again
      console.log('Input NOT valid, elicit the violated slot again')
      callback(lexResponses.elicitSlot(intentRequest.sessionAttributes, intentRequest.currentIntent.name, slots, validationResult.violatedSlot, validationResult.message));
      return;
    }

    const price = (coffeeType && coffeeSize) ? await getProductInfo(coffeeType, coffeeSize): undefined;
    if (coffeeType !== null && price !== undefined) intentRequest.sessionAttributes['Price'] = price.toFixed(2);

    callback(lexResponses.delegate(intentRequest.sessionAttributes, intentRequest.currentIntent.slots));
    return;
  }

  if (source === 'FulfillmentCodeHook') {
    console.log('FulfillmentCodeHook');

    const cost = intentRequest.sessionAttributes['Price'];
    await saveOrderToDB({type: coffeeType, size: coffeeSize, price: cost, userId: intentRequest.userId});

    const {fulfillmentState, message} = buildFulfillmentResult('Fulfilled', `Your order of a ${coffeeSize} ${coffeeType} is placed. Your total will be $${cost}. You can continue with your request or type 'close' to close the chat.`);

    callback(lexResponses.close(intentRequest.sessionAttributes, fulfillmentState, message));
  }
}
