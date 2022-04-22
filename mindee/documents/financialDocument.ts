// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'Document'.
const Document = require("./document");
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'Invoice'.
const Invoice = require("./invoice");
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'Receipt'.
const Receipt = require("./receipt");
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

class FinancialDocument extends Document {
  /**
   *  @param {Object} apiPrediction - Json parsed prediction from HTTP response
   *  @param {Input} input - Input object
   *  @param {Integer} pageNumber - Page number for multi pages pdf input
   *  @param {Object} locale - locale value for creating FinancialDocument object from scratch
   *  @param {Object} totalIncl - total tax included value for creating FinancialDocument object from scratch
   *  @param {Object} totalExcl - total tax excluded value for creating FinancialDocument object from scratch
   *  @param {Object} Date - date value for creating FinancialDocument object from scratch
   *  @param {Object} InvoiceNumber - Invoice number value for creating FinancialDocument object from scratch
   *  @param {Object} taxes - taxes value for creating FinancialDocument object from scratch
   *  @param {Object} supplier - supplier value for creating FinancialDocument object from scratch
   *  @param {Object} supplierAddress - supplier address value for creating FinancialDocument object from scratch
   *  @param {Object} paymentDetails - payment details value for creating FinancialDocument object from scratch
   *  @param {Object} companyNumber - company number value for creating FinancialDocument object from scratch
   *  @param {Object} vatNumber - vat number value for creating FinancialDocument object from scratch
   *  @param {Object} orientation - orientation value for creating FinancialDocument object from scratch
   *  @param {Object} totalTax - total tax value for creating FinancialDocument object from scratch
   *  @param {Object} time - time value for creating FinancialDocument object from scratch
   *  @param {Object} customerName - customer name value for creating FinancialDocument object from scratch
   *  @param {Object} customerAddress - customer address value for creating FinancialDocument object from scratch
   *  @param {Object} customerCompanyRegistration - customer company registration value for creating FinancialDocument object from scratch
   *  @param {Object} pageNumber - pageNumber for multi pages pdf input
   *  @param {String} level - specify whether object is built from "page" level or "document" level prediction
   */
  constructor({
    apiPrediction = undefined,
    inputFile = undefined,
    locale = undefined,
    totalIncl = undefined,
    totalExcl = undefined,
    date = undefined,
    invoiceNumber = undefined,
    dueDate = undefined,
    taxes = undefined,
    supplier = undefined,
    supplierAddress = undefined,
    paymentDetails = undefined,
    companyNumber = undefined,
    vatNumber = undefined,
    orientation = undefined,
    totalTax = undefined,
    time = undefined,
    customerName = undefined,
    customerAddress = undefined,
    customerCompanyRegistration = undefined,
    words = undefined,
    pageNumber = 0,
    level = "page",
  }) {
    super(inputFile);
    this.level = level;
    if (apiPrediction === undefined) {
      this.#initFromScratch({
        locale,
        totalIncl,
        totalExcl,
        date,
        invoiceNumber,
        dueDate,
        taxes,
        supplier,
        supplierAddress,
        paymentDetails,
        companyNumber,
        vatNumber,
        orientation,
        pageNumber,
        totalTax,
        time,
        customerName,
        customerAddress,
        customerCompanyRegistration,
      });
    } else {
      this.#initFromApiPrediction(apiPrediction, inputFile, pageNumber, words);
    }
    this.#checklist();
  }

  // @ts-expect-error ts-migrate(18022) FIXME: A method cannot be named with a private identifier... Remove this comment to see the full error message
  #initFromScratch({
    locale,
    totalIncl,
    totalExcl,
    totalTax,
    date,
    invoiceNumber,
    dueDate,
    taxes,
    paymentDetails,
    companyNumber,
    vatNumber,
    orientation,
    pageNumber,
    supplier,
    supplierAddress,
    time,
    customerName,
    customerAddress,
    customerCompanyRegistration,
  }: any) {
    const constructPrediction = function (item: any) {
      return { prediction: { value: item }, valueKey: "value", pageNumber };
    };
    this.locale = new Locale(constructPrediction(locale));
    this.totalIncl = new Amount(constructPrediction(totalIncl));
    this.totalExcl = new Amount(constructPrediction(totalExcl));
    this.totalTax = new Amount(constructPrediction(totalTax));
    // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
    this.date = new Date(constructPrediction(date));
    // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
    this.dueDate = new Date(constructPrediction(dueDate));
    this.supplier = new Field(constructPrediction(supplier));
    this.supplierAddress = new Field(this.constructPrediction(supplierAddress));
    this.time = new Field(constructPrediction(time));
    this.orientation = new Orientation(constructPrediction(orientation));
    this.invoiceNumber = new Field(constructPrediction(invoiceNumber));
    this.paymentDetails = new Field(constructPrediction(paymentDetails));
    this.companyNumber = new Field(constructPrediction(companyNumber));
    this.vatNumber = new Field(constructPrediction(vatNumber));
    this.customerName = new Field(this.constructPrediction(customerName));
    this.customerAddress = new Field(this.constructPrediction(customerAddress));
    this.customerCompanyRegistration = new Field(
      this.constructPrediction(customerCompanyRegistration)
    );
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
  }

  // @ts-expect-error ts-migrate(18022) FIXME: A method cannot be named with a private identifier... Remove this comment to see the full error message
  #initFromApiPrediction(
    apiPrediction: any,
    inputFile: any,
    pageNumber: any,
    words: any
  ) {
    if (Object.keys(apiPrediction).includes("invoice_number")) {
      const invoice = new Invoice({
        apiPrediction,
        inputFile,
        pageNumber,
        level: this.level,
        words: words,
      });
      this.locale = invoice.locale;
      this.totalIncl = invoice.totalIncl;
      this.totalExcl = invoice.totalExcl;
      this.date = invoice.invoiceDate;
      this.invoiceNumber = invoice.invoiceNumber;
      this.dueDate = invoice.dueDate;
      this.taxes = invoice.taxes;
      this.supplier = invoice.supplier;
      this.supplierAddress = invoice.supplierAddress;
      this.paymentDetails = invoice.paymentDetails;
      this.companyNumber = invoice.companyNumber;
      this.orientation = invoice.orientation;
      this.totalTax = invoice.totalTax;
      if (invoice.words) this.words = invoice.words;
      this.time = new Field({
        prediction: { value: undefined, confidence: 0.0 },
      });
      this.customerName = invoice.customerName;
      this.customerAddress = invoice.customerAddress;
      this.customerCompanyRegistration = invoice.customerCompanyRegistration;
    } else {
      const receipt = new Receipt({
        apiPrediction,
        inputFile,
        pageNumber,
        level: this.level,
        words: words,
      });
      this.orientation = receipt.orientation;
      this.date = receipt.date;
      this.dueDate = receipt.date;
      this.taxes = receipt.taxes;
      this.locale = receipt.locale;
      this.totalIncl = receipt.totalIncl;
      this.totalExcl = receipt.totalExcl;
      this.supplier = receipt.merchantName;
      this.supplierAddress = new Field({
        prediction: { value: undefined, confidence: 0.0 },
      });
      this.time = receipt.time;
      this.totalTax = receipt.totalTax;
      this.invoiceNumber = new Field({
        prediction: { value: undefined, confidence: 0.0 },
      });
      this.paymentDetails = new Field({
        prediction: { value: undefined, confidence: 0.0 },
      });
      this.companyNumber = new Field({
        prediction: { value: undefined, confidence: 0.0 },
      });
      this.customerName = new Field({
        prediction: { value: undefined, confidence: 0.0 },
      });
      this.customerAddress = new Field({
        prediction: { value: undefined, confidence: 0.0 },
      });
      this.customerCompanyRegistration = [];
      if (receipt.words) this.words = receipt.words;
    }
  }

  toString() {
    return `
    -----Financial document-----
    Filename: ${this.filename}
    Total amount: ${this.totalIncl.value}
    Date: ${this.date.value}
    Supplier: ${this.supplier.value}
    Total taxes: ${this.totalTax.value}
    `;
  }

  // @ts-expect-error ts-migrate(18022) FIXME: A method cannot be named with a private identifier... Remove this comment to see the full error message
  #checklist() {
    this.checklist = {
      taxesMatchTotalIncl: this.#taxesMatchTotalIncl(),
    };
  }

  // @ts-expect-error ts-migrate(18022) FIXME: A method cannot be named with a private identifier... Remove this comment to see the full error message
  #taxesMatchTotalIncl() {
    // Check taxes and total include exist
    if (this.taxes.length === 0 || this.totalIncl.value === undefined)
      return false;

    // Reconstruct totalIncl from taxes
    let totalVat = 0;
    let reconstructedTotal = 0;
    this.taxes.forEach((tax: any) => {
      if (tax.value === undefined || !tax.rate) return false;
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
        confidence: 1.0,
      }));
      this.totalTax.probability = 1.0;
      this.totalIncl.probability = 1.0;
      return true;
    }
    return false;
  }
}

module.exports = FinancialDocument;
