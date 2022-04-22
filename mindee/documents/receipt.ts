// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'Document'.
const Document = require("./document");
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'Field'.
const Field = require("./fields").field;
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'Date'.
const Date = require("./fields").date;
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'Amount'.
const Amount = require("./fields").amount;
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'Locale'.
const Locale = require("./fields").locale;
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'Orientatio... Remove this comment to see the full error message
const Orientation = require("./fields").orientation;
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'Tax'.
const Tax = require("./fields").tax;
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'fs'.
const fs = require("fs").promises;

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'Receipt'.
class Receipt extends Document {
  /**
   *  @param {Object} apiPrediction - Json parsed prediction from HTTP response
   *  @param {Input} input - Input object
   *  @param {Integer} pageNumber - Page number for multi pages pdf input
   *  @param {Object} locale - locale value for creating Receipt object from scratch
   *  @param {Object} totalIncl - total tax Included value for creating Receipt object from scratch
   *  @param {Object} date - date value for creating Receipt object from scratch
   *  @param {Object} category - category value for creating Receipt object from scratch
   *  @param {Object} merchantName - merchant name value for creating Receipt object from scratch
   *  @param {Object} time - time value for creating Receipt object from scratch
   *  @param {Object} taxes - taxes value for creating Receipt object from scratch
   *  @param {Object} orientation - orientation value for creating Receipt object from scratch
   *  @param {Object} totalTax - total taxes value for creating Receipt object from scratch
   *  @param {Object} totalExcl - total taxes excluded value for creating Receipt object from scratch
   *  @param {String} level - specify whether object is built from "page" level or "document" level prediction
   */
  constructor({
    apiPrediction = undefined,
    inputFile = undefined,
    locale = undefined,
    totalIncl = undefined,
    date = undefined,
    category = undefined,
    merchantName = undefined,
    time = undefined,
    taxes = undefined,
    orientation = undefined,
    totalTax = undefined,
    totalExcl = undefined,
    words = undefined,
    pageNumber = 0,
    level = "page",
  }) {
    super(inputFile);
    this.level = level;
    this.constructPrediction = function (item: any) {
      return { prediction: { value: item }, valueKey: "value", pageNumber };
    };
    if (apiPrediction === undefined) {
      this.#initFromScratch({
        locale,
        totalExcl,
        totalIncl,
        date,
        category,
        merchantName,
        time,
        taxes,
        orientation,
        totalTax,
        pageNumber,
      });
    } else {
      this.#initFromApiPrediction(apiPrediction, pageNumber, words);
    }
    this.#checklist();
    this.#reconstruct();
  }

  // @ts-expect-error ts-migrate(18022) FIXME: A method cannot be named with a private identifier... Remove this comment to see the full error message
  #initFromScratch({
    locale,
    totalExcl,
    totalIncl,
    date,
    category,
    merchantName,
    time,
    taxes,
    orientation,
    totalTax,
    pageNumber,
  }: any) {
    this.locale = new Locale(this.constructPrediction(locale));
    this.totalIncl = new Amount(this.constructPrediction(totalIncl));
    this.date = new Date(this.constructPrediction(date));
    this.category = new Field(this.constructPrediction(category));
    this.merchantName = new Field(this.constructPrediction(merchantName));
    this.time = new Field(this.constructPrediction(time));
    if (taxes !== undefined) {
      this.taxes = [];
      for (const t of taxes) {
        this.taxes.push(
          new Tax({
            prediction: { value: t[0], rate: t[1] },
            pageNumber,
            valueKey: "value",
            rateKey: "rate",
          })
        );
      }
    }
    this.orientation = new Orientation(this.constructPrediction(orientation));
    this.totalTax = new Amount(this.constructPrediction(totalTax));
    this.totalExcl = new Amount(this.constructPrediction(totalExcl));
  }

  /**
    Set the object attributes with api prediction values
    @param apiPrediction: Raw prediction from HTTP response
    @param pageNumber: Page number for multi pages pdf input
   */
  // @ts-expect-error ts-migrate(18022) FIXME: A method cannot be named with a private identifier... Remove this comment to see the full error message
  #initFromApiPrediction(apiPrediction: any, pageNumber: any, words: any) {
    this.locale = new Locale({ prediction: apiPrediction.locale, pageNumber });
    this.totalIncl = new Amount({
      prediction: apiPrediction.total_incl,
      valueKey: "value",
      pageNumber,
    });
    // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
    this.date = new Date({
      prediction: apiPrediction.date,
      valueKey: "value",
      pageNumber,
    });
    this.category = new Field({
      prediction: apiPrediction.category,
      pageNumber,
    });
    this.merchantName = new Field({
      prediction: apiPrediction.supplier,
      valueKey: "value",
      pageNumber,
    });
    this.time = new Field({
      prediction: apiPrediction.time,
      valueKey: "value",
      pageNumber,
    });
    this.taxes = apiPrediction.taxes.map(
      (taxPrediction: any) =>
        new Tax({
          prediction: taxPrediction,
          pageNumber,
          valueKey: "value",
          rateKey: "rate",
          codeKey: "code",
        })
    );
    this.totalTax = new Amount({
      prediction: { value: undefined, confidence: 0 },
      valueKey: "value",
      pageNumber,
    });
    this.totalExcl = new Amount({
      prediction: { value: undefined, confidence: 0 },
      valueKey: "value",
      pageNumber,
    });
    if (this.level === "page") {
      this.orientation = new Orientation({
        prediction: apiPrediction.orientation,
        pageNumber,
      });
    } else {
      this.orientation = new Orientation(
        this.constructPrediction({
          prediction: {
            value: undefined,
            confidence: 0.0,
            degrees: undefined,
          },
        })
      );
    }
    if (words && words.length > 0) this.words = words;
  }

  toString() {
    return `
    -----Receipt data-----
    Filename: ${this.filename}
    Total amount: ${this.totalIncl.value}
    Date: ${this.date.value}
    Category: ${this.category.value}
    Time: ${this.time.value}
    Merchant name: ${this.merchantName.value}
    Taxes: ${this.taxes.map((tax: any) => tax.toString()).join(" - ")}
    Total taxes: ${this.totalTax.value}
    `;
  }

  static async load(path: any) {
    const file = fs.readFile(path);
    const args = JSON.parse(file);
    return new Receipt({ reconsctruted: true, ...args });
  }

  /**
   * Call all check methods
   */
  // @ts-expect-error ts-migrate(18022) FIXME: A method cannot be named with a private identifier... Remove this comment to see the full error message
  #checklist() {
    this.checklist = { taxesMatchTotalIncl: this.#taxesMatchTotal() };
  }

  // @ts-expect-error ts-migrate(18022) FIXME: A method cannot be named with a private identifier... Remove this comment to see the full error message
  #taxesMatchTotal() {
    // Check taxes and total amount exist

    if (this.taxes.length === 0 || this.totalIncl.value == null) return false;

    // Reconstruct total_incl from taxes
    let totalVat = 0;
    let reconstructedTotal = 0;
    this.taxes.forEach((tax: any) => {
      if (tax.value == null || !tax.rate) return false;
      totalVat += tax.value;
      reconstructedTotal += tax.value + (100 * tax.value) / tax.rate;
    });

    // Sanity check
    if (totalVat <= 0) return false;

    // Crate epsilon
    const eps = 1 / (100 * totalVat);

    if (
      this.totalIncl.value * (1 - eps) - 0.02 <= reconstructedTotal &&
      reconstructedTotal <= this.totalIncl.value * (1 + eps) + 0.02
    ) {
      this.taxes = this.taxes.map((tax: any) => ({
        ...tax,
        probability: 1.0,
      }));
      this.totalTax.probability = 1.0;
      this.totalIncl.probability = 1.0;
      return true;
    }
    return false;
  }

  /**
   * Call all fields that need to be reconstructed
   */
  // @ts-expect-error ts-migrate(18022) FIXME: A method cannot be named with a private identifier... Remove this comment to see the full error message
  #reconstruct() {
    this.#reconstructTotalExclFromTCCAndTaxes();
    this.#reconstructTotalTax();
  }

  /**
   * Set this.totalExcl with Amount object
   * The totalExcl Amount value is the difference between totalIncl and sum of taxes
   * The totalExcl Amount probability is the product of this.taxes probabilities multiplied by totalIncl probability
   */
  // @ts-expect-error ts-migrate(18022) FIXME: A method cannot be named with a private identifier... Remove this comment to see the full error message
  #reconstructTotalExclFromTCCAndTaxes() {
    if (this.taxes.length && this.totalIncl.value != null) {
      const totalExcl = {
        value: this.totalIncl.value - Field.arraySum(this.taxes),
        confidence:
          Field.arrayProbability(this.taxes) * this.totalIncl.probability,
      };
      this.totalExcl = new Amount({
        prediction: totalExcl,
        valueKey: "value",
        reconstructed: true,
      });
    }
  }

  /**
   * Set this.totalTax with Amount object
   * The totalTax Amount value is the sum of all this.taxes value
   * The totalTax Amount probability is the product of this.taxes probabilities
   */
  // @ts-expect-error ts-migrate(18022) FIXME: A method cannot be named with a private identifier... Remove this comment to see the full error message
  #reconstructTotalTax() {
    if (this.taxes.length && this.totalTax.value == null) {
      const totalTax = {
        value: this.taxes
          .map((tax: any) => tax.value || 0)
          .reduce((a: any, b: any) => a + b, 0),
        confidence: Field.arrayProbability(this.taxes),
      };
      if (totalTax.value > 0)
        this.totalTax = new Amount({
          prediction: totalTax,
          valueKey: "value",
          reconstructed: true,
        });
    }
  }
}

module.exports = Receipt;