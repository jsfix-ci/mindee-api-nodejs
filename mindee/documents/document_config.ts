import { Input } from "@mindee/inputs";
import {
  Endpoint,
  InvoiceEndpoint,
  CustomEndpoint,
  PassportEndpoint, ReceiptEndpoint,
} from "@api/endpoint";
import { errorHandler } from "@errors/handler";
import { Response } from "@api/response";
import {
  Invoice,
  CustomDocument,
  Passport,
  Receipt,
  FinancialDocument,
} from "@documents/index";

export class DocumentConfig {
  doc_class: any;
  document_type: string;
  singular_name: string;
  plurial_name: string;
  endpoints: [Endpoint];

  constructor(
    doc_class: any,
    document_type: string,
    singular_name: string,
    plurial_name: string,
    endpoints: any
  ) {
    this.doc_class = doc_class;
    this.document_type = document_type;
    this.singular_name = singular_name;
    this.plurial_name = plurial_name;
    this.endpoints = endpoints;
  }

  async predict_request(input_doc: Input, include_words = false) {
    await input_doc.init();
    const response = await this.endpoints[0].request(
      "POST",
      input_doc,
      include_words
    );
    return response;
  }

  build_result(inputFile: Input, response: any) {
    if (response.statusCode > 201) {
      const errorMessage = JSON.stringify(response.data, null, 4);
      errorHandler.throw(
        new Error(
          `${this.endpoints[0].url_name} API ${response.statusCode} HTTP error: ${errorMessage}`
        )
      );
      return new Response({
        httpResponse: response,
        documentType: this.document_type,
        document: undefined,
        input: inputFile,
        error: true,
      });
    }
    return new Response({
      httpResponse: response,
      documentType: this.document_type,
      document: inputFile,
      input: inputFile,
    });
  }

  async predict(input_doc: Input, include_words: boolean) {
    const response = await this.predict_request(input_doc, include_words);
    return this.build_result(input_doc, response);
  }
}

export class InvoiceConfig extends DocumentConfig {
  constructor(api_key: string) {
    const endpoints = [new InvoiceEndpoint(api_key)];
    super(Invoice, "invoice", "invoice", "invoices", endpoints);
  }
}

export class ReceiptConfig extends DocumentConfig {
  constructor(api_key: string) {
    const endpoints = [new ReceiptEndpoint(api_key)];
    super(Receipt, "receipt", "receipt", "receipts", endpoints);
  }
}

export class FinancialDocConfig extends DocumentConfig {
  constructor(invoice_api_key: string, receipt_api_key: string) {
    const endpoints = [
      new InvoiceEndpoint(invoice_api_key),
      new ReceiptEndpoint(receipt_api_key),
    ];
    super(
      FinancialDocument,
      "financialDocument",
      "financialDocument",
      "financialDocuments",
      endpoints
    );
  }
}

export class PassportConfig extends DocumentConfig {
  constructor(api_key: string) {
    const endpoints = [new PassportEndpoint(api_key)];
    super(Passport, "passport", "passport", "passports", endpoints);
  }
}

export class CustomDocConfig extends DocumentConfig {
  constructor(
    document_type: string,
    account_name: string,
    singular_name: string,
    plural_name: string,
    version: string,
    api_key: string
  ) {
    const endpoints = [
      new CustomEndpoint(document_type, account_name, version, api_key),
    ];
    super(CustomDocument, document_type, singular_name, plural_name, endpoints);
  }
}
