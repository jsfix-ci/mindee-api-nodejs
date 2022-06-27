import { promises as fs } from "fs";
import { Input } from "../inputs";

export interface DocumentConstructorProps {
  apiPrediction: { [index: string]: any };
  inputFile?: Input;
}

export class Document {
  readonly documentType: string;
  checklist: any;
  mimeType: string | undefined;
  filename: string = "";
  filepath: string | undefined;

  /**
   * Takes a list of Documents and return one Document where
   * each field is set with the maximum probability field
   * @param documentType - the internal document type
   * @param {Input} inputFile - input file given to parse the document
   */
  constructor(documentType: string, inputFile?: Input) {
    this.documentType = documentType;
    this.filepath = undefined;

    if (inputFile !== undefined) {
      this.filepath = inputFile.filepath;
      this.filename = inputFile.filename;
      this.mimeType = inputFile.mimeType;
    }
    this.checklist = {};
  }

  clone() {
    return JSON.parse(JSON.stringify(this));
  }

  /** return true if all checklist of the document if true */
  checkAll() {
    return this.checklist.every((item: any) => item === true);
  }

  /** Export document into a JSON file */
  async dump(path: any) {
    return await fs.writeFile(path, JSON.stringify(Object.entries(this)));
  }

  /** Create a Document from a JSON file */
  static async load(path: any) {
    const file = fs.readFile(path);
    // @ts-ignore
    const args = JSON.parse(file);
    return new Document({ reconstructed: true, ...args });
  }

  /**
   * Takes a list of Documents and return one Document where
   * each field is set with the maximum probability field
   * @param {Array<Document>} documents - A list of Documents
   */
  static mergePages(documents: any) {
    const finalDocument = documents[0].clone();
    const attributes = Object.getOwnPropertyNames(finalDocument);
    for (const document of documents) {
      for (const attribute of attributes) {
        if (Array.isArray(document?.[attribute])) {
          finalDocument[attribute] = finalDocument[attribute]?.length
            ? finalDocument[attribute]
            : document?.[attribute];
        } else if (
          document?.[attribute]?.confidence >
          finalDocument[attribute].confidence
        ) {
          finalDocument[attribute] = document?.[attribute];
        }
      }
    }
    return finalDocument;
  }

  static cleanOutString(outStr: string): string {
    const lines = / \n/gm;
    return outStr.replace(lines, "\n");
  }
}
