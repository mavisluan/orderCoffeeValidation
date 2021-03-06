'use strict';
const dispatch = require('./dispatch');

module.exports.intents = (event, context, callback) => {
  console.log('event', event)

  try {
    console.log(`event.bot.name=${event.bot.name}`);
    if (!event.sessionAttributes) event.sessionAttributes = {}
    dispatch(event, (response) => callback(null, response))
  } catch (err) {
    callback(err)
  }
};
