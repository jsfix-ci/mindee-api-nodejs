import "module-alias/register";
import { Input } from "@mindee/inputs";
import {
  CustomDocConfig,
  FinancialDocConfig,
  InvoiceConfig,
  PassportConfig,
  ReceiptConfig,
} from "@documents/documentConfig";

class DocumentClient {
  inputDoc: Input;
  docConfigs: { [key: string]: any };

  constructor(inputDoc: Input, docConfigs: any) {
    this.inputDoc = inputDoc;
    this.docConfigs = docConfigs;
  }

  async parse(documentType: string, username?: string, include_words = false) {
    const found: any = [];
    Object.keys(this.docConfigs).forEach((conf) => {
      const splitConf = conf.split(",");
      if (splitConf[1] === documentType) found.push(splitConf);
    });
    // TODO: raise error when document type is not configured => when found is empty

    let config_key: string[] = [];
    if (username) {
      config_key = [username, documentType];
    } else if (found.length === 1) {
      config_key = found[0];
    }
    // } else {
    //   const usernames = found.map((conf: string[]) => conf[0]);
    //   // TODO: raise error printing all usernames
    // }

    const docConfig = this.docConfigs[config_key.toString()];
    return await docConfig.predict(this.inputDoc, include_words);
  }
}

export class Client {
  docConfigs: { [key: string]: any };

  constructor() {
    this.docConfigs = {};
  }

  configInvoice(apiKey = "") {
    this.docConfigs["mindee,invoice"] = new InvoiceConfig(apiKey);
    return this;
  }

  configReceipt(apiKey = "") {
    this.docConfigs["mindee,receipt"] = new ReceiptConfig(apiKey);
    return this;
  }

  configFinancialDoc({
    invoiceApiKey = "",
    receiptApiKey = "",
  }: {
    [key: string]: string;
  }) {
    this.docConfigs["mindee,financialDocument"] = new FinancialDocConfig(
      invoiceApiKey,
      receiptApiKey
    );
    return this;
  }

  configPassport(apiKey = "") {
    this.docConfigs["mindee,passport"] = new PassportConfig(apiKey);
    return this;
  }

  configCustomDoc(
    accountName: string,
    documentType: string,
    singularName: string,
    pluralName: string,
    apiKey = "",
    version = "1"
  ) {
    this.docConfigs[`${accountName},${documentType}`] = new CustomDocConfig(
      documentType,
      accountName,
      singularName,
      pluralName,
      version,
      apiKey
    );
    return this;
  }

  docFromPath(inputPath: string, filename: string, cutPdf = true) {
    const doc = new Input({
      file: inputPath,
      inputType: "path",
      allowCutPdf: cutPdf,
      filename: filename,
    });
    return new DocumentClient(doc, this.docConfigs);
  }

  docFromBase64(inputPath: string, filename: string, cutPdf = true) {
    const doc = new Input({
      file: inputPath,
      inputType: "base64",
      allowCutPdf: cutPdf,
      filename: filename,
    });
    return new DocumentClient(doc, this.docConfigs);
  }

  docFromStream(inputPath: string, filename: string, cutPdf = true) {
    const doc = new Input({
      file: inputPath,
      inputType: "stream",
      allowCutPdf: cutPdf,
      filename: filename,
    });
    return new DocumentClient(doc, this.docConfigs);
  }

  docFromBytes(inputPath: string, filename: string, cutPdf = true) {
    const doc = new Input({
      file: inputPath,
      inputType: "bytes",
      allowCutPdf: cutPdf,
      filename: filename,
    });
    return new DocumentClient(doc, this.docConfigs);
  }
}

exports.Client = Client;
exports.documents = require("./documents");
exports.api = require("./api");
exports.inputs = require("./inputs");
