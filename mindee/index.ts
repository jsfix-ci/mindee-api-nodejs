import "module-alias/register";

import { errorHandler } from "@errors/handler";
import { logger } from "@mindee/logger";

import { APIReceipt } from "@api/receipt";
import { APIInvoice } from "@api/invoice";

import { APIFinancialDocument } from "@mindee/api/financialDocument";
import { Input } from "@mindee/inputs";
import {
  CustomDocConfig,
  FinancialDocConfig,
  InvoiceConfig,
  PassportConfig,
  ReceiptConfig,
} from "@documents/document_config";

// interface constructorObject {
//   receiptToken: string;
//   invoiceToken: string;
//   throwOnError: boolean;
//   debug: boolean;
// }

// class Client {
//   /**
//    * @param {string} receiptToken - Receipt Expense Token from Mindee dashboard
//    * @param {string} invoiceToken - Invoice Token from Mindee dashboard
//    * @param {boolean} throwOnError - Throw if an error is send from the API / SDK (true by default)
//    * @param {boolean} debug - Enable debug logging (disable by default)
//    */
//   receiptToken: string | undefined;
//   invoiceToken: string | undefined;
//   readonly receipt: APIReceipt;
//   readonly invoice: APIInvoice;
//   readonly financialDocument: APIFinancialDocument;
//
//   constructor({
//     receiptToken,
//     invoiceToken,
//     throwOnError = true,
//     debug,
//   }: constructorObject) {
//     this.receiptToken = receiptToken || process.env.MINDEE_RECEIPT_TOKEN;
//     this.invoiceToken = invoiceToken || process.env.MINDEE_INVOICE_TOKEN;
//     errorHandler.throwOnError = throwOnError;
//     logger.level = debug ?? process.env.MINDEE_DEBUG ? "debug" : "warn";
//     this.receipt = new APIReceipt(this.receiptToken);
//     this.invoice = new APIInvoice(this.invoiceToken);
//     this.financialDocument = new APIFinancialDocument(
//       this.invoiceToken as string,
//       this.receiptToken as string
//     );
//   }
// }

class DocumentClient {
  input_doc: Input;
  doc_configs: { [key: string]: any };

  constructor(input_doc: Input, doc_configs: any) {
    this.input_doc = input_doc;
    this.doc_configs = doc_configs;
  }

  async parse(document_type: string, username?: string, include_words = false) {
    const found: any = [];
    Object.keys(this.doc_configs).forEach((conf) => {
      const split_conf = conf.split(",");
      if (split_conf[1] === document_type) found.push(split_conf);
    });
    // TODO: raise error when document type is not configured => when found is empty

    let config_key: string[] = [];
    if (username) {
      config_key = [username, document_type];
    } else if (found.length === 1) {
      config_key = found[0];
    } else {
      const usernames = found.map((conf: string[]) => conf[0]);
      // TODO: raise error printing all usernames
    }

    const doc_config = this.doc_configs[config_key.toString()];
    return await doc_config.predict(this.input_doc, include_words);
  }
}

class Client {
  doc_configs: { [key: string]: any };

  constructor() {
    this.doc_configs = {};
  }

  config_invoice(api_key = "") {
    this.doc_configs["mindee,invoice"] = new InvoiceConfig(api_key);
    return this;
  }

  config_receipt(api_key = "") {
    this.doc_configs["mindee,receipt"] = new ReceiptConfig(api_key);
    return this;
  }

  config_financial_doc({
    invoice_api_key = "",
    receipt_api_key = "",
  }: {
    [key: string]: string;
  }) {
    this.doc_configs["mindee,financialDocument"] = new FinancialDocConfig(
      invoice_api_key,
      receipt_api_key
    );
    return this;
  }

  config_passport(api_key = "") {
    this.doc_configs["mindee,passport"] = new PassportConfig(api_key);
    return this;
  }

  config_custom_doc(
    account_name: string,
    document_type: string,
    singular_name: string,
    plural_name: string,
    api_key = "",
    version = "1"
  ) {
    this.doc_configs[`${account_name},${document_type}`] = new CustomDocConfig(
      document_type,
      account_name,
      singular_name,
      plural_name,
      version,
      api_key
    );
    return this;
  }

  doc_from_path(input_path: string, filename: string, cut_pdf = true) {
    const doc = new Input({
      file: input_path,
      inputType: "path",
      allowCutPdf: cut_pdf,
      filename: filename,
    });
    return new DocumentClient(doc, this.doc_configs);
  }
}

module.exports = Client;
exports.documents = require("./documents");
exports.api = require("./api");
exports.inputs = require("./inputs");
