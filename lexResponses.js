'use strict';

module.exports.delegate = (sessionAttributes, slots) => {
    console.log('delegate-- slots', slots)
    return {
        sessionAttributes,
        dialogAction: {
            type: 'Delegate',
            slots,
        },
    };
}

module.exports.elicitSlot = (sessionAttributes, intentName, slots, slotToElicit, message) => {
    console.log('elicitSlot-- slots', slots)

    return {
        sessionAttributes,
        dialogAction: {
            type: 'ElicitSlot',
            intentName,
            slots,
            slotToElicit,
            message,
        },
    };
}

module.exports.close = (sessionAttributes, fulfillmentState, message) => {
    console.log('close-fulfillmentState', fulfillmentState)

    return {
        sessionAttributes,
        dialogAction: {
            type: 'Close',
            fulfillmentState,
            message,
        },
    }
}