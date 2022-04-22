// const APIObject = require("./object");
// @ts-expect-error ts-migrate(2459) FIXME: Module '"./object"' declares 'APIObject' locally, ... Remove this comment to see the full error message
import { APIObject } from "./object";
// const Input = require("../inputs");
// @ts-expect-error ts-migrate(2459) FIXME: Module '"../inputs"' declares 'Input' locally, but... Remove this comment to see the full error message
import { Input } from "../inputs";

interface FinancialDocumentParse {
  input: string;
  inputType: string;
  filename: string | undefined;
  version: string;
  cutPdf: boolean;
  includeWords: boolean;
}

class APIFinancialDocument extends APIObject {
  apiToken: string | undefined;

  constructor(public invoiceToken: string, public receiptToken: string) {
    super(undefined, "financialDocument");
    this.invoiceToken = invoiceToken;
    this.receiptToken = receiptToken;
  }

  /**
   * @param {String} file: Receipt filepath (allowed jpg, png, tiff, pdf)
   * @param {String} inputType: String in {'path', 'stream', 'base64'}
   * @param {Boolean} includeWords: extract all words into http_response
   * @param {String} version: expense_receipt api version
   * @param {Boolean} cutPdf: Automatically reconstruct pdf with more than 4 pages
   * @returns {Response} Wrapped response with Receipts objects parsed
   */
  async parse({
    input,
    inputType = "path",
    filename = undefined,
    version = "3",
    cutPdf = true,
    includeWords = false,
  }: FinancialDocumentParse) {
    const inputFile = new Input({
      file: input,
      inputType: inputType,
      filename: filename,
      allowCutPdf: cutPdf,
    });
    await inputFile.init();
    this.apiToken =
      inputFile.fileExtension === "application/pdf"
        ? this.invoiceToken
        : this.receiptToken;
    const url =
      inputFile.fileExtension === "application/pdf"
        ? `/invoices/v${version}/predict`
        : `/expense_receipts/v${version}/predict`;
    super.parse();
    return super._request(url, inputFile, includeWords);
  }
}

module.exports = APIFinancialDocument;
