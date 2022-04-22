import { errorHandler } from "./errors/handler";
import { logger } from "./logger";
// @ts-expect-error ts-migrate(2459) FIXME: Module '"./api/receipt"' declares 'APIReceipt' loc... Remove this comment to see the full error message
import { APIReceipt } from "./api/receipt";
// @ts-expect-error ts-migrate(2459) FIXME: Module '"./api/invoice"' declares 'APIInvoice' loc... Remove this comment to see the full error message
import { APIInvoice } from "./api/invoice";
// @ts-expect-error ts-migrate(2459) FIXME: Module '"./api/financialDocument"' declares 'APIFi... Remove this comment to see the full error message
import { APIFinancialDocument } from "./api/financialDocument";

interface constructorObject {
  receiptToken: string;
  invoiceToken: string;
  throwOnError: boolean;
  debug: boolean;
}

class Client {
  /**
   * @param {string} receiptToken - Receipt Expense Token from Mindee dashboard
   * @param {string} invoiceToken - Invoice Token from Mindee dashboard
   * @param {boolean} throwOnError - Throw if an error is send from the API / SDK (true by default)
   * @param {boolean} debug - Enable debug logging (disable by default)
   */
  private readonly receiptToken: string | undefined;
  private readonly invoiceToken: string | undefined;
  private readonly receipt: any;
  private readonly invoice: any;
  private readonly financialDocument: any;

  constructor({
    receiptToken,
    invoiceToken,
    throwOnError = true,
    debug,
  }: constructorObject) {
    this.receiptToken = receiptToken || process.env.MINDEE_RECEIPT_TOKEN;
    this.invoiceToken = invoiceToken || process.env.MINDEE_INVOICE_TOKEN;
    errorHandler.throwOnError = throwOnError;
    logger.level = debug ?? process.env.MINDEE_DEBUG ? "debug" : "warn";
    this.receipt = new APIReceipt(this.receiptToken);
    this.invoice = new APIInvoice(this.invoiceToken);
    this.financialDocument = new APIFinancialDocument(
      this.invoiceToken,
      this.receiptToken
    );
  }
}

exports.Client = Client;
exports.documents = require("./documents");
exports.api = require("./api");
exports.inputs = require("./inputs");
