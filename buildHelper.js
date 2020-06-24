'use strict';

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


const buildFulfillmentResult = (fulfillmentState, messageContent) =>{
    return {
        fulfillmentState,
        message: {contentType: 'PlainText', content: messageContent}
    }
}

module.exports = {buildValidationResult, buildFulfillmentResult}