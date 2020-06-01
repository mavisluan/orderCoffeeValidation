'use strict'
const lexResponse = require('./lexResponse');
const types = ['latte', 'americano', 'cappuccino', 'espresso'];
const sizes = ['double', 'normal', 'large'];

function buildValidationResult(isValid, violatedSlot, messageContent, options) {
  if (messageContent == null) {
    return {
      isValid,
      violatedSlot,
      options
    };
  }
  return {
    isValid,
    violatedSlot,
    message: { contentType: 'PlainText', content: messageContent },
    options
  };
}

const validateCoffeeOrder = (coffeeType, coffeeSize) => {
    if (coffeeType && types.indexOf(coffeeType.toLowerCase()) === -1) {
        // const options = getOptions('Select a coffee', types);
        return buildValidationResult(false, 'coffee', `We do not have ${coffeeType}, would you like a different type of coffee?  Our most popular coffee is americano.`, options);
    }

    if (coffeeSize && sizes.indexOf(coffeeSize.toLowerCase()) === -1) {
        // const options = getOptions('Select a size', sizes);
        return buildValidationResult(false, 'size', `We do not have ${coffeeSize}, would you like a different size of coffee? Our most popular size is normal.`, options);
    }

    if (coffeeType && coffeeSize) {
        //Latte and cappuccino can be normal or large
        if ((coffeeType.toLowerCase() === 'cappuccino' || coffeeType.toLowerCase() === 'latte') && !(coffeeSize.toLowerCase() === 'normal' || coffeeSize.toLowerCase() === 'large')) {
        // const options = getOptions('Select a size', ['normal', 'large']);
        return buildValidationResult(false, 'size', `We do not have ${coffeeType} in that size. Normal or large are the available sizes for that drink.`, options);
        }

        //Expresso can be normal or double
        if (coffeeType.toLowerCase() === 'expresso' && !(coffeeSize.toLowerCase() === 'normal' || coffeeSize.toLowerCase() === 'double')) {
        // const options = getOptions('Select a size', ['normal', 'double']);
        return buildValidationResult(false, 'size', `We do not have ${coffeeType} in that size. Normal or double are the available sizes for that drink.`, options);
        }

        //Americano is always normal
        if (coffeeType.toLowerCase() === 'americano' && coffeeSize.toLowerCase() !== 'normal') {
        // const options = getOptions('Select a size', ['normal']);
        return buildValidationResult(false, 'size', `We do not have ${coffeeType} in that size. Normal is the available sizes for that drink.`, options);
        }
    }

    return buildValidationResult(true, null, null);
}

module.exports = (intentRequest, callback) => {
    const coffeeType = intentRequest.currentIntent.slots.coffee;
    const coffeeSize = intentRequest.currentIntent.slots.size;
    console.log(coffeeType + ' ' + coffeeSize);
    
    const source = intentRequest.invocationSource;
    if (source === 'DialogCodeHook') {
        const slots = intentRequest.currentIntent.slots;
        const validationResult = validateCoffeeOrder(coffeeType, coffeeSize);

        if (!validationResult.isValid) {
            slots[`${validationResult.voilatedSlot}`] = null;
            callback(lexResponse.elicitSlot(intentRequest.sessionAttribute, intentRequest.currentIntent.name, slots,  validationResult.violatedSlot))
        }

        callback(lexResponse.delegate(intentRequest.sessionAttribute, intentRequest.currentIntent.slots))
        return;
    }
}