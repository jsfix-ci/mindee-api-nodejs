// const APIObject = require("./object");
// @ts-expect-error ts-migrate(2459) FIXME: Module '"./object"' declares 'APIObject' locally, ... Remove this comment to see the full error message
import { APIObject } from "./object";
// const Input = require("../inputs");
// @ts-expect-error ts-migrate(2459) FIXME: Module '"../inputs"' declares 'Input' locally, but... Remove this comment to see the full error message
import { Input } from "../inputs";

interface ReceiptParse {
  input: string;
  inputType: string;
  filename: string | undefined;
  version: string;
  cutPdf: boolean;
  includeWords: boolean;
}

class APIReceipt extends APIObject {
  baseUrl: string;

  constructor(public apiToken: string | undefined = undefined) {
    super(apiToken, "receipt");
    // @ts-expect-error ts-migrate(2565) FIXME: Property 'baseUrl' is used before being assigned.
    this.baseUrl = `${this.baseUrl}/expense_receipts/`;
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
  }: ReceiptParse) {
    super.parse();
    const inputFile = new Input({
      file: input,
      inputType: inputType,
      filename: filename,
      allowCutPdf: cutPdf,
    });
    await inputFile.init();
    const url = `v${version}/predict`;
    return await super._request(url, inputFile, includeWords);
  }
}

module.exports = APIReceipt;
