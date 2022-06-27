import { promises as fs } from "fs";
import {
  Document,
  Passport,
  Receipt,
  Invoice,
  FinancialDocument,
  CustomDocument,
} from "../documents";
import { Input } from "../inputs";

export class Response {
  httpResponse: any;
  readonly documentType: string;
  inputFile: Input;
  pages: Array<Document>;
  document: Document | undefined;

  constructor({ httpResponse, documentType, input, error }: any) {
    this.httpResponse = httpResponse;
    this.documentType = documentType;
    this.inputFile = input;
    this.pages = [];
    if (!error) {
      this.formatResponse();
    }
  }

  async dump(path: string) {
    return await fs.writeFile(path, JSON.stringify(Object.entries(this)));
  }

  formatResponse() {
    const httpDataDocument = this.httpResponse.data.document;
    const predictions = httpDataDocument.inference.pages.entries();
    const constructors = {
      receipt: (params: any) => new Receipt(params),
      invoice: (params: any) => new Invoice(params),
      financialDocument: (params: any) => new FinancialDocument(params),
      customDocument: (params: any) => new CustomDocument(params),
      passport: (params: any) => new Passport(params),
    };

    const documentWordsContent = [];

    // Create a list of Document (Receipt, Invoice...) for each page of the input document
    for (const [pageNumber, prediction] of predictions) {
      let pageWordsContent = [];
      if (
        "ocr" in httpDataDocument &&
        Object.keys(httpDataDocument.ocr).length > 0
      ) {
        pageWordsContent =
          httpDataDocument.ocr["mvision-v1"].pages[pageNumber].all_words;
        documentWordsContent.push(
          ...httpDataDocument.ocr["mvision-v1"].pages[pageNumber].all_words
        );
      }
      if (this.documentType in constructors) {
        this.pages.push(
          // @ts-ignore
          constructors[this.documentType]({
            apiPrediction: prediction.prediction,
            inputFile: this.inputFile,
            pageNumber: pageNumber,
            words: pageWordsContent,
            documentType: this.documentType,
          })
        );
        // Merge the list of Document into a unique Document
        // @ts-ignore
        this.document = constructors[this.documentType]({
          apiPrediction: httpDataDocument.inference.prediction,
          inputFile: this.inputFile,
          pageNumber: httpDataDocument.n_pages,
          level: "document",
          words: documentWordsContent,
          documentType: this.documentType,
        });
      } else {
        this.pages.push(
          constructors["customDocument"]({
            inputFile: this.inputFile,
            prediction: prediction.prediction,
            pageId: pageNumber,
            documentType: this.documentType,
          })
        );
        this.document = constructors["customDocument"]({
          inputFile: this.inputFile,
          prediction: httpDataDocument.inference.prediction,
          pageId: pageNumber,
          documentType: this.documentType,
        });
      }
    }
  }
}
