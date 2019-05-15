const twilio = require('twilio');
const config = require('./config');

class Twilio {
  constructor() {
    this.accountSid = process.env.TWILLIO_ACCOUNT_SID;
    this.authToken = process.env.TWILLIO_AUTH_TOKEN;
  }

  get client() {
    return new twilio(this.accountSid, this.authToken)
  }

  sendMessage(message) {
    return this.client.messages.create({
      body: message,
      to: config.targetPhoneNumber,  // Text this number
      from: process.env.TWILLIO_PHONE_NUMBER // From a valid Twilio number
    })
      .then(() => console.log('SMS has been sent successfully'))
      .catch((error) => {
        console.log('Can not send the SMS:');
        console.log(error);
      })
  }
}

module.exports = Twilio;