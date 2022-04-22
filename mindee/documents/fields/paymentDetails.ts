// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'Field'.
const Field = require("./field");

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'PaymentDet... Remove this comment to see the full error message
class PaymentDetails extends Field {
  /**
   * @param {Object} prediction - Prediction object from HTTP response
   * @param {String} valueKey - Key to use in the prediction dict to get the iban
   * @param {String} accountNumberKey - Key to use to get the account number in the prediction dict
   * @param {String} ibanKey - Key to use to get the IBAN in the prediction dict
   * @param {String} routingNumberKey - Key to use to get the routing number in the prediction dict
   * @param {String} swiftKey - Key to use to get the SWIFT in the prediction dict
   * @param {Boolean} reconstructed - Does the object is reconstructed (not extracted by the API)
   * @param {Integer} pageNumber - Page number for multi pages pdf
   */
  constructor({
    prediction,
    valueKey = "iban",
    accountNumberKey = "account_number",
    ibanKey = "iban",
    routingNumberKey = "routing_number",
    swiftKey = "swift",
    reconstructed = false,
    pageNumber = 0,
  }: any) {
    super({ prediction, valueKey, reconstructed, pageNumber });

    this.accountNumber = undefined;
    this.iban = undefined;
    this.routingNumber = undefined;
    this.swift = undefined;

    this.#setKey(prediction[accountNumberKey], "accountNumber");
    this.#setKey(prediction[ibanKey], "iban");
    this.#setKey(prediction[routingNumberKey], "routingNumber");
    this.#setKey(prediction[swiftKey], "swift");
  }

  // @ts-expect-error ts-migrate(18022) FIXME: A method cannot be named with a private identifier... Remove this comment to see the full error message
  #setKey(value: any, key: any) {
    if (typeof value === "string" && value !== "N/A") this[key] = value;
    else this[key] = undefined;
  }

  toString() {
    let str = "";
    const keys = ["accountNumber", "iban", "routingNumber", "swift"];
    for (const key of keys) {
      if (this[key]) str += `${this[key]}; `;
    }
    return str;
  }
}

module.exports = PaymentDetails;
