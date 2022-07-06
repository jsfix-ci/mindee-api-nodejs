import {
  Input,
  PathInput,
  Base64Input,
  StreamInput,
  BytesInput,
} from "./inputs";
import {
  DocumentConfig,
  CustomDocConfig,
  FinancialDocConfig,
  InvoiceConfig,
  PassportConfig,
  ReceiptConfig,
} from "./documents/documentConfig";
import { ReadStream } from "fs";
import { errorHandler } from "./errors/handler";
import { logger, LOG_LEVELS } from "./logger";

interface PredictOptions {
  username?: string;
  cutPages?: boolean;
  fullText?: boolean;
}

class DocumentClient {
  inputDoc: Input;
  docConfigs: { [key: string]: DocumentConfig };

  constructor(inputDoc: Input, docConfigs: any) {
    this.inputDoc = inputDoc;
    this.docConfigs = docConfigs;
  }

  async parse(docType: string, options?: PredictOptions) {
    const found: any = [];
    Object.keys(this.docConfigs).forEach((conf) => {
      const splitConf = conf.split(",");
      if (splitConf[1] === docType) {
        found.push(splitConf);
      }
    });
    // TODO: raise error when document type is not configured => when found is empty

    let configKey: string[] = [];
    if (options?.username) {
      configKey = [options.username, docType];
    } else if (found.length === 1) {
      configKey = found[0];
    }
    // } else {
    //   const usernames = found.map((conf: string[]) => conf[0]);
    //   // TODO: raise error printing all usernames
    // }

    // seems like there should be a better way of doing this
    const fullText = options?.fullText ? options.fullText : false;
    const cutPages = options?.cutPages ? options.cutPages : true;

    const docConfig = this.docConfigs[configKey.toString()];
    return await docConfig.predict(this.inputDoc, fullText, cutPages);
  }
}

interface ClientOptions {
  throwOnError?: boolean;
  debug?: boolean;
}

/**
 * Mindee Client
 */
export class Client {
  docConfigs: { [key: string]: any };

  /**
   * @param options
   */
  constructor(options?: ClientOptions) {
    const throwOnError =
      options?.throwOnError === undefined ? true : options.throwOnError;
    const debug = options?.debug === undefined ? true : options.debug;
    this.docConfigs = {};

    errorHandler.throwOnError = throwOnError;
    logger.level =
      debug ?? process.env.MINDEE_DEBUG
        ? LOG_LEVELS["debug"]
        : LOG_LEVELS["warn"];
  }

  configInvoice(apiKey: string = "") {
    this.docConfigs["mindee,invoice"] = new InvoiceConfig(apiKey);
    return this;
  }

  configReceipt(apiKey: string = "") {
    this.docConfigs["mindee,receipt"] = new ReceiptConfig(apiKey);
    return this;
  }

  configFinancialDoc(invoiceApiKey: string = "", receiptApiKey: string = "") {
    this.docConfigs["mindee,financialDoc"] = new FinancialDocConfig(
      invoiceApiKey,
      receiptApiKey
    );
    return this;
  }

  configPassport(apiKey: string = "") {
    this.docConfigs["mindee,passport"] = new PassportConfig(apiKey);
    return this;
  }

  configCustomDoc(
    accountName: string,
    documentType: string,
    apiKey = "",
    version = "1"
  ) {
    this.docConfigs[`${accountName},${documentType}`] = new CustomDocConfig({
      documentType: documentType,
      accountName: accountName,
      version: version,
      apiKey: apiKey,
    });
    return this;
  }

  docFromPath(inputPath: string) {
    const doc = new PathInput({
      inputPath: inputPath,
    });
    return new DocumentClient(doc, this.docConfigs);
  }

  docFromBase64(inputString: string, filename: string) {
    const doc = new Base64Input({
      inputString: inputString,
      filename: filename,
    });
    return new DocumentClient(doc, this.docConfigs);
  }

  docFromStream(inputStream: ReadStream, filename: string) {
    const doc = new StreamInput({
      inputStream: inputStream,
      filename: filename,
    });
    return new DocumentClient(doc, this.docConfigs);
  }

  docFromBytes(inputBytes: string, filename: string) {
    const doc = new BytesInput({
      inputBytes: inputBytes,
      filename: filename,
    });
    return new DocumentClient(doc, this.docConfigs);
  }
}

exports.Client = Client;
exports.documents = require("./documents");
exports.api = require("./api");
exports.inputs = require("./inputs");