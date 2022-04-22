// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'fs'.
const fs = require("fs").promises;

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'Document'.
class Document {
  checklist: any;
  fileExtension: any;
  filename: any;
  filepath: any;
  /**
   * Takes a list of Documents and return one Document where
   * each field is set with the maximum probability field
   * @param {Input} inputFile - input file given to parse the document
   */
  constructor(inputFile = undefined) {
    this.filepath = undefined;
    this.filename = undefined;
    this.fileExtension = undefined;

    if (inputFile != undefined) {
      // @ts-expect-error ts-migrate(2532) FIXME: Object is possibly 'undefined'.
      this.filepath = inputFile.filepath;
      // @ts-expect-error ts-migrate(2532) FIXME: Object is possibly 'undefined'.
      this.filename = inputFile.filename;
      // @ts-expect-error ts-migrate(2532) FIXME: Object is possibly 'undefined'.
      this.fileExtension = inputFile.fileExtension;
    }
    this.checklist = {};
  }

  clone() {
    return JSON.parse(JSON.stringify(this));
  }

  /** return true if all checklist of the document if true */
  checkAll() {
    return this.checklist.every((item: any) => item == true);
  }

  /** Export document into a JSON file */
  async dump(path: any) {
    return await fs.writeFile(path, JSON.stringify(Object.entries(this)));
  }

  /** Create a Document from a JSON file */
  static async load(path: any) {
    const file = fs.readFile(path);
    const args = JSON.parse(file);
    return new Document({ reconsctruted: true, ...args });
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
          document?.[attribute]?.probability >
          finalDocument[attribute].probability
        ) {
          finalDocument[attribute] = document?.[attribute];
        }
      }
    }
    return finalDocument;
  }
}

module.exports = Document;
