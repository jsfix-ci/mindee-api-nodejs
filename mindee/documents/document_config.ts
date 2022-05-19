import { Input } from "@mindee/inputs";
import { Endpoint, InvoiceEndpoint } from "@api/endpoint";
import { errorHandler } from "@errors/handler";
import { Response } from "@api/response";
import { Invoice } from "@documents/invoice";

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
    const response = await this.endpoints[0].request(
      "POST",
      input_doc,
      include_words
    );
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
}

export class InvoiceConfig extends DocumentConfig {
  constructor(api_key: string) {
    const endpoints = [new InvoiceEndpoint(api_key)];
    super(Invoice, "invoice", "invoice", "invoices", endpoints);
  }
}
