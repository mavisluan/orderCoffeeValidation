'use strict'

module.exports.delegate = (sessionAttributes, slots) => {
    return {
        sessionAttributes,
        dialogAction: {
            type: 'Delegate',
            slots,
        }
    }
}