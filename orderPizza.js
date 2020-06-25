'use strict';

const lexResponses = require('./lexResponses');
const { getProductInfo, saveOrderToDB } = require('./dbClient');
const { buildValidationResult, buildFulfillmentResult } = require('./buildHelper');

const validatePizzaOrder = (pizzaType, pizzaSize, pizzaCrust, types, sizes, crusts) => {
  if (pizzaType && types.indexOf(pizzaType) === -1) {
    return buildValidationResult(false, 'pizza', `We do not have ${pizzaType}, would you like a different type of pizza?  Our most popular pizza is pepperoni.`);
  }

  if (pizzaCrust && crusts.indexOf(pizzaCrust.toLowerCase()) === -1) {
    return buildValidationResult(false, 'pizzaCrust', `We do not have ${pizzaCrust}, would you like a different crust of pizza? Our most popular crust is thick.`);
  }


  if (pizzaSize && sizes.indexOf(pizzaSize.toLowerCase()) === -1) {
    return buildValidationResult(false, 'pizzaSize', `We do not have ${pizzaSize}, would you like a different size of pizza? Our most popular size is medium.`);
  }

  return buildValidationResult(true, null, null);
}

module.exports = async (intentRequest, callback) => {
  const pizzaType = intentRequest.currentIntent.slots.pizza;
  const pizzaCrust = intentRequest.currentIntent.slots.crust;
  const pizzaSize = intentRequest.currentIntent.slots.pizzaSize;

  const types = await getProductInfo('pizzaTypes', 'pizzaTypes');
  const sizes = await getProductInfo('pizzaSizes', 'pizzaSizes');
  const crusts = await getProductInfo('pizzaCrusts', 'pizzaCrusts');
  
  console.log('currentIntentSlots', pizzaType + ' ' + pizzaCrust + ' ' + pizzaSize );

  const source = intentRequest.invocationSource;

  if (source === 'DialogCodeHook') {
    const slots = intentRequest.currentIntent.slots;
    const validationResult = validatePizzaOrder(pizzaType, pizzaSize, pizzaCrust, types, sizes, crusts);

    if (!validationResult.isValid) { 
      slots[`${validationResult.violatedSlot}`] = null; // set violatedSlot value to be null
      // ask for the violatedSlot input again
      console.log('Input NOT valid, elicit the violated slot again')
      callback(lexResponses.elicitSlot(intentRequest.sessionAttributes, intentRequest.currentIntent.name, slots, validationResult.violatedSlot, validationResult.message));
      return;
    }

    if (pizzaType !== null && pizzaSize !== null) {
      if (pizzaSize === 'small') intentRequest.sessionAttributes['Price'] = (pizzaType.length * 1.5).toFixed(2);
      if (pizzaSize === 'medium') intentRequest.sessionAttributes['Price'] = (pizzaType.length * 2).toFixed(2);
      else intentRequest.sessionAttributes['Price'] = (pizzaType.length * 3).toFixed(2);
    } 

    callback(lexResponses.delegate(intentRequest.sessionAttributes, intentRequest.currentIntent.slots));
    return;
  }

  if (source === 'FulfillmentCodeHook') {
    console.log('FulfillmentCodeHook');

    const cost = intentRequest.sessionAttributes['Price'];
    await saveOrderToDB({type: pizzaType, size: pizzaSize, crust: pizzaCrust, price: cost, userId: intentRequest.userId});

    const {fulfillmentState, message} = buildFulfillmentResult('Fulfilled', `Your order of a ${pizzaSize} ${pizzaCrust} ${pizzaType} is placed. Your total will be $${cost}. You can continue with your request or type 'close' to close the chat.`)

    callback(lexResponses.close(intentRequest.sessionAttributes, fulfillmentState, message));
  }
}