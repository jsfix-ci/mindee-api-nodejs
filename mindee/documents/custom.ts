import { Document } from "./document";
import { ListField } from "./fields";

export class CustomDocument extends Document {
  fields: { [key: string]: ListField };
  pageId: number;

  constructor({ inputFile, prediction, pageId, documentType }: any) {
    super(documentType, inputFile);
    this.fields = {};
    this.pageId = pageId;

    Object.keys(prediction).forEach((fieldName) => {
      const fieldPrediction = prediction[fieldName];
      this.fields[fieldName] = new ListField(fieldPrediction, pageId);
    });
  }

  toString(): string {
    let outStr = `----- ${this.documentType} -----`;
    outStr += `\nFilename: ${this.filename}`.trimEnd();
    for (const [name, fieldData] of Object.entries(this.fields)) {
      outStr += `\n${name}: ${fieldData.toString()}`.trimEnd();
    }
    outStr += "\n----------------------\n";
    return outStr;
  }
}
